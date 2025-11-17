import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Clock,
  User,
  Edit,
  Trash,
  Plus,
  FileText,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/formatters';

export interface TimelineEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  timestamp: Date | string;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

interface TimelineProps {
  events: TimelineEvent[];
  showUserInfo?: boolean;
  showChanges?: boolean;
  maxHeight?: string;
}

export function Timeline({
  events,
  showUserInfo = true,
  showChanges = false,
  maxHeight,
}: TimelineProps) {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4" />;
      case 'update':
        return <Edit className="w-4 h-4" />;
      case 'delete':
        return <Trash className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <XCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'create':
        return 'text-green-600 bg-green-100';
      case 'update':
        return 'text-blue-600 bg-blue-100';
      case 'delete':
        return 'text-red-600 bg-red-100';
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeLabel = (type: TimelineEvent['type']) => {
    const labels = {
      create: 'Criado',
      update: 'Atualizado',
      delete: 'Excluído',
      success: 'Sucesso',
      error: 'Erro',
      warning: 'Aviso',
      info: 'Info',
    };
    return labels[type] || type;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className="relative"
      style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
    >
      {events.map((event, index) => (
        <div key={event.id} className="relative pb-8 last:pb-0">
          {/* Linha vertical */}
          {index !== events.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200" />
          )}

          <div className="flex gap-4">
            {/* Ícone */}
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(event.type)}`}>
                {getIcon(event.type)}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {getTypeLabel(event.type)}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600">{event.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(event.timestamp)}
                </span>
              </div>

              {/* Usuário */}
              {showUserInfo && event.user && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                      {getInitials(event.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">{event.user.name}</span>
                </div>
              )}

              {/* Mudanças */}
              {showChanges && event.changes && event.changes.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">Alterações:</p>
                  <div className="space-y-1">
                    {event.changes.map((change, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="text-gray-600">{change.field}:</span>{' '}
                        <span className="text-red-600 line-through">{String(change.oldValue)}</span>
                        {' → '}
                        <span className="text-green-600">{String(change.newValue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">Nenhum histórico disponível</p>
        </div>
      )}
    </div>
  );
}

// Timeline Compacta (para uso em cards menores)
export function CompactTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-2">
      {events.slice(0, 5).map((event) => (
        <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900">{event.title}</p>
            <p className="text-xs text-gray-500">{formatRelativeTime(event.timestamp)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Timeline Card - Timeline dentro de um card
export function TimelineCard({
  title,
  events,
  showUserInfo = true,
  showChanges = false,
}: {
  title?: string;
  events: TimelineEvent[];
  showUserInfo?: boolean;
  showChanges?: boolean;
}) {
  return (
    <Card className="p-6">
      {title && <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>}
      <Timeline
        events={events}
        showUserInfo={showUserInfo}
        showChanges={showChanges}
        maxHeight="400px"
      />
    </Card>
  );
}

// Exemplo de uso
export function TimelineExample() {
  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'create',
      title: 'Veículo cadastrado',
      description: 'Novo veículo ABC-1234 foi adicionado à frota',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      user: { name: 'João Silva' },
      metadata: { placa: 'ABC-1234', tipo: 'Carro' },
    },
    {
      id: '2',
      type: 'update',
      title: 'Status atualizado',
      description: 'Status do veículo alterado para manutenção',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
      user: { name: 'Maria Santos' },
      changes: [
        { field: 'Status', oldValue: 'Ativo', newValue: 'Manutenção' },
        { field: 'KM', oldValue: '50000', newValue: '51500' },
      ],
    },
    {
      id: '3',
      type: 'success',
      title: 'Inspeção aprovada',
      description: 'Veículo passou pela inspeção técnica',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 dia atrás
      user: { name: 'Pedro Costa' },
    },
  ];

  return <TimelineCard title="Histórico do Veículo" events={events} showChanges />;
}
