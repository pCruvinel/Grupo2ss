'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE CONTRATOS - RN-003                                  ║
 * ║  Gestão de contratos com parcelamento flexível                 ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, FileText, List, Grid, Eye, Download, Calendar, User } from 'lucide-react';
import { 
  createClient, 
  LoadingSpinner, 
  EmptyState,
  formatCurrency,
  formatDate 
} from '../../../lib/figma-make-helpers';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { ExportButton } from '../../../components/shared/ExportButton';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { toast } from 'sonner@2.0.3';

// Inline hook mock
const useEmpresa = () => ({
  empresa: { 
    id: '1', 
    nome: '2S Locações', 
    tipo: '2s_locacoes',
    cor_primaria: '#1F4788',
    cor_secundaria: '#28A745'
  },
  empresas: [
    { id: '1', nome: '2S Locações', tipo: '2s_locacoes' },
    { id: '2', nome: '2S Marketing', tipo: '2s_marketing' },
    { id: '3', nome: '2S Produções e Eventos', tipo: 'producoes_eventos' },
  ],
  loading: false,
  changeEmpresa: (empresaId: string) => {},
});

interface Contrato {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  cliente_email?: string;
  empresa_id: string;
  tipo: string;
  descricao?: string;
  valor_total: number;
  status: 'ativo' | 'concluido' | 'cancelado';
  tipo_parcelamento: 'mensal' | 'personalizado';
  data_inicio: string;
  data_fim: string;
  num_parcelas?: number;
  parcelas?: any[];
}

export default function ContratosPage() {
  const { empresa } = useEmpresa();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [parcelasDialogOpen, setParcelasDialogOpen] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [empresa]);

  const fetchData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      const { data: contratosData, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('data_inicio', { ascending: false });

      if (error) throw error;

      if (contratosData) setContratos(contratosData);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar contratos
  const contratosFiltrados = contratos.filter((c) => {
    const matchSearch =
      c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
    const matchTipo = filterTipo === 'todos' || c.tipo === filterTipo;

    return matchSearch && matchStatus && matchTipo;
  });

  // Estatísticas
  const stats = {
    total: contratos.length,
    ativos: contratos.filter((c) => c.status === 'ativo').length,
    concluidos: contratos.filter((c) => c.status === 'concluido').length,
    cancelados: contratos.filter((c) => c.status === 'cancelado').length,
    valorTotal: contratos.reduce((acc, c) => acc + c.valor_total, 0),
    valorAtivos: contratos
      .filter((c) => c.status === 'ativo')
      .reduce((acc, c) => acc + c.valor_total, 0),
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      ativo: { color: 'bg-green-100 text-green-700', label: '✅ Ativo' },
      concluido: { color: 'bg-blue-100 text-blue-700', label: '✔️ Concluído' },
      cancelado: { color: 'bg-red-100 text-red-700', label: '❌ Cancelado' },
    };
    const config = configs[status as keyof typeof configs] || configs.ativo;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTipoParcelamentoBadge = (tipo: string, numParcelas?: number) => {
    if (tipo === 'mensal') {
      return (
        <Badge className="bg-blue-100 text-blue-700">
          📅 Mensal ({numParcelas || 0}x)
        </Badge>
      );
    }
    return (
      <Badge className="bg-purple-100 text-purple-700">
        ✏️ Personalizado ({numParcelas || 0}x)
      </Badge>
    );
  };

  const handleVerParcelas = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setParcelasDialogOpen(true);
  };

  const handleMarcarParcela = async (parcelaId: string, status: string) => {
    try {
      // Implementar lógica de atualização de parcela
      toast.info('Funcionalidade em desenvolvimento');
    } catch (error: any) {
      console.error('Erro ao atualizar parcela:', error);
      toast.error('Erro ao atualizar parcela');
    }
  };

  // Colunas da tabela
  const columns: Column<Contrato>[] = [
    {
      key: 'numero',
      label: 'Número',
      render: (_, item) => (
        <Link href={`/financeiro/contratos/${item.id}`} className="text-blue-600 hover:underline">
          {item.numero}
        </Link>
      ),
    },
    {
      key: 'cliente',
      label: 'Cliente',
      render: (_, item) => (
        <div>
          <p className="text-gray-900">{item.cliente_nome}</p>
          {item.cliente_cpf_cnpj && (
            <p className="text-xs text-gray-500 font-mono">{item.cliente_cpf_cnpj}</p>
          )}
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (_, item) => <span className="text-sm text-gray-600">{item.tipo}</span>,
    },
    {
      key: 'valor_total',
      label: 'Valor Total',
      render: (_, item) => (
        <span className="font-mono text-gray-900">{formatCurrency(item.valor_total)}</span>
      ),
    },
    {
      key: 'parcelamento',
      label: 'Parcelamento (RN-003)',
      render: (_, item) => getTipoParcelamentoBadge(item.tipo_parcelamento, item.num_parcelas),
    },
    {
      key: 'vigencia',
      label: 'Vigência',
      render: (_, item) => (
        <div className="text-sm">
          <p className="text-gray-600">{formatDate(item.data_inicio)}</p>
          <p className="text-gray-500">até {formatDate(item.data_fim)}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, item) => getStatusBadge(item.status),
    },
  ];

  // Ações customizadas
  const customActions = (item: Contrato) => (
    <>
      <Button
        onClick={() => handleVerParcelas(item)}
        variant="ghost"
        size="sm"
        title="Ver Parcelas"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Link href={`/financeiro/contratos/${item.id}`}>
        <Button variant="ghost" size="sm" title="Ver Detalhes">
          <FileText className="w-4 h-4" />
        </Button>
      </Link>
    </>
  );

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
              Contratos
            </h1>
            <p className="text-gray-600">
              {empresa?.nome} • {stats.total} contrato(s)
            </p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              RN-003: Parcelamento Flexível
            </Badge>
          </div>
          <div className="flex gap-2">
            {/* Toggle de visualização */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            <ExportButton
              data={contratosFiltrados}
              filename="contratos"
              columns={[
                { key: 'numero', label: 'Número' },
                { key: 'cliente_nome', label: 'Cliente' },
                { key: 'cliente_cpf_cnpj', label: 'CPF/CNPJ' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'valor_total', label: 'Valor Total' },
                { key: 'status', label: 'Status' },
                { key: 'tipo_parcelamento', label: 'Tipo Parcelamento' },
                { key: 'num_parcelas', label: 'Nº Parcelas' },
                { key: 'data_inicio', label: 'Data Início' },
                { key: 'data_fim', label: 'Data Fim' },
              ]}
            />

            <Link href="/financeiro/contratos/novo">
              <Button className="bg-[#1F4788] hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Novo Contrato
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Ativos</p>
            <p className="text-2xl text-green-600">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Concluídos</p>
            <p className="text-2xl text-blue-600">{stats.concluidos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Cancelados</p>
            <p className="text-2xl text-red-600">{stats.cancelados}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Valor Total</p>
            <p className="text-xl text-gray-900">{formatCurrency(stats.valorTotal)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Ativos (R$)</p>
            <p className="text-xl text-green-600">{formatCurrency(stats.valorAtivos)}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs mb-1">Buscar</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nº contrato ou cliente..."
            />
          </div>
          <div>
            <Label className="text-xs mb-1">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">✅ Ativo</SelectItem>
                <SelectItem value="concluido">✔️ Concluído</SelectItem>
                <SelectItem value="cancelado">❌ Cancelado</SelectItem>
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
                <SelectItem value="Prestação de Serviços">Prestação de Serviços</SelectItem>
                <SelectItem value="Fornecimento">Fornecimento</SelectItem>
                <SelectItem value="Locação">Locação</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {contratosFiltrados.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhum contrato encontrado"
            description="Ajuste os filtros ou crie um novo contrato"
            actionLabel="Novo Contrato"
            onAction={() => (window.location.href = '/financeiro/contratos/novo')}
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="p-6">
          <DataTable
            data={contratosFiltrados}
            columns={columns}
            searchPlaceholder="Buscar contratos..."
            customActions={customActions}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contratosFiltrados.map((contrato) => (
            <Card key={contrato.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Link
                    href={`/financeiro/contratos/${contrato.id}`}
                    className="text-lg text-blue-600 hover:underline"
                  >
                    {contrato.numero}
                  </Link>
                  <p className="text-sm text-gray-600">{contrato.tipo}</p>
                </div>
                {getStatusBadge(contrato.status)}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{contrato.cliente_nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDate(contrato.data_inicio)} - {formatDate(contrato.data_fim)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valor Total:</span>
                  <span className="text-lg text-gray-900">
                    {formatCurrency(contrato.valor_total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Parcelamento:</span>
                  {getTipoParcelamentoBadge(contrato.tipo_parcelamento, contrato.num_parcelas)}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleVerParcelas(contrato)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Parcelas
                </Button>
                <Link href={`/financeiro/contratos/${contrato.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <FileText className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Parcelas */}
      <Dialog open={parcelasDialogOpen} onOpenChange={setParcelasDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1F4788]" />
              Parcelas do Contrato - {selectedContrato?.numero}
            </DialogTitle>
            <DialogDescription>
              {selectedContrato?.tipo_parcelamento === 'mensal'
                ? `Parcelamento mensal com ${selectedContrato?.num_parcelas} parcelas`
                : `Parcelamento personalizado com ${selectedContrato?.num_parcelas} parcelas`}
            </DialogDescription>
          </DialogHeader>

          {selectedContrato && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Cliente</p>
                    <p className="text-sm text-gray-900">{selectedContrato.cliente_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-lg text-gray-900">
                      {formatCurrency(selectedContrato.valor_total)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedContrato.parcelas && selectedContrato.parcelas.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedContrato.parcelas.map((parcela: any) => (
                    <div
                      key={parcela.id}
                      className="flex items-center justify-between p-3 bg-white rounded border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">Parcela {parcela.numero}</Badge>
                        <span className="text-sm text-gray-600">
                          Vencimento: {formatDate(parcela.vencimento)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-gray-900">
                          {formatCurrency(parcela.valor)}
                        </span>
                        <Badge
                          className={
                            parcela.status === 'pago'
                              ? 'bg-green-100 text-green-700'
                              : parcela.status === 'atrasado'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {parcela.status === 'pago' ? '✅ Pago' : parcela.status === 'atrasado' ? '🔴 Atrasado' : '⏳ Pendente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p>Nenhuma parcela cadastrada</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}