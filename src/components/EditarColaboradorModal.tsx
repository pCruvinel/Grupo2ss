import { useState, useEffect } from 'react';
import { Building2, UserCircle } from 'lucide-react';
import { TwoColumnModal } from './TwoColumnModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { formatarMoeda, formatarPorcentagem } from '../lib/formatters';

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  tipo_contrato: 'CLT' | 'PJ' | 'Temporario';
  salario: number;
  data_admissao: string;
  status: 'ativo' | 'inativo';
  empresas_vinculadas: string[];
  rateio_salario?: Record<string, number>;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface EditarColaboradorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colaborador: Colaborador;
  empresas: { id: string; nome: string }[];
  onSave: (data: Partial<Colaborador>) => void;
}

export function EditarColaboradorModal({
  open,
  onOpenChange,
  colaborador,
  empresas,
  onSave,
}: EditarColaboradorModalProps) {
  const [formData, setFormData] = useState<Partial<Colaborador>>(colaborador);
  const [rateioPercentuais, setRateioPercentuais] = useState<Record<string, number>>(
    colaborador.rateio_salario || {}
  );

  useEffect(() => {
    setFormData(colaborador);
    setRateioPercentuais(colaborador.rateio_salario || {});
  }, [colaborador]);

  const empresasSelecionadas = formData.empresas_vinculadas || [];
  const isMultiEmpresa = empresasSelecionadas.length > 1;

  const handleToggleEmpresa = (empresaId: string) => {
    const currentEmpresas = empresasSelecionadas || [];
    let newEmpresas: string[];

    if (currentEmpresas.includes(empresaId)) {
      newEmpresas = currentEmpresas.filter((id) => id !== empresaId);
      // Remove rateio da empresa desmarcada
      const newRateio = { ...rateioPercentuais };
      delete newRateio[empresaId];
      setRateioPercentuais(newRateio);
    } else {
      newEmpresas = [...currentEmpresas, empresaId];
      // Adiciona rateio igual para nova empresa
      const numEmpresas = newEmpresas.length;
      const percIgual = 100 / numEmpresas;
      const newRateio: Record<string, number> = {};
      newEmpresas.forEach((id) => {
        newRateio[id] = percIgual;
      });
      setRateioPercentuais(newRateio);
    }

    setFormData({ ...formData, empresas_vinculadas: newEmpresas });
  };

  const handleUpdateRateio = (empresaId: string, valor: number) => {
    setRateioPercentuais({ ...rateioPercentuais, [empresaId]: valor });
  };

  const totalRateio = Object.values(rateioPercentuais).reduce((acc, v) => acc + v, 0);

  const handleSave = () => {
    // Validações
    if (!formData.nome || !formData.cpf || !formData.cargo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!empresasSelecionadas || empresasSelecionadas.length === 0) {
      toast.error('Selecione pelo menos uma empresa');
      return;
    }

    if (isMultiEmpresa && Math.abs(totalRateio - 100) > 0.1) {
      toast.error(`Percentuais devem somar 100% (atual: ${totalRateio.toFixed(2)}%)`);
      return;
    }

    const dataToSave = {
      ...formData,
      rateio_salario: isMultiEmpresa ? rateioPercentuais : undefined,
    };

    onSave(dataToSave);
    toast.success('Colaborador atualizado com sucesso!');
    onOpenChange(false);
  };

  // Mock de histórico para demonstração
  const historico = [
    {
      data: colaborador.updated_at || colaborador.created_at || new Date().toISOString(),
      usuario: colaborador.updated_by || colaborador.created_by || 'Sistema',
      acao: 'Registro criado',
      detalhes: 'Colaborador cadastrado no sistema',
    },
  ];

  const leftColumnContent = (
    <div className="space-y-6">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-sm text-gray-900 border-b pb-2">Dados Pessoais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Nome Completo *</Label>
            <Input
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Nome completo"
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
            <Label>Telefone</Label>
            <Input
              value={formData.telefone || ''}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="col-span-2">
            <Label>Email</Label>
            <Input
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              type="email"
              placeholder="email@exemplo.com"
            />
          </div>
        </div>
      </div>

      {/* Dados Profissionais */}
      <div className="space-y-4">
        <h3 className="text-sm text-gray-900 border-b pb-2">Dados Profissionais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cargo *</Label>
            <Input
              value={formData.cargo || ''}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              placeholder="Ex: Técnico, Motorista"
            />
          </div>
          <div>
            <Label>Tipo de Contrato *</Label>
            <Select
              value={formData.tipo_contrato}
              onValueChange={(value: any) => setFormData({ ...formData, tipo_contrato: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLT">CLT</SelectItem>
                <SelectItem value="PJ">PJ</SelectItem>
                <SelectItem value="Temporario">Temporário</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Salário *</Label>
            <Input
              value={formData.salario || ''}
              onChange={(e) => setFormData({ ...formData, salario: parseFloat(e.target.value) || 0 })}
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Data de Admissão *</Label>
            <Input
              value={formData.data_admissao || ''}
              onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
              type="date"
            />
          </div>
          <div>
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
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

      {/* Vinculação de Empresas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm text-gray-900">Empresas Vinculadas (RN-001, RN-002) *</h3>
          <Badge className="bg-blue-100 text-blue-700">
            {empresasSelecionadas.length} empresa(s)
          </Badge>
        </div>
        
        <div className="space-y-2">
          {empresas.map((emp) => {
            const isSelecionada = empresasSelecionadas.includes(emp.id);
            return (
              <div
                key={emp.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelecionada
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleToggleEmpresa(emp.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-5 h-5 ${isSelecionada ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className={`text-sm ${isSelecionada ? 'text-gray-900' : 'text-gray-600'}`}>
                      {emp.nome}
                    </span>
                  </div>
                  {isSelecionada && (
                    <Badge className="bg-blue-600 text-white">Selecionada</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rateio de Salário */}
      {isMultiEmpresa && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-sm text-gray-900">Rateio de Salário (RN-002) *</h3>
            <Badge className="bg-purple-100 text-purple-700">
              Total: {totalRateio.toFixed(2)}%
            </Badge>
          </div>

          <div className="space-y-3">
            {empresasSelecionadas.map((empId) => {
              const emp = empresas.find((e) => e.id === empId);
              if (!emp) return null;

              return (
                <div key={empId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-900">{emp.nome}</span>
                  <Input
                    value={rateioPercentuais[empId] || 0}
                    onChange={(e) => handleUpdateRateio(empId, parseFloat(e.target.value) || 0)}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 w-4">%</span>
                  {formData.salario && (
                    <span className="text-sm text-gray-500 w-32 text-right">
                      R$ {((formData.salario * (rateioPercentuais[empId] || 0)) / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {Math.abs(totalRateio - 100) > 0.1 && (
            <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2">
              <span className="text-sm text-red-600">
                ⚠️ Os percentuais devem somar exatamente 100%
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );

  return (
    <TwoColumnModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Colaborador"
      leftColumn={leftColumnContent}
      auditInfo={{
        created_at: colaborador.created_at,
        updated_at: colaborador.updated_at,
        created_by: colaborador.created_by,
        updated_by: colaborador.updated_by,
      }}
      historico={historico}
    />
  );
}