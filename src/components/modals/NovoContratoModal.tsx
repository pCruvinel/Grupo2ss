import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileText, User, DollarSign, Calendar, Package } from 'lucide-react';
import { toast } from 'sonner';
import { formatarCPFouCNPJ, formatarTelefone, validarCPF, validarCNPJ, validarEmail } from '../../lib/formatters';

interface NovoContratoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contrato: any) => void;
  empresa_id: string;
}

export function NovoContratoModal({ open, onClose, onSave, empresa_id }: NovoContratoModalProps) {
  const [currentTab, setCurrentTab] = useState('cliente');
  const [formData, setFormData] = useState({
    // Dados do Cliente
    cliente_nome: '',
    cliente_cpf_cnpj: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_endereco: '',
    
    // Dados do Contrato
    tipo: '',
    descricao: '',
    valor_total: '',
    data_inicio: '',
    data_fim: '',
    
    // Parcelamento
    tipo_parcelamento: 'mensal',
    num_parcelas: '',
    
    // Outros
    observacoes: '',
    empresa_id: empresa_id,
  });

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
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
        num_parcelas: '',
        observacoes: '',
        empresa_id: empresa_id,
      });
      setCurrentTab('cliente');
    }
  }, [open, empresa_id]);

  const handleSave = () => {
    // Validações
    if (!formData.cliente_nome.trim()) {
      toast.error('Nome do cliente é obrigatório');
      setCurrentTab('cliente');
      return;
    }

    if (!formData.cliente_cpf_cnpj.trim()) {
      toast.error('CPF/CNPJ é obrigatório');
      setCurrentTab('cliente');
      return;
    }

    if (!formData.tipo) {
      toast.error('Tipo de contrato é obrigatório');
      setCurrentTab('contrato');
      return;
    }

    if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
      toast.error('Valor total é obrigatório e deve ser maior que zero');
      setCurrentTab('contrato');
      return;
    }

    if (!formData.data_inicio || !formData.data_fim) {
      toast.error('Datas de início e fim são obrigatórias');
      setCurrentTab('contrato');
      return;
    }

    if (new Date(formData.data_fim) <= new Date(formData.data_inicio)) {
      toast.error('Data de fim deve ser posterior à data de início');
      setCurrentTab('contrato');
      return;
    }

    if (formData.tipo_parcelamento === 'personalizado' && (!formData.num_parcelas || parseInt(formData.num_parcelas) <= 0)) {
      toast.error('Número de parcelas é obrigatório para parcelamento personalizado');
      setCurrentTab('parcelamento');
      return;
    }

    // Calcular número de parcelas se for mensal
    let numParcelas = formData.num_parcelas;
    if (formData.tipo_parcelamento === 'mensal') {
      const inicio = new Date(formData.data_inicio);
      const fim = new Date(formData.data_fim);
      const meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth()) + 1;
      numParcelas = meses.toString();
    }

    const contratoData = {
      ...formData,
      valor_total: parseFloat(formData.valor_total),
      num_parcelas: parseInt(numParcelas),
      status: 'ativo',
    };

    onSave(contratoData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1F4788]" />
            Novo Contrato
          </DialogTitle>
          <DialogDescription>
            Preencha as informações para criar um novo contrato
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cliente">
              <User className="w-4 h-4 mr-2" />
              Cliente
            </TabsTrigger>
            <TabsTrigger value="contrato">
              <FileText className="w-4 h-4 mr-2" />
              Contrato
            </TabsTrigger>
            <TabsTrigger value="parcelamento">
              <DollarSign className="w-4 h-4 mr-2" />
              Parcelamento
            </TabsTrigger>
          </TabsList>

          {/* Aba: Cliente */}
          <TabsContent value="cliente" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="cliente_nome">Nome/Razão Social *</Label>
              <Input
                id="cliente_nome"
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                placeholder="Nome completo ou razão social"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_cpf_cnpj">CPF/CNPJ *</Label>
                <Input
                  id="cliente_cpf_cnpj"
                  value={formData.cliente_cpf_cnpj}
                  onChange={(e) => {
                    const formatted = formatarCPFouCNPJ(e.target.value);
                    setFormData({ ...formData, cliente_cpf_cnpj: formatted });
                  }}
                  placeholder="000.000.000-00"
                  maxLength={18}
                />
              </div>

              <div>
                <Label htmlFor="cliente_telefone">Telefone</Label>
                <Input
                  id="cliente_telefone"
                  value={formData.cliente_telefone}
                  onChange={(e) => {
                    const formatted = formatarTelefone(e.target.value);
                    setFormData({ ...formData, cliente_telefone: formatted });
                  }}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cliente_email">Email</Label>
              <Input
                id="cliente_email"
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                placeholder="cliente@email.com"
              />
            </div>

            <div>
              <Label htmlFor="cliente_endereco">Endereço</Label>
              <Input
                id="cliente_endereco"
                value={formData.cliente_endereco}
                onChange={(e) => setFormData({ ...formData, cliente_endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade - UF"
              />
            </div>
          </TabsContent>

          {/* Aba: Contrato */}
          <TabsContent value="contrato" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="tipo">Tipo de Contrato *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="locacao">Locação</SelectItem>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o objeto do contrato"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="valor_total">Valor Total *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                <Input
                  id="valor_total"
                  type="number"
                  step="0.01"
                  value={formData.valor_total}
                  onChange={(e) => setFormData({ ...formData, valor_total: e.target.value })}
                  placeholder="0,00"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="data_fim">Data Fim *</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Aba: Parcelamento */}
          <TabsContent value="parcelamento" className="space-y-4 mt-4">
            <div>
              <Label>Tipo de Parcelamento *</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button
                  type="button"
                  variant={formData.tipo_parcelamento === 'mensal' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, tipo_parcelamento: 'mensal' })}
                  className="h-auto py-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Mensal</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Parcelas mensais automáticas
                  </span>
                </Button>

                <Button
                  type="button"
                  variant={formData.tipo_parcelamento === 'personalizado' ? 'default' : 'outline'}
                  onClick={() => setFormData({ ...formData, tipo_parcelamento: 'personalizado' })}
                  className="h-auto py-4 flex flex-col items-start"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">Personalizado</span>
                  </div>
                  <span className="text-xs text-left opacity-80">
                    Defina quantidade e valores
                  </span>
                </Button>
              </div>
            </div>

            {formData.tipo_parcelamento === 'personalizado' && (
              <div>
                <Label htmlFor="num_parcelas">Número de Parcelas *</Label>
                <Input
                  id="num_parcelas"
                  type="number"
                  min="1"
                  value={formData.num_parcelas}
                  onChange={(e) => setFormData({ ...formData, num_parcelas: e.target.value })}
                  placeholder="Ex: 12"
                />
              </div>
            )}

            {formData.tipo_parcelamento === 'mensal' && formData.data_inicio && formData.data_fim && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Parcelamento Automático:</strong> As parcelas serão geradas mensalmente
                  entre as datas especificadas.
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o contrato"
                rows={3}
              />
            </div>

            {/* Resumo */}
            {formData.valor_total && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Resumo do Contrato</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Valor Total:</span>
                    <span className="font-medium text-gray-900">
                      R$ {parseFloat(formData.valor_total || '0').toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {formData.tipo_parcelamento === 'mensal' && formData.data_inicio && formData.data_fim && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nº Parcelas (estimado):</span>
                        <span className="font-medium text-gray-900">
                          {(() => {
                            const inicio = new Date(formData.data_inicio);
                            const fim = new Date(formData.data_fim);
                            const meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + 
                                         (fim.getMonth() - inicio.getMonth()) + 1;
                            return meses;
                          })()}x
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor por Parcela:</span>
                        <span className="font-medium text-gray-900">
                          R$ {(() => {
                            const inicio = new Date(formData.data_inicio);
                            const fim = new Date(formData.data_fim);
                            const meses = (fim.getFullYear() - inicio.getFullYear()) * 12 + 
                                         (fim.getMonth() - inicio.getMonth()) + 1;
                            const valorParcela = parseFloat(formData.valor_total) / meses;
                            return valorParcela.toFixed(2).replace('.', ',');
                          })()}
                        </span>
                      </div>
                    </>
                  )}
                  {formData.tipo_parcelamento === 'personalizado' && formData.num_parcelas && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nº Parcelas:</span>
                        <span className="font-medium text-gray-900">{formData.num_parcelas}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor por Parcela:</span>
                        <span className="font-medium text-gray-900">
                          R$ {(parseFloat(formData.valor_total) / parseInt(formData.num_parcelas))
                            .toFixed(2)
                            .replace('.', ',')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
            Criar Contrato
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}