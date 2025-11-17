import { useState } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter, DollarSign, Tag, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';

interface Servico {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  descricao: string;
  valor_padrao: number;
  empresa_id: string;
  status: string;
}

interface CatalogosProps {
  servicos?: Servico[];
  empresas?: Array<{ id: string; nome: string }>;
  empresaAtual?: string;
  onUpdate?: (servicos: Servico[]) => void;
}

export default function Catalogos({ 
  servicos = [], 
  empresas = [],
  empresaAtual = '1',
  onUpdate 
}: CatalogosProps) {
  const [servicosList, setServicosList] = useState<Servico[]>(servicos);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    categoria: '',
    descricao: '',
    valor_padrao: '',
    status: 'ativo',
  });

  const categorias = Array.from(new Set(servicosList.map(s => s.categoria)));

  const servicosFiltrados = servicosList.filter(servico => {
    const matchSearch = servico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       servico.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = categoriaFilter === 'todas' || servico.categoria === categoriaFilter;
    return matchSearch && matchCategoria;
  });

  const handleSave = () => {
    if (!formData.nome || !formData.categoria || !formData.valor_padrao) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const novoServico: Servico = {
      id: editingServico?.id || `srv-${Date.now()}`,
      codigo: formData.codigo || `SRV-${Date.now()}`,
      nome: formData.nome,
      categoria: formData.categoria,
      descricao: formData.descricao,
      valor_padrao: parseFloat(formData.valor_padrao),
      empresa_id: empresaAtual,
      status: formData.status,
    };

    let updatedServicos;
    if (editingServico) {
      updatedServicos = servicosList.map(s => s.id === novoServico.id ? novoServico : s);
      toast.success('Serviço atualizado com sucesso!');
    } else {
      updatedServicos = [...servicosList, novoServico];
      toast.success('Serviço criado com sucesso!');
    }

    setServicosList(updatedServicos);
    if (onUpdate) onUpdate(updatedServicos);
    
    handleCloseDialog();
  };

  const handleEdit = (servico: Servico) => {
    setEditingServico(servico);
    setFormData({
      codigo: servico.codigo,
      nome: servico.nome,
      categoria: servico.categoria,
      descricao: servico.descricao,
      valor_padrao: servico.valor_padrao.toString(),
      status: servico.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedServicos = servicosList.filter(s => s.id !== id);
    setServicosList(updatedServicos);
    if (onUpdate) onUpdate(updatedServicos);
    toast.success('Serviço excluído com sucesso!');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingServico(null);
    setFormData({
      codigo: '',
      nome: '',
      categoria: '',
      descricao: '',
      valor_padrao: '',
      status: 'ativo',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Catálogo de Serviços</h1>
        <p className="text-gray-600">Gerencie os serviços e produtos oferecidos pela empresa</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas Categorias</SelectItem>
            {categorias.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingServico(null)} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingServico ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do serviço
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input
                    id="codigo"
                    placeholder="SRV-001"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    placeholder="Ex: Marketing, Eventos, etc"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Serviço *</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome do serviço"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o serviço..."
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor Padrão (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.valor_padrao}
                    onChange={(e) => setFormData({ ...formData, valor_padrao: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingServico ? 'Atualizar' : 'Criar'} Serviço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {servicosFiltrados.map((servico) => (
          <Card key={servico.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg mb-1 truncate">{servico.nome}</CardTitle>
                  <CardDescription className="text-xs">{servico.codigo}</CardDescription>
                </div>
                <Badge className={getStatusColor(servico.status)} variant="secondary">
                  {servico.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{servico.categoria}</span>
              </div>

              {servico.descricao && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{servico.descricao}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="font-medium text-green-700">
                  R$ {servico.valor_padrao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(servico)}
                  className="flex-1 gap-2"
                >
                  <Edit className="h-3 w-3" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(servico.id)}
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {servicosFiltrados.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum serviço encontrado</p>
            <p className="text-sm text-gray-500">Ajuste os filtros ou crie um novo serviço</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
