import { History, TrendingUp, TrendingDown, Package, Lock, Unlock, Edit } from 'lucide-react';
import { TwoColumnModal } from './TwoColumnModal';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida' | 'bloqueio' | 'desbloqueio' | 'ajuste';
  quantidade: number;
  estoque_anterior: number;
  estoque_novo: number;
  data: string;
  usuario: string;
  motivo?: string;
  ordem_servico_id?: string;
  ordem_servico_numero?: string;
}

interface Material {
  id: string;
  codigo: string;
  nome: string;
  categoria: string;
  estoque_atual: number;
  unidade: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface HistoricoMaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material: Material;
  movimentacoes: Movimentacao[];
}

export function HistoricoMaterialModal({
  open,
  onOpenChange,
  material,
  movimentacoes,
}: HistoricoMaterialModalProps) {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'saida':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'bloqueio':
        return <Lock className="w-4 h-4 text-red-600" />;
      case 'desbloqueio':
        return <Unlock className="w-4 h-4 text-green-600" />;
      case 'ajuste':
        return <Edit className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada';
      case 'saida':
        return 'Saída';
      case 'bloqueio':
        return 'Bloqueio (RN-006)';
      case 'desbloqueio':
        return 'Desbloqueio';
      case 'ajuste':
        return 'Ajuste Manual';
      default:
        return tipo;
    }
  };

  const getTipoBadgeVariant = (tipo: string): any => {
    switch (tipo) {
      case 'entrada':
        return 'success';
      case 'saida':
        return 'destructive';
      case 'bloqueio':
        return 'destructive';
      case 'desbloqueio':
        return 'success';
      case 'ajuste':
        return 'default';
      default:
        return 'outline';
    }
  };

  // Ordenar movimentações por data (mais recente primeiro)
  const movimentacoesOrdenadas = [...movimentacoes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === 'entrada')
    .reduce((acc, m) => acc + m.quantidade, 0);

  const totalSaidas = movimentacoes
    .filter((m) => m.tipo === 'saida')
    .reduce((acc, m) => acc + m.quantidade, 0);

  // Converter movimentações para formato de histórico
  const historico = movimentacoesOrdenadas.map((mov) => ({
    data: mov.data,
    usuario: mov.usuario,
    acao: getTipoLabel(mov.tipo),
    detalhes: `${mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : ''}${mov.quantidade} ${material.unidade}${mov.motivo ? ` - ${mov.motivo}` : ''}${mov.ordem_servico_numero ? ` (OS #${mov.ordem_servico_numero})` : ''}`,
  }));

  const leftColumnContent = (
    <div className="space-y-6">
      {/* Resumo Estatístico */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Estoque Atual</p>
          <p className="text-xl text-gray-900">
            {material.estoque_atual} <span className="text-sm text-gray-500">{material.unidade}</span>
          </p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Entradas</p>
          <p className="text-xl text-green-600">
            +{totalEntradas} <span className="text-sm text-green-500">{material.unidade}</span>
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Total Saídas</p>
          <p className="text-xl text-red-600">
            -{totalSaidas} <span className="text-sm text-red-500">{material.unidade}</span>
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Movimentações</p>
          <p className="text-xl text-blue-600">{movimentacoes.length}</p>
        </div>
      </div>

      {/* Timeline de Movimentações */}
      <div className="space-y-2">
        <h3 className="text-sm text-gray-900 border-b pb-2">Timeline de Movimentações</h3>
        
        {movimentacoesOrdenadas.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <History className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm">Nenhuma movimentação registrada</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {movimentacoesOrdenadas.map((mov, index) => (
                <div
                  key={mov.id}
                  className="relative pl-8 pb-3 border-l-2 border-gray-200 last:border-l-0"
                >
                  {/* Ícone na timeline */}
                  <div className="absolute left-0 -translate-x-1/2 top-1 bg-white p-1 rounded-full border-2 border-gray-200">
                    {getTipoIcon(mov.tipo)}
                  </div>

                  {/* Card da movimentação */}
                  <div className="ml-2 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getTipoBadgeVariant(mov.tipo)}>
                          {getTipoLabel(mov.tipo)}
                        </Badge>
                        {mov.ordem_servico_numero && (
                          <Badge variant="outline" className="text-xs">
                            OS #{mov.ordem_servico_numero}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(mov.data).toLocaleString('pt-BR')}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Quantidade:</span>
                        <p className={`font-medium ${
                          mov.tipo === 'entrada' ? 'text-green-600' : 
                          mov.tipo === 'saida' ? 'text-red-600' : 
                          'text-gray-900'
                        }`}>
                          {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : ''}
                          {mov.quantidade} {material.unidade}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Estoque Anterior:</span>
                        <p className="font-medium text-gray-900">
                          {mov.estoque_anterior} {material.unidade}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Estoque Novo:</span>
                        <p className="font-medium text-gray-900">
                          {mov.estoque_novo} {material.unidade}
                        </p>
                      </div>
                    </div>

                    {mov.motivo && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700">
                        <strong>Motivo:</strong> {mov.motivo}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Responsável:</strong> {mov.usuario}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );

  return (
    <TwoColumnModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Histórico de Movimentações - ${material.codigo}`}
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
