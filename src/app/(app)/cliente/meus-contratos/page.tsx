'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO CLIENTE - MEUS CONTRATOS                              ║
 * ║  Visão do cliente sobre seus contratos e parcelas             ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Progress } from '../../../../components/ui/progress';
import { toast } from 'sonner@2.0.3';

// Inline utils
import { formatarMoeda, formatarData } from '../../../../lib/formatters';

interface Contrato {
  id: string;
  numero_contrato: string;
  cliente_id: string;
  cliente?: {
    nome: string;
    email?: string;
    telefone?: string;
  };
  empresa_id: string;
  empresa?: {
    nome: string;
    tipo: string;
  };
  tipo: 'locacao' | 'servico' | 'venda';
  descricao: string;
  valor_total: number;
  valor_entrada?: number;
  num_parcelas: number;
  data_inicio: string;
  data_fim?: string;
  status: 'ativo' | 'concluido' | 'cancelado';
  observacoes?: string;
  data_criacao: string;
}

interface Parcela {
  id: string;
  contrato_id: string;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  observacao?: string;
}

export default function MeusContratosPage() {
  const { user } = useAuth();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogContratoOpen, setDialogContratoOpen] = useState(false);
  const [dialogParcelasOpen, setDialogParcelasOpen] = useState(false);
  const [contratoSelecionado, setContratoSelecionado] = useState<Contrato | null>(null);
  const [parcelasDoContrato, setParcelasDoContrato] = useState<Parcela[]>([]);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Mock data para demonstração
      const mockContratos: Contrato[] = [
        {
          id: '1',
          numero_contrato: 'CONT-2024-001',
          cliente_id: user.id,
          empresa_id: '1',
          empresa: {
            nome: '2S Locações',
            tipo: 'locacao',
          },
          tipo: 'locacao',
          descricao: 'Locação de Equipamentos - Projeto ABC',
          valor_total: 15000,
          valor_entrada: 3000,
          num_parcelas: 12,
          data_inicio: '2024-01-01',
          data_fim: '2024-12-31',
          status: 'ativo',
          data_criacao: '2023-12-15',
        },
        {
          id: '2',
          numero_contrato: 'CONT-2024-002',
          cliente_id: user.id,
          empresa_id: '1',
          empresa: {
            nome: '2S Locações',
            tipo: 'locacao',
          },
          tipo: 'servico',
          descricao: 'Manutenção de Equipamentos',
          valor_total: 5000,
          num_parcelas: 5,
          data_inicio: '2024-01-15',
          status: 'ativo',
          data_criacao: '2024-01-10',
        },
      ];

      const mockParcelas: Parcela[] = [
        { id: '1', contrato_id: '1', numero_parcela: 1, valor: 1000, data_vencimento: '2024-01-05', data_pagamento: '2024-01-05', status: 'pago' },
        { id: '2', contrato_id: '1', numero_parcela: 2, valor: 1000, data_vencimento: '2024-02-05', data_pagamento: '2024-02-05', status: 'pago' },
        { id: '3', contrato_id: '1', numero_parcela: 3, valor: 1000, data_vencimento: '2024-03-05', status: 'pendente' },
        { id: '4', contrato_id: '1', numero_parcela: 4, valor: 1000, data_vencimento: '2024-04-05', status: 'pendente' },
        { id: '5', contrato_id: '2', numero_parcela: 1, valor: 1000, data_vencimento: '2024-01-20', data_pagamento: '2024-01-20', status: 'pago' },
        { id: '6', contrato_id: '2', numero_parcela: 2, valor: 1000, data_vencimento: '2024-02-20', status: 'pendente' },
      ];

      setContratos(mockContratos);
      setParcelas(mockParcelas);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const handleVerContrato = (contrato: Contrato) => {
    setContratoSelecionado(contrato);
    setDialogContratoOpen(true);
  };

  const handleVerParcelas = (contrato: Contrato) => {
    setContratoSelecionado(contrato);
    const parcelasContrato = parcelas.filter((p) => p.contrato_id === contrato.id);
    setParcelasDoContrato(parcelasContrato);
    setDialogParcelasOpen(true);
  };

  // Estatísticas
  const stats = {
    total: contratos.length,
    ativos: contratos.filter((c) => c.status === 'ativo').length,
    concluidos: contratos.filter((c) => c.status === 'concluido').length,
    valorTotal: contratos.reduce((acc, c) => acc + c.valor_total, 0),
    parcelasPendentes: parcelas.filter((p) => p.status === 'pendente').length,
    parcelasPagas: parcelas.filter((p) => p.status === 'pago').length,
    parcelasAtrasadas: parcelas.filter((p) => p.status === 'atrasado').length,
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      ativo: { color: 'bg-green-100 text-green-700', label: '✅ Ativo', icon: CheckCircle2 },
      concluido: { color: 'bg-blue-100 text-blue-700', label: '✔️ Concluído', icon: CheckCircle2 },
      cancelado: { color: 'bg-red-100 text-red-700', label: '❌ Cancelado', icon: AlertCircle },
      pendente: { color: 'bg-yellow-100 text-yellow-700', label: '⏳ Pendente', icon: Clock },
      pago: { color: 'bg-green-100 text-green-700', label: '✅ Pago', icon: CheckCircle2 },
      atrasado: { color: 'bg-red-100 text-red-700', label: '⚠️ Atrasado', icon: AlertCircle },
    };
    const config = configs[status as keyof typeof configs] || configs.ativo;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTipoBadge = (tipo: string) => {
    const configs = {
      locacao: { color: 'bg-blue-100 text-blue-700', label: '🏠 Locação' },
      servico: { color: 'bg-green-100 text-green-700', label: '🔧 Serviço' },
      venda: { color: 'bg-purple-100 text-purple-700', label: '💰 Venda' },
    };
    const config = configs[tipo as keyof typeof configs] || configs.servico;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const calcularProgresso = (contrato: Contrato) => {
    const parcelasContrato = parcelas.filter((p) => p.contrato_id === contrato.id);
    const pagas = parcelasContrato.filter((p) => p.status === 'pago').length;
    return parcelasContrato.length > 0 ? (pagas / parcelasContrato.length) * 100 : 0;
  };

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
              Meus Contratos
            </h1>
            <p className="text-gray-600">
              {user?.nome} • {stats.total} contrato(s)
            </p>
          </div>
          <Button variant="outline" className="border-[#1F4788] text-[#1F4788]">
            <Download className="w-4 h-4 mr-2" />
            Baixar Relatório
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Ativos</p>
            </div>
            <p className="text-2xl text-green-600">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">Concluídos</p>
            </div>
            <p className="text-2xl text-blue-600">{stats.concluidos}</p>
          </Card>
          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Valor Total</p>
            </div>
            <p className="text-2xl text-green-600">{formatarMoeda(stats.valorTotal)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-yellow-600 mb-1">Pendentes</p>
            <p className="text-xl text-yellow-600">{stats.parcelasPendentes}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-red-600 mb-1">Atrasadas</p>
            <p className="text-xl text-red-600">{stats.parcelasAtrasadas}</p>
          </Card>
        </div>

        {/* Alerta de Parcelas Atrasadas */}
        {stats.parcelasAtrasadas > 0 && (
          <Card className="p-4 mb-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium text-red-900">⚠️ Atenção: Parcelas Atrasadas</div>
                <div className="text-sm text-red-700">
                  Você possui {stats.parcelasAtrasadas} parcela(s) atrasada(s). Por favor, regularize o quanto antes.
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Lista de Contratos */}
      {contratos.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhum contrato encontrado"
            description="Você ainda não possui contratos cadastrados"
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contratos.map((contrato) => {
            const progresso = calcularProgresso(contrato);
            const parcelasContrato = parcelas.filter((p) => p.contrato_id === contrato.id);
            const proximasParcelas = parcelasContrato.filter((p) => p.status === 'pendente').slice(0, 2);

            return (
              <Card key={contrato.id} className="p-6 hover:shadow-lg transition-shadow">
                {/* Header do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-gray-600">#{contrato.numero_contrato}</p>
                    <h3 className="text-lg text-gray-900 mb-2">{contrato.descricao}</h3>
                    <div className="flex gap-2">
                      {getTipoBadge(contrato.tipo)}
                      {getStatusBadge(contrato.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-[#1F4788]">{formatarMoeda(contrato.valor_total)}</p>
                    <p className="text-xs text-gray-500">{contrato.num_parcelas}x parcelas</p>
                  </div>
                </div>

                {/* Empresa */}
                {contrato.empresa && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{contrato.empresa.nome}</span>
                    </div>
                  </div>
                )}

                {/* Datas */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Data Início:</p>
                    <p className="text-gray-900">{formatarData(contrato.data_inicio)}</p>
                  </div>
                  {contrato.data_fim && (
                    <div>
                      <p className="text-gray-600">Data Fim:</p>
                      <p className="text-gray-900">{formatarData(contrato.data_fim)}</p>
                    </div>
                  )}
                </div>

                {/* Progresso de Pagamento */}
                {contrato.status === 'ativo' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progresso de Pagamento</span>
                      <span className="text-gray-900">{progresso.toFixed(0)}%</span>
                    </div>
                    <Progress value={progresso} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {parcelasContrato.filter((p) => p.status === 'pago').length} de {parcelasContrato.length}{' '}
                      parcelas pagas
                    </p>
                  </div>
                )}

                {/* Próximas Parcelas */}
                {proximasParcelas.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900 mb-2">
                      📅 Próximas Parcelas:
                    </p>
                    {proximasParcelas.map((parcela) => (
                      <div key={parcela.id} className="flex justify-between text-sm mb-1">
                        <span className="text-yellow-700">
                          Parcela {parcela.numero_parcela}/{contrato.num_parcelas}
                        </span>
                        <div className="text-right">
                          <p className="text-yellow-900">{formatarMoeda(parcela.valor)}</p>
                          <p className="text-xs text-yellow-600">Venc: {formatarData(parcela.data_vencimento)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    onClick={() => handleVerContrato(contrato)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                  <Button
                    onClick={() => handleVerParcelas(contrato)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <CreditCard className="w-4 h-4 mr-1" />
                    Parcelas
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes do Contrato */}
      <Dialog open={dialogContratoOpen} onOpenChange={setDialogContratoOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Contrato</DialogTitle>
            <DialogDescription>Informações completas do contrato</DialogDescription>
          </DialogHeader>

          {contratoSelecionado && (
            <div className="space-y-6">
              {/* Header */}
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-mono text-sm text-gray-600">#{contratoSelecionado.numero_contrato}</p>
                    <h3 className="text-xl text-gray-900 mb-2">{contratoSelecionado.descricao}</h3>
                    <div className="flex gap-2">
                      {getTipoBadge(contratoSelecionado.tipo)}
                      {getStatusBadge(contratoSelecionado.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl text-[#1F4788]">{formatarMoeda(contratoSelecionado.valor_total)}</p>
                    <p className="text-sm text-gray-600">{contratoSelecionado.num_parcelas}x parcelas</p>
                  </div>
                </div>

                {contratoSelecionado.valor_entrada && contratoSelecionado.valor_entrada > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor de Entrada:</span>
                      <span className="text-green-600 font-mono">
                        {formatarMoeda(contratoSelecionado.valor_entrada)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Tabs defaultValue="geral" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                  <TabsTrigger value="empresa">Empresa</TabsTrigger>
                  <TabsTrigger value="observacoes">Observações</TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Início:</span>
                      <span className="text-gray-900">{formatarData(contratoSelecionado.data_inicio)}</span>
                    </div>
                    {contratoSelecionado.data_fim && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Data de Término:</span>
                        <span className="text-gray-900">{formatarData(contratoSelecionado.data_fim)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data de Criação:</span>
                      <span className="text-gray-900">{formatarData(contratoSelecionado.data_criacao)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Número de Parcelas:</span>
                      <span className="text-gray-900">{contratoSelecionado.num_parcelas}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor por Parcela:</span>
                      <span className="text-gray-900 font-mono">
                        {formatarMoeda(contratoSelecionado.valor_total / contratoSelecionado.num_parcelas)}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="empresa" className="space-y-4 mt-4">
                  {contratoSelecionado.empresa && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Building2 className="w-6 h-6 text-blue-600" />
                          <h4 className="text-lg text-blue-900">{contratoSelecionado.empresa.nome}</h4>
                        </div>
                        <p className="text-sm text-blue-700">
                          Tipo: {contratoSelecionado.empresa.tipo.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="observacoes" className="space-y-4 mt-4">
                  {contratoSelecionado.observacoes ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {contratoSelecionado.observacoes}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Sem observações</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Parcelas */}
      <Dialog open={dialogParcelasOpen} onOpenChange={setDialogParcelasOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Parcelas do Contrato</DialogTitle>
            <DialogDescription>
              {contratoSelecionado?.numero_contrato} - {parcelasDoContrato.length} parcela(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-green-50">
                <p className="text-sm text-green-600 mb-1">Pagas</p>
                <p className="text-2xl text-green-700">
                  {parcelasDoContrato.filter((p) => p.status === 'pago').length}
                </p>
              </Card>
              <Card className="p-4 bg-yellow-50">
                <p className="text-sm text-yellow-600 mb-1">Pendentes</p>
                <p className="text-2xl text-yellow-700">
                  {parcelasDoContrato.filter((p) => p.status === 'pendente').length}
                </p>
              </Card>
              <Card className="p-4 bg-red-50">
                <p className="text-sm text-red-600 mb-1">Atrasadas</p>
                <p className="text-2xl text-red-700">
                  {parcelasDoContrato.filter((p) => p.status === 'atrasado').length}
                </p>
              </Card>
            </div>

            {/* Lista de Parcelas */}
            <div className="space-y-2">
              {parcelasDoContrato.map((parcela) => (
                <div
                  key={parcela.id}
                  className={`p-4 border rounded-lg ${
                    parcela.status === 'pago'
                      ? 'bg-green-50 border-green-200'
                      : parcela.status === 'atrasado'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {parcela.status === 'pago' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : parcela.status === 'atrasado' ? (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          Parcela {parcela.numero_parcela}/{contratoSelecionado?.num_parcelas}
                        </p>
                        <p className="text-sm text-gray-600">
                          Vencimento: {formatarData(parcela.data_vencimento)}
                        </p>
                        {parcela.data_pagamento && (
                          <p className="text-sm text-green-600">
                            Pago em: {formatarData(parcela.data_pagamento)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-mono text-gray-900">{formatarMoeda(parcela.valor)}</p>
                      {getStatusBadge(parcela.status)}
                    </div>
                  </div>
                  {parcela.observacao && (
                    <p className="text-sm text-gray-600 mt-2 pl-9">{parcela.observacao}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}