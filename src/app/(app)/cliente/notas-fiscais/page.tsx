'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO CLIENTE - NOTAS FISCAIS                               ║
 * ║  Consulta e download de notas fiscais                         ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  Hash,
  Filter,
  Search,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { formatarMoeda, formatarData } from '../../../../lib/formatters';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { toast } from 'sonner@2.0.3';

// Mock Supabase Client
const createClient = () => ({
  from: (table: string) => ({
    select: (query: string = '*') => ({
      eq: (field: string, value: any) => ({
        single: () => ({ data: null, error: null }),
        order: (field: string, options?: any) => ({
          then: (callback: any) => callback({ data: [], error: null }),
        }),
      }),
      order: (field: string, options?: any) => ({ data: [], error: null }),
    }),
  }),
});

const supabase = createClient();

interface NotaFiscal {
  id: string;
  numero: string;
  serie?: string;
  chave_acesso?: string;
  cliente_id: string;
  cliente?: {
    nome: string;
    email?: string;
  };
  empresa_id: string;
  empresa?: {
    nome: string;
    tipo: string;
  };
  contrato_id?: string;
  contrato?: {
    numero_contrato: string;
    descricao: string;
  };
  tipo: 'produto' | 'servico';
  valor_total: number;
  valor_impostos?: number;
  data_emissao: string;
  data_vencimento?: string;
  status: 'emitida' | 'cancelada' | 'paga';
  descricao?: string;
  observacoes?: string;
  xml_url?: string;
  pdf_url?: string;
  data_criacao: string;
}

export default function NotasFiscaisPage() {
  const { user } = useAuth();
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);
  const [notaSelecionada, setNotaSelecionada] = useState<NotaFiscal | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterMes, setFilterMes] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar cliente associado ao usuário
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!clienteData) {
        toast.error('Cliente não encontrado');
        setLoading(false);
        return;
      }

      // Buscar notas fiscais do cliente
      const { data: notasData, error } = await supabase
        .from('notas_fiscais')
        .select('*, cliente:clientes(*), empresa:empresas(*), contrato:contratos(*)')
        .eq('cliente_id', clienteData.id)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      if (notasData) setNotas(notasData);
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      toast.error('Erro ao carregar notas fiscais');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar notas
  const notasFiltradas = useMemo(() => {
    let resultado = notas;

    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (n) =>
          n.numero.toLowerCase().includes(termo) ||
          n.descricao?.toLowerCase().includes(termo) ||
          n.chave_acesso?.toLowerCase().includes(termo)
      );
    }

    if (filterStatus !== 'todos') {
      resultado = resultado.filter((n) => n.status === filterStatus);
    }

    if (filterTipo !== 'todos') {
      resultado = resultado.filter((n) => n.tipo === filterTipo);
    }

    if (filterMes !== 'todos') {
      const mes = parseInt(filterMes);
      resultado = resultado.filter((n) => {
        const dataEmissao = new Date(n.data_emissao);
        return dataEmissao.getMonth() === mes;
      });
    }

    return resultado;
  }, [notas, searchTerm, filterStatus, filterTipo, filterMes]);

  // Estatísticas
  const stats = {
    total: notas.length,
    emitidas: notas.filter((n) => n.status === 'emitida').length,
    pagas: notas.filter((n) => n.status === 'paga').length,
    canceladas: notas.filter((n) => n.status === 'cancelada').length,
    valorTotal: notas
      .filter((n) => n.status !== 'cancelada')
      .reduce((acc, n) => acc + n.valor_total, 0),
    valorImpostos: notas
      .filter((n) => n.status !== 'cancelada')
      .reduce((acc, n) => acc + (n.valor_impostos || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      emitida: { color: 'bg-blue-100 text-blue-700', label: '📄 Emitida', icon: FileText },
      paga: { color: 'bg-green-100 text-green-700', label: '✅ Paga', icon: CheckCircle2 },
      cancelada: { color: 'bg-red-100 text-red-700', label: '❌ Cancelada', icon: XCircle },
    };
    const config = configs[status as keyof typeof configs] || configs.emitida;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const configs = {
      produto: { color: 'bg-purple-100 text-purple-700', label: '📦 Produto' },
      servico: { color: 'bg-blue-100 text-blue-700', label: '🔧 Serviço' },
    };
    const config = configs[tipo as keyof typeof configs] || configs.servico;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleVerDetalhes = (nota: NotaFiscal) => {
    setNotaSelecionada(nota);
    setDialogDetalhesOpen(true);
  };

  const handleDownloadPDF = (nota: NotaFiscal) => {
    if (nota.pdf_url) {
      window.open(nota.pdf_url, '_blank');
      toast.success('Download iniciado');
    } else {
      toast.error('PDF não disponível');
    }
  };

  const handleDownloadXML = (nota: NotaFiscal) => {
    if (nota.xml_url) {
      window.open(nota.xml_url, '_blank');
      toast.success('Download iniciado');
    } else {
      toast.error('XML não disponível');
    }
  };

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-8 h-8 text-[#1F4788]" />
              Minhas Notas Fiscais
            </h1>
            <p className="text-gray-600">
              {user?.nome} • {stats.total} nota(s) fiscal(is)
            </p>
          </div>
          <Button variant="outline" className="border-[#1F4788] text-[#1F4788]">
            <Download className="w-4 h-4 mr-2" />
            Baixar Todas (ZIP)
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">Emitidas</p>
            </div>
            <p className="text-2xl text-blue-600">{stats.emitidas}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Pagas</p>
            </div>
            <p className="text-2xl text-green-600">{stats.pagas}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600">Canceladas</p>
            </div>
            <p className="text-2xl text-red-600">{stats.canceladas}</p>
          </Card>
          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Valor Total</p>
            </div>
            <p className="text-2xl text-green-600">{formatarMoeda(stats.valorTotal)}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <Label className="text-xs mb-1">
              <Search className="w-3 h-3 inline mr-1" />
              Buscar
            </Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Número, descrição ou chave..."
            />
          </div>
          <div>
            <Label className="text-xs mb-1">
              <Filter className="w-3 h-3 inline mr-1" />
              Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="emitida">📄 Emitida</SelectItem>
                <SelectItem value="paga">✅ Paga</SelectItem>
                <SelectItem value="cancelada">❌ Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Tipo</Label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="produto">📦 Produto</SelectItem>
                <SelectItem value="servico">🔧 Serviço</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Mês
            </Label>
            <Select value={filterMes} onValueChange={setFilterMes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {meses.map((mes, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de Notas Fiscais */}
      {notasFiltradas.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhuma nota fiscal encontrada"
            description="Ajuste os filtros ou aguarde a emissão de novas notas"
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {notasFiltradas.map((nota) => (
            <Card
              key={nota.id}
              className={`p-6 hover:shadow-md transition-shadow ${
                nota.status === 'cancelada' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                {/* Info Principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg text-gray-900">NF-e #{nota.numero}</h3>
                        {nota.serie && (
                          <Badge variant="outline" className="text-xs">
                            Série {nota.serie}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{nota.descricao || 'Nota Fiscal'}</p>
                      <div className="flex gap-2 mt-2">
                        {getTipoBadge(nota.tipo)}
                        {getStatusBadge(nota.status)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {/* Empresa */}
                    {nota.empresa && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Empresa</p>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-900">{nota.empresa.nome}</p>
                        </div>
                      </div>
                    )}

                    {/* Data de Emissão */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Data de Emissão</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{formatarData(nota.data_emissao)}</p>
                      </div>
                    </div>

                    {/* Vencimento */}
                    {nota.data_vencimento && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vencimento</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-900">{formatarData(nota.data_vencimento)}</p>
                        </div>
                      </div>
                    )}

                    {/* Contrato */}
                    {nota.contrato && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Contrato</p>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-900">{nota.contrato.numero_contrato}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chave de Acesso */}
                  {nota.chave_acesso && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Chave de Acesso</p>
                      <p className="font-mono text-xs text-gray-700">{nota.chave_acesso}</p>
                    </div>
                  )}
                </div>

                {/* Valores e Ações */}
                <div className="text-right ml-6">
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Valor Total</p>
                    <p className="text-3xl text-[#1F4788]">{formatarMoeda(nota.valor_total)}</p>
                    {nota.valor_impostos && nota.valor_impostos > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Impostos: {formatarMoeda(nota.valor_impostos)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={() => handleVerDetalhes(nota)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Detalhes
                    </Button>
                    {nota.pdf_url && (
                      <Button
                        onClick={() => handleDownloadPDF(nota)}
                        variant="outline"
                        size="sm"
                        className="w-full border-blue-300 text-blue-600"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    )}
                    {nota.xml_url && (
                      <Button
                        onClick={() => handleDownloadXML(nota)}
                        variant="outline"
                        size="sm"
                        className="w-full border-green-300 text-green-600"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        XML
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={dialogDetalhesOpen} onOpenChange={setDialogDetalhesOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
            <DialogDescription>Informações completas da nota fiscal</DialogDescription>
          </DialogHeader>

          {notaSelecionada && (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl text-gray-900">NF-e #{notaSelecionada.numero}</h3>
                      {notaSelecionada.serie && (
                        <Badge variant="outline">Série {notaSelecionada.serie}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notaSelecionada.descricao || 'Nota Fiscal'}</p>
                    <div className="flex gap-2 mt-3">
                      {getTipoBadge(notaSelecionada.tipo)}
                      {getStatusBadge(notaSelecionada.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-1">Valor Total</p>
                    <p className="text-3xl text-[#1F4788]">{formatarMoeda(notaSelecionada.valor_total)}</p>
                  </div>
                </div>

                {notaSelecionada.chave_acesso && (
                  <div className="pt-4 border-t border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">Chave de Acesso</p>
                    <p className="font-mono text-sm text-blue-900 break-all">
                      {notaSelecionada.chave_acesso}
                    </p>
                  </div>
                )}
              </div>

              {/* Informações */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📋 Informações Gerais</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número:</span>
                      <span className="text-gray-900 font-mono">#{notaSelecionada.numero}</span>
                    </div>
                    {notaSelecionada.serie && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Série:</span>
                        <span className="text-gray-900">{notaSelecionada.serie}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="text-gray-900">
                        {notaSelecionada.tipo === 'produto' ? 'Produto' : 'Serviço'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Emissão:</span>
                      <span className="text-gray-900">{formatarData(notaSelecionada.data_emissao)}</span>
                    </div>
                    {notaSelecionada.data_vencimento && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data de Vencimento:</span>
                        <span className="text-gray-900">{formatarData(notaSelecionada.data_vencimento)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Empresa */}
                {notaSelecionada.empresa && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">🏢 Empresa Emissora</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-900 font-medium">{notaSelecionada.empresa.nome}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notaSelecionada.empresa.tipo.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contrato */}
                {notaSelecionada.contrato && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">📄 Contrato Relacionado</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-mono text-sm text-gray-600">
                        #{notaSelecionada.contrato.numero_contrato}
                      </p>
                      <p className="text-gray-900">{notaSelecionada.contrato.descricao}</p>
                    </div>
                  </div>
                )}

                {/* Valores */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">💰 Valores</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor Total:</span>
                      <span className="text-gray-900 font-mono">
                        {formatarMoeda(notaSelecionada.valor_total)}
                      </span>
                    </div>
                    {notaSelecionada.valor_impostos && notaSelecionada.valor_impostos > 0 && (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Impostos:</span>
                          <span className="text-red-600 font-mono">
                            {formatarMoeda(notaSelecionada.valor_impostos)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t">
                          <span className="text-gray-600 font-medium">Valor Líquido:</span>
                          <span className="text-green-600 font-mono font-medium">
                            {formatarMoeda(notaSelecionada.valor_total - notaSelecionada.valor_impostos)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Observações */}
                {notaSelecionada.observacoes && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">📝 Observações</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {notaSelecionada.observacoes}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                {notaSelecionada.pdf_url && (
                  <Button
                    onClick={() => handleDownloadPDF(notaSelecionada)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PDF
                  </Button>
                )}
                {notaSelecionada.xml_url && (
                  <Button
                    onClick={() => handleDownloadXML(notaSelecionada)}
                    variant="outline"
                    className="flex-1 border-green-300 text-green-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar XML
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}