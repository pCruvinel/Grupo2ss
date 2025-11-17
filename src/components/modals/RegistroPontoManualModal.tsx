import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from '../ui/sonner';
import { Clock, AlertTriangle, User } from 'lucide-react';
import { Badge } from '../ui/badge';

interface RegistroPontoManualModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (registro: any) => void;
  colaboradores: { id: string; nome: string; empresa_id: string }[];
}

export function RegistroPontoManualModal({ open, onClose, onSave, colaboradores }: RegistroPontoManualModalProps) {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    data: new Date().toISOString().split('T')[0],
    entrada: '',
    saida_almoco: '',
    retorno_almoco: '',
    saida: '',
    tipo: 'presencial',
    justificativa: '',
  });

  const calcularHoras = () => {
    if (!formData.entrada || !formData.saida) return '00:00';
    
    const [entH, entM] = formData.entrada.split(':').map(Number);
    const [saiH, saiM] = formData.saida.split(':').map(Number);
    
    let totalMinutos = (saiH * 60 + saiM) - (entH * 60 + entM);
    
    // Descontar horário de almoço
    if (formData.saida_almoco && formData.retorno_almoco) {
      const [saAlmH, saAlmM] = formData.saida_almoco.split(':').map(Number);
      const [retAlmH, retAlmM] = formData.retorno_almoco.split(':').map(Number);
      const almocoMinutos = (retAlmH * 60 + retAlmM) - (saAlmH * 60 + saAlmM);
      totalMinutos -= almocoMinutos;
    }
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!formData.colaborador_id || !formData.data || !formData.entrada || !formData.saida) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.justificativa.trim()) {
      toast.error('A justificativa é obrigatória para registro manual');
      return;
    }

    // Validar horários
    if (formData.saida_almoco && formData.retorno_almoco) {
      if (formData.saida_almoco <= formData.entrada) {
        toast.error('Horário de saída para almoço deve ser após a entrada');
        return;
      }
      if (formData.retorno_almoco <= formData.saida_almoco) {
        toast.error('Horário de retorno do almoço deve ser após a saída');
        return;
      }
      if (formData.saida <= formData.retorno_almoco) {
        toast.error('Horário de saída deve ser após o retorno do almoço');
        return;
      }
    } else if (formData.saida <= formData.entrada) {
      toast.error('Horário de saída deve ser após a entrada');
      return;
    }

    const horasTrabalhadas = calcularHoras();
    const colaborador = colaboradores.find(c => c.id === formData.colaborador_id);

    onSave({
      ...formData,
      id: Date.now().toString(),
      horas_trabalhadas: horasTrabalhadas,
      colaborador_nome: colaborador?.nome,
      tipo_registro: 'manual',
      criado_em: new Date().toISOString(),
      criado_por: 'Gestor Sistema', // Em produção viria do usuário logado
    });

    toast.success('Registro de ponto manual criado com sucesso!');
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      colaborador_id: '',
      data: new Date().toISOString().split('T')[0],
      entrada: '',
      saida_almoco: '',
      retorno_almoco: '',
      saida: '',
      tipo: 'presencial',
      justificativa: '',
    });
    onClose();
  };

  const colaboradorSelecionado = colaboradores?.find(c => c.id === formData.colaborador_id);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Registro Manual de Ponto
          </DialogTitle>
          <DialogDescription>
            Registre o ponto de um colaborador manualmente
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de Registro Manual */}
        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-900 mb-1">Atenção: Registro Manual</h3>
              <p className="text-sm text-orange-700">
                Este registro será marcado como manual e requer justificativa. Use apenas em casos excepcionais 
                como esquecimento de registro, problemas técnicos ou ajustes autorizados.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Colaborador e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Colaborador *</Label>
              <Select value={formData.colaborador_id} onValueChange={(value) => setFormData({ ...formData, colaborador_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores?.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {col.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {colaboradorSelecionado && (
                <Badge className="mt-2" variant="outline">
                  {colaboradores.find(c => c.id === formData.colaborador_id)?.nome}
                </Badge>
              )}
            </div>
            <div>
              <Label>Data *</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Horários */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Horários do Dia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Entrada *</Label>
                <Input
                  type="time"
                  value={formData.entrada}
                  onChange={(e) => setFormData({ ...formData, entrada: e.target.value })}
                />
              </div>
              <div>
                <Label>Saída para Almoço</Label>
                <Input
                  type="time"
                  value={formData.saida_almoco}
                  onChange={(e) => setFormData({ ...formData, saida_almoco: e.target.value })}
                />
              </div>
              <div>
                <Label>Retorno do Almoço</Label>
                <Input
                  type="time"
                  value={formData.retorno_almoco}
                  onChange={(e) => setFormData({ ...formData, retorno_almoco: e.target.value })}
                />
              </div>
              <div>
                <Label>Saída *</Label>
                <Input
                  type="time"
                  value={formData.saida}
                  onChange={(e) => setFormData({ ...formData, saida: e.target.value })}
                />
              </div>
            </div>
            
            {formData.entrada && formData.saida && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-900">
                  Total de horas trabalhadas: <span className="font-bold">{calcularHoras()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Tipo de Trabalho */}
          <div>
            <Label>Tipo de Trabalho</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">🏢 Presencial</SelectItem>
                <SelectItem value="home_office">🏠 Home Office</SelectItem>
                <SelectItem value="externo">🚗 Externo</SelectItem>
                <SelectItem value="hibrido">🔄 Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Justificativa */}
          <div>
            <Label>Justificativa *</Label>
            <Textarea
              value={formData.justificativa}
              onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
              placeholder="Descreva o motivo do registro manual (ex: esquecimento, falha no sistema, ajuste autorizado...)"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.justificativa.length}/500 caracteres
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-orange-600 hover:bg-orange-700">
            Registrar Ponto Manual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}