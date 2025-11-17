import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Upload } from 'lucide-react';

interface ContratoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contrato: any) => void;
  contrato: any | null;
}

export function ContratoModal({ open, onClose, onSave, contrato }: ContratoModalProps) {
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'cliente',
    nome: '',
    valor: '',
    dataInicio: '',
    dataFim: '',
    parcelamento: 'mensal',
    primeiraParcela: '',
    status: 'ativo',
  });

  useEffect(() => {
    if (contrato) {
      setFormData({
        numero: contrato.numero,
        tipo: contrato.tipo,
        nome: contrato.nome,
        valor: String(contrato.valor),
        dataInicio: '',
        dataFim: contrato.dataVencimento,
        parcelamento: 'mensal',
        primeiraParcela: '',
        status: contrato.status,
      });
    } else {
      setFormData({
        numero: `CTR-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        tipo: 'cliente',
        nome: '',
        valor: '',
        dataInicio: '',
        dataFim: '',
        parcelamento: 'mensal',
        primeiraParcela: '',
        status: 'ativo',
      });
    }
  }, [contrato, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      numero: formData.numero,
      tipo: formData.tipo,
      nome: formData.nome,
      valor: parseFloat(formData.valor),
      dataVencimento: formData.dataFim,
      status: formData.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contrato ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">Número do Contrato</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                required
                disabled
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo de Contrato</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="nome">
              {formData.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Digite o nome"
              required
            />
          </div>

          <div>
            <Label htmlFor="valor">Valor Total</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label>Parcelamento</Label>
            <RadioGroup value={formData.parcelamento} onValueChange={(value) => setFormData({ ...formData, parcelamento: value })}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mensal" id="mensal" />
                <Label htmlFor="mensal" className="cursor-pointer">Mensal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="personalizado" id="personalizado" />
                <Label htmlFor="personalizado" className="cursor-pointer">Personalizado</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.parcelamento === 'mensal' && (
            <div>
              <Label htmlFor="primeiraParcela">Data da Primeira Parcela</Label>
              <Input
                id="primeiraParcela"
                type="date"
                value={formData.primeiraParcela}
                onChange={(e) => setFormData({ ...formData, primeiraParcela: e.target.value })}
              />
              <p className="text-sm text-gray-500 mt-1">As próximas parcelas serão calculadas automaticamente</p>
            </div>
          )}

          <div>
            <Label htmlFor="pdf">Upload de PDF (Opcional)</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label
                htmlFor="pdf"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Clique para fazer upload do contrato em PDF</p>
                </div>
                <input id="pdf" type="file" className="hidden" accept=".pdf" />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#1F4788] hover:bg-blue-800">
              {contrato ? 'Atualizar' : 'Salvar'} Contrato
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
