import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { DollarSign, User, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface NovoPagamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (pagamento: any) => void;
  colaboradores: Array<{ id: string; nome: string; cargo?: string }>;
  empresas?: Array<{ id: string; nome: string }>;
  empresa_id: string;
}

export function NovoPagamentoModal({ 
  open, 
  onClose, 
  onSave, 
  colaboradores,
  empresas = [],
  empresa_id 
}: NovoPagamentoModalProps) {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    tipo: 'salario',
    descricao: '',
    valor_bruto: '',
    bonus: '',
    descontos: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    mes_referencia: new Date().toISOString().slice(0, 7),
    forma_pagamento: 'transferencia',
    observacoes: '',
    empresa_id: empresa_id,
  });

  const [valorLiquido, setValorLiquido] = useState(0);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        colaborador_id: '',
        tipo: 'salario',
        descricao: '',
        valor_bruto: '',
        bonus: '',
        descontos: '',
        data_pagamento: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        mes_referencia: new Date().toISOString().slice(0, 7),
        forma_pagamento: 'transferencia',
        observacoes: '',
        empresa_id: empresa_id,
      });
      setValorLiquido(0);
    }
  }, [open, empresa_id]);

  useEffect(() => {
    // Calcular valor líquido
    const bruto = parseFloat(formData.valor_bruto || '0');
    const bonusVal = parseFloat(formData.bonus || '0');
    const descontosVal = parseFloat(formData.descontos || '0');
    
    const liquido = bruto + bonusVal - descontosVal;
    setValorLiquido(liquido);
  }, [formData.valor_bruto, formData.bonus, formData.descontos]);

  const handleSave = () => {
    // Validações
    if (!formData.colaborador_id) {
      toast.error('Selecione um colaborador');
      return;
    }

    if (!formData.tipo) {
      toast.error('Selecione o tipo de pagamento');
      return;
    }

    if (!formData.valor_bruto || parseFloat(formData.valor_bruto) <= 0) {
      toast.error('Valor bruto é obrigatório e deve ser maior que zero');
      return;
    }

    if (!formData.data_vencimento) {
      toast.error('Data de vencimento é obrigatória');
      return;
    }

    if (valorLiquido < 0) {
      toast.error('Valor líquido não pode ser negativo');
      return;
    }

    const pagamentoData = {
      ...formData,
      valor_bruto: parseFloat(formData.valor_bruto),
      bonus: parseFloat(formData.bonus || '0'),
      descontos: parseFloat(formData.descontos || '0'),
      valor_liquido: valorLiquido,
      status: 'pendente',
    };

    onSave(pagamentoData);
  };

  const colaboradorSelecionado = colaboradores.find(c => c.id === formData.colaborador_id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#28A745]" />
            Novo Pagamento
          </DialogTitle>
          <DialogDescription>
            Registre um novo pagamento a colaborador - RN-007: Bônus e descontos separados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Colaborador */}
          <div>
            <Label htmlFor="colaborador_id" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Colaborador *
            </Label>
            <Select
              value={formData.colaborador_id}
              onValueChange={(value) => setFormData({ ...formData, colaborador_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o colaborador" />
              </SelectTrigger>
              <SelectContent>
                {colaboradores.map((colaborador) => (
                  <SelectItem key={colaborador.id} value={colaborador.id}>
                    {colaborador.nome} {colaborador.cargo && `- ${colaborador.cargo}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {colaboradorSelecionado && (
              <p className="text-xs text-gray-500 mt-1">
                Cargo: {colaboradorSelecionado.cargo || 'Não especificado'}
              </p>
            )}
          </div>

          {/* Tipo de Pagamento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Pagamento *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salario">💼 Salário</SelectItem>
                  <SelectItem value="bonus">🎁 Bônus</SelectItem>
                  <SelectItem value="comissao">📊 Comissão</SelectItem>
                  <SelectItem value="ferias">🏖️ Férias</SelectItem>
                  <SelectItem value="decimo_terceiro">🎄 13º Salário</SelectItem>
                  <SelectItem value="adiantamento">💸 Adiantamento</SelectItem>
                  <SelectItem value="outros">📝 Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
              <Select
                value={formData.forma_pagamento}
                onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: Salário referente ao mês de novembro"
            />
          </div>

          {/* Mês de Referência */}
          <div>
            <Label htmlFor="mes_referencia">Mês de Referência *</Label>
            <Input
              id="mes_referencia"
              type="month"
              value={formData.mes_referencia}
              onChange={(e) => setFormData({ ...formData, mes_referencia: e.target.value })}
            />
          </div>

          {/* Valores - RN-007 */}
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-900 font-medium">
                RN-007: Bônus e Descontos Separados
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Valor Bruto */}
              <div>
                <Label htmlFor="valor_bruto">Valor Bruto *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                  <Input
                    id="valor_bruto"
                    type="number"
                    step="0.01"
                    value={formData.valor_bruto}
                    onChange={(e) => setFormData({ ...formData, valor_bruto: e.target.value })}
                    placeholder="0,00"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Bônus */}
              <div>
                <Label htmlFor="bonus" className="text-green-700">
                  + Bônus
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                  <Input
                    id="bonus"
                    type="number"
                    step="0.01"
                    value={formData.bonus}
                    onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                    placeholder="0,00"
                    className="pl-10 border-green-300 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Descontos */}
              <div>
                <Label htmlFor="descontos" className="text-red-700">
                  - Descontos
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">R$</span>
                  <Input
                    id="descontos"
                    type="number"
                    step="0.01"
                    value={formData.descontos}
                    onChange={(e) => setFormData({ ...formData, descontos: e.target.value })}
                    placeholder="0,00"
                    className="pl-10 border-red-300 focus:border-red-500"
                  />
                </div>
              </div>
            </div>

            {/* Valor Líquido Calculado */}
            <div className="pt-3 border-t border-blue-300">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Valor Líquido:</span>
                <span className="text-2xl font-bold text-blue-900">
                  R$ {valorLiquido.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Bruto + Bônus - Descontos
              </p>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_vencimento" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Vencimento *
              </Label>
              <Input
                id="data_vencimento"
                type="date"
                value={formData.data_vencimento}
                onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="data_pagamento">Data Pagamento</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={formData.data_pagamento}
                onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Deixe vazio se ainda não foi pago
              </p>
            </div>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações adicionais sobre o pagamento"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#28A745] hover:bg-green-700">
            Registrar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
