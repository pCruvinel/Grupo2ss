import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calculator } from 'lucide-react';

interface PontoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ponto: any) => void;
}

export function PontoModal({ open, onClose, onSave }: PontoModalProps) {
  const [formData, setFormData] = useState({
    data: '',
    entradaManha: '',
    saidaAlmoco: '',
    entradaTarde: '',
    saida: '',
    almoco: '1',
    horasContratadas: '8',
  });

  const [calculado, setCalculado] = useState({
    saldo: 0,
    trabalhadas: 0,
    banco: 0,
  });

  const calcularHoras = (inicio: string, fim: string): number => {
    if (!inicio || !fim) return 0;
    
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);
    
    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const fimMinutos = horaFim * 60 + minutoFim;
    
    return (fimMinutos - inicioMinutos) / 60;
  };

  const handleCalcular = () => {
    const horasManha = calcularHoras(formData.entradaManha, formData.saidaAlmoco);
    const horasTarde = calcularHoras(formData.entradaTarde, formData.saida);
    const almoco = parseFloat(formData.almoco) || 1;
    const contratadas = parseFloat(formData.horasContratadas) || 8;
    
    const trabalhadas = horasManha + horasTarde;
    const saldo = trabalhadas - contratadas;
    
    setCalculado({
      saldo,
      trabalhadas,
      banco: saldo,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      data: formData.data,
      entradaManha: formData.entradaManha,
      saidaAlmoco: formData.saidaAlmoco,
      entradaTarde: formData.entradaTarde,
      saida: formData.saida,
      saldo: calculado.saldo,
      banco: calculado.banco,
    });

    // Resetar form
    setFormData({
      data: '',
      entradaManha: '',
      saidaAlmoco: '',
      entradaTarde: '',
      saida: '',
      almoco: '1',
      horasContratadas: '8',
    });
    setCalculado({ saldo: 0, trabalhadas: 0, banco: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Registro de Ponto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="data">Data</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entradaManha">Entrada Manhã</Label>
              <Input
                id="entradaManha"
                type="time"
                value={formData.entradaManha}
                onChange={(e) => setFormData({ ...formData, entradaManha: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="saidaAlmoco">Saída Almoço</Label>
              <Input
                id="saidaAlmoco"
                type="time"
                value={formData.saidaAlmoco}
                onChange={(e) => setFormData({ ...formData, saidaAlmoco: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entradaTarde">Entrada Tarde</Label>
              <Input
                id="entradaTarde"
                type="time"
                value={formData.entradaTarde}
                onChange={(e) => setFormData({ ...formData, entradaTarde: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="saida">Saída</Label>
              <Input
                id="saida"
                type="time"
                value={formData.saida}
                onChange={(e) => setFormData({ ...formData, saida: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="almoco">Almoço (horas)</Label>
              <Input
                id="almoco"
                type="number"
                step="0.5"
                value={formData.almoco}
                onChange={(e) => setFormData({ ...formData, almoco: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="horasContratadas">Horas Contratadas</Label>
              <Input
                id="horasContratadas"
                type="number"
                step="0.5"
                value={formData.horasContratadas}
                onChange={(e) => setFormData({ ...formData, horasContratadas: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              onClick={handleCalcular}
              variant="outline"
              className="border-[#1F4788] text-[#1F4788] hover:bg-blue-50"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calcular Horas
            </Button>
          </div>

          {calculado.trabalhadas > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-gray-900 mb-3">Resultado do Cálculo</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Horas Trabalhadas</div>
                  <div className="text-gray-900">{calculado.trabalhadas.toFixed(2)}h</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Saldo do Dia</div>
                  <div className={calculado.saldo >= 0 ? 'text-[#28A745]' : 'text-[#DC3545]'}>
                    {calculado.saldo >= 0 ? '+' : ''}{calculado.saldo.toFixed(2)}h
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Banco Atualizado</div>
                  <div className={calculado.banco >= 0 ? 'text-[#28A745]' : 'text-[#DC3545]'}>
                    {calculado.banco >= 0 ? '+' : ''}{calculado.banco.toFixed(2)}h
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1F4788] hover:bg-blue-800"
              disabled={calculado.trabalhadas === 0}
            >
              Salvar Ponto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
