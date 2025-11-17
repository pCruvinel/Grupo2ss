'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE FOLHA DE PAGAMENTO - Next.js                       ║
 * ║  Cálculo e gestão de folhas de pagamento por empresa          ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import { Download, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { 
  createClient, 
  useEmpresa, 
  LoadingSpinner, 
  EmptyState,
  formatCurrency,
  formatDate 
} from '../../../lib/figma-make-helpers';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Label } from '../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';

interface ItemFolha {
  id: string;
  colaborador_id: string;
  colaborador?: {
    nome: string;
    cpf: string;
    cargo: string;
    empresa_id: string;
  };
  salario_base: number;
  bonus: number;
  descontos: number;
  salario_liquido: number;
  empresas_ids?: string[];
  rateio?: Record<string, number>; // RN-002: {empresa_id: percentual}
  mes_referencia: string;
  status: 'pendente' | 'aprovado' | 'pago';
}

export default function FolhaPagamentoPage() {
  const { empresa } = useEmpresa();
  const [folha, setFolha] = useState<ItemFolha[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rateioDialogOpen, setRateioDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ItemFolha | null>(null);
  
  // Filtros
  const [filterMes, setFilterMes] = useState('2024-11');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterComRateio, setFilterComRateio] = useState('todos');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [empresa]);

  const fetchData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // Buscar todas as empresas
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('*')
        .eq('status', 'ativo')
        .order('nome');

      // Buscar folha de pagamento (filtrada pela empresa atual - RN-001)
      const { data: folhaData, error } = await supabase
        .from('folha_pagamento')
        .select(`
          *,
          colaborador:colaboradores(nome, cpf, cargo, empresa_id)
        `)
        .eq('empresa_id', empresa.id)
        .order('mes_referencia', { ascending: false });

      if (error) throw error;

      if (empresasData) setEmpresas(empresasData);
      if (folhaData) setFolha(folhaData);
    } catch (error) {
      console.error('Erro ao carregar folha:', error);
      toast.error('Erro ao carregar folha de pagamento');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar folha
  const folhaFiltrada = useMemo(() => {
    let resultado = folha;

    if (filterMes) {
      resultado = resultado.filter(f => f.mes_referencia === filterMes);
    }
    if (filterStatus !== 'todos') {
      resultado = resultado.filter(f => f.status === filterStatus);
    }
    if (filterComRateio === 'sim') {
      resultado = resultado.filter(f => f.rateio && Object.keys(f.rateio).length > 1);
    } else if (filterComRateio === 'nao') {
      resultado = resultado.filter(f => !f.rateio || Object.keys(f.rateio).length <= 1);
    }

    return resultado;
  }, [folha, filterMes, filterStatus, filterComRateio]);

  // Calcular valor por empresa (RN-002)
  const calcularValorEmpresa = (item: ItemFolha): number => {
    if (item.rateio && empresa && item.rateio[empresa.id]) {
      return (item.salario_liquido * item.rateio[empresa.id]) / 100;
    }
    return item.salario_liquido;
  };

  // Estatísticas
  const stats = {
    total: folhaFiltrada.length,
    totalBruto: folhaFiltrada.reduce((sum, f) => sum + f.salario_base, 0),
    totalBonus: folhaFiltrada.reduce((sum, f) => sum + f.bonus, 0),
    totalDescontos: folhaFiltrada.reduce((sum, f) => sum + f.descontos, 0),
    totalLiquido: folhaFiltrada.reduce((sum, f) => sum + calcularValorEmpresa(f), 0),
    comRateio: folhaFiltrada.filter(f => f.rateio && Object.keys(f.rateio).length > 1).length,
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pendente: { color: 'bg-yellow-100 text-yellow-700', label: '⏳ Pendente' },
      aprovado: { color: 'bg-blue-100 text-blue-700', label: '✅ Aprovado' },
      pago: { color: 'bg-green-100 text-green-700', label: '💰 Pago' },
    };
    const config = configs[status as keyof typeof configs] || configs.pendente;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleAprovar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folha_pagamento')
        .update({ status: 'aprovado' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Folha aprovada!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao aprovar:', error);
      toast.error('Erro ao aprovar folha');
    }
  };

  const handleMarcarPago = async (id: string) => {
    try {
      const { error } = await supabase
        .from('folha_pagamento')
        .update({ status: 'pago' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Pagamento registrado!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao registrar pagamento');
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Colunas da tabela
  const columns: Column<ItemFolha>[] = [
    {
      key: 'colaborador',
      label: 'Colaborador',
      render: (_, item) => item.colaborador?.nome || '-',
    },
    {
      key: 'cpf',
      label: 'CPF',
      render: (_, item) => (
        <span className="font-mono text-sm">
          {item.colaborador?.cpf ? formatCPF(item.colaborador.cpf) : '-'}
        </span>
      ),
    },
    {
      key: 'cargo',
      label: 'Cargo',
      render: (_, item) => item.colaborador?.cargo || '-',
    },
    {
      key: 'salario_base',
      label: 'Salário Base',
      render: (_, item) => (
        <span className="font-mono">{formatCurrency(item.salario_base)}</span>
      ),
    },
    {
      key: 'bonus',
      label: 'Bônus',
      render: (_, item) => (
        <span className="font-mono text-green-600">
          +{formatCurrency(item.bonus)}
        </span>
      ),
    },
    {
      key: 'descontos',
      label: 'Descontos',
      render: (_, item) => (
        <span className="font-mono text-red-600">
          -{formatCurrency(item.descontos)}
        </span>
      ),
    },
    {
      key: 'rateio',
      label: 'Rateio (RN-002)',
      render: (_, item) => {
        if (!item.rateio || Object.keys(item.rateio).length <= 1) {
          return <span className="text-gray-400 text-sm">-</span>;
        }
        return (
          <Badge className="bg-orange-100 text-orange-700 text-xs">
            {empresa && item.rateio[empresa.id] ? `${item.rateio[empresa.id]}%` : '-'}
          </Badge>
        );
      },
    },
    {
      key: 'salario_liquido',
      label: 'Valor Empresa',
      render: (_, item) => (
        <span className="font-mono text-blue-600">
          {formatCurrency(calcularValorEmpresa(item))}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, item) => getStatusBadge(item.status),
    },
  ];

  // Ações customizadas
  const customActions = (item: ItemFolha) => (
    <>
      {item.rateio && Object.keys(item.rateio).length > 1 && (
        <Button
          onClick={() => {
            setSelectedItem(item);
            setRateioDialogOpen(true);
          }}
          variant="ghost"
          size="sm"
          title="Ver Rateio"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
      {item.status === 'pendente' && (
        <Button
          onClick={() => handleAprovar(item.id)}
          variant="ghost"
          size="sm"
          className="text-blue-600"
          title="Aprovar"
        >
          ✅
        </Button>
      )}
      {item.status === 'aprovado' && (
        <Button
          onClick={() => handleMarcarPago(item.id)}
          variant="ghost"
          size="sm"
          className="text-green-600"
          title="Marcar como Pago"
        >
          💰
        </Button>
      )}
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
              <DollarSign className="w-8 h-8 text-[#28A745]" />
              Folha de Pagamento
            </h1>
            <p className="text-gray-600">
              {empresa?.nome} • {stats.total} colaborador(es)
            </p>
          </div>
          <Button className="bg-[#28A745] hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Holerites
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Salário Base</p>
            <p className="text-xl text-gray-900">{formatCurrency(stats.totalBruto)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Bônus</p>
            <p className="text-xl text-green-600">+{formatCurrency(stats.totalBonus)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Descontos</p>
            <p className="text-xl text-red-600">-{formatCurrency(stats.totalDescontos)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Líquido</p>
            <p className="text-xl text-blue-600">{formatCurrency(stats.totalLiquido)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PieChart className="w-4 h-4 text-orange-600" />
              <p className="text-sm text-gray-600">Com Rateio</p>
            </div>
            <p className="text-2xl text-orange-600">{stats.comRateio}</p>
            <Badge className="mt-1 text-xs bg-orange-100 text-orange-700">RN-002</Badge>
          </Card>
        </div>

        {/* Alerta RN-002 */}
        <Card className="p-4 bg-orange-50 border-orange-200 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900 mb-1">
                RN-002: Rateio Automático Aplicado
              </p>
              <p className="text-sm text-orange-700">
                Os valores exibidos já refletem o <strong>rateio por empresa</strong>. Colaboradores
                que trabalham em múltiplas empresas têm seus custos distribuídos automaticamente
                conforme os percentuais configurados.
              </p>
            </div>
          </div>
        </Card>

        {/* Resumo Financeiro */}
        <Card className="p-6 mb-4">
          <h3 className="font-medium text-gray-900 mb-4">Resumo Financeiro</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Salários Base</span>
              <span className="font-mono">{formatCurrency(stats.totalBruto)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-green-600">+ Total Bônus</span>
              <span className="font-mono text-green-600">{formatCurrency(stats.totalBonus)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-red-600">- Total Descontos</span>
              <span className="font-mono text-red-600">{formatCurrency(stats.totalDescontos)}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="font-medium text-gray-900">Total a Pagar (com rateio)</span>
              <span className="text-2xl font-mono text-blue-600">
                {formatCurrency(stats.totalLiquido)}
              </span>
            </div>
          </div>
        </Card>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs mb-1">Mês Referência</Label>
            <Select value={filterMes} onValueChange={setFilterMes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-11">Novembro 2024</SelectItem>
                <SelectItem value="2024-10">Outubro 2024</SelectItem>
                <SelectItem value="2024-09">Setembro 2024</SelectItem>
                <SelectItem value="2024-08">Agosto 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">⏳ Pendente</SelectItem>
                <SelectItem value="aprovado">✅ Aprovado</SelectItem>
                <SelectItem value="pago">💰 Pago</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Com Rateio (RN-002)</Label>
            <Select value={filterComRateio} onValueChange={setFilterComRateio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {folhaFiltrada.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhum item encontrado"
            description="Ajuste os filtros ou aguarde o processamento da folha"
            icon={<DollarSign className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={folhaFiltrada}
            columns={columns}
            searchPlaceholder="Buscar por colaborador..."
            customActions={customActions}
          />
        </Card>
      )}

      {/* Modal de Visualização de Rateio */}
      <Dialog open={rateioDialogOpen} onOpenChange={setRateioDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Detalhes do Rateio (RN-002)
            </DialogTitle>
            <DialogDescription>
              Distribuição do salário entre empresas do grupo
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm text-gray-900 mb-1">
                  {selectedItem.colaborador?.nome}
                </h4>
                <p className="text-xs text-gray-600">{selectedItem.colaborador?.cargo}</p>
                <p className="text-lg text-gray-900 mt-2">
                  Salário Líquido Total: {formatCurrency(selectedItem.salario_liquido)}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Distribuição por Empresa:</Label>
                {selectedItem.rateio &&
                  Object.entries(selectedItem.rateio).map(([empId, percentual]: [string, any]) => {
                    const emp = empresas.find((e) => e.id === empId);
                    const valor = (selectedItem.salario_liquido * percentual) / 100;
                    return (
                      <div
                        key={empId}
                        className="flex items-center justify-between p-3 bg-orange-50 rounded border border-orange-200"
                      >
                        <div className="flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-orange-600" />
                          <span className="text-sm text-gray-900">{emp?.nome || 'Empresa'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {percentual.toFixed(1)}%
                          </Badge>
                          <span className="text-sm text-gray-900">{formatCurrency(valor)}</span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="flex justify-between items-center p-3 bg-orange-100 rounded border-2 border-orange-300">
                <span className="text-sm text-gray-700">Total:</span>
                <span className="text-lg text-gray-900">
                  {formatCurrency(selectedItem.salario_liquido)}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}