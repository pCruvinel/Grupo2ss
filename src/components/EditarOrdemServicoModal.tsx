import { useState, useEffect } from 'react';
import { FileText, Lock, CheckCircle2 } from 'lucide-react';
import { TwoColumnModal } from './TwoColumnModal';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

interface Material {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  estoque_atual: number;
  unidade: string;
  status: 'disponivel' | 'bloqueado' | 'baixo';
}

interface MaterialVinculado {
  material_id: string;
  material_nome: string;
  quantidade: number;
  unidade: string;
  estoque_atual: number;
}

interface OrdemServico {
  id: string;
  numero: string;
  cliente_id: string;
  cliente_nome: string;
  tipo: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';
  responsavel: string;
  valor: number;
  materiais_vinculados: MaterialVinculado[];
  empresa_id: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface EditarOrdemServicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordem: OrdemServico;
  clientes: { id: string; nome: string }[];
  materiais: Material[];
  empresas: { id: string; nome: string }[];
  onSave: (data: Partial<OrdemServico>) => void;
}

export function EditarOrdemServicoModal({
  open,
  onOpenChange,
  ordem,
  clientes,
  materiais,
  empresas,
  onSave,
}: EditarOrdemServicoModalProps) {
  const [formData, setFormData] = useState<Partial<OrdemServico>>(ordem);
  const [materiaisVinculados, setMateriaisVinculados] = useState<MaterialVinculado[]>(ordem.materiais_vinculados || []);
  const [materialSelecionado, setMaterialSelecionado] = useState('');
  const [quantidadeMaterial, setQuantidadeMaterial] = useState(1);

  useEffect(() => {
    setFormData(ordem);
    setMateriaisVinculados(ordem.materiais_vinculados || []);
  }, [ordem]);

  const handleAdicionarMaterial = () => {
    if (!materialSelecionado) {
      toast.error('Selecione um material');
      return;
    }

    const material = materiais.find((m) => m.id === materialSelecionado);
    if (!material) return;

    // Verificar se material já está vinculado
    if (materiaisVinculados.some((m) => m.material_id === materialSelecionado)) {
      toast.error('Material já adicionado');
      return;
    }

    // Verificar estoque (RN-006)
    if (material.estoque_atual < quantidadeMaterial) {
      toast.error('Quantidade solicitada maior que o estoque disponível');
      return;
    }

    const novoMaterial: MaterialVinculado = {
      material_id: material.id,
      material_nome: material.nome,
      quantidade: quantidadeMaterial,
      unidade: material.unidade,
      estoque_atual: material.estoque_atual,
    };

    setMateriaisVinculados([...materiaisVinculados, novoMaterial]);
    setMaterialSelecionado('');
    setQuantidadeMaterial(1);
    toast.success('Material adicionado');
  };

  const handleRemoverMaterial = (materialId: string) => {
    setMateriaisVinculados(materiaisVinculados.filter((m) => m.material_id !== materialId));
    toast.success('Material removido');
  };

  const materiaisDisponiveis = materiais.filter(
    (m) => m.status === 'disponivel' && !materiaisVinculados.some((mv) => mv.material_id === m.id)
  );

  const handleSave = () => {
    // Validações
    if (!formData.cliente_id || !formData.tipo || !formData.data_inicio || !formData.data_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (new Date(formData.data_fim) < new Date(formData.data_inicio)) {
      toast.error('Data de fim não pode ser anterior à data de início');
      return;
    }

    const dataToSave = {
      ...formData,
      materiais_vinculados: materiaisVinculados,
    };

    onSave(dataToSave);
    toast.success('Ordem de Serviço atualizada com sucesso!');
    onOpenChange(false);
  };

  const podeEditarMateriais = formData.status !== 'concluida' && formData.status !== 'cancelada';

  // Mock de histórico para demonstração
  const historico = [
    {
      data: ordem.created_at || new Date().toISOString(),
      usuario: ordem.created_by || 'Sistema',
      acao: 'OS criada',
      detalhes: `Ordem de serviço #${ordem.numero} criada`,
    },
    ...(ordem.updated_at && ordem.updated_at !== ordem.created_at
      ? [
          {
            data: ordem.updated_at,
            usuario: ordem.updated_by || 'Sistema',
            acao: 'OS atualizada',
            detalhes: 'Informações da ordem de serviço foram atualizadas',
          },
        ]
      : []),
  ];

  const leftColumnContent = (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-sm text-gray-900 border-b pb-2">Informações Básicas</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Número da OS</Label>
            <Input value={formData.numero} disabled className="bg-gray-50" />
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
          <div>
            <Label>Cliente *</Label>
            <Select
              value={formData.cliente_id}
              onValueChange={(value) => {
                const cliente = clientes.find((c) => c.id === value);
                setFormData({
                  ...formData,
                  cliente_id: value,
                  cliente_nome: cliente?.nome || '',
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((cli) => (
                  <SelectItem key={cli.id} value={cli.id}>
                    {cli.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tipo de Serviço *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Instalação">Instalação</SelectItem>
                <SelectItem value="Manutenção">Manutenção</SelectItem>
                <SelectItem value="Locação">Locação</SelectItem>
                <SelectItem value="Evento">Evento</SelectItem>
                <SelectItem value="Produção">Produção</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Responsável</Label>
            <Input
              value={formData.responsavel || ''}
              onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
              placeholder="Nome do responsável"
            />
          </div>
          <div>
            <Label>Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aberta">Aberta</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Data Início *</Label>
            <Input
              value={formData.data_inicio || ''}
              onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
              type="date"
            />
          </div>
          <div>
            <Label>Data Fim *</Label>
            <Input
              value={formData.data_fim || ''}
              onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
              type="date"
            />
          </div>
          <div className="col-span-2">
            <Label>Valor (R$)</Label>
            <Input
              value={formData.valor || ''}
              onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) || 0 })}
              type="number"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          <div className="col-span-2">
            <Label>Descrição</Label>
            <Textarea
              value={formData.descricao || ''}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descreva os detalhes do serviço..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Materiais Vinculados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-sm text-gray-900">Materiais Vinculados (RN-006)</h3>
          <Badge className="bg-blue-100 text-blue-700">
            {materiaisVinculados.length} material(is)
          </Badge>
        </div>

        {!podeEditarMateriais && (
          <Alert>
            <Lock className="w-4 h-4" />
            <AlertDescription>
              Não é possível editar materiais de uma OS concluída ou cancelada
            </AlertDescription>
          </Alert>
        )}

        {podeEditarMateriais && materiaisDisponiveis.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <Label className="mb-3 block">Adicionar Material</Label>
            <div className="flex gap-2">
              <Select value={materialSelecionado} onValueChange={setMaterialSelecionado}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um material" />
                </SelectTrigger>
                <SelectContent>
                  {materiaisDisponiveis.map((mat) => (
                    <SelectItem key={mat.id} value={mat.id}>
                      {mat.codigo} - {mat.nome} (Estoque: {mat.estoque_atual} {mat.unidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={quantidadeMaterial}
                onChange={(e) => setQuantidadeMaterial(parseFloat(e.target.value) || 0)}
                type="number"
                step="0.01"
                min="0"
                placeholder="Qtd"
                className="w-24"
              />
              <Button onClick={handleAdicionarMaterial} size="sm" className="bg-[#28A745] hover:bg-green-700">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        )}

        {materiaisVinculados.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">Nenhum material vinculado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {materiaisVinculados.map((mat) => (
              <div key={mat.material_id} className="p-3 bg-white border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-900">{mat.material_nome}</p>
                      <p className="text-xs text-gray-500">
                        Quantidade: {mat.quantidade} {mat.unidade} | Estoque: {mat.estoque_atual} {mat.unidade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {mat.quantidade} {mat.unidade}
                    </Badge>
                    {podeEditarMateriais && (
                      <Button
                        onClick={() => handleRemoverMaterial(mat.material_id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <Package className="w-4 h-4" />
          <AlertDescription>
            <strong>RN-006: Bloqueio Automático de Estoque</strong>
            <br />
            Materiais vinculados serão bloqueados automaticamente no estoque até a finalização da OS
          </AlertDescription>
        </Alert>
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
      title={`Editar Ordem de Serviço - OS #${ordem.numero}`}
      leftColumn={leftColumnContent}
      auditInfo={{
        created_at: ordem.created_at,
        updated_at: ordem.updated_at,
        created_by: ordem.created_by,
        updated_by: ordem.updated_by,
      }}
      historico={historico}
    />
  );
}