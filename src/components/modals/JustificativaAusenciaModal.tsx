import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from '../ui/sonner';
import { FileText, Calendar, User, Upload } from 'lucide-react';
import { Badge } from '../ui/badge';

interface JustificativaAusenciaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (justificativa: any) => void;
  colaboradores: { id: string; nome: string; empresa_id: string }[];
}

export function JustificativaAusenciaModal({ open, onClose, onSave, colaboradores }: JustificativaAusenciaModalProps) {
  const [formData, setFormData] = useState({
    colaborador_id: '',
    data_inicio: '',
    data_fim: '',
    tipo_ausencia: '',
    motivo: '',
    observacoes: '',
    anexo_nome: '',
  });

  const tiposAusencia = [
    { value: 'atestado_medico', label: '🏥 Atestado Médico', requerDoc: true },
    { value: 'licenca_medica', label: '⚕️ Licença Médica', requerDoc: true },
    { value: 'falta_justificada', label: '✅ Falta Justificada', requerDoc: false },
    { value: 'falta_injustificada', label: '❌ Falta Injustificada', requerDoc: false },
    { value: 'ferias', label: '🏖️ Férias', requerDoc: false },
    { value: 'licenca_maternidade', label: '👶 Licença Maternidade', requerDoc: true },
    { value: 'licenca_paternidade', label: '👨‍👶 Licença Paternidade', requerDoc: true },
    { value: 'casamento', label: '💒 Casamento', requerDoc: true },
    { value: 'luto', label: '🕊️ Luto', requerDoc: true },
    { value: 'outros', label: '📋 Outros', requerDoc: false },
  ];

  const calcularDias = () => {
    if (!formData.data_inicio || !formData.data_fim) return 0;
    
    const inicio = new Date(formData.data_inicio);
    const fim = new Date(formData.data_fim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };

  const tipoSelecionado = tiposAusencia.find(t => t.value === formData.tipo_ausencia);
  const requerDocumento = tipoSelecionado?.requerDoc || false;

  const handleSubmit = () => {
    if (!formData.colaborador_id || !formData.data_inicio || !formData.data_fim || !formData.tipo_ausencia || !formData.motivo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validar datas
    const inicio = new Date(formData.data_inicio);
    const fim = new Date(formData.data_fim);
    
    if (fim < inicio) {
      toast.error('A data final não pode ser anterior à data inicial');
      return;
    }

    if (requerDocumento && !formData.anexo_nome) {
      toast.error('Este tipo de ausência requer anexo de documento comprobatório');
      return;
    }

    const colaborador = colaboradores.find(c => c.id === formData.colaborador_id);
    const dias = calcularDias();

    onSave({
      ...formData,
      id: Date.now().toString(),
      colaborador_nome: colaborador?.nome,
      dias_ausencia: dias,
      status: 'pendente',
      criado_em: new Date().toISOString(),
      criado_por: 'Gestor Sistema', // Em produção viria do usuário logado
    });

    toast.success(`Justificativa de ausência registrada (${dias} ${dias === 1 ? 'dia' : 'dias'})`);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      colaborador_id: '',
      data_inicio: '',
      data_fim: '',
      tipo_ausencia: '',
      motivo: '',
      observacoes: '',
      anexo_nome: '',
    });
    onClose();
  };

  const handleFileUpload = () => {
    // Simulação de upload de arquivo
    const nomeArquivo = `atestado_${Date.now()}.pdf`;
    setFormData({ ...formData, anexo_nome: nomeArquivo });
    toast.success('Arquivo anexado com sucesso!');
  };

  const dias = calcularDias();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Justificativa de Ausência
          </DialogTitle>
          <DialogDescription>
            Registre uma ausência ou falta justificada de um colaborador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Colaborador */}
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
          </div>

          {/* Período de Ausência */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Período de Ausência</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início *</Label>
                <Input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label>Data Fim *</Label>
                <Input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  min={formData.data_inicio}
                />
              </div>
            </div>
            
            {dias > 0 && (
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-900">
                  Total de dias de ausência: <span className="font-bold">{dias} {dias === 1 ? 'dia' : 'dias'}</span>
                </p>
              </div>
            )}
          </div>

          {/* Tipo de Ausência */}
          <div>
            <Label>Tipo de Ausência *</Label>
            <Select value={formData.tipo_ausencia} onValueChange={(value) => setFormData({ ...formData, tipo_ausencia: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposAusencia.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                    {tipo.requerDoc && <Badge className="ml-2 bg-orange-100 text-orange-700 text-xs">Requer Doc.</Badge>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tipoSelecionado && requerDocumento && (
              <p className="text-xs text-orange-600 mt-1">
                ⚠️ Este tipo de ausência requer anexo de documento comprobatório
              </p>
            )}
          </div>

          {/* Motivo */}
          <div>
            <Label>Motivo *</Label>
            <Textarea
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Descreva o motivo da ausência"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.motivo.length}/300 caracteres
            </p>
          </div>

          {/* Observações */}
          <div>
            <Label>Observações Adicionais</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Informações complementares (opcional)"
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.observacoes.length}/200 caracteres
            </p>
          </div>

          {/* Anexo de Documento */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Label>Documento Comprobatório {requerDocumento && '*'}</Label>
              {formData.anexo_nome && (
                <Badge className="bg-green-100 text-green-700">
                  ✓ Anexado
                </Badge>
              )}
            </div>
            
            {formData.anexo_nome ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-700">{formData.anexo_nome}</span>
                </div>
                <Button
                  onClick={() => setFormData({ ...formData, anexo_nome: '' })}
                  variant="ghost"
                  size="sm"
                  className="text-red-600"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleFileUpload}
                variant="outline"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Anexar Documento (PDF, JPEG, PNG)
              </Button>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Aceita arquivos PDF, JPEG ou PNG até 5MB
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            Registrar Justificativa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}