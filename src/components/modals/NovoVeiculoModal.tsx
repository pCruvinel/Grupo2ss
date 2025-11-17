import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from '../ui/sonner';
import { Car } from 'lucide-react';

interface NovoVeiculoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (veiculo: any) => void;
  empresas: { id: string; nome: string }[];
}

export function NovoVeiculoModal({ open, onClose, onSave, empresas }: NovoVeiculoModalProps) {
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    marca: '',
    ano: '',
    tipo: 'carro',
    empresa_id: '',
    status: 'ativo',
    km_atual: '',
    combustivel: 'flex',
    cor: '',
    renavam: '',
    chassi: '',
  });

  const handleSubmit = () => {
    if (!formData.placa || !formData.modelo || !formData.marca || !formData.ano || !formData.empresa_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validação de placa
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    if (!placaRegex.test(formData.placa.toUpperCase().replace('-', ''))) {
      toast.error('Placa inválida. Use formato AAA0A00 ou AAA-0000');
      return;
    }

    onSave({
      ...formData,
      id: Date.now().toString(),
      placa: formData.placa.toUpperCase(),
      created_at: new Date().toISOString(),
    });

    toast.success('Veículo cadastrado com sucesso!');
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      placa: '',
      modelo: '',
      marca: '',
      ano: '',
      tipo: 'carro',
      empresa_id: '',
      status: 'ativo',
      km_atual: '',
      combustivel: 'flex',
      cor: '',
      renavam: '',
      chassi: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Novo Veículo
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo veículo na frota da empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dados Básicos */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">Dados Básicos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Placa *</Label>
                <Input
                  value={formData.placa}
                  onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                  placeholder="AAA-0000 ou AAA0A00"
                  maxLength={8}
                />
              </div>
              <div>
                <Label>Empresa *</Label>
                <Select value={formData.empresa_id} onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marca *</Label>
                <Input
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  placeholder="Ex: Fiat, Volkswagen"
                />
              </div>
              <div>
                <Label>Modelo *</Label>
                <Input
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  placeholder="Ex: Uno, Gol"
                />
              </div>
              <div>
                <Label>Ano *</Label>
                <Input
                  value={formData.ano}
                  onChange={(e) => setFormData({ ...formData, ano: e.target.value })}
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  placeholder="2024"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  value={formData.cor}
                  onChange={(e) => setFormData({ ...formData, cor: e.target.value })}
                  placeholder="Ex: Branco, Prata"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Veículo</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
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
              <Label>Combustível</Label>
              <Select value={formData.combustivel} onValueChange={(value) => setFormData({ ...formData, combustivel: value })}>
                <SelectTrigger>
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
              <Label>Quilometragem Atual</Label>
              <Input
                value={formData.km_atual}
                onChange={(e) => setFormData({ ...formData, km_atual: e.target.value })}
                type="number"
                min="0"
                placeholder="0"
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
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
            <h3 className="font-medium text-gray-900 mb-3">Documentação</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>RENAVAM</Label>
                <Input
                  value={formData.renavam}
                  onChange={(e) => setFormData({ ...formData, renavam: e.target.value })}
                  placeholder="00000000000"
                  maxLength={11}
                />
              </div>
              <div>
                <Label>Chassi</Label>
                <Input
                  value={formData.chassi}
                  onChange={(e) => setFormData({ ...formData, chassi: e.target.value.toUpperCase() })}
                  placeholder="0AA00AAA0A0000000"
                  maxLength={17}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} variant="outline">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-[#1F4788] hover:bg-blue-800">
            Cadastrar Veículo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
