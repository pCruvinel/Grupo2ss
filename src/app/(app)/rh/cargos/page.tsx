'use client';

import { useState, useEffect } from 'react';
import { 
  createClient, 
  useEmpresa, 
  LoadingSpinner, 
  EmptyState,
  StatusBadge 
} from '../../../lib/figma-make-helpers';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Plus, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

// Inline type
interface Cargo {
  id: string;
  nome: string;
  descricao?: string;
  nivel?: string;
  salario_base?: number;
  empresa_id: string;
  ativo: boolean;
}

export default function CargosPage() {
  const { empresa } = useEmpresa();
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });
  const supabase = createClient();

  useEffect(() => {
    if (!empresa) return;

    const fetchCargos = async () => {
      try {
        const { data, error } = await supabase
          .from('cargos')
          .select('*')
          .eq('empresa_id', empresa.id)
          .order('nome');

        if (error) throw error;
        if (data) setCargos(data);
      } catch (error) {
        console.error('Erro ao carregar cargos:', error);
        toast.error('Erro ao carregar cargos');
      } finally {
        setLoading(false);
      }
    };

    fetchCargos();
  }, [empresa, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    try {
      const cargoData = {
        ...formData,
        empresa_id: empresa.id,
      };

      if (editingCargo) {
        const { error } = await supabase
          .from('cargos')
          .update(cargoData)
          .eq('id', editingCargo.id);

        if (error) throw error;
        toast.success('Cargo atualizado com sucesso!');
      } else {
        const { error } = await supabase.from('cargos').insert(cargoData);

        if (error) throw error;
        toast.success('Cargo criado com sucesso!');
      }

      setDialogOpen(false);
      setFormData({ nome: '', descricao: '' });
      setEditingCargo(null);

      // Recarregar dados
      const { data } = await supabase
        .from('cargos')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('nome');

      if (data) setCargos(data);
    } catch (error: any) {
      console.error('Erro ao salvar cargo:', error);
      toast.error(error.message || 'Erro ao salvar cargo');
    }
  };

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo);
    setFormData({
      nome: cargo.nome,
      descricao: cargo.descricao || '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (cargo: Cargo) => {
    if (!confirm('Tem certeza que deseja excluir este cargo?')) return;

    try {
      const { error } = await supabase.from('cargos').delete().eq('id', cargo.id);

      if (error) throw error;

      toast.success('Cargo excluído com sucesso!');
      setCargos(cargos.filter((c) => c.id !== cargo.id));
    } catch (error: any) {
      console.error('Erro ao excluir cargo:', error);
      toast.error('Erro ao excluir cargo');
    }
  };

  const columns: Column<Cargo>[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'descricao', label: 'Descrição' },
    {
      key: 'status',
      label: 'Status',
      render: (cargo) => <StatusBadge status={cargo.status} />,
    },
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Cargos</h1>
          <p className="text-gray-600">Gestão de cargos e funções</p>
        </div>
        <Button
          onClick={() => {
            setEditingCargo(null);
            setFormData({ nome: '', descricao: '' });
            setDialogOpen(true);
          }}
          className="bg-[#1F4788] hover:bg-blue-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cargo
        </Button>
      </div>

      <Card className="p-6">
        {cargos.length === 0 ? (
          <EmptyState
            title="Nenhum cargo cadastrado"
            description="Comece criando cargos para sua empresa"
            actionLabel="Novo Cargo"
            onAction={() => setDialogOpen(true)}
            icon={<Briefcase className="w-8 h-8 text-gray-400" />}
          />
        ) : (
          <DataTable
            data={cargos}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Buscar cargos..."
          />
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCargo ? 'Editar Cargo' : 'Novo Cargo'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Cargo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Gerente de Vendas"
                required
              />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição das responsabilidades"
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setFormData({ nome: '', descricao: '' });
                  setEditingCargo(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#1F4788] hover:bg-blue-800">
                {editingCargo ? 'Atualizar' : 'Criar'} Cargo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}