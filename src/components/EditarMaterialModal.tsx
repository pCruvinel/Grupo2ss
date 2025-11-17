import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { TwoColumnModal } from './TwoColumnModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from './ui/sonner';

interface Material {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  unidade: string;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo: number;
  valor_unitario: number;
  localizacao: string;
  status: 'disponivel' | 'bloqueado' | 'baixo';
  bloqueado_por_os?: string;
  empresa_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface EditarMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  empresas: { id: string; nome: string }[];
  onSave: (data: Partial<Material>) => void;
}

export function EditarMaterialModal({
  open,
  onOpenChange,
  material,
  empresas,
  onSave,
}: EditarMaterialModalProps) {
  const [formData, setFormData] = useState<Partial<Material>>(material);

  useEffect(() => {
    setFormData(material);
  }, [material]);

  const estoqueAtual = formData.estoque_atual || 0;
  const estoqueMinimo = formData.estoque_minimo || 0;
  const estoqueMaximo = formData.estoque_maximo || 0;
  const isCritico = estoqueAtual <= estoqueMinimo;
  const isBloqueado = formData.status === 'bloqueado';

  const handleSave = () => {
    // Validações
    if (!formData.nome || !formData.codigo || !formData.categoria) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (estoqueMinimo > estoqueMaximo) {
      toast.error('Estoque mínimo não pode ser maior que o máximo');
      return;
    }

    if (estoqueAtual > estoqueMaximo) {
      toast.warning('Estoque atual está acima do máximo definido');
    }

    // Atualizar status automaticamente baseado no estoque
    let novoStatus = formData.status;
    if (!isBloqueado) {
      if (estoqueAtual <= estoqueMinimo) {
        novoStatus = 'baixo';
      } else {
        novoStatus = 'disponivel';
      }
    }

    const dataToSave = {
      ...formData,
      status: novoStatus,
    };

    onSave(dataToSave);
    toast.success('Material atualizado com sucesso!');
    onOpenChange(false);
  };

  // Mock de histórico para demonstração
  const historico = [
    {
      data: material.updated_at || material.created_at || new Date().toISOString(),
      usuario: material.updated_by || material.created_by || 'Sistema',
      acao: 'Registro criado',
      detalhes: 'Material cadastrado no estoque',
    },
  ];

  const leftColumnContent = (
    <div className="space-y-6">
      {/* Alerta de Material Bloqueado */}
      {isBloqueado && (
        <Alert variant="destructive">
          <Lock className="w-4 h-4" />
          <AlertDescription>
            <strong>Material Bloqueado (RN-006)</strong>
            <br />
            {material.bloqueado_por_os ? (
              <>Este material está bloqueado pela OS #{material.bloqueado_por_os}</>
            ) : (
              <>Este material está bloqueado e não pode ser utilizado</>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerta de Estoque Crítico */}
      {isCritico && !isBloqueado && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            <strong>Estoque Crítico!</strong>
            <br />
            O estoque atual está abaixo do mínimo. Considere fazer uma reposição.
          </AlertDescription>
        </Alert>
      )}

      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-sm text-gray-900 border-b pb-2">Informações Básicas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Código *</Label>
            <Input
              value={formData.codigo || ''}
              onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              placeholder="Ex: MAT-001"
            />
          </div>
          <div>
            <Label>Empresa *</Label>
            <Select
              value={formData.empresa_id}
              onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Nome do Material *</Label>
            <Input
              value={formData.nome || ''}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Cabo HDMI 2.0"
            />
          </div>
          <div>
            <Label>Categoria *</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData({ ...formData, categoria: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Equipamento">Equipamento</SelectItem>
                <SelectItem value="Ferramenta">Ferramenta</SelectItem>
                <SelectItem value="Cabo">Cabo</SelectItem>
                <SelectItem value="Acessorio">Acessório</SelectItem>
                <SelectItem value="Material Eletrico">Material Elétrico</SelectItem>
                <SelectItem value="Material Consumivel">Material Consumível</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Unidade de Medida *</Label>
            <Select
              value={formData.unidade}
              onValueChange={(value) => setFormData({ ...formData, unidade: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UN">Unidade (UN)</SelectItem>
                <SelectItem value="CX">Caixa (CX)</SelectItem>
                <SelectItem value="KG">Quilograma (KG)</SelectItem>
                <SelectItem value="M">Metro (M)</SelectItem>
                <SelectItem value="L">Litro (L)</SelectItem>
                <SelectItem value="PC">Peça (PC)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Localização</Label>
            <Input
              value={formData.localizacao || ''}
              onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
              placeholder="Ex: Prateleira A3, Almoxarifado"
            />
          </div>
        </div>
      </div>

      {/* Controle de Estoque */}
      <div className="space-y-4">
        <h3 className="text-sm text-gray-900 border-b pb-2">Controle de Estoque</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Estoque Atual *</Label>
            <Input
              value={formData.estoque_atual || ''}
              onChange={(e) => setFormData({ ...formData, estoque_atual: parseFloat(e.target.value) || 0 })}
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Label>Estoque Mínimo *</Label>
            <Input
              value={formData.estoque_minimo || ''}
              onChange={(e) => setFormData({ ...formData, estoque_minimo: parseFloat(e.target.value) || 0 })}
              type="number"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <Label>Estoque Máximo *</Label>
            <Input
              value={formData.estoque_maximo || ''}
              onChange={(e) => setFormData({ ...formData, estoque_maximo: parseFloat(e.target.value) || 0 })}
              type="number"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Indicador Visual de Estoque */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Nível de Estoque</span>
            <Badge variant={isCritico ? 'destructive' : 'default'}>
              {estoqueAtual} / {estoqueMaximo} {formData.unidade}
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isCritico ? 'bg-red-500' : estoqueAtual > estoqueMaximo ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min((estoqueAtual / estoqueMaximo) * 100, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Mínimo: {estoqueMinimo}</span>
            <span className="text-xs text-gray-500">Máximo: {estoqueMaximo}</span>
          </div>
        </div>
      </div>

      {/* Valor */}
      <div className="space-y-4">
        <h3 className="text-sm text-gray-900 border-b pb-2">Valor</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Valor Unitário (R$) *</Label>
            <Input
              value={formData.valor_unitario || ''}
              onChange={(e) => setFormData({ ...formData, valor_unitario: parseFloat(e.target.value) || 0 })}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div className="flex items-end">
            <div className="p-3 bg-blue-50 rounded-lg flex-1">
              <p className="text-xs text-gray-600 mb-1">Valor Total em Estoque</p>
              <p className="text-lg text-gray-900">
                R$ {((formData.valor_unitario || 0) * (formData.estoque_atual || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <Label className="mb-2 block">Status Atual</Label>
        <div className="flex items-center gap-3">
          {isBloqueado ? (
            <>
              <Lock className="w-5 h-5 text-red-600" />
              <Badge variant="destructive">Bloqueado (RN-006)</Badge>
            </>
          ) : isCritico ? (
            <>
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <Badge variant="warning">Estoque Baixo</Badge>
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5 text-green-600" />
              <Badge variant="success">Disponível</Badge>
            </>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isBloqueado
            ? 'Material bloqueado automaticamente (RN-006)'
            : 'Status atualizado automaticamente baseado no estoque'}
        </p>
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
          Salvar Alterações
        </Button>
      </div>
    </div>
  );

  return (
    <TwoColumnModal
      open={open}
      onOpenChange={onOpenChange}
      title="Editar Material"
      leftColumn={leftColumnContent}
      auditInfo={{
        created_at: material.created_at,
        updated_at: material.updated_at,
        created_by: material.created_by,
        updated_by: material.updated_by,
      }}
      historico={historico}
    />
  );
}
