import { useState, useEffect } from 'react';
import { Plus, Edit, Search, List, Grid, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { NovoColaboradorModal } from './NovoColaboradorModal';
import { Pagination } from './shared/Pagination';

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  cargo_nome: string;
  empresas: string[];
  salario_base: number;
  status: 'ativo' | 'inativo';
  rateio?: Record<string, number>;
  email?: string;
  telefone?: string;
  data_admissao?: string;
}

interface ColaboradoresDashboardProps {
  colaboradores: Colaborador[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
}

export function ColaboradoresDashboard({ colaboradores, empresas, empresaAtual, onUpdate }: ColaboradoresDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [selectedColab, setSelectedColab] = useState<Colaborador | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [colaboradoresData, setColaboradoresData] = useState(colaboradores);

  const [formData, setFormData] = useState<Partial<Colaborador>>({
    status: 'ativo',
    empresas: [empresaAtual],
  });

  // Sincronizar dados quando props mudam
  useEffect(() => {
    setColaboradoresData(colaboradores);
  }, [colaboradores]);

  // Filtros
  const colaboradoresFiltrados = colaboradoresData.filter(c => {
    const matchSearch = c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.cpf.includes(searchTerm) ||
                       c.cargo_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Paginação
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = colaboradoresFiltrados.slice(startIndex, startIndex + itemsPerPage);

  const handleSaveNovoColaborador = (novoColaborador: any) => {
    setColaboradoresData([...colaboradoresData, novoColaborador]);
    onUpdate?.();
  };

  const handleOpenModal = (colaborador?: Colaborador) => {
    if (colaborador) {
      setIsEditing(true);
      setSelectedColab(colaborador);
      setFormData(colaborador);
    } else {
      setIsEditing(false);
      setSelectedColab(null);
      setFormData({
        status: 'ativo',
        empresas: [empresaAtual],
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.cpf || !formData.cargo_nome) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditing) {
      toast.success('Colaborador atualizado com sucesso!');
    } else {
      toast.success('Colaborador criado com sucesso!');
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
            <h1 className="text-gray-900 mb-2">Colaboradores</h1>
            <p className="text-gray-600">Gestão de colaboradores</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-orange-100 text-orange-700">RN-002: Rateio Automático</Badge>
              <Badge className="bg-gray-100 text-gray-700">RN-005: Exclusão Lógica</Badge>
            </div>
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
              Novo Colaborador
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, CPF ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo (RN-005)</SelectItem>
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
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Empresas</TableHead>
                <TableHead>Rateio</TableHead>
                <TableHead>Salário Base</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum colaborador encontrado
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((colab) => (
                  <TableRow key={colab.id}>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{colab.nome}</p>
                        {colab.email && <p className="text-xs text-gray-500">{colab.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{colab.cpf}</TableCell>
                    <TableCell className="text-sm text-gray-900">{colab.cargo_nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {colab.empresas.map((empId) => {
                          const emp = empresas.find(e => e.id === empId);
                          return (
                            <Badge key={empId} variant="outline" className="text-xs">
                              {emp?.nome}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {colab.rateio ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(colab.rateio).map(([empId, perc]) => {
                            const emp = empresas.find(e => e.id === empId);
                            return (
                              <Badge key={empId} className="bg-orange-100 text-orange-700 text-xs">
                                {emp?.nome.split(' ')[0]}: {perc}%
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-900">
                      R$ {colab.salario_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={colab.status === 'ativo' ? 'success' : 'secondary' as any}>
                        {colab.status === 'ativo' ? 'Ativo' : 'Inativo (RN-005)'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenModal(colab)} variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            totalItems={colaboradoresFiltrados.length}
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
              <p className="text-gray-500">Nenhum colaborador encontrado</p>
            </Card>
          ) : (
            currentItems.map((colab) => (
              <Card key={colab.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg text-gray-900">{colab.nome}</h3>
                      {colab.status === 'inativo' && (
                        <Badge variant="outline" className="bg-gray-100">🚫 INATIVO (RN-005)</Badge>
                      )}
                      {colab.rateio && (
                        <Badge className="bg-orange-100 text-orange-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Rateio (RN-002)
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{colab.cargo_nome} • {colab.cpf}</p>
                    
                    <div className="flex gap-2 mb-2">
                      {colab.empresas.map((empId) => {
                        const emp = empresas.find(e => e.id === empId);
                        return (
                          <Badge key={empId} variant="outline">
                            {emp?.nome}
                          </Badge>
                        );
                      })}
                    </div>

                    {colab.rateio && (
                      <div className="flex gap-2 mt-2">
                        {Object.entries(colab.rateio).map(([empId, perc]) => {
                          const emp = empresas.find(e => e.id === empId);
                          return (
                            <Badge key={empId} className="bg-orange-100 text-orange-700 text-xs">
                              {emp?.nome}: {perc}%
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-500 mb-1">Salário Base</p>
                    <p className="text-2xl text-gray-900 mb-3">R$ {colab.salario_base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <Button onClick={() => handleOpenModal(colab)} variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Colaborador' : 'Novo Colaborador'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do colaborador' : 'Preencha os dados do novo colaborador'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do colaborador"
                />
              </div>
              <div>
                <Label>CPF *</Label>
                <Input
                  value={formData.cpf || ''}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                  type="email"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label>Cargo *</Label>
                <Input
                  value={formData.cargo_nome || ''}
                  onChange={(e) => setFormData({ ...formData, cargo_nome: e.target.value })}
                  placeholder="Ex: Gerente, Analista, etc"
                />
              </div>
              <div>
                <Label>Salário Base *</Label>
                <Input
                  value={formData.salario_base || ''}
                  onChange={(e) => setFormData({ ...formData, salario_base: parseFloat(e.target.value) || 0 })}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Data de Admissão</Label>
                <Input
                  value={formData.data_admissao || ''}
                  onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                  type="date"
                />
              </div>
              <div>
                <Label>Status (RN-005)</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo (Exclusão Lógica)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
              {isEditing ? 'Atualizar' : 'Criar Colaborador'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Colaborador */}
      <NovoColaboradorModal
        open={showNovoModal}
        onClose={() => setShowNovoModal(false)}
        empresas={empresas}
        onSave={handleSaveNovoColaborador}
      />
    </div>
  );
}