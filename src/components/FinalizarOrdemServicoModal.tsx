import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { useState } from 'react';
import { CheckCircle2, Unlock, Package } from 'lucide-react';

interface MaterialVinculado {
  material_id: string;
  material_nome: string;
  quantidade: number;
  unidade: string;
}

interface OrdemServico {
  id: string;
  numero: string;
  cliente_nome: string;
  tipo: string;
  materiais_vinculados: MaterialVinculado[];
  status: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface FinalizarOrdemServicoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ordem: OrdemServico;
  onConfirm: (observacoes: string) => void;
}

export function FinalizarOrdemServicoModal({
  open,
  onOpenChange,
  ordem,
  onConfirm,
}: FinalizarOrdemServicoModalProps) {
  const [observacoes, setObservacoes] = useState('');

  const handleFinalizar = () => {
    onConfirm(observacoes);
    toast.success('Ordem de Serviço finalizada!', {
      description: 'Materiais liberados do estoque',
    });
    onOpenChange(false);
    setObservacoes('');
  };

  const totalMateriais = ordem.materiais_vinculados?.length || 0;

  // Mock de histórico para demonstração
  const historico = [
    {
      data: ordem.created_at || new Date().toISOString(),
      usuario: ordem.created_by || 'Sistema',
      acao: 'OS criada',
      detalhes: `Ordem de serviço #${ordem.numero} criada`,
    },
    {
      data: new Date().toISOString(),
      usuario: 'Sistema',
      acao: 'Preparando finalização',
      detalhes: 'Processando liberação de materiais',
    },
  ];

  const leftColumnContent = (
    <div className="space-y-6">
      {/* Resumo da OS */}
      <div className="p-4 bg-blue-50 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cliente:</span>
          <span className="text-sm text-gray-900 font-medium">{ordem.cliente_nome}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tipo:</span>
          <Badge variant="outline">{ordem.tipo}</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status Atual:</span>
          <Badge>{ordem.status}</Badge>
        </div>
      </div>

      {/* Materiais que serão liberados */}
      {totalMateriais > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Materiais que serão Liberados (RN-006)</Label>
            <Badge className="bg-green-100 text-green-700">
              {totalMateriais} material(is)
            </Badge>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {ordem.materiais_vinculados.map((mat) => (
              <div
                key={mat.material_id}
                className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-900">{mat.material_nome}</p>
                    <p className="text-xs text-gray-600">
                      {mat.quantidade} {mat.unidade} será liberado(a)
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  <Unlock className="w-3 h-3 mr-1" />
                  Liberar
                </Badge>
              </div>
            ))}
          </div>

          <Alert>
            <Package className="w-4 h-4" />
            <AlertDescription>
              <strong>RN-006: Liberação Automática de Estoque</strong>
              <br />
              Ao finalizar a OS, todos os materiais bloqueados serão automaticamente liberados e voltarão ao estoque disponível.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {totalMateriais === 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>
            Esta OS não possui materiais vinculados.
          </AlertDescription>
        </Alert>
      )}

      {/* Observações de Finalização */}
      <div className="space-y-2">
        <Label>Observações de Finalização (Opcional)</Label>
        <Textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Adicione observações sobre a finalização da OS, problemas encontrados, materiais danificados, etc..."
          rows={4}
        />
      </div>

      {/* Aviso Importante */}
      <Alert variant="destructive">
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>Atenção!</strong>
          <br />
          Esta ação não pode ser desfeita. A OS será marcada como concluída e os materiais serão liberados.
        </AlertDescription>
      </Alert>

      {/* Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleFinalizar} className="bg-green-600 hover:bg-green-700">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Confirmar Finalização
        </Button>
      </div>
    </div>
  );

  return (
    <TwoColumnModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Finalizar Ordem de Serviço - OS #${ordem.numero}`}
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