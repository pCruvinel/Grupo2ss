import { useState } from 'react';
import { Plus, Edit, Search, List, Grid, Package, AlertTriangle, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { NovoMaterialModal } from './NovoMaterialModal';
import { Pagination } from './shared/Pagination';

interface Material {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'aluguel' | 'venda';
  quantidade_total: number;
  quantidade_disponivel: number;
  quantidade_bloqueada: number;
  empresa_id: string;
  status: 'ativo' | 'inativo';
  ordem_servico_vinculada?: string;
  valor_unitario?: number;
  categoria?: string;
}

interface MateriaisDashboardProps {
  materiais: Material[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
}

export function MateriaisDashboard({ materiais, empresas, empresaAtual, onUpdate }: MateriaisDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [materiaisData, setMateriaisData] = useState(materiais);

  const [formData, setFormData] = useState<Partial<Material>>({
    status: 'ativo',
    empresa_id: empresaAtual,
    tipo: 'venda',
    quantidade_bloqueada: 0,
  });

  // Filtros
  const materiaisFiltrados = materiaisData.filter(m => {
    const matchSearch = m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       m.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTipo = tipoFilter === 'todos' || m.tipo === tipoFilter;
    const matchStatus = statusFilter === 'todos' || 
                       (statusFilter === 'bloqueado' && m.quantidade_bloqueada > 0) ||
                       (statusFilter === 'disponivel' && m.quantidade_disponivel > 0);
    return matchSearch && matchTipo && matchStatus;
  });

  // Paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = materiaisFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveNovoMaterial = (novoMaterial: any) => {
    setMateriaisData([...materiaisData, novoMaterial]);
    onUpdate?.();
  };

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setIsEditing(true);
      setSelectedMaterial(material);
      setFormData(material);
    } else {
      setIsEditing(false);
      setSelectedMaterial(null);
      setFormData({
        status: 'ativo',
        empresa_id: empresaAtual,
        tipo: 'venda',
        quantidade_bloqueada: 0,
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.codigo || !formData.quantidade_total) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditing) {
      toast.success('Material atualizado com sucesso!');
    } else {
      toast.success('Material criado com sucesso!');
    }

    setShowModal(false);
    onUpdate?.();
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Materiais e Estoque</h1>
            <p className="text-gray-600">Gestão de materiais e equipamentos</p>
            <Badge className="mt-2 bg-red-100 text-red-700">RN-006: Bloqueio de Estoque em Aluguel</Badge>
          </div>
          <div className="flex gap-2">
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
            <Button onClick={() => setShowNovoModal(true)} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={tipoFilter} onValueChange={setTipoFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="venda">Venda</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Disponibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="disponivel">Disponível</SelectItem>
              <SelectItem value="bloqueado">Bloqueado (RN-006)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visualização em Tabela */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Disponível</TableHead>
                <TableHead>Bloqueado (RN-006)</TableHead>
                <TableHead>OS Vinculada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Nenhum material encontrado
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((material) => (
                  <TableRow key={material.id}>
                    <TableCell className="text-sm text-gray-900">{material.codigo}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{material.nome}</p>
                        {material.valor_unitario && (
                          <p className="text-xs text-gray-500">
                            R$ {material.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.tipo === 'aluguel' ? 'default' : 'secondary'}>
                        {material.tipo === 'aluguel' ? '🔄 Aluguel' : '🛒 Venda'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{material.categoria || '-'}</TableCell>
                    <TableCell className="text-sm text-gray-900">{material.quantidade_total}</TableCell>
                    <TableCell>
                      <span className={`text-sm ${material.quantidade_disponivel > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {material.quantidade_disponivel}
                      </span>
                    </TableCell>
                    <TableCell>
                      {material.quantidade_bloqueada > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {material.quantidade_bloqueada}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {material.ordem_servico_vinculada || '-'}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenModal(material)} variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            totalItems={materiaisFiltrados.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </Card>
      ) : (
        /* Visualização em Cards */
        <div className="space-y-4">
          {currentItems.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum material encontrado</p>
            </Card>
          ) : (
            currentItems.map((material) => (
              <Card key={material.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg text-gray-900">{material.nome}</h3>
                      <Badge variant={material.tipo === 'aluguel' ? 'default' : 'secondary'}>
                        {material.tipo === 'aluguel' ? '🔄 Aluguel' : '🛒 Venda'}
                      </Badge>
                      {material.quantidade_bloqueada > 0 && (
                        <Badge variant="destructive">
                          <Lock className="w-3 h-3 mr-1" />
                          {material.quantidade_bloqueada} Bloqueados (RN-006)
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Código: {material.codigo}</p>
                    {material.ordem_servico_vinculada && (
                      <p className="text-sm text-orange-600">
                        Vinculado a: {material.ordem_servico_vinculada}
                      </p>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <div className="mb-3">
                      <p className="text-xl text-green-600">{material.quantidade_disponivel}</p>
                      <p className="text-xs text-gray-500">disponíveis de {material.quantidade_total}</p>
                    </div>
                    <Button onClick={() => handleOpenModal(material)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
          <Pagination
            totalItems={materiaisFiltrados.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Material' : 'Novo Material'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do material' : 'Preencha os dados do novo material'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código *</Label>
                <Input
                  value={formData.codigo || ''}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="MAT-001"
                />
              </div>
              <div>
                <Label>Nome *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do material"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aluguel">Aluguel (RN-006)</SelectItem>
                    <SelectItem value="venda">Venda</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipo === 'aluguel' ? 'Itens de aluguel são bloqueados quando vinculados a OS' : 'Itens de venda não são bloqueados'}
                </p>
              </div>
              <div>
                <Label>Categoria</Label>
                <Input
                  value={formData.categoria || ''}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Equipamentos, Cabos, etc"
                />
              </div>
              <div>
                <Label>Quantidade Total *</Label>
                <Input
                  value={formData.quantidade_total || ''}
                  onChange={(e) => setFormData({ ...formData, quantidade_total: parseInt(e.target.value) || 0 })}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <Label>Quantidade Disponível</Label>
                <Input
                  value={formData.quantidade_disponivel || ''}
                  onChange={(e) => setFormData({ ...formData, quantidade_disponivel: parseInt(e.target.value) || 0 })}
                  type="number"
                  min="0"
                />
              </div>
              <div>
                <Label>Valor Unitário</Label>
                <Input
                  value={formData.valor_unitario || ''}
                  onChange={(e) => setFormData({ ...formData, valor_unitario: parseFloat(e.target.value) || 0 })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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

            {formData.tipo === 'aluguel' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <Lock className="w-4 h-4 inline mr-1" />
                  <strong>RN-006:</strong> Materiais de aluguel são bloqueados automaticamente quando vinculados a uma Ordem de Serviço e só são liberados após conclusão.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
              {isEditing ? 'Atualizar' : 'Criar Material'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Material */}
      <NovoMaterialModal
        open={showNovoModal}
        onClose={() => setShowNovoModal(false)}
        empresas={empresas}
        onSave={handleSaveNovoMaterial}
      />
    </div>
  );
}