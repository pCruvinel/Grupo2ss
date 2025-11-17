import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

// ═══════════════════════════════════════════════════════════════
// STAT CARD - Card de estatística com tendência
// ═══════════════════════════════════════════════════════════════

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  description,
  color = 'blue',
  onClick,
}: StatCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
    gray: 'text-gray-600 bg-gray-100',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.isPositive === undefined) {
      return trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-gray-600';
    }
    return trend.isPositive ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card
      className={`p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {(trend || description) && (
        <div className="flex items-center justify-between">
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && (
                <span className="text-gray-500 ml-1">{trend.label}</span>
              )}
            </div>
          )}
          {description && !trend && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// MINI CHART CARD - Card com mini gráfico
// ═══════════════════════════════════════════════════════════════

interface MiniChartCardProps {
  title: string;
  value: string | number;
  change: number;
  data: number[];
  color?: string;
}

export function MiniChartCard({
  title,
  value,
  change,
  data,
  color = '#1F4788',
}: MiniChartCardProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl text-gray-900">{value}</p>
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="flex items-end gap-1 h-12">
        {data.map((value, index) => {
          const height = range === 0 ? 50 : ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className="flex-1 rounded-t transition-all hover:opacity-70"
              style={{
                height: `${Math.max(height, 10)}%`,
                backgroundColor: color,
                opacity: 0.7 + (index / data.length) * 0.3,
              }}
            />
          );
        })}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// QUICK STATS - Stats rápidos em linha
// ═══════════════════════════════════════════════════════════════

interface QuickStat {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <Card className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            {stat.icon && (
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: stat.color + '20', color: stat.color }}
              >
                {stat.icon}
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600">{stat.label}</p>
              <p className="text-lg font-medium text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY FEED - Feed de atividades
// ═══════════════════════════════════════════════════════════════

interface Activity {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 5 }: ActivityFeedProps) {
  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Atividades Recentes</h3>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </div>

      <div className="space-y-4">
        {activities.slice(0, maxItems).map((activity, index) => (
          <div key={activity.id} className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(activity.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              {activity.user && (
                <p className="text-xs text-gray-500 mt-1">por {activity.user}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// PROGRESS CARD - Card com barra de progresso
// ═══════════════════════════════════════════════════════════════

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  description?: string;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressCard({
  title,
  current,
  total,
  description,
  color = '#1F4788',
  showPercentage = true,
}: ProgressCardProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {showPercentage && (
          <span className="text-sm text-gray-600">{percentage.toFixed(0)}%</span>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{current} concluídos</span>
          <span>{total} total</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {description && <p className="text-sm text-gray-500">{description}</p>}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// STATUS CARD - Card com lista de status
// ═══════════════════════════════════════════════════════════════

interface StatusItem {
  label: string;
  count: number;
  color: string;
}

interface StatusCardProps {
  title: string;
  items: StatusItem[];
  total?: number;
}

export function StatusCard({ title, items, total }: StatusCardProps) {
  const calculatedTotal = total || items.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="space-y-3">
        {items.map((item, index) => {
          const percentage = calculatedTotal > 0 ? (item.count / calculatedTotal) * 100 : 0;
          return (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">{item.count}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {total && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-lg font-semibold text-gray-900">{total}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// WIDGET COM MENU - Widget com opções de ação
// ═══════════════════════════════════════════════════════════════

interface WidgetWithMenuProps {
  title: string;
  children: React.ReactNode;
  menuItems?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  }[];
}

export function WidgetWithMenu({ title, children, menuItems }: WidgetWithMenuProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {menuItems && menuItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menuItems.map((item, index) => (
                <DropdownMenuItem key={index} onClick={item.onClick}>
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      {children}
    </Card>
  );
}
