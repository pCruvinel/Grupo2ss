import { Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from './ui/sonner';
import { useState } from 'react';

interface Material {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  estoque_atual: number;
  unidade: string;
  status: 'disponivel' | 'bloqueado' | 'baixo';
  bloqueado_por_os?: string;
}

interface BloquearMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  acao: 'bloquear' | 'desbloquear';
  onConfirm: (motivo: string) => void;
}

export function BloquearMaterialModal({
  open,
  onOpenChange,
  material,
  acao,
  onConfirm,
}: BloquearMaterialModalProps) {
  const [motivo, setMotivo] = useState('');

  const handleConfirmar = () => {
    if (acao === 'bloquear' && !motivo.trim()) {
      toast.error('Informe o motivo do bloqueio');
      return;
    }

    onConfirm(motivo);
    
    if (acao === 'bloquear') {
      toast.success('Material bloqueado com sucesso!', {
        description: 'O material não poderá ser utilizado até ser desbloqueado',
      });
    } else {
      toast.success('Material desbloqueado com sucesso!', {
        description: 'O material está novamente disponível para uso',
      });
    }

    onOpenChange(false);
    setMotivo('');
  };

  const isBloquear = acao === 'bloquear';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBloquear ? (
              <>
                <Lock className="w-5 h-5 text-red-600" />
                Bloquear Material
              </>
            ) : (
              <>
                <Unlock className="w-5 h-5 text-green-600" />
                Desbloquear Material
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isBloquear
              ? 'Bloqueie o material para impedir seu uso (RN-006)'
              : 'Desbloqueie o material para permitir seu uso novamente'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Material */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Código:</span>
              <span className="text-sm text-gray-900 font-mono">{material.codigo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Nome:</span>
              <span className="text-sm text-gray-900">{material.nome}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Categoria:</span>
              <Badge variant="outline">{material.categoria}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Estoque Atual:</span>
              <span className="text-sm text-gray-900">
                {material.estoque_atual} {material.unidade}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status Atual:</span>
              <Badge variant={material.status === 'bloqueado' ? 'destructive' : 'default'}>
                {material.status === 'bloqueado' ? 'Bloqueado' : 'Disponível'}
              </Badge>
            </div>
            {material.bloqueado_por_os && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bloqueado por:</span>
                <Badge variant="outline">OS #{material.bloqueado_por_os}</Badge>
              </div>
            )}
          </div>

          {/* Campo de Motivo/Observações */}
          <div className="space-y-2">
            <Label>
              {isBloquear ? 'Motivo do Bloqueio *' : 'Observações (Opcional)'}
            </Label>
            <Textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder={
                isBloquear
                  ? 'Ex: Material danificado, em manutenção, reservado para evento específico...'
                  : 'Adicione observações sobre o desbloqueio...'
              }
              rows={4}
            />
          </div>

          {/* Alertas */}
          {isBloquear ? (
            <Alert variant="destructive">
              <Lock className="w-4 h-4" />
              <AlertDescription>
                <strong>RN-006: Bloqueio de Material</strong>
                <br />
                Ao bloquear, o material ficará indisponível para uso em novas Ordens de Serviço até ser desbloqueado manualmente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <Unlock className="w-4 h-4" />
              <AlertDescription>
                <strong>RN-006: Desbloqueio de Material</strong>
                <br />
                Ao desbloquear, o material voltará ao status "Disponível" e poderá ser utilizado em novas Ordens de Serviço.
              </AlertDescription>
            </Alert>
          )}

          {/* Aviso para materiais bloqueados por OS */}
          {!isBloquear && material.bloqueado_por_os && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                <strong>Atenção!</strong>
                <br />
                Este material foi bloqueado automaticamente pela OS #{material.bloqueado_por_os}. Desbloquear manualmente pode causar inconsistências.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            className={isBloquear ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            {isBloquear ? (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Bloquear Material
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Desbloquear Material
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
