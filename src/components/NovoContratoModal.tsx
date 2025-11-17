import { useState } from 'react';
import { Plus, FileText, User, FileCheck, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from './ui/sonner';

interface NovoContratoModalProps {
  open: boolean;
  onClose: () => void;
  empresaAtual: string;
  empresas: { id: string; nome: string }[];
  onSave: (contrato: any) => void;
}

export function NovoContratoModal({ open, onClose, empresaAtual, empresas, onSave }: NovoContratoModalProps) {
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_endereco: '',
    tipo: '',
    descricao: '',
    valor_total: '',
    data_inicio: '',
    data_fim: '',
    tipo_parcelamento: 'mensal',
    num_parcelas: '12',
    observacoes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente_nome.trim()) newErrors.cliente_nome = 'Nome do cliente é obrigatório';
    if (!formData.cliente_cpf_cnpj.trim()) newErrors.cliente_cpf_cnpj = 'CPF/CNPJ é obrigatório';
    if (!formData.tipo.trim()) newErrors.tipo = 'Tipo de contrato é obrigatório';
    if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
      newErrors.valor_total = 'Valor deve ser maior que zero';
    }
    if (!formData.data_inicio) newErrors.data_inicio = 'Data de início é obrigatória';
    if (!formData.data_fim) newErrors.data_fim = 'Data de término é obrigatória';

    if (formData.data_inicio && formData.data_fim) {
      if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
        newErrors.data_fim = 'Data de término deve ser posterior à data de início';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const novoContrato = {
      id: `${Date.now()}`,
      numero: `CTR-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      cliente_nome: formData.cliente_nome,
      cliente_cpf_cnpj: formData.cliente_cpf_cnpj,
      cliente_email: formData.cliente_email,
      cliente_telefone: formData.cliente_telefone,
      cliente_endereco: formData.cliente_endereco,
      empresa_id: empresaAtual,
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor_total: parseFloat(formData.valor_total),
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      status: 'ativo',
      tipo_parcelamento: formData.tipo_parcelamento,
      num_parcelas: parseInt(formData.num_parcelas),
      observacoes: formData.observacoes,
    };

    onSave(novoContrato);
    toast.success('Contrato criado com sucesso!');
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      cliente_nome: '',
      cliente_cpf_cnpj: '',
      cliente_email: '',
      cliente_telefone: '',
      cliente_endereco: '',
      tipo: '',
      descricao: '',
      valor_total: '',
      data_inicio: '',
      data_fim: '',
      tipo_parcelamento: 'mensal',
      num_parcelas: '12',
      observacoes: '',
    });
    setErrors({});
    onClose();
  };

  const valorParcela = formData.tipo_parcelamento !== 'avista' 
    ? (parseFloat(formData.valor_total) || 0) / (parseInt(formData.num_parcelas) || 1)
    : 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1F4788]" />
            Novo Contrato
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo contrato
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs defaultValue="cliente" className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="cliente" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <User className="w-4 h-4 mr-2" />
                Dados do Cliente
              </TabsTrigger>
              <TabsTrigger 
                value="contrato" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <FileCheck className="w-4 h-4 mr-2" />
                Dados do Contrato
              </TabsTrigger>
              <TabsTrigger 
                value="financeiro" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Informações Financeiras
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Tab 1: Dados do Cliente */}
              <TabsContent value="cliente" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Informações do Cliente</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="cliente_nome">Nome/Razão Social *</Label>
                    <Input
                      id="cliente_nome"
                      value={formData.cliente_nome}
                      onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                      placeholder="Ex: Empresa ABC Ltda"
                      className={errors.cliente_nome ? 'border-red-500' : ''}
                    />
                    {errors.cliente_nome && (
                      <p className="text-xs text-red-500 mt-1">{errors.cliente_nome}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cliente_cpf_cnpj">CPF/CNPJ *</Label>
                    <Input
                      id="cliente_cpf_cnpj"
                      value={formData.cliente_cpf_cnpj}
                      onChange={(e) => setFormData({ ...formData, cliente_cpf_cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                      className={errors.cliente_cpf_cnpj ? 'border-red-500' : ''}
                    />
                    {errors.cliente_cpf_cnpj && (
                      <p className="text-xs text-red-500 mt-1">{errors.cliente_cpf_cnpj}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="cliente_telefone">Telefone</Label>
                    <Input
                      id="cliente_telefone"
                      value={formData.cliente_telefone}
                      onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="cliente_email">E-mail</Label>
                    <Input
                      id="cliente_email"
                      type="email"
                      value={formData.cliente_email}
                      onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                      placeholder="contato@cliente.com"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="cliente_endereco">Endereço Completo</Label>
                    <Input
                      id="cliente_endereco"
                      value={formData.cliente_endereco}
                      onChange={(e) => setFormData({ ...formData, cliente_endereco: e.target.value })}
                      placeholder="Rua, número, bairro, cidade - UF"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Dados do Contrato */}
              <TabsContent value="contrato" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Informações do Contrato</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo">Tipo de Contrato *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Locação de Equipamentos">Locação de Equipamentos</SelectItem>
                        <SelectItem value="Locação de Maquinário">Locação de Maquinário</SelectItem>
                        <SelectItem value="Campanha Digital">Campanha Digital</SelectItem>
                        <SelectItem value="Marketing Contínuo">Marketing Contínuo</SelectItem>
                        <SelectItem value="Produção de Evento">Produção de Evento</SelectItem>
                        <SelectItem value="Eventos Mensais">Eventos Mensais</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo && (
                      <p className="text-xs text-red-500 mt-1">{errors.tipo}</p>
                    )}
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
                    {errors.valor_total && (
                      <p className="text-xs text-red-500 mt-1">{errors.valor_total}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="data_inicio">Data de Início *</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      className={errors.data_inicio ? 'border-red-500' : ''}
                    />
                    {errors.data_inicio && (
                      <p className="text-xs text-red-500 mt-1">{errors.data_inicio}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="data_fim">Data de Término *</Label>
                    <Input
                      id="data_fim"
                      type="date"
                      value={formData.data_fim}
                      onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                      className={errors.data_fim ? 'border-red-500' : ''}
                    />
                    {errors.data_fim && (
                      <p className="text-xs text-red-500 mt-1">{errors.data_fim}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="descricao">Descrição do Contrato</Label>
                    <textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva os detalhes do contrato..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Observações adicionais..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Informações Financeiras */}
              <TabsContent value="financeiro" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Parcelamento e Pagamento (RN-003)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_parcelamento">Tipo de Parcelamento</Label>
                    <Select value={formData.tipo_parcelamento} onValueChange={(value) => setFormData({ ...formData, tipo_parcelamento: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avista">À Vista</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                        <SelectItem value="personalizado">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo_parcelamento !== 'avista' && (
                    <div>
                      <Label htmlFor="num_parcelas">Número de Parcelas</Label>
                      <Input
                        id="num_parcelas"
                        type="number"
                        min="1"
                        value={formData.num_parcelas}
                        onChange={(e) => setFormData({ ...formData, num_parcelas: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Preview do Parcelamento */}
                {formData.valor_total && (
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-3">
                    <h4 className="text-sm text-gray-900">Resumo Financeiro</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Valor Total</p>
                        <p className="text-lg text-gray-900">
                          R$ {parseFloat(formData.valor_total).toFixed(2)}
                        </p>
                      </div>

                      {formData.tipo_parcelamento !== 'avista' && (
                        <>
                          <div>
                            <p className="text-xs text-gray-600">Valor por Parcela</p>
                            <p className="text-lg text-green-600">
                              R$ {valorParcela.toFixed(2)}
                            </p>
                          </div>

                          <div className="col-span-2">
                            <p className="text-xs text-gray-600">Descrição</p>
                            <p className="text-sm text-gray-900">
                              {formData.num_parcelas}x de R$ {valorParcela.toFixed(2)} ({formData.tipo_parcelamento})
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-orange-50 rounded border border-orange-200">
                  <p className="text-xs text-orange-800">
                    <strong>RN-003:</strong> O sistema permite parcelamento flexível com datas customizadas. 
                    Você poderá ajustar as parcelas após criar o contrato.
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Ações - Fixo no rodapé */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Criar Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
