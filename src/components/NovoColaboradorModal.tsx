import { useState, useEffect } from 'react';
import { Plus, Users, TrendingUp, AlertCircle, User, Briefcase, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import { formatarCPF, formatarTelefone, validarCPF, validarEmail } from '../lib/formatters';

interface NovoColaboradorModalProps {
  open: boolean;
  onClose: () => void;
  empresas: { id: string; nome: string }[];
  onSave: (colaborador: any) => void;
}

export function NovoColaboradorModal({ open, onClose, empresas, onSave }: NovoColaboradorModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    departamento: '',
    data_admissao: '',
    salario_total: '',
    tipo_contrato: 'CLT',
    status: 'ativo',
  });

  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);
  const [tipoRateio, setTipoRateio] = useState<'igual' | 'personalizado'>('igual');
  const [rateioPersonalizado, setRateioPersonalizado] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular rateio automático de salário (RN-002)
  useEffect(() => {
    if (empresasSelecionadas.length > 0 && formData.salario_total) {
      if (tipoRateio === 'igual') {
        const percentualPorEmpresa = 100 / empresasSelecionadas.length;
        const novoRateio: Record<string, number> = {};
        empresasSelecionadas.forEach(empId => {
          novoRateio[empId] = percentualPorEmpresa;
        });
        
        const rateioAtualString = JSON.stringify(rateioPersonalizado);
        const novoRateioString = JSON.stringify(novoRateio);
        
        if (rateioAtualString !== novoRateioString) {
          setRateioPersonalizado(novoRateio);
        }
      }
    }
  }, [empresasSelecionadas, tipoRateio, formData.salario_total]);

  const handleToggleEmpresa = (empresaId: string) => {
    setEmpresasSelecionadas(prev => {
      if (prev.includes(empresaId)) {
        return prev.filter(id => id !== empresaId);
      } else {
        return [...prev, empresaId];
      }
    });
  };

  const handleRateioPersonalizadoChange = (empresaId: string, valor: number) => {
    setRateioPersonalizado(prev => ({
      ...prev,
      [empresaId]: valor,
    }));
  };

  const calcularSalarioPorEmpresa = (empresaId: string): number => {
    const percentual = rateioPersonalizado[empresaId] || 0;
    const salarioTotal = parseFloat(formData.salario_total) || 0;
    return (salarioTotal * percentual) / 100;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.cpf || !validarCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';
    if (!formData.email.trim() || !validarEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.telefone || formData.telefone.length < 14) {
      newErrors.telefone = 'Telefone inválido';
    }
    if (!formData.cargo) newErrors.cargo = 'Cargo é obrigatório';
    if (!formData.departamento) newErrors.departamento = 'Departamento é obrigatório';
    if (!formData.data_admissao) newErrors.data_admissao = 'Data de admissão é obrigatória';
    if (!formData.salario_total || parseFloat(formData.salario_total) <= 0) {
      newErrors.salario_total = 'Salário deve ser maior que zero';
    }
    
    if (empresasSelecionadas.length === 0) {
      newErrors.empresas = 'Selecione pelo menos uma empresa';
    }

    // Validar soma do rateio personalizado
    if (empresasSelecionadas.length > 1 && tipoRateio === 'personalizado') {
      const somaPercentuais = Object.values(rateioPersonalizado).reduce((acc, val) => acc + val, 0);
      if (Math.abs(somaPercentuais - 100) > 0.01) {
        newErrors.rateio = `Soma dos percentuais (${somaPercentuais.toFixed(2)}%) deve ser 100%`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const novoColaborador = {
      id: `${Date.now()}`,
      nome: formData.nome,
      cpf: formData.cpf,
      email: formData.email,
      telefone: formData.telefone,
      cargo: formData.cargo,
      departamento: formData.departamento,
      data_admissao: formData.data_admissao,
      salario_total: parseFloat(formData.salario_total),
      tipo_contrato: formData.tipo_contrato,
      status: formData.status,
      empresas: empresasSelecionadas,
      rateio_salario: rateioPersonalizado,
      data_criacao: new Date().toISOString().split('T')[0],
    };

    onSave(novoColaborador);
    
    if (empresasSelecionadas.length > 1) {
      toast.success('Colaborador criado com rateio salarial automático! (RN-002)');
    } else {
      toast.success('Colaborador criado com sucesso!');
    }
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: '',
      departamento: '',
      data_admissao: '',
      salario_total: '',
      tipo_contrato: 'CLT',
      status: 'ativo',
    });
    setEmpresasSelecionadas([]);
    setTipoRateio('igual');
    setRateioPersonalizado({});
    setErrors({});
    onClose();
  };

  const somaPercentuais = Object.values(rateioPersonalizado).reduce((acc, val) => acc + val, 0);
  const salarioTotal = parseFloat(formData.salario_total) || 0;

  // Componente auxiliar para item de rateio
  const EmpresaRateioItem = ({ 
    empId, 
    empresa, 
    percentual, 
    salario, 
    tipoRateio, 
    onRateioChange 
  }: {
    empId: string;
    empresa: { id: string; nome: string } | undefined;
    percentual: number;
    salario: number;
    tipoRateio: 'igual' | 'personalizado';
    onRateioChange: (empresaId: string, valor: number) => void;
  }) => (
    <div className="flex items-center gap-3 p-2 bg-white rounded border border-orange-200">
      <div className="flex-1">
        <p className="text-sm text-gray-900">{empresa?.nome}</p>
      </div>
      
      {tipoRateio === 'personalizado' ? (
        <div className="flex items-center gap-2">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={percentual}
            onChange={(e) => onRateioChange(empId, parseFloat(e.target.value) || 0)}
            className="w-20 h-8"
          />
          <span className="text-sm text-gray-600">%</span>
        </div>
      ) : (
        <Badge variant="outline" className="text-xs">
          {percentual.toFixed(2)}%
        </Badge>
      )}
      
      <div className="text-right min-w-[100px]">
        <p className="text-sm text-gray-900">R$ {salario.toFixed(2)}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1F4788]" />
            Novo Colaborador
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo colaborador e configure o rateio salarial entre empresas (RN-002)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pessoal" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="pessoal" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <User className="w-4 h-4 mr-2" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger 
              value="profissional" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Dados Profissionais
            </TabsTrigger>
            <TabsTrigger 
              value="empresas" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Empresas e Rateio
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Tab 1: Dados Pessoais */}
            <TabsContent value="pessoal" className="p-6 m-0 space-y-4">
              <h3 className="text-sm text-gray-900 border-b pb-2">Informações Pessoais</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: João da Silva Santos"
                    className={errors.nome ? 'border-red-500' : ''}
                  />
                  {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatarCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={errors.cpf ? 'border-red-500' : ''}
                  />
                  {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatarTelefone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                    className={errors.telefone ? 'border-red-500' : ''}
                  />
                  {errors.telefone && <p className="text-xs text-red-500 mt-1">{errors.telefone}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="data_admissao">Data de Admissão *</Label>
                  <Input
                    id="data_admissao"
                    type="date"
                    value={formData.data_admissao}
                    onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                    className={errors.data_admissao ? 'border-red-500' : ''}
                  />
                  {errors.data_admissao && <p className="text-xs text-red-500 mt-1">{errors.data_admissao}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Dados Profissionais */}
            <TabsContent value="profissional" className="p-6 m-0 space-y-4">
              <h3 className="text-sm text-gray-900 border-b pb-2">Informações Profissionais</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo *</Label>
                  <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                    <SelectTrigger className={errors.cargo ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diretor">Diretor</SelectItem>
                      <SelectItem value="Gerente">Gerente</SelectItem>
                      <SelectItem value="Coordenador">Coordenador</SelectItem>
                      <SelectItem value="Supervisor">Supervisor</SelectItem>
                      <SelectItem value="Analista">Analista</SelectItem>
                      <SelectItem value="Assistente">Assistente</SelectItem>
                      <SelectItem value="Auxiliar">Auxiliar</SelectItem>
                      <SelectItem value="Operador">Operador</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="Motorista">Motorista</SelectItem>
                      <SelectItem value="Montador">Montador</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.cargo && <p className="text-xs text-red-500 mt-1">{errors.cargo}</p>}
                </div>

                <div>
                  <Label htmlFor="departamento">Departamento *</Label>
                  <Select value={formData.departamento} onValueChange={(value) => setFormData({ ...formData, departamento: value })}>
                    <SelectTrigger className={errors.departamento ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Diretoria">Diretoria</SelectItem>
                      <SelectItem value="Administrativo">Administrativo</SelectItem>
                      <SelectItem value="Financeiro">Financeiro</SelectItem>
                      <SelectItem value="RH">Recursos Humanos</SelectItem>
                      <SelectItem value="Operacional">Operacional</SelectItem>
                      <SelectItem value="Logística">Logística</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="TI">Tecnologia da Informação</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.departamento && <p className="text-xs text-red-500 mt-1">{errors.departamento}</p>}
                </div>

                <div>
                  <Label htmlFor="tipo_contrato">Tipo de Contrato *</Label>
                  <Select value={formData.tipo_contrato} onValueChange={(value) => setFormData({ ...formData, tipo_contrato: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="PJ">PJ (Pessoa Jurídica)</SelectItem>
                      <SelectItem value="Estágio">Estágio</SelectItem>
                      <SelectItem value="Temporário">Temporário</SelectItem>
                      <SelectItem value="Terceirizado">Terceirizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="salario_total">Salário Total (R$) *</Label>
                  <Input
                    id="salario_total"
                    type="number"
                    step="0.01"
                    value={formData.salario_total}
                    onChange={(e) => setFormData({ ...formData, salario_total: e.target.value })}
                    placeholder="0.00"
                    className={errors.salario_total ? 'border-red-500' : ''}
                  />
                  {errors.salario_total && <p className="text-xs text-red-500 mt-1">{errors.salario_total}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="ferias">Férias</SelectItem>
                      <SelectItem value="afastado">Afastado</SelectItem>
                      <SelectItem value="desligado">Desligado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Empresas e Rateio */}
            <TabsContent value="empresas" className="p-6 m-0 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm text-gray-900">Rateio Salarial entre Empresas (RN-002)</h3>
                </div>
                <Badge className="bg-orange-100 text-orange-700">Rateio Automático</Badge>
              </div>

              {/* Seleção de Empresas */}
              <div>
                <Label>Empresas * (selecione uma ou mais)</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {empresas.map(empresa => (
                    <div
                      key={empresa.id}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        empresasSelecionadas.includes(empresa.id)
                          ? 'border-[#1F4788] bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleToggleEmpresa(empresa.id)}
                    >
                      <Checkbox
                        checked={empresasSelecionadas.includes(empresa.id)}
                        onCheckedChange={() => handleToggleEmpresa(empresa.id)}
                      />
                      <span className="text-sm text-gray-900">{empresa.nome}</span>
                    </div>
                  ))}
                </div>
                {errors.empresas && <p className="text-xs text-red-500 mt-1">{errors.empresas}</p>}
              </div>

              {/* Configuração de Rateio */}
              {empresasSelecionadas.length > 1 && (
                <Card className="p-4 bg-orange-50 border-orange-200 w-full">
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Rateio</Label>
                      <Select value={tipoRateio} onValueChange={(value: 'igual' | 'personalizado') => setTipoRateio(value)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="igual">📊 Igual (Automático)</SelectItem>
                          <SelectItem value="personalizado">✏️ Personalizado (Manual)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-1">
                        {tipoRateio === 'igual' 
                          ? 'Salário será dividido igualmente entre as empresas selecionadas'
                          : 'Defina manualmente o percentual de cada empresa'}
                      </p>
                    </div>

                    {/* Visualização do Rateio */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Distribuição Salarial por Empresa:</Label>
                      {empresasSelecionadas.map(empId => {
                        const empresa = empresas.find(e => e.id === empId);
                        const percentual = rateioPersonalizado[empId] || 0;
                        const salario = calcularSalarioPorEmpresa(empId);

                        return (
                          <EmpresaRateioItem
                            key={empId}
                            empId={empId}
                            empresa={empresa}
                            percentual={percentual}
                            salario={salario}
                            tipoRateio={tipoRateio}
                            onRateioChange={handleRateioPersonalizadoChange}
                          />
                        );
                      })}
                    </div>

                    {/* Resumo do Rateio */}
                    <div className="flex justify-between items-center p-3 bg-white rounded border-2 border-orange-300">
                      <div>
                        <p className="text-sm text-gray-600">Salário Total Rateado:</p>
                        <p className="text-xs text-gray-500">{somaPercentuais.toFixed(2)}% de {empresasSelecionadas.length} empresas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg text-gray-900">R$ {salarioTotal.toFixed(2)}</p>
                      </div>
                    </div>

                    {errors.rateio && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-600">{errors.rateio}</p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {empresasSelecionadas.length === 1 && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    ℹ️ Colaborador será alocado 100% para {empresas.find(e => e.id === empresasSelecionadas[0])?.nome}
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Ações - Fixo no rodapé */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} className="bg-[#1F4788] hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Criar Colaborador
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}