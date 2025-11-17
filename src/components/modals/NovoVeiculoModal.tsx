import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Car, Loader2, AlertCircle } from 'lucide-react';
import { formatarPlaca } from '../../lib/formatters';
import { validarPlaca, validarTextoObrigatorio } from '../../lib/validators';
import type { NovoVeiculoModalProps, Veiculo, FormErrors } from '../../types/modals';

export function NovoVeiculoModal({ open, onClose, onSave, empresas }: NovoVeiculoModalProps) {
  const initialFormData: Omit<Veiculo, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> = {
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    tipo: 'carro',
    empresa_id: '',
    status: 'ativo',
    km_atual: '0',
    combustivel: 'flex',
    cor: '',
    renavam: '',
    chassi: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Detectar mudanças no formulário
  useEffect(() => {
    const hasChanges = Object.entries(formData).some(([key, value]) => {
      if (key === 'tipo' || key === 'status' || key === 'combustivel') return false;
      return value !== '' && value !== '0';
    });
    setIsDirty(hasChanges);
  }, [formData]);

  // Reset ao fechar/abrir
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setErrors({});
      setIsDirty(false);
    }
  }, [open]);

  // Validação completa do formulário
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validação de Placa
    if (!validarTextoObrigatorio(formData.placa)) {
      newErrors.placa = 'Placa é obrigatória';
    } else if (!validarPlaca(formData.placa)) {
      newErrors.placa = 'Placa inválida. Use formato AAA-0000 ou AAA0A00';
    }

    // Validação de Modelo
    if (!validarTextoObrigatorio(formData.modelo)) {
      newErrors.modelo = 'Modelo é obrigatório';
    }

    // Validação de Marca
    if (!validarTextoObrigatorio(formData.marca)) {
      newErrors.marca = 'Marca é obrigatória';
    }

    // Validação de Ano
    if (!validarTextoObrigatorio(formData.ano)) {
      newErrors.ano = 'Ano é obrigatório';
    } else {
      const anoNum = parseInt(formData.ano);
      const anoAtual = new Date().getFullYear();
      if (isNaN(anoNum) || anoNum < 1900 || anoNum > anoAtual + 1) {
        newErrors.ano = `Ano deve estar entre 1900 e ${anoAtual + 1}`;
      }
    }

    // Validação de Empresa
    if (!validarTextoObrigatorio(formData.empresa_id)) {
      newErrors.empresa_id = 'Selecione uma empresa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Confirmação de saída com dados não salvos
  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmar = window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair sem salvar?'
      );
      if (!confirmar) return;
    }
    onClose();
  }, [isDirty, onClose]);

  // Salvamento com loading e tratamento de erros
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário', {
        description: 'Verifique os campos destacados em vermelho',
      });
      return;
    }

    setIsLoading(true);

    try {
      await onSave(formData);
      toast.success('Veículo cadastrado com sucesso!', {
        description: `${formData.marca} ${formData.modelo} - ${formatarPlaca(formData.placa)}`,
      });
      onClose();
    } catch (error) {
      console.error('Erro ao cadastrar veículo:', error);
      toast.error('Erro ao cadastrar veículo', {
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar campo com validação
  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao editar
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#1F4788]" />
            Novo Veículo
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo veículo na frota da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados Básicos */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm text-gray-900 mb-3 border-b pb-2">Dados Básicos</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Placa */}
              <div>
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => updateField('placa', formatarPlaca(e.target.value))}
                  placeholder="AAA-0000 ou AAA0A00"
                  maxLength={8}
                  aria-invalid={!!errors.placa}
                  aria-describedby={errors.placa ? 'placa-error' : undefined}
                  aria-required="true"
                  disabled={isLoading}
                  className={errors.placa ? 'border-red-500 focus-visible:ring-red-500' : ''}
                />
                {errors.placa && (
                  <p id="placa-error" role="alert" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.placa}
                  </p>
                )}
              </div>

              {/* Empresa */}
              <div>
                <Label htmlFor="empresa_id">Empresa *</Label>
                <Select 
                  value={formData.empresa_id} 
                  onValueChange={(value) => updateField('empresa_id', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger 
                    id="empresa_id"
                    aria-invalid={!!errors.empresa_id}
                    aria-required="true"
                    className={errors.empresa_id ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.empresa_id && (
                  <p role="alert" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.empresa_id}
                  </p>
                )}
              </div>

              {/* Marca */}
              <div>
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => updateField('marca', e.target.value)}
                  placeholder="Ex: Fiat, Volkswagen"
                  aria-invalid={!!errors.marca}
                  aria-required="true"
                  disabled={isLoading}
                  className={errors.marca ? 'border-red-500' : ''}
                />
                {errors.marca && (
                  <p role="alert" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.marca}
                  </p>
                )}
              </div>

              {/* Modelo */}
              <div>
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => updateField('modelo', e.target.value)}
                  placeholder="Ex: Uno, Gol"
                  aria-invalid={!!errors.modelo}
                  aria-required="true"
                  disabled={isLoading}
                  className={errors.modelo ? 'border-red-500' : ''}
                />
                {errors.modelo && (
                  <p role="alert" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.modelo}
                  </p>
                )}
              </div>

              {/* Ano */}
              <div>
                <Label htmlFor="ano">Ano *</Label>
                <Input
                  id="ano"
                  value={formData.ano}
                  onChange={(e) => updateField('ano', e.target.value)}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="2024"
                  aria-invalid={!!errors.ano}
                  aria-required="true"
                  disabled={isLoading}
                  className={errors.ano ? 'border-red-500' : ''}
                />
                {errors.ano && (
                  <p role="alert" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.ano}
                  </p>
                )}
              </div>

              {/* Cor */}
              <div>
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  value={formData.cor}
                  onChange={(e) => updateField('cor', e.target.value)}
                  placeholder="Ex: Branco, Prata"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Veículo</Label>
              <Select value={formData.tipo} onValueChange={(value: any) => updateField('tipo', value)} disabled={isLoading}>
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="carro">🚗 Carro</SelectItem>
                  <SelectItem value="moto">🏍️ Moto</SelectItem>
                  <SelectItem value="van">🚐 Van</SelectItem>
                  <SelectItem value="caminhao">🚚 Caminhão</SelectItem>
                  <SelectItem value="onibus">🚌 Ônibus</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="combustivel">Combustível</Label>
              <Select value={formData.combustivel} onValueChange={(value: any) => updateField('combustivel', value)} disabled={isLoading}>
                <SelectTrigger id="combustivel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasolina">⛽ Gasolina</SelectItem>
                  <SelectItem value="etanol">🌱 Etanol</SelectItem>
                  <SelectItem value="flex">🔄 Flex</SelectItem>
                  <SelectItem value="diesel">🛢️ Diesel</SelectItem>
                  <SelectItem value="eletrico">⚡ Elétrico</SelectItem>
                  <SelectItem value="hibrido">🔋 Híbrido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="km_atual">Quilometragem Atual</Label>
              <Input
                id="km_atual"
                value={formData.km_atual}
                onChange={(e) => updateField('km_atual', e.target.value)}
                type="number"
                min="0"
                placeholder="0"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => updateField('status', value)} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">✅ Ativo</SelectItem>
                  <SelectItem value="manutencao">🔧 Manutenção</SelectItem>
                  <SelectItem value="inativo">❌ Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Documentação */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm text-gray-900 mb-3 border-b pb-2">Documentação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="renavam">RENAVAM</Label>
                <Input
                  id="renavam"
                  value={formData.renavam}
                  onChange={(e) => updateField('renavam', e.target.value)}
                  placeholder="00000000000"
                  maxLength={11}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="chassi">Chassi</Label>
                <Input
                  id="chassi"
                  value={formData.chassi}
                  onChange={(e) => updateField('chassi', e.target.value.toUpperCase())}
                  placeholder="0AA00AAA0A0000000"
                  maxLength={17}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline" disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            className="bg-[#1F4788] hover:bg-blue-800"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cadastrando...
              </>
            ) : (
              'Cadastrar Veículo'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}