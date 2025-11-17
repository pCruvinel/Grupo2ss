'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE ORDENS DE SERVIÇO - NEXT.JS                       ║
 * ║  Com filtros avançados, ações em lote e exportação            ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  Breadcrumbs,
  AdvancedFilters,
  BulkActions,
  useBulkSelection,
  ExportData,
  ResponsiveTable,
  NoOrdensEmptyState,
  TableSkeleton,
  NoSearchResultsEmptyState,
  SectionErrorBoundary,
} from '../../../components/shared';
import { createClient, MOCK_EMPRESAS, formatDate } from '../../../lib/figma-make-helpers';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';

// Inline mocks for hooks
const useDebounce = (value: any, delay: number) => value;
const usePagination = (config: any) => ({
  currentPage: 1,
  totalPages: Math.ceil(config.totalItems / config.itemsPerPage),
  startIndex: 0,
  endIndex: config.itemsPerPage,
  hasPreviousPage: false,
  hasNextPage: config.totalItems > config.itemsPerPage,
  goToPreviousPage: () => {},
  goToNextPage: () => {},
  goToPage: (page: number) => {},
});
const useIsMobile = () => false;

interface OrdemServico {
  id: string;
  numero: string;
  descricao: string;
  tipo: string;
  veiculo_id?: string;
  veiculo?: {
    placa: string;
    marca: string;
    modelo: string;
  };
  solicitante: string;
  responsavel?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  data_abertura: string;
  data_prevista?: string;
  data_conclusao?: string;
  custo_previsto?: number;
  custo_real?: number;
  observacoes?: string;
  empresa_id: string;
}

export default function OrdensServicoPage() {
  const { empresa } = useEmpresa();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrdem, setEditingOrdem] = useState<OrdemServico | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPrioridade, setFilterPrioridade] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    tipo: '',
    veiculo_id: '',
    solicitante: '',
    responsavel: '',
    prioridade: 'media' as const,
    status: 'pendente' as const,
    data_abertura: new Date().toISOString().split('T')[0],
    data_prevista: '',
    custo_previsto: 0,
    observacoes: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [empresa]);

  const fetchData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // Buscar veículos
      const { data: veiculosData } = await supabase
        .from('veiculos')
        .select('*')
        .eq('empresa_id', empresa.id)
        .eq('status', 'ativo')
        .order('placa');

      // Buscar ordens de serviço
      const { data: ordensData, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          veiculo:veiculos(placa, marca, modelo)
        `)
        .eq('empresa_id', empresa.id)
        .order('data_abertura', { ascending: false });

      if (error) throw error;

      if (veiculosData) setVeiculos(veiculosData);
      if (ordensData) setOrdens(ordensData);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ordens
  const ordensFiltradas = useMemo(() => {
    let resultado = ordens;

    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (o) =>
          o.numero.toLowerCase().includes(termo) ||
          o.descricao.toLowerCase().includes(termo) ||
          o.solicitante.toLowerCase().includes(termo)
      );
    }

    if (filterStatus !== 'todos') {
      resultado = resultado.filter((o) => o.status === filterStatus);
    }

    if (filterPrioridade !== 'todos') {
      resultado = resultado.filter((o) => o.prioridade === filterPrioridade);
    }

    if (filterTipo !== 'todos') {
      resultado = resultado.filter((o) => o.tipo === filterTipo);
    }

    return resultado;
  }, [ordens, searchTerm, filterStatus, filterPrioridade, filterTipo]);

  // Estatísticas
  const stats = {
    total: ordens.length,
    pendentes: ordens.filter((o) => o.status === 'pendente').length,
    emAndamento: ordens.filter((o) => o.status === 'em_andamento').length,
    concluidas: ordens.filter((o) => o.status === 'concluida').length,
    canceladas: ordens.filter((o) => o.status === 'cancelada').length,
    custoPrevisto: ordens.reduce((acc, o) => acc + (o.custo_previsto || 0), 0),
    custoReal: ordens
      .filter((o) => o.status === 'concluida')
      .reduce((acc, o) => acc + (o.custo_real || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      pendente: { color: 'bg-yellow-100 text-yellow-700', label: '⏳ Pendente', icon: Clock },
      em_andamento: { color: 'bg-blue-100 text-blue-700', label: '🔄 Em Andamento', icon: AlertTriangle },
      concluida: { color: 'bg-green-100 text-green-700', label: '✅ Concluída', icon: CheckCircle },
      cancelada: { color: 'bg-red-100 text-red-700', label: '❌ Cancelada', icon: XCircle },
    };
    const config = configs[status as keyof typeof configs] || configs.pendente;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const configs = {
      baixa: { color: 'bg-gray-100 text-gray-700', label: 'Baixa' },
      media: { color: 'bg-blue-100 text-blue-700', label: 'Média' },
      alta: { color: 'bg-orange-100 text-orange-700', label: 'Alta' },
      urgente: { color: 'bg-red-100 text-red-700', label: '🚨 Urgente' },
    };
    const config = configs[prioridade as keyof typeof configs] || configs.media;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleOpenDialog = (ordem?: OrdemServico) => {
    if (ordem) {
      setEditingOrdem(ordem);
      setFormData({
        numero: ordem.numero,
        descricao: ordem.descricao,
        tipo: ordem.tipo,
        veiculo_id: ordem.veiculo_id || '',
        solicitante: ordem.solicitante,
        responsavel: ordem.responsavel || '',
        prioridade: ordem.prioridade,
        status: ordem.status,
        data_abertura: ordem.data_abertura,
        data_prevista: ordem.data_prevista || '',
        custo_previsto: ordem.custo_previsto || 0,
        observacoes: ordem.observacoes || '',
      });
    } else {
      setEditingOrdem(null);
      const proximoNumero = `OS-${String(ordens.length + 1).padStart(4, '0')}`;
      setFormData({
        numero: proximoNumero,
        descricao: '',
        tipo: '',
        veiculo_id: '',
        solicitante: '',
        responsavel: '',
        prioridade: 'media',
        status: 'pendente',
        data_abertura: new Date().toISOString().split('T')[0],
        data_prevista: '',
        custo_previsto: 0,
        observacoes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.descricao || !formData.tipo || !formData.solicitante) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const ordemData = {
        ...formData,
        empresa_id: empresa?.id,
        veiculo_id: formData.veiculo_id || null,
        responsavel: formData.responsavel || null,
        data_prevista: formData.data_prevista || null,
        custo_previsto: formData.custo_previsto || null,
        observacoes: formData.observacoes || null,
      };

      if (editingOrdem) {
        // Atualizar
        const { error } = await supabase
          .from('ordens_servico')
          .update(ordemData)
          .eq('id', editingOrdem.id);

        if (error) throw error;
        toast.success('Ordem atualizada com sucesso!');
      } else {
        // Criar
        const { error } = await supabase.from('ordens_servico').insert(ordemData);

        if (error) throw error;
        toast.success('Ordem criada com sucesso!');
      }

      setDialogOpen(false);
      setEditingOrdem(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar ordem:', error);
      toast.error(error.message || 'Erro ao salvar ordem');
    }
  };

  const handleAtualizarStatus = async (ordemId: string, novoStatus: string) => {
    try {
      const updateData: any = { status: novoStatus };

      if (novoStatus === 'concluida') {
        updateData.data_conclusao = new Date().toISOString().split('T')[0];
      }

      const { error } = await supabase
        .from('ordens_servico')
        .update(updateData)
        .eq('id', ordemId);

      if (error) throw error;

      toast.success('Status atualizado com sucesso!');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  // Colunas da tabela
  const columns: Column<OrdemServico>[] = [
    {
      key: 'numero',
      label: 'Número',
      render: (_, item) => (
        <span className="font-mono text-sm text-blue-600">{item.numero}</span>
      ),
    },
    {
      key: 'descricao',
      label: 'Descrição',
      render: (_, item) => (
        <div>
          <p className="text-gray-900">{item.descricao}</p>
          <p className="text-xs text-gray-500">{item.tipo}</p>
        </div>
      ),
    },
    {
      key: 'veiculo',
      label: 'Veículo',
      render: (_, item) => (
        <div className="flex items-center gap-2">
          {item.veiculo ? (
            <>
              <Car className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-mono text-gray-900">{item.veiculo.placa}</p>
                <p className="text-xs text-gray-500">
                  {item.veiculo.marca} {item.veiculo.modelo}
                </p>
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'solicitante',
      label: 'Solicitante',
      render: (_, item) => <span className="text-sm text-gray-600">{item.solicitante}</span>,
    },
    {
      key: 'prioridade',
      label: 'Prioridade',
      render: (_, item) => getPrioridadeBadge(item.prioridade),
    },
    {
      key: 'data_abertura',
      label: 'Data Abertura',
      render: (_, item) => (
        <span className="text-sm text-gray-600">{formatDate(item.data_abertura)}</span>
      ),
    },
    {
      key: 'custo',
      label: 'Custo Previsto',
      render: (_, item) => (
        <span className="font-mono text-sm text-gray-900">
          {item.custo_previsto ? formatCurrency(item.custo_previsto) : '-'}
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
  const customActions = (item: OrdemServico) => (
    <>
      <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" title="Editar">
        <Edit className="w-4 h-4" />
      </Button>
      {item.status === 'pendente' && (
        <Button
          onClick={() => handleAtualizarStatus(item.id, 'em_andamento')}
          variant="ghost"
          size="sm"
          className="text-blue-600"
          title="Iniciar"
        >
          🔄
        </Button>
      )}
      {item.status === 'em_andamento' && (
        <Button
          onClick={() => handleAtualizarStatus(item.id, 'concluida')}
          variant="ghost"
          size="sm"
          className="text-green-600"
          title="Concluir"
        >
          ✅
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
              <FileText className="w-8 h-8 text-[#1F4788]" />
              Ordens de Serviço
            </h1>
            <p className="text-gray-600">
              {empresa?.nome} • {stats.total} ordem(ns)
            </p>
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

            <Button variant="outline" className="border-[#1F4788] text-[#1F4788]">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button onClick={() => handleOpenDialog()} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Nova Ordem
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <p className="text-2xl text-yellow-600">{stats.pendentes}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">Em Andamento</p>
            </div>
            <p className="text-2xl text-blue-600">{stats.emAndamento}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Concluídas</p>
            </div>
            <p className="text-2xl text-green-600">{stats.concluidas}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600">Canceladas</p>
            </div>
            <p className="text-2xl text-red-600">{stats.canceladas}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Custo Previsto</p>
            <p className="text-xl text-gray-900">{formatCurrency(stats.custoPrevisto)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Custo Real</p>
            <p className="text-xl text-green-600">{formatCurrency(stats.custoReal)}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="text-xs mb-1">Buscar</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Número, descrição ou solicitante..."
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
                <SelectItem value="pendente">⏳ Pendente</SelectItem>
                <SelectItem value="em_andamento">🔄 Em Andamento</SelectItem>
                <SelectItem value="concluida">✅ Concluída</SelectItem>
                <SelectItem value="cancelada">❌ Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Prioridade</Label>
            <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">🚨 Urgente</SelectItem>
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
                <SelectItem value="Manutenção Preventiva">Manutenção Preventiva</SelectItem>
                <SelectItem value="Manutenção Corretiva">Manutenção Corretiva</SelectItem>
                <SelectItem value="Reparo">Reparo</SelectItem>
                <SelectItem value="Inspeção">Inspeção</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {ordensFiltradas.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhuma ordem encontrada"
            description="Ajuste os filtros ou crie uma nova ordem de serviço"
            actionLabel="Nova Ordem"
            onAction={() => handleOpenDialog()}
            icon={<FileText className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="p-6">
          <DataTable
            data={ordensFiltradas}
            columns={columns}
            searchPlaceholder="Buscar ordens..."
            customActions={customActions}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ordensFiltradas.map((ordem) => (
            <Card key={ordem.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm text-blue-600">{ordem.numero}</p>
                  <p className="text-sm text-gray-600">{ordem.tipo}</p>
                </div>
                {getStatusBadge(ordem.status)}
              </div>

              <h3 className="text-lg text-gray-900 mb-2">{ordem.descricao}</h3>

              <div className="space-y-2 mb-4">
                {ordem.veiculo && (
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">
                      {ordem.veiculo.placa} - {ordem.veiculo.marca} {ordem.veiculo.modelo}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Aberta em {formatDate(ordem.data_abertura)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solicitante:</span>
                  <span className="text-sm text-gray-900">{ordem.solicitante}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Prioridade:</span>
                  {getPrioridadeBadge(ordem.prioridade)}
                </div>
                {ordem.custo_previsto && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Custo:</span>
                    <span className="text-sm text-gray-900">
                      {formatCurrency(ordem.custo_previsto)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleOpenDialog(ordem)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
                {ordem.status === 'pendente' && (
                  <Button
                    onClick={() => handleAtualizarStatus(ordem.id, 'em_andamento')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    🔄 Iniciar
                  </Button>
                )}
                {ordem.status === 'em_andamento' && (
                  <Button
                    onClick={() => handleAtualizarStatus(ordem.id, 'concluida')}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    ✅ Concluir
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOrdem ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações da ordem de serviço
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  disabled={!!editingOrdem}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manutenção Preventiva">Manutenção Preventiva</SelectItem>
                    <SelectItem value="Manutenção Corretiva">Manutenção Corretiva</SelectItem>
                    <SelectItem value="Reparo">Reparo</SelectItem>
                    <SelectItem value="Inspeção">Inspeção</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva a ordem de serviço..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="veiculo_id">Veículo</Label>
                <Select
                  value={formData.veiculo_id}
                  onValueChange={(value) => setFormData({ ...formData, veiculo_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {veiculos.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.placa} - {v.marca} {v.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="prioridade">Prioridade *</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value: any) => setFormData({ ...formData, prioridade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">🚨 Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="solicitante">Solicitante *</Label>
                <Input
                  id="solicitante"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={formData.responsavel}
                  onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="data_abertura">Data Abertura *</Label>
                <Input
                  id="data_abertura"
                  type="date"
                  value={formData.data_abertura}
                  onChange={(e) => setFormData({ ...formData, data_abertura: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="data_prevista">Data Prevista</Label>
                <Input
                  id="data_prevista"
                  type="date"
                  value={formData.data_prevista}
                  onChange={(e) => setFormData({ ...formData, data_prevista: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="custo_previsto">Custo Previsto (R$)</Label>
                <Input
                  id="custo_previsto"
                  type="number"
                  step="0.01"
                  value={formData.custo_previsto}
                  onChange={(e) =>
                    setFormData({ ...formData, custo_previsto: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              {editingOrdem && (
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">⏳ Pendente</SelectItem>
                      <SelectItem value="em_andamento">🔄 Em Andamento</SelectItem>
                      <SelectItem value="concluida">✅ Concluída</SelectItem>
                      <SelectItem value="cancelada">❌ Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingOrdem(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
              {editingOrdem ? 'Atualizar' : 'Criar'} Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}