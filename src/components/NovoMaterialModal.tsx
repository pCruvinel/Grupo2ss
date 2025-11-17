import { useState } from 'react';
import { Plus, Package, AlertTriangle, FileText, DollarSign, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from './ui/sonner';

interface NovoMaterialModalProps {
  open: boolean;
  onClose: () => void;
  empresas: { id: string; nome: string }[];
  onSave: (material: any) => void;
}

export function NovoMaterialModal({ open, onClose, empresas, onSave }: NovoMaterialModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    unidade: 'UN',
    quantidade_total: '',
    quantidade_disponivel: '',
    quantidade_minima: '',
    valor_unitario: '',
    localizacao: '',
    fornecedor: '',
    empresa_id: '',
    observacoes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const gerarCodigo = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MAT-${timestamp}-${random}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.codigo.trim()) newErrors.codigo = 'Código é obrigatório';
    if (!formData.categoria) newErrors.categoria = 'Categoria é obrigatória';
    if (!formData.quantidade_total || parseFloat(formData.quantidade_total) < 0) {
      newErrors.quantidade_total = 'Quantidade total inválida';
    }
    if (!formData.quantidade_disponivel || parseFloat(formData.quantidade_disponivel) < 0) {
      newErrors.quantidade_disponivel = 'Quantidade disponível inválida';
    }
    if (!formData.quantidade_minima || parseFloat(formData.quantidade_minima) < 0) {
      newErrors.quantidade_minima = 'Quantidade mínima inválida';
    }
    if (!formData.valor_unitario || parseFloat(formData.valor_unitario) <= 0) {
      newErrors.valor_unitario = 'Valor unitário deve ser maior que zero';
    }
    if (!formData.empresa_id) newErrors.empresa_id = 'Selecione uma empresa';

    const qtdTotal = parseFloat(formData.quantidade_total) || 0;
    const qtdDisponivel = parseFloat(formData.quantidade_disponivel) || 0;
    if (qtdDisponivel > qtdTotal) {
      newErrors.quantidade_disponivel = 'Quantidade disponível não pode ser maior que a total';
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

    const qtdTotal = parseFloat(formData.quantidade_total);
    const qtdDisponivel = parseFloat(formData.quantidade_disponivel);
    const qtdMinima = parseFloat(formData.quantidade_minima);
    const qtdBloqueada = qtdTotal - qtdDisponivel;

    const novoMaterial = {
      id: `${Date.now()}`,
      nome: formData.nome,
      codigo: formData.codigo,
      categoria: formData.categoria,
      unidade: formData.unidade,
      quantidade_total: qtdTotal,
      quantidade_disponivel: qtdDisponivel,
      quantidade_bloqueada: qtdBloqueada,
      quantidade_minima: qtdMinima,
      valor_unitario: parseFloat(formData.valor_unitario),
      valor_total: qtdTotal * parseFloat(formData.valor_unitario),
      localizacao: formData.localizacao,
      fornecedor: formData.fornecedor,
      empresa_id: formData.empresa_id,
      observacoes: formData.observacoes,
      status: qtdDisponivel <= qtdMinima ? 'critico' : 'disponivel',
      data_cadastro: new Date().toISOString().split('T')[0],
      ultima_movimentacao: new Date().toISOString().split('T')[0],
    };

    onSave(novoMaterial);
    
    if (qtdDisponivel <= qtdMinima) {
      toast.warning('Material cadastrado com estoque crítico!', {
        description: `Quantidade disponível (${qtdDisponivel}) está abaixo do mínimo (${qtdMinima})`,
      });
    } else {
      toast.success('Material cadastrado com sucesso!');
    }
    
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      codigo: '',
      categoria: '',
      unidade: 'UN',
      quantidade_total: '',
      quantidade_disponivel: '',
      quantidade_minima: '',
      valor_unitario: '',
      localizacao: '',
      fornecedor: '',
      empresa_id: '',
      observacoes: '',
    });
    setErrors({});
    onClose();
  };

  const qtdTotal = parseFloat(formData.quantidade_total) || 0;
  const qtdDisponivel = parseFloat(formData.quantidade_disponivel) || 0;
  const qtdBloqueada = qtdTotal - qtdDisponivel;
  const qtdMinima = parseFloat(formData.quantidade_minima) || 0;
  const isEstoqueCritico = qtdDisponivel > 0 && qtdDisponivel <= qtdMinima;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1F4788]" />
            Novo Material
          </DialogTitle>
          <DialogDescription>
            Cadastre um novo material no estoque (RN-006: Bloqueio automático em OS)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="identificacao" className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="identificacao" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <FileText className="w-4 h-4 mr-2" />
                Identificação
              </TabsTrigger>
              <TabsTrigger 
                value="estoque" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <Package className="w-4 h-4 mr-2" />
                Estoque
              </TabsTrigger>
              <TabsTrigger 
                value="financeiro" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger 
                value="adicional" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1F4788] data-[state=active]:bg-transparent px-6"
              >
                <Settings className="w-4 h-4 mr-2" />
                Adicional
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Tab 1: Identificação */}
              <TabsContent value="identificacao" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Informações Básicas</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nome">Nome do Material *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Tenda Piramidal 10x10m Branca"
                      className={errors.nome ? 'border-red-500' : ''}
                    />
                    {errors.nome && <p className="text-xs text-red-500 mt-1">{errors.nome}</p>}
                  </div>

                  <div>
                    <Label htmlFor="codigo">Código *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                        placeholder="MAT-XXXXXX-XXX"
                        className={errors.codigo ? 'border-red-500' : ''}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData({ ...formData, codigo: gerarCodigo() })}
                      >
                        Gerar
                      </Button>
                    </div>
                    {errors.codigo && <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>}
                  </div>

                  <div>
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                      <SelectTrigger className={errors.categoria ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tendas">Tendas</SelectItem>
                        <SelectItem value="Palcos">Palcos</SelectItem>
                        <SelectItem value="Iluminação">Iluminação</SelectItem>
                        <SelectItem value="Som">Som e Áudio</SelectItem>
                        <SelectItem value="Mobiliário">Mobiliário</SelectItem>
                        <SelectItem value="Decoração">Decoração</SelectItem>
                        <SelectItem value="Equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="Estruturas">Estruturas Metálicas</SelectItem>
                        <SelectItem value="Geradores">Geradores</SelectItem>
                        <SelectItem value="Climatização">Climatização</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.categoria && <p className="text-xs text-red-500 mt-1">{errors.categoria}</p>}
                  </div>

                  <div>
                    <Label htmlFor="unidade">Unidade de Medida *</Label>
                    <Select value={formData.unidade} onValueChange={(value) => setFormData({ ...formData, unidade: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UN">Unidade (UN)</SelectItem>
                        <SelectItem value="KG">Quilograma (KG)</SelectItem>
                        <SelectItem value="M">Metro (M)</SelectItem>
                        <SelectItem value="M2">Metro Quadrado (M²)</SelectItem>
                        <SelectItem value="L">Litro (L)</SelectItem>
                        <SelectItem value="CX">Caixa (CX)</SelectItem>
                        <SelectItem value="PC">Peça (PC)</SelectItem>
                        <SelectItem value="KIT">Kit (KIT)</SelectItem>
                      </SelectContent>
                    </Select>
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
                </div>
              </TabsContent>

              {/* Tab 2: Estoque */}
              <TabsContent value="estoque" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Controle de Estoque</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="quantidade_total">Quantidade Total *</Label>
                    <Input id="quantidade_total" type="number" step="0.01" min="0" value={formData.quantidade_total}
                      onChange={(e) => setFormData({ ...formData, quantidade_total: e.target.value })}
                      placeholder="0" className={errors.quantidade_total ? 'border-red-500' : ''} />
                    {errors.quantidade_total && <p className="text-xs text-red-500 mt-1">{errors.quantidade_total}</p>}
                  </div>

                  <div>
                    <Label htmlFor="quantidade_disponivel">Quantidade Disponível *</Label>
                    <Input id="quantidade_disponivel" type="number" step="0.01" min="0" value={formData.quantidade_disponivel}
                      onChange={(e) => setFormData({ ...formData, quantidade_disponivel: e.target.value })}
                      placeholder="0" className={errors.quantidade_disponivel ? 'border-red-500' : ''} />
                    {errors.quantidade_disponivel && <p className="text-xs text-red-500 mt-1">{errors.quantidade_disponivel}</p>}
                  </div>

                  <div>
                    <Label htmlFor="quantidade_minima">Quantidade Mínima *</Label>
                    <Input id="quantidade_minima" type="number" step="0.01" min="0" value={formData.quantidade_minima}
                      onChange={(e) => setFormData({ ...formData, quantidade_minima: e.target.value })}
                      placeholder="0" className={errors.quantidade_minima ? 'border-red-500' : ''} />
                    {errors.quantidade_minima && <p className="text-xs text-red-500 mt-1">{errors.quantidade_minima}</p>}
                  </div>
                </div>

                {qtdTotal > 0 && (
                  <div className={`p-4 rounded-lg border-2 ${isEstoqueCritico ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg text-gray-900">{qtdTotal} {formData.unidade}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Disponível</p>
                        <p className={`text-lg ${isEstoqueCritico ? 'text-red-600' : 'text-green-600'}`}>
                          {qtdDisponivel} {formData.unidade}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Bloqueada (RN-006)</p>
                        <p className="text-lg text-orange-600">{qtdBloqueada.toFixed(2)} {formData.unidade}</p>
                      </div>
                    </div>
                    
                    {isEstoqueCritico && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-red-100 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <p className="text-xs text-red-700">Estoque Crítico! Quantidade disponível está abaixo do mínimo.</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Tab 3: Financeiro */}
              <TabsContent value="financeiro" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Informações Financeiras</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valor_unitario">Valor Unitário (R$) *</Label>
                    <Input id="valor_unitario" type="number" step="0.01" min="0" value={formData.valor_unitario}
                      onChange={(e) => setFormData({ ...formData, valor_unitario: e.target.value })}
                      placeholder="0.00" className={errors.valor_unitario ? 'border-red-500' : ''} />
                    {errors.valor_unitario && <p className="text-xs text-red-500 mt-1">{errors.valor_unitario}</p>}
                  </div>

                  <div>
                    <Label>Valor Total Estimado</Label>
                    <div className="p-2 bg-gray-100 rounded border border-gray-300 text-right h-10 flex items-center justify-end">
                      <span className="text-lg text-gray-900">
                        R$ {(qtdTotal * (parseFloat(formData.valor_unitario) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm text-gray-900 mb-2">Resumo de Valores</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600">Valor Unitário</p>
                      <p className="text-sm text-gray-900">R$ {(parseFloat(formData.valor_unitario) || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Valor Total em Estoque</p>
                      <p className="text-sm text-gray-900">
                        R$ {(qtdTotal * (parseFloat(formData.valor_unitario) || 0)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Valor Disponível</p>
                      <p className="text-sm text-green-600">
                        R$ {(qtdDisponivel * (parseFloat(formData.valor_unitario) || 0)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Valor Bloqueado</p>
                      <p className="text-sm text-orange-600">
                        R$ {(qtdBloqueada * (parseFloat(formData.valor_unitario) || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 4: Adicional */}
              <TabsContent value="adicional" className="p-6 m-0 space-y-4">
                <h3 className="text-sm text-gray-900 border-b pb-2">Informações Adicionais</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="localizacao">Localização/Armazém</Label>
                    <Input id="localizacao" value={formData.localizacao}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                      placeholder="Ex: Galpão A - Prateleira 3" />
                  </div>

                  <div>
                    <Label htmlFor="fornecedor">Fornecedor</Label>
                    <Input id="fornecedor" value={formData.fornecedor}
                      onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                      placeholder="Nome do fornecedor" />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <textarea id="observacoes" value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      placeholder="Informações adicionais sobre o material..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={4} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Ações - Fixo no rodapé */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button type="submit" className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}