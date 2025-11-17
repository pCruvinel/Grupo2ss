import { useState, useEffect } from 'react';
import { Plus, Receipt, DollarSign, Calendar, Building2, FileText, TrendingUp, AlertCircle } from 'lucide-react';
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
import { formatarMoeda, formatarPorcentagem } from '../lib/formatters';

interface NovaDespesaModalProps {
  open: boolean;
  onClose: () => void;
  empresas: { id: string; nome: string }[];
  onSave: (despesa: any) => void;
}

export function NovaDespesaModal({ open, onClose, empresas, onSave }: NovaDespesaModalProps) {
  const [formData, setFormData] = useState({
    descricao: '',
    categoria: '',
    valor_total: '',
    data_vencimento: '',
    fornecedor: '',
    observacoes: '',
  });

  const [empresasSelecionadas, setEmpresasSelecionadas] = useState<string[]>([]);
  const [tipoRateio, setTipoRateio] = useState<'igual' | 'personalizado'>('igual');
  const [rateioPersonalizado, setRateioPersonalizado] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular rateio automático
  useEffect(() => {
    if (empresasSelecionadas.length > 0 && formData.valor_total) {
      if (tipoRateio === 'igual') {
        const percentualPorEmpresa = 100 / empresasSelecionadas.length;
        const novoRateio: Record<string, number> = {};
        empresasSelecionadas.forEach(empId => {
          novoRateio[empId] = percentualPorEmpresa;
        });
        setRateioPersonalizado(novoRateio);
      }
    }
  }, [empresasSelecionadas, tipoRateio, formData.valor_total]);

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

  const calcularValorPorEmpresa = (empresaId: string): number => {
    const percentual = rateioPersonalizado[empresaId] || 0;
    const valorTotal = parseFloat(formData.valor_total) || 0;
    return (valorTotal * percentual) / 100;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) newErrors.descricao = 'Descrição é obrigatória';
    if (!formData.categoria) newErrors.categoria = 'Categoria é obrigatória';
    if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
      newErrors.valor_total = 'Valor deve ser maior que zero';
    }
    if (!formData.data_vencimento) newErrors.data_vencimento = 'Data de vencimento é obrigatória';
    if (!formData.fornecedor.trim()) newErrors.fornecedor = 'Fornecedor é obrigatório';
    
    if (empresasSelecionadas.length === 0) {
      newErrors.empresas = 'Selecione pelo menos uma empresa';
    }

    // Validar soma do rateio personalizado
    if (tipoRateio === 'personalizado') {
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

    const novaDespesa = {
      id: `${Date.now()}`,
      descricao: formData.descricao,
      categoria: formData.categoria,
      valor_total: parseFloat(formData.valor_total),
      data_vencimento: formData.data_vencimento,
      fornecedor: formData.fornecedor,
      observacoes: formData.observacoes,
      empresas: empresasSelecionadas,
      rateio: rateioPersonalizado,
      status: 'pendente',
      data_criacao: new Date().toISOString().split('T')[0],
    };

    onSave(novaDespesa);
    
    if (empresasSelecionadas.length > 1) {
      toast.success('Despesa criada com rateio automático aplicado! (RN-002)');
    } else {
      toast.success('Despesa criada com sucesso!');
    }
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      descricao: '',
      categoria: '',
      valor_total: '',
      data_vencimento: '',
      fornecedor: '',
      observacoes: '',
    });
    setEmpresasSelecionadas([]);
    setTipoRateio('igual');
    setRateioPersonalizado({});
    setErrors({});
    onClose();
  };

  const somaPercentuais = Object.values(rateioPersonalizado).reduce((acc, val) => acc + val, 0);
  const valorTotal = parseFloat(formData.valor_total) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#1F4788]" />
            Nova Despesa
          </DialogTitle>
          <DialogDescription>
            Cadastre uma nova despesa e configure o rateio automático entre empresas (RN-002)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="despesa" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="despesa" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <FileText className="w-4 h-4 mr-2" />
              Dados da Despesa
            </TabsTrigger>
            <TabsTrigger 
              value="rateio" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Rateio entre Empresas
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Tab 1: Dados da Despesa */}
            <TabsContent value="despesa" className="p-6 m-0 space-y-4">
              <h3 className="text-sm text-gray-900 border-b pb-2">Informações Básicas</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Fornecimento de energia elétrica"
                    className={errors.descricao ? 'border-red-500' : ''}
                  />
                  {errors.descricao && <p className="text-xs text-red-500 mt-1">{errors.descricao}</p>}
                </div>

                <div>
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aluguel">Aluguel</SelectItem>
                      <SelectItem value="Energia">Energia</SelectItem>
                      <SelectItem value="Água">Água</SelectItem>
                      <SelectItem value="Internet">Internet</SelectItem>
                      <SelectItem value="Telefone">Telefone</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Combustível">Combustível</SelectItem>
                      <SelectItem value="Material de Escritório">Material de Escritório</SelectItem>
                      <SelectItem value="Seguro">Seguro</SelectItem>
                      <SelectItem value="Impostos">Impostos</SelectItem>
                      <SelectItem value="Salários">Salários</SelectItem>
                      <SelectItem value="Encargos">Encargos Trabalhistas</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.categoria && <p className="text-xs text-red-500 mt-1">{errors.categoria}</p>}
                </div>

                <div>
                  <Label htmlFor="valor_total">Valor Total (R$) *</Label>
                  <Input
                    id="valor_total"
                    type="number"
                    step="0.01"
                    value={formData.valor_total}
                    onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                    placeholder="0.00"
                    className={errors.valor_total ? 'border-red-500' : ''}
                  />
                  {errors.valor_total && <p className="text-xs text-red-500 mt-1">{errors.valor_total}</p>}
                </div>

                <div>
                  <Label htmlFor="fornecedor">Fornecedor *</Label>
                  <Input
                    id="fornecedor"
                    value={formData.fornecedor}
                    onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor"
                    className={errors.fornecedor ? 'border-red-500' : ''}
                  />
                  {errors.fornecedor && <p className="text-xs text-red-500 mt-1">{errors.fornecedor}</p>}
                </div>

                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className={errors.data_vencimento ? 'border-red-500' : ''}
                  />
                  {errors.data_vencimento && <p className="text-xs text-red-500 mt-1">{errors.data_vencimento}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Informações adicionais..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Rateio entre Empresas */}
            <TabsContent value="rateio" className="p-6 m-0 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm text-gray-900">Rateio entre Empresas (RN-002)</h3>
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
                <Card className="p-4 bg-orange-50 border-orange-200">
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
                          ? 'Valor será dividido igualmente entre as empresas selecionadas'
                          : 'Defina manualmente o percentual de cada empresa'}
                      </p>
                    </div>

                    {/* Visualização do Rateio */}
                    <div className="space-y-2">
                      <Label className="text-xs text-gray-600">Distribuição por Empresa:</Label>
                      {empresasSelecionadas.map(empId => {
                        const empresa = empresas.find(e => e.id === empId);
                        const percentual = rateioPersonalizado[empId] || 0;
                        const valor = calcularValorPorEmpresa(empId);

                        return (
                          <div key={empId} className="flex items-center gap-3 p-2 bg-white rounded border border-orange-200">
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
                                  onChange={(e) => handleRateioPersonalizadoChange(empId, parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8"
                                />
                                <span className="text-sm text-gray-600">%</span>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {formatarPorcentagem(percentual)}
                              </Badge>
                            )}
                            
                            <div className="text-right min-w-[100px]">
                              <p className="text-sm text-gray-900">{formatarMoeda(valor)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumo do Rateio */}
                    <div className="flex justify-between items-center p-3 bg-white rounded border-2 border-orange-300">
                      <div>
                        <p className="text-sm text-gray-600">Total Rateado:</p>
                        <p className="text-xs text-gray-500">{somaPercentuais.toFixed(2)}% de {empresasSelecionadas.length} empresas</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg text-gray-900">{formatarMoeda(valorTotal)}</p>
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
                    ℹ️ Despesa será alocada 100% para {empresas.find(e => e.id === empresasSelecionadas[0])?.nome}
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
            Criar Despesa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}