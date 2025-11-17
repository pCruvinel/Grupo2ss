import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Inbox,
  Search,
  FileX,
  Database,
  Users,
  Car,
  DollarSign,
  Calendar,
  AlertCircle,
  Package,
  ShoppingCart,
  TrendingUp,
  ClipboardList,
  Plus,
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action, secondaryAction }: EmptyStateProps) {
  return (
    <Card className="p-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="mb-4 text-gray-300">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
        {(action || secondaryAction) && (
          <div className="flex gap-3">
            {action && (
              <Button onClick={action.onClick} className="bg-[#1F4788] hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button onClick={secondaryAction.onClick} variant="outline">
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

// Empty States Específicos
export function NoDataEmptyState({ onAction }: { onAction?: () => void }) {
  return (
    <EmptyState
      icon={<Inbox className="w-16 h-16" />}
      title="Nenhum dado encontrado"
      description="Não há registros para exibir no momento. Comece adicionando novos itens."
      action={onAction ? { label: 'Adicionar Novo', onClick: onAction } : undefined}
    />
  );
}

export function NoSearchResultsEmptyState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={<Search className="w-16 h-16" />}
      title="Nenhum resultado encontrado"
      description="Não encontramos resultados para sua pesquisa. Tente ajustar os filtros ou termos de busca."
      secondaryAction={onClear ? { label: 'Limpar Filtros', onClick: onClear } : undefined}
    />
  );
}

export function NoFilesEmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={<FileX className="w-16 h-16" />}
      title="Nenhum arquivo disponível"
      description="Você ainda não enviou nenhum arquivo. Faça upload para começar."
      action={onUpload ? { label: 'Fazer Upload', onClick: onUpload } : undefined}
    />
  );
}

export function DatabaseErrorEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-16 h-16 text-red-400" />}
      title="Erro ao carregar dados"
      description="Ocorreu um erro ao buscar os dados. Verifique sua conexão e tente novamente."
      action={onRetry ? { label: 'Tentar Novamente', onClick: onRetry } : undefined}
    />
  );
}

export function NoVeiculosEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Car className="w-16 h-16" />}
      title="Nenhum veículo cadastrado"
      description="Sua frota está vazia. Comece cadastrando o primeiro veículo para gerenciar sua frota."
      action={onAdd ? { label: 'Cadastrar Veículo', onClick: onAdd } : undefined}
    />
  );
}

export function NoColaboradoresEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Users className="w-16 h-16" />}
      title="Nenhum colaborador cadastrado"
      description="Ainda não há colaboradores no sistema. Adicione colaboradores para começar a gerenciar sua equipe."
      action={onAdd ? { label: 'Adicionar Colaborador', onClick: onAdd } : undefined}
    />
  );
}

export function NoDespesasEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<DollarSign className="w-16 h-16" />}
      title="Nenhuma despesa registrada"
      description="Não há despesas cadastradas para este período. Registre suas despesas para manter o controle financeiro."
      action={onAdd ? { label: 'Registrar Despesa', onClick: onAdd } : undefined}
    />
  );
}

export function NoProdutosEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Package className="w-16 h-16" />}
      title="Nenhum produto no estoque"
      description="Seu estoque está vazio. Adicione produtos para começar a gerenciar seu inventário."
      action={onAdd ? { label: 'Adicionar Produto', onClick: onAdd } : undefined}
    />
  );
}

export function NoVendasEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<ShoppingCart className="w-16 h-16" />}
      title="Nenhuma venda registrada"
      description="Ainda não há vendas no sistema. Registre sua primeira venda para começar a acompanhar o faturamento."
      action={onAdd ? { label: 'Registrar Venda', onClick: onAdd } : undefined}
    />
  );
}

export function NoRelatoriosEmptyState({ onGenerate }: { onGenerate?: () => void }) {
  return (
    <EmptyState
      icon={<TrendingUp className="w-16 h-16" />}
      title="Nenhum relatório disponível"
      description="Não há dados suficientes para gerar relatórios. Continue usando o sistema para acumular informações."
      action={onGenerate ? { label: 'Gerar Relatório', onClick: onGenerate } : undefined}
    />
  );
}

export function NoAgendamentosEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<Calendar className="w-16 h-16" />}
      title="Nenhum agendamento"
      description="Não há agendamentos para exibir. Crie um novo agendamento para organizar sua agenda."
      action={onAdd ? { label: 'Novo Agendamento', onClick: onAdd } : undefined}
    />
  );
}

export function NoTarefasEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={<ClipboardList className="w-16 h-16" />}
      title="Nenhuma tarefa pendente"
      description="Parabéns! Você não tem tarefas pendentes. Que tal criar uma nova?"
      action={onAdd ? { label: 'Nova Tarefa', onClick: onAdd } : undefined}
    />
  );
}

// Empty State Genérico Personalizável
export function CustomEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <EmptyState
      icon={<Icon className="w-16 h-16" />}
      title={title}
      description={description}
      action={actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined}
    />
  );
}
