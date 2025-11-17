'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE MATERIAIS - RN-006                                 ║
 * ║  Controle de estoque com bloqueio de negativos                ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Package,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  List,
  Grid,
  Download,
  Edit,
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Box,
} from 'lucide-react';
import { 
  createClient, 
  useEmpresa, 
  LoadingSpinner, 
  EmptyState,
  formatCurrency,
  formatDate 
} from '../../../lib/figma-make-helpers';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';

interface Material {
  id: string;
  codigo?: string;
  nome: string;
  descricao?: string;
  categoria_id?: string;
  categoria?: {
    nome: string;
  };
  unidade_medida: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  valor_unitario: number;
  localizacao?: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  empresa_id: string;
}

interface Movimentacao {
  id: string;
  material_id: string;
  material?: {
    nome: string;
    codigo?: string;
  };
  tipo: 'entrada' | 'saida';
  quantidade: number;
  motivo: string;
  observacao?: string;
  usuario: string;
  data_movimentacao: string;
}

export default function MateriaisPage() {
  const { empresa } = useEmpresa();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // Dialogs
  const [dialogMaterialOpen, setDialogMaterialOpen] = useState(false);
  const [dialogMovimentacaoOpen, setDialogMovimentacaoOpen] = useState(false);
  const [dialogHistoricoOpen, setDialogHistoricoOpen] = useState(false);
  
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterCategoria, setFilterCategoria] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Form Material
  const [formMaterial, setFormMaterial] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    unidade_medida: 'UN',
    estoque_atual: 0,
    estoque_minimo: 0,
    estoque_maximo: 0,
    valor_unitario: 0,
    localizacao: '',
    status: 'ativo' as const,
  });

  // Form Movimentação
  const [formMovimentacao, setFormMovimentacao] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: 0,
    motivo: '',
    observacao: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [empresa]);

  const fetchData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // Buscar materiais
      const { data: materiaisData, error: materiaisError } = await supabase
        .from('materiais')
        .select('*, categoria:categorias_material(nome)')
        .eq('empresa_id', empresa.id)
        .order('nome');

      if (materiaisError) throw materiaisError;

      // Buscar movimentações
      const { data: movimentacoesData } = await supabase
        .from('movimentacoes_estoque')
        .select('*, material:materiais(nome, codigo)')
        .eq('empresa_id', empresa.id)
        .order('data_movimentacao', { ascending: false })
        .limit(50);

      if (materiaisData) setMateriais(materiaisData);
      if (movimentacoesData) setMovimentacoes(movimentacoesData);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast.error('Erro ao carregar materiais');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar materiais
  const materiaisFiltrados = useMemo(() => {
    let resultado = materiais;

    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (m) =>
          m.nome.toLowerCase().includes(termo) ||
          m.codigo?.toLowerCase().includes(termo) ||
          m.descricao?.toLowerCase().includes(termo)
      );
    }

    if (filterStatus !== 'todos') {
      resultado = resultado.filter((m) => m.status === filterStatus);
    }

    if (showLowStock) {
      resultado = resultado.filter((m) => m.estoque_atual <= m.estoque_minimo);
    }

    return resultado;
  }, [materiais, searchTerm, filterStatus, showLowStock]);

  // Estatísticas
  const stats = {
    total: materiais.length,
    ativos: materiais.filter((m) => m.status === 'ativo').length,
    inativos: materiais.filter((m) => m.status === 'inativo').length,
    estoqueBaixo: materiais.filter((m) => m.estoque_atual <= m.estoque_minimo).length,
    valorTotal: materiais.reduce((acc, m) => acc + m.estoque_atual * m.valor_unitario, 0),
    quantidadeTotal: materiais.reduce((acc, m) => acc + m.estoque_atual, 0),
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      ativo: { color: 'bg-green-100 text-green-700', label: '✅ Ativo' },
      inativo: { color: 'bg-red-100 text-red-700', label: '❌ Inativo' },
      manutencao: { color: 'bg-yellow-100 text-yellow-700', label: '🔧 Manutenção' },
    };
    const config = configs[status as keyof typeof configs] || configs.ativo;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const handleOpenMaterialDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormMaterial({
        codigo: material.codigo || '',
        nome: material.nome,
        descricao: material.descricao || '',
        unidade_medida: material.unidade_medida,
        estoque_atual: material.estoque_atual,
        estoque_minimo: material.estoque_minimo,
        estoque_maximo: material.estoque_maximo,
        valor_unitario: material.valor_unitario,
        localizacao: material.localizacao || '',
        status: material.status,
      });
    } else {
      setEditingMaterial(null);
      setFormMaterial({
        codigo: '',
        nome: '',
        descricao: '',
        unidade_medida: 'UN',
        estoque_atual: 0,
        estoque_minimo: 0,
        estoque_maximo: 0,
        valor_unitario: 0,
        localizacao: '',
        status: 'ativo',
      });
    }
    setDialogMaterialOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (!formMaterial.nome || !formMaterial.unidade_medida) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const materialData = {
        ...formMaterial,
        empresa_id: empresa?.id,
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('materiais')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) throw error;
        toast.success('Material atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('materiais').insert(materialData);

        if (error) throw error;
        toast.success('Material cadastrado com sucesso!');
      }

      setDialogMaterialOpen(false);
      setEditingMaterial(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar material:', error);
      toast.error(error.message || 'Erro ao salvar material');
    }
  };

  const handleOpenMovimentacaoDialog = (material: Material) => {
    setSelectedMaterial(material);
    setFormMovimentacao({
      tipo: 'entrada',
      quantidade: 0,
      motivo: '',
      observacao: '',
    });
    setDialogMovimentacaoOpen(true);
  };

  const handleSaveMovimentacao = async () => {
    if (!selectedMaterial || formMovimentacao.quantidade <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // RN-006: Bloqueio de Estoque - Não permitir estoque negativo
    if (formMovimentacao.tipo === 'saida') {
      if (formMovimentacao.quantidade > selectedMaterial.estoque_atual) {
        toast.error(
          `❌ RN-006: Estoque insuficiente! Disponível: ${selectedMaterial.estoque_atual} ${selectedMaterial.unidade_medida}`
        );
        return;
      }
    }

    try {
      const novoEstoque =
        formMovimentacao.tipo === 'entrada'
          ? selectedMaterial.estoque_atual + formMovimentacao.quantidade
          : selectedMaterial.estoque_atual - formMovimentacao.quantidade;

      // Atualizar estoque do material
      const { error: materialError } = await supabase
        .from('materiais')
        .update({ estoque_atual: novoEstoque })
        .eq('id', selectedMaterial.id);

      if (materialError) throw materialError;

      // Registrar movimentação
      const { error: movError } = await supabase.from('movimentacoes_estoque').insert({
        material_id: selectedMaterial.id,
        empresa_id: empresa?.id,
        tipo: formMovimentacao.tipo,
        quantidade: formMovimentacao.quantidade,
        motivo: formMovimentacao.motivo,
        observacao: formMovimentacao.observacao || null,
        usuario: 'Sistema', // TODO: Pegar do usuário logado
        data_movimentacao: new Date().toISOString(),
      });

      if (movError) throw movError;

      toast.success(
        `${formMovimentacao.tipo === 'entrada' ? '✅ Entrada' : '🔻 Saída'} registrada com sucesso!`
      );

      setDialogMovimentacaoOpen(false);
      setSelectedMaterial(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error(error.message || 'Erro ao registrar movimentação');
    }
  };

  const handleOpenHistorico = async (material: Material) => {
    setSelectedMaterial(material);

    // Buscar histórico do material
    const { data } = await supabase
      .from('movimentacoes_estoque')
      .select('*')
      .eq('material_id', material.id)
      .order('data_movimentacao', { ascending: false })
      .limit(20);

    if (data) setMovimentacoes(data);
    setDialogHistoricoOpen(true);
  };

  // Colunas da tabela
  const columns: Column<Material>[] = [
    {
      key: 'codigo',
      label: 'Código',
      render: (_, item) => (
        <span className="font-mono text-sm text-gray-600">{item.codigo || '-'}</span>
      ),
    },
    {
      key: 'nome',
      label: 'Nome',
      render: (_, item) => (
        <div>
          <p className="text-gray-900">{item.nome}</p>
          {item.categoria && <p className="text-xs text-gray-500">{item.categoria.nome}</p>}
        </div>
      ),
    },
    {
      key: 'estoque',
      label: 'Estoque Atual',
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-gray-900">
            {item.estoque_atual} {item.unidade_medida}
          </span>
          {item.estoque_atual <= item.estoque_minimo && (
            <AlertTriangle className="w-4 h-4 text-orange-500" title="Estoque baixo" />
          )}
        </div>
      ),
    },
    {
      key: 'minmax',
      label: 'Mín / Máx',
      render: (_, item) => (
        <div className="text-sm text-gray-600">
          <p>Mín: {item.estoque_minimo}</p>
          <p>Máx: {item.estoque_maximo}</p>
        </div>
      ),
    },
    {
      key: 'valor',
      label: 'Valor Un.',
      render: (_, item) => (
        <span className="font-mono text-sm text-gray-900">
          {formatCurrency(item.valor_unitario)}
        </span>
      ),
    },
    {
      key: 'valorTotal',
      label: 'Valor Total',
      render: (_, item) => (
        <span className="font-mono text-sm text-green-600">
          {formatCurrency(item.estoque_atual * item.valor_unitario)}
        </span>
      ),
    },
    {
      key: 'localizacao',
      label: 'Localização',
      render: (_, item) => <span className="text-sm text-gray-600">{item.localizacao || '-'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, item) => getStatusBadge(item.status),
    },
  ];

  // Ações customizadas
  const customActions = (item: Material) => (
    <>
      <Button
        onClick={() => handleOpenMovimentacaoDialog(item)}
        variant="ghost"
        size="sm"
        title="Movimentar Estoque"
        className="text-blue-600"
      >
        <ArrowUpCircle className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => handleOpenHistorico(item)}
        variant="ghost"
        size="sm"
        title="Ver Histórico"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        onClick={() => handleOpenMaterialDialog(item)}
        variant="ghost"
        size="sm"
        title="Editar"
      >
        <Edit className="w-4 h-4" />
      </Button>
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
              <Package className="w-8 h-8 text-[#1F4788]" />
              Materiais e Estoque
            </h1>
            <p className="text-gray-600">
              {empresa?.nome} • {stats.total} material(is)
            </p>
            <Badge className="mt-2 bg-red-100 text-red-700">
              RN-006: Bloqueio de Estoque Negativo
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

            <Button variant="outline" className="border-[#1F4788] text-[#1F4788]">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button onClick={() => handleOpenMaterialDialog()} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Box className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Ativos</p>
            </div>
            <p className="text-2xl text-green-600">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <p className="text-sm text-gray-600">Estoque Baixo</p>
            </div>
            <p className="text-2xl text-orange-600">{stats.estoqueBaixo}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Qtd Total</p>
            <p className="text-2xl text-blue-600">{stats.quantidadeTotal.toFixed(0)}</p>
          </Card>
          <Card className="p-4 col-span-2">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Valor Total em Estoque</p>
            </div>
            <p className="text-2xl text-green-600">{formatCurrency(stats.valorTotal)}</p>
          </Card>
        </div>

        {/* Alerta de Estoque Baixo */}
        {stats.estoqueBaixo > 0 && (
          <Card className="p-4 mb-4 bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">⚠️ Atenção: Estoque Baixo</div>
                  <div className="text-sm text-orange-700">
                    {stats.estoqueBaixo} materiais abaixo do estoque mínimo
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setShowLowStock(!showLowStock)}
                variant="outline"
                size="sm"
                className="border-orange-300"
              >
                {showLowStock ? 'Mostrar Todos' : 'Ver Estoque Baixo'}
              </Button>
            </div>
          </Card>
        )}

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs mb-1">Buscar</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, código ou descrição..."
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
                <SelectItem value="inativo">❌ Inativo</SelectItem>
                <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Filtro Rápido</Label>
            <Select value={showLowStock ? 'baixo' : 'todos'} onValueChange={(v) => setShowLowStock(v === 'baixo')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="baixo">⚠️ Estoque Baixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {materiaisFiltrados.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhum material encontrado"
            description="Ajuste os filtros ou cadastre um novo material"
            actionLabel="Novo Material"
            onAction={() => handleOpenMaterialDialog()}
            icon={<Package className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="p-6">
          <DataTable
            data={materiaisFiltrados}
            columns={columns}
            searchPlaceholder="Buscar materiais..."
            customActions={customActions}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiaisFiltrados.map((material) => (
            <Card key={material.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm text-gray-600">{material.codigo || 'S/CÓD'}</p>
                  <h3 className="text-lg text-gray-900">{material.nome}</h3>
                  {material.categoria && (
                    <p className="text-sm text-gray-500">{material.categoria.nome}</p>
                  )}
                </div>
                {getStatusBadge(material.status)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">Estoque Atual:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg text-gray-900">
                      {material.estoque_atual} {material.unidade_medida}
                    </span>
                    {material.estoque_atual <= material.estoque_minimo && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Mínimo:</p>
                    <p className="font-mono text-gray-900">{material.estoque_minimo}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Máximo:</p>
                    <p className="font-mono text-gray-900">{material.estoque_maximo}</p>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Valor Unitário:</span>
                    <span className="font-mono text-gray-900">
                      {formatCurrency(material.valor_unitario)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor Total:</span>
                    <span className="font-mono text-lg text-green-600">
                      {formatCurrency(material.estoque_atual * material.valor_unitario)}
                    </span>
                  </div>
                </div>

                {material.localizacao && (
                  <div className="text-sm">
                    <p className="text-gray-600">Localização:</p>
                    <p className="text-gray-900">{material.localizacao}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenMovimentacaoDialog(material)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ArrowUpCircle className="w-4 h-4 mr-1" />
                  Movimentar
                </Button>
                <Button
                  onClick={() => handleOpenHistorico(material)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Histórico
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Material */}
      <Dialog open={dialogMaterialOpen} onOpenChange={setDialogMaterialOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMaterial ? 'Editar Material' : 'Novo Material'}</DialogTitle>
            <DialogDescription>Preencha as informações do material</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codigo">Código (Opcional)</Label>
                <Input
                  id="codigo"
                  value={formMaterial.codigo}
                  onChange={(e) => setFormMaterial({ ...formMaterial, codigo: e.target.value })}
                  placeholder="MAT-001"
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formMaterial.status}
                  onValueChange={(value: any) => setFormMaterial({ ...formMaterial, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="inativo">❌ Inativo</SelectItem>
                    <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="nome">Nome do Material *</Label>
                <Input
                  id="nome"
                  value={formMaterial.nome}
                  onChange={(e) => setFormMaterial({ ...formMaterial, nome: e.target.value })}
                  placeholder="Ex: Parafuso M10"
                />
              </div>

              <div>
                <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
                <Select
                  value={formMaterial.unidade_medida}
                  onValueChange={(value) => setFormMaterial({ ...formMaterial, unidade_medida: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UN">UN - Unidade</SelectItem>
                    <SelectItem value="KG">KG - Quilograma</SelectItem>
                    <SelectItem value="L">L - Litro</SelectItem>
                    <SelectItem value="M">M - Metro</SelectItem>
                    <SelectItem value="M2">M² - Metro Quadrado</SelectItem>
                    <SelectItem value="M3">M³ - Metro Cúbico</SelectItem>
                    <SelectItem value="CX">CX - Caixa</SelectItem>
                    <SelectItem value="PC">PC - Peça</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="valor_unitario">Valor Unitário (R$) *</Label>
                <Input
                  id="valor_unitario"
                  type="number"
                  step="0.01"
                  value={formMaterial.valor_unitario}
                  onChange={(e) =>
                    setFormMaterial({ ...formMaterial, valor_unitario: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <Label htmlFor="estoque_atual">Estoque Atual *</Label>
                <Input
                  id="estoque_atual"
                  type="number"
                  step="0.01"
                  value={formMaterial.estoque_atual}
                  onChange={(e) =>
                    setFormMaterial({ ...formMaterial, estoque_atual: parseFloat(e.target.value) || 0 })
                  }
                  disabled={!!editingMaterial}
                />
                {editingMaterial && (
                  <p className="text-xs text-gray-500 mt-1">
                    Use "Movimentar" para alterar o estoque
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="estoque_minimo">Estoque Mínimo *</Label>
                <Input
                  id="estoque_minimo"
                  type="number"
                  step="0.01"
                  value={formMaterial.estoque_minimo}
                  onChange={(e) =>
                    setFormMaterial({ ...formMaterial, estoque_minimo: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div>
                <Label htmlFor="estoque_maximo">Estoque Máximo *</Label>
                <Input
                  id="estoque_maximo"
                  type="number"
                  step="0.01"
                  value={formMaterial.estoque_maximo}
                  onChange={(e) =>
                    setFormMaterial({ ...formMaterial, estoque_maximo: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="localizacao">Localização</Label>
                <Input
                  id="localizacao"
                  value={formMaterial.localizacao}
                  onChange={(e) => setFormMaterial({ ...formMaterial, localizacao: e.target.value })}
                  placeholder="Ex: Galpão A - Prateleira 3"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formMaterial.descricao}
                  onChange={(e) => setFormMaterial({ ...formMaterial, descricao: e.target.value })}
                  placeholder="Descrição detalhada do material"
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
                setDialogMaterialOpen(false);
                setEditingMaterial(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSaveMaterial} className="bg-[#1F4788] hover:bg-blue-800">
              {editingMaterial ? 'Atualizar' : 'Cadastrar'} Material
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Movimentação */}
      <Dialog open={dialogMovimentacaoOpen} onOpenChange={setDialogMovimentacaoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Movimentação de Estoque - RN-006</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.nome} - Estoque atual: {selectedMaterial?.estoque_atual}{' '}
              {selectedMaterial?.unidade_medida}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={formMovimentacao.tipo} onValueChange={(value: any) => setFormMovimentacao({ ...formMovimentacao, tipo: value })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="entrada" className="flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4" />
                Entrada
              </TabsTrigger>
              <TabsTrigger value="saida" className="flex items-center gap-2">
                <ArrowDownCircle className="w-4 h-4" />
                Saída
              </TabsTrigger>
            </TabsList>

            <TabsContent value="entrada" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  value={formMovimentacao.quantidade}
                  onChange={(e) =>
                    setFormMovimentacao({ ...formMovimentacao, quantidade: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="motivo">Motivo *</Label>
                <Select
                  value={formMovimentacao.motivo}
                  onValueChange={(value) => setFormMovimentacao({ ...formMovimentacao, motivo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Compra">Compra</SelectItem>
                    <SelectItem value="Devolução">Devolução</SelectItem>
                    <SelectItem value="Ajuste de Inventário">Ajuste de Inventário</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formMovimentacao.observacao}
                  onChange={(e) => setFormMovimentacao({ ...formMovimentacao, observacao: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>

              {formMovimentacao.quantidade > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Novo estoque:{' '}
                    <span className="font-mono font-bold">
                      {(selectedMaterial?.estoque_atual || 0) + formMovimentacao.quantidade}{' '}
                      {selectedMaterial?.unidade_medida}
                    </span>
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saida" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="quantidade">Quantidade *</Label>
                <Input
                  id="quantidade"
                  type="number"
                  step="0.01"
                  value={formMovimentacao.quantidade}
                  onChange={(e) =>
                    setFormMovimentacao({ ...formMovimentacao, quantidade: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Disponível: {selectedMaterial?.estoque_atual} {selectedMaterial?.unidade_medida}
                </p>
              </div>

              <div>
                <Label htmlFor="motivo">Motivo *</Label>
                <Select
                  value={formMovimentacao.motivo}
                  onValueChange={(value) => setFormMovimentacao({ ...formMovimentacao, motivo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Consumo">Consumo</SelectItem>
                    <SelectItem value="Venda">Venda</SelectItem>
                    <SelectItem value="Perda">Perda</SelectItem>
                    <SelectItem value="Transferência">Transferência</SelectItem>
                    <SelectItem value="Ajuste de Inventário">Ajuste de Inventário</SelectItem>
                    <SelectItem value="Outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacao">Observação</Label>
                <Textarea
                  id="observacao"
                  value={formMovimentacao.observacao}
                  onChange={(e) => setFormMovimentacao({ ...formMovimentacao, observacao: e.target.value })}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>

              {formMovimentacao.quantidade > 0 && (
                <>
                  {formMovimentacao.quantidade > (selectedMaterial?.estoque_atual || 0) ? (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 font-medium">
                        ❌ RN-006: Estoque insuficiente! Quantidade solicitada maior que o disponível.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <TrendingDown className="w-4 h-4 inline mr-1" />
                        Novo estoque:{' '}
                        <span className="font-mono font-bold">
                          {(selectedMaterial?.estoque_atual || 0) - formMovimentacao.quantidade}{' '}
                          {selectedMaterial?.unidade_medida}
                        </span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogMovimentacaoOpen(false);
                setSelectedMaterial(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveMovimentacao}
              className="bg-[#1F4788] hover:bg-blue-800"
            >
              Confirmar Movimentação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Histórico */}
      <Dialog open={dialogHistoricoOpen} onOpenChange={setDialogHistoricoOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
            <DialogDescription>
              {selectedMaterial?.nome} - Últimas 20 movimentações
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {movimentacoes.length > 0 ? (
              movimentacoes.map((mov) => (
                <div key={mov.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {mov.tipo === 'entrada' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                          Entrada
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <ArrowDownCircle className="w-3 h-3 mr-1" />
                          Saída
                        </Badge>
                      )}
                      <span className="font-mono text-lg text-gray-900">
                        {mov.quantidade} {selectedMaterial?.unidade_medida}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(mov.data_movimentacao)}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="text-gray-600">Motivo:</span>{' '}
                      <span className="text-gray-900">{mov.motivo}</span>
                    </p>
                    {mov.observacao && (
                      <p className="text-sm">
                        <span className="text-gray-600">Observação:</span>{' '}
                        <span className="text-gray-900">{mov.observacao}</span>
                      </p>
                    )}
                    <p className="text-sm">
                      <span className="text-gray-600">Usuário:</span>{' '}
                      <span className="text-gray-900">{mov.usuario}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p>Nenhuma movimentação registrada</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}