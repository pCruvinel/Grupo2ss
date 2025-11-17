import { useState } from 'react';
import { Plus, Edit, Building2, CheckCircle2, XCircle, List, Grid, DollarSign, Users, Package } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';

interface Empresa {
  id: string;
  nome: string;
  tipo: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  status?: 'ativo' | 'inativo';
  data_fundacao?: string;
}

interface EmpresasDashboardProps {
  empresas: Empresa[];
  contratos: any[];
  colaboradores: any[];
  materiais: any[];
}

export function EmpresasDashboard({ empresas, contratos, colaboradores, materiais }: EmpresasDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [showModal, setShowModal] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<Empresa>>({
    status: 'ativo',
  });

  // Garantir que os arrays não sejam undefined
  const empresasArray = empresas || [];
  const contratosArray = contratos || [];
  const colaboradoresArray = colaboradores || [];
  const materiaisArray = materiais || [];

  const empresasComEstatisticas = empresasArray.map(emp => {
    const qtdContratos = contratosArray.filter(c => c.empresa_id === emp.id).length;
    const qtdColaboradores = colaboradoresArray.filter(c => c.empresas?.includes(emp.id)).length;
    const qtdMateriais = materiaisArray.filter(m => m.empresa_id === emp.id).length;
    const receitaTotal = contratosArray
      .filter(c => c.empresa_id === emp.id)
      .reduce((acc, c) => acc + (c.valor_total || 0), 0);

    return {
      ...emp,
      qtdContratos,
      qtdColaboradores,
      qtdMateriais,
      receitaTotal,
    };
  });

  const handleOpenModal = (empresa?: Empresa) => {
    if (empresa) {
      setIsEditing(true);
      setSelectedEmpresa(empresa);
      setFormData(empresa);
    } else {
      setIsEditing(false);
      setSelectedEmpresa(null);
      setFormData({ status: 'ativo' });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (isEditing) {
      toast.success('Empresa atualizada com sucesso!');
    } else {
      toast.success('Empresa criada com sucesso!');
    }

    setShowModal(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Empresas do Grupo</h1>
            <p className="text-gray-600">Gestão das empresas do Grupo 2S</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">RN-001: Segregação por Empresa</Badge>
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
            <Button onClick={() => handleOpenModal()} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {empresasComEstatisticas.map((empresa) => (
            <Card key={empresa.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-[#1F4788] rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg text-gray-900">{empresa.nome}</h3>
                    <p className="text-sm text-gray-600">ID: {empresa.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-700">Receita Total</span>
                  </div>
                  <span className="text-gray-900">
                    R$ {(empresa.receitaTotal / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Colaboradores</span>
                  </div>
                  <span className="text-gray-900">{empresa.qtdColaboradores}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-700">Materiais</span>
                  </div>
                  <span className="text-gray-900">{empresa.qtdMateriais}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-gray-700">Contratos</span>
                  </div>
                  <span className="text-gray-900">{empresa.qtdContratos}</span>
                </div>
              </div>

              <Button 
                onClick={() => handleOpenModal(empresa)} 
                variant="outline" 
                className="w-full"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Empresa
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contratos</TableHead>
                <TableHead>Colaboradores</TableHead>
                <TableHead>Materiais</TableHead>
                <TableHead>Receita Total</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresasComEstatisticas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-[#1F4788]" />
                      <span className="text-gray-900">{empresa.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{empresa.tipo}</TableCell>
                  <TableCell className="text-sm text-gray-900">{empresa.qtdContratos}</TableCell>
                  <TableCell className="text-sm text-gray-900">{empresa.qtdColaboradores}</TableCell>
                  <TableCell className="text-sm text-gray-900">{empresa.qtdMateriais}</TableCell>
                  <TableCell className="text-sm text-gray-900">
                    R$ {empresa.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleOpenModal(empresa)} variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações da empresa' : 'Preencha os dados da nova empresa'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome da Empresa *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome da empresa"
                />
              </div>
              <div>
                <Label>Tipo *</Label>
                <Input
                  value={formData.tipo || ''}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  placeholder="Ex: 2s_locacoes"
                />
              </div>
              <div>
                <Label>CNPJ</Label>
                <Input
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 0000-0000"
                />
              </div>
              <div className="col-span-2">
                <Label>Email</Label>
                <Input
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contato@empresa.com"
                  type="email"
                />
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input
                  value={formData.endereco || ''}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>
              <div>
                <Label>Data de Fundação</Label>
                <Input
                  value={formData.data_fundacao || ''}
                  onChange={(e) => setFormData({ ...formData, data_fundacao: e.target.value })}
                  type="date"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowModal(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
              {isEditing ? 'Atualizar' : 'Criar Empresa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}