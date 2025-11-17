import { useState } from 'react';
import { Plus, FileText, Lock, AlertCircle, Trash2, User, Calendar, Package, DollarSign } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface Material {
  id: string;
  nome: string;
  codigo: string;
  unidade: string;
  quantidade_disponivel: number;
}

interface MaterialSelecionado {
  material_id: string;
  quantidade: number;
}

interface NovaOrdemServicoModalProps {
  open: boolean;
  onClose: () => void;
  empresas: { id: string; nome: string }[];
  clientes: { id: string; nome: string }[];
  materiais: Material[];
  onSave: (os: any) => void;
}

export function NovaOrdemServicoModal({ 
  open, 
  onClose, 
  empresas,
  clientes,
  materiais,
  onSave 
}: NovaOrdemServicoModalProps) {
  const [formData, setFormData] = useState({
    numero_os: '',
    cliente_id: '',
    empresa_id: '',
    tipo_servico: '',
    data_inicio: '',
    data_fim: '',
    local_evento: '',
    responsavel: '',
    valor_total: '',
    observacoes: '',
  });

  const [materiaisSelecionados, setMateriaisSelecionados] = useState<MaterialSelecionado[]>([]);
  const [materialAtual, setMaterialAtual] = useState('');
  const [quantidadeAtual, setQuantidadeAtual] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const gerarNumeroOS = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `OS-${timestamp}-${random}`;
  };

  const getMaterialById = (id: string) => {
    return materiais.find(m => m.id === id);
  };

  const handleAdicionarMaterial = () => {
    if (!materialAtual || !quantidadeAtual) {
      toast.error('Selecione um material e informe a quantidade');
      return;
    }

    const material = getMaterialById(materialAtual);
    if (!material) return;

    const quantidade = parseFloat(quantidadeAtual);

    if (materiaisSelecionados.some(m => m.material_id === materialAtual)) {
      toast.error('Material já adicionado à ordem de serviço');
      return;
    }

    // Verificar disponibilidade (RN-006)
    if (quantidade > material.quantidade_disponivel) {
      toast.error('Quantidade indisponível!', {
        description: `Disponível: ${material.quantidade_disponivel} ${material.unidade}`,
      });
      return;
    }

    setMateriaisSelecionados([...materiaisSelecionados, {
      material_id: materialAtual,
      quantidade,
    }]);

    setMaterialAtual('');
    setQuantidadeAtual('');
    toast.success('Material adicionado');
  };

  const handleRemoverMaterial = (materialId: string) => {
    setMateriaisSelecionados(materiaisSelecionados.filter(m => m.material_id !== materialId));
    toast.info('Material removido');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.numero_os.trim()) newErrors.numero_os = 'Número da OS é obrigatório';
    if (!formData.cliente_id) newErrors.cliente_id = 'Selecione um cliente';
    if (!formData.empresa_id) newErrors.empresa_id = 'Selecione uma empresa';
    if (!formData.tipo_servico) newErrors.tipo_servico = 'Tipo de serviço é obrigatório';
    if (!formData.data_inicio) newErrors.data_inicio = 'Data de início é obrigatória';
    if (!formData.data_fim) newErrors.data_fim = 'Data de fim é obrigatória';
    if (!formData.local_evento.trim()) newErrors.local_evento = 'Local do evento é obrigatório';
    if (!formData.responsavel.trim()) newErrors.responsavel = 'Responsável é obrigatório';
    if (!formData.valor_total || parseFloat(formData.valor_total) <= 0) {
      newErrors.valor_total = 'Valor deve ser maior que zero';
    }

    if (formData.data_inicio && formData.data_fim) {
      if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
        newErrors.data_fim = 'Data de fim deve ser maior que a data de início';
      }
    }

    if (materiaisSelecionados.length === 0) {
      newErrors.materiais = 'Adicione pelo menos um material';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    const novaOS = {
      id: `${Date.now()}`,
      numero_os: formData.numero_os,
      cliente_id: formData.cliente_id,
      empresa_id: formData.empresa_id,
      tipo_servico: formData.tipo_servico,
      data_inicio: formData.data_inicio,
      data_fim: formData.data_fim,
      local_evento: formData.local_evento,
      responsavel: formData.responsavel,
      valor_total: parseFloat(formData.valor_total),
      observacoes: formData.observacoes,
      materiais: materiaisSelecionados,
      status: 'planejamento',
      data_criacao: new Date().toISOString().split('T')[0],
    };

    onSave(novaOS);
    
    toast.success('Ordem de Serviço criada com sucesso!', {
      description: `${materiaisSelecionados.length} materiais bloqueados automaticamente (RN-006)`,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      numero_os: '',
      cliente_id: '',
      empresa_id: '',
      tipo_servico: '',
      data_inicio: '',
      data_fim: '',
      local_evento: '',
      responsavel: '',
      valor_total: '',
      observacoes: '',
    });
    setMateriaisSelecionados([]);
    setMaterialAtual('');
    setQuantidadeAtual('');
    setErrors({});
    onClose();
  };

  const materiaisDisponiveis = materiais.filter(
    m => !materiaisSelecionados.some(ms => ms.material_id === m.id)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1F4788]" />
            Nova Ordem de Serviço
          </DialogTitle>
          <DialogDescription>
            Crie uma nova OS com bloqueio automático de materiais (RN-006)
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="dados" className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="dados" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <User className="w-4 h-4 mr-2" />
              Dados Básicos
            </TabsTrigger>
            <TabsTrigger 
              value="evento" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Evento
            </TabsTrigger>
            <TabsTrigger 
              value="materiais" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <Package className="w-4 h-4 mr-2" />
              Materiais
            </TabsTrigger>
            <TabsTrigger 
              value="financeiro" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Financeiro
            </TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            {/* Tab 1: Dados Básicos */}
            <TabsContent value="dados" className="p-6 m-0 space-y-4">
              <h3 className="text-sm text-gray-900 border-b pb-2">Informações da Ordem de Serviço</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_os">Número da OS *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="numero_os"
                      value={formData.numero_os}
                      onChange={(e) => setFormData({ ...formData, numero_os: e.target.value.toUpperCase() })}
                      placeholder="OS-XXXXXX-XX"
                      className={errors.numero_os ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData({ ...formData, numero_os: gerarNumeroOS() })}
                    >
                      Gerar
                    </Button>
                  </div>
                  {errors.numero_os && <p className="text-xs text-red-500 mt-1">{errors.numero_os}</p>}
                </div>

                <div>
                  <Label htmlFor="tipo_servico">Tipo de Serviço *</Label>
                  <Select value={formData.tipo_servico} onValueChange={(value) => setFormData({ ...formData, tipo_servico: value })}>
                    <SelectTrigger className={errors.tipo_servico ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Montagem de Tendas">Montagem de Tendas</SelectItem>
                      <SelectItem value="Montagem de Palco">Montagem de Palco</SelectItem>
                      <SelectItem value="Iluminação">Iluminação</SelectItem>
                      <SelectItem value="Som e Áudio">Som e Áudio</SelectItem>
                      <SelectItem value="Decoração">Decoração</SelectItem>
                      <SelectItem value="Evento Completo">Evento Completo</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo_servico && <p className="text-xs text-red-500 mt-1">{errors.tipo_servico}</p>}
                </div>

                <div>
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                    <SelectTrigger className={errors.cliente_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.cliente_id && <p className="text-xs text-red-500 mt-1">{errors.cliente_id}</p>}
                </div>

                <div>
                  <Label htmlFor="empresa_id">Empresa *</Label>
                  <Select value={formData.empresa_id} onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}>
                    <SelectTrigger className={errors.empresa_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map(empresa => (
                        <SelectItem key={empresa.id} value={empresa.id}>{empresa.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.empresa_id && <p className="text-xs text-red-500 mt-1">{errors.empresa_id}</p>}
                </div>

                <div>
                  <Label htmlFor="responsavel">Responsável *</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    placeholder="Nome do responsável"
                    className={errors.responsavel ? 'border-red-500' : ''}
                  />
                  {errors.responsavel && <p className="text-xs text-red-500 mt-1">{errors.responsavel}</p>}
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Evento */}
            <TabsContent value="evento" className="p-6 m-0 space-y-4">
              <h3 className="text-sm text-gray-900 border-b pb-2">Informações do Evento</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    className={errors.data_inicio ? 'border-red-500' : ''}
                  />
                  {errors.data_inicio && <p className="text-xs text-red-500 mt-1">{errors.data_inicio}</p>}
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
                  {errors.data_fim && <p className="text-xs text-red-500 mt-1">{errors.data_fim}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="local_evento">Local do Evento *</Label>
                  <Input
                    id="local_evento"
                    value={formData.local_evento}
                    onChange={(e) => setFormData({ ...formData, local_evento: e.target.value })}
                    placeholder="Endereço completo do evento"
                    className={errors.local_evento ? 'border-red-500' : ''}
                  />
                  {errors.local_evento && <p className="text-xs text-red-500 mt-1">{errors.local_evento}</p>}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    placeholder="Detalhes adicionais sobre o evento..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Materiais */}
            <TabsContent value="materiais" className="p-6 m-0 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm text-gray-900">Materiais (RN-006: Bloqueio Automático)</h3>
                <Badge className="bg-orange-100 text-orange-700">
                  <Lock className="w-3 h-3 mr-1" />
                  {materiaisSelecionados.length} bloqueados
                </Badge>
              </div>

              {/* Adicionar Material */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="text-sm text-gray-900 mb-3">Adicionar Material</h4>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <Label>Material</Label>
                    <Select value={materialAtual} onValueChange={setMaterialAtual}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiaisDisponiveis.map(material => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.codigo} - {material.nome} ({material.quantidade_disponivel} {material.unidade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantidadeAtual}
                      onChange={(e) => setQuantidadeAtual(e.target.value)}
                      placeholder="0"
                    />
                  </div>

                  <div className="col-span-3 flex items-end">
                    <Button
                      type="button"
                      onClick={handleAdicionarMaterial}
                      className="w-full bg-[#1F4788] hover:bg-blue-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Lista de Materiais */}
              {materiaisSelecionados.length > 0 ? (
                <div className="space-y-2">
                  <Label className="text-xs text-gray-600">Materiais Selecionados:</Label>
                  {materiaisSelecionados.map(ms => {
                    const material = getMaterialById(ms.material_id);
                    if (!material) return null;

                    return (
                      <div key={ms.material_id} className="flex items-center gap-3 p-3 bg-white rounded border border-gray-200">
                        <Lock className="w-4 h-4 text-orange-600" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{material.codigo} - {material.nome}</p>
                          <p className="text-xs text-gray-500">Disponível: {material.quantidade_disponivel} {material.unidade}</p>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <p className="text-sm text-gray-900">{ms.quantidade} {material.unidade}</p>
                          <p className="text-xs text-orange-600">Bloqueado</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverMaterial(ms.material_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Nenhum material adicionado</p>
                  <p className="text-xs text-gray-400 mt-1">Adicione materiais usando o formulário acima</p>
                </div>
              )}

              {errors.materiais && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-xs text-red-600">{errors.materiais}</p>
                </div>
              )}
            </TabsContent>

            {/* Tab 4: Financeiro */}
            <TabsContent value="financeiro" className="p-6 m-0 space-y-4">
              <h3 className="text-sm text-gray-900 border-b pb-2">Informações Financeiras</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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

                {formData.valor_total && (
                  <div className="col-span-2 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm text-gray-900 mb-2">Resumo Financeiro</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Valor Total da OS</p>
                        <p className="text-lg text-gray-900">R$ {parseFloat(formData.valor_total).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Materiais Bloqueados</p>
                        <p className="text-lg text-orange-600">{materiaisSelecionados.length} itens</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
            Criar Ordem de Serviço
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}