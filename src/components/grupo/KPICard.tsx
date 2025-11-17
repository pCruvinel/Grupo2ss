import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  variacao?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  loading?: boolean;
}

export function KPICard({
  titulo,
  valor,
  subtitulo,
  variacao,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
  loading = false,
}: KPICardProps) {
  const getVariacaoIcon = () => {
    if (variacao === undefined || variacao === 0) return <Minus className="w-4 h-4" />;
    return variacao > 0 
      ? <TrendingUp className="w-4 h-4" /> 
      : <TrendingDown className="w-4 h-4" />;
  };

  const getVariacaoColor = () => {
    if (variacao === undefined || variacao === 0) return 'text-gray-500';
    return variacao > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getVariacaoBg = () => {
    if (variacao === undefined || variacao === 0) return 'bg-gray-50';
    return variacao > 0 ? 'bg-green-50' : 'bg-red-50';
  };

  if (loading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <div className="w-6 h-6 bg-gray-300 rounded" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-300 rounded w-32" />
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${iconBgColor}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {variacao !== undefined && (
          <Badge 
            variant="outline" 
            className={`${getVariacaoBg()} ${getVariacaoColor()} border-0 text-xs gap-1`}
          >
            {getVariacaoIcon()}
            {Math.abs(variacao).toFixed(1)}%
          </Badge>
        )}
      </div>
      
      <p className="text-sm text-gray-600 mb-1">{titulo}</p>
      <p className="text-2xl text-gray-900 mb-1">{valor}</p>
      
      {subtitulo && (
        <p className="text-xs text-gray-500">{subtitulo}</p>
      )}
    </Card>
  );
}
