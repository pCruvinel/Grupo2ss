import { useState } from 'react';
import { Check, Trash2, Edit, Download, Mail, Archive, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { toast } from '../ui/sonner';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive';
  requireConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationDescription?: string;
  onExecute: (selectedIds: string[]) => void | Promise<void>;
}

interface BulkActionsProps {
  data: any[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  actions: BulkAction[];
  itemIdKey?: string;
  selectAllLabel?: string;
}

export function BulkActions({
  data,
  selectedIds,
  onSelectionChange,
  actions,
  itemIdKey = 'id',
  selectAllLabel = 'Selecionar todos',
}: BulkActionsProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkAction | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const allSelected = data.length > 0 && selectedIds.length === data.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((item) => item[itemIdKey]));
    }
  };

  const handleToggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const handleActionClick = (action: BulkAction) => {
    if (selectedIds.length === 0) {
      toast.error('Selecione pelo menos um item');
      return;
    }

    if (action.requireConfirmation) {
      setCurrentAction(action);
      setShowConfirmation(true);
    } else {
      executeAction(action);
    }
  };

  const executeAction = async (action: BulkAction) => {
    setIsExecuting(true);
    try {
      await action.onExecute(selectedIds);
      toast.success(`${action.label} executado com sucesso em ${selectedIds.length} item(ns)`);
      onSelectionChange([]);
    } catch (error) {
      toast.error(`Erro ao executar ${action.label}`);
      console.error(error);
    } finally {
      setIsExecuting(false);
      setShowConfirmation(false);
      setCurrentAction(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border">
        {/* Select All Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={handleSelectAll}
            className={someSelected ? 'data-[state=checked]:bg-blue-600' : ''}
            aria-label={someSelected ? 'Alguns selecionados' : allSelected ? 'Todos selecionados' : 'Nenhum selecionado'}
          />
          <span className="text-sm text-gray-700">
            {selectAllLabel}
            {selectedIds.length > 0 && (
              <Badge className="ml-2 bg-blue-600 text-white">
                {selectedIds.length} selecionado{selectedIds.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </span>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center gap-2 flex-wrap">
              {/* Primary Actions (até 3) */}
              {actions.slice(0, 3).map((action) => (
                <Button
                  key={action.id}
                  variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleActionClick(action)}
                  disabled={isExecuting}
                  className="gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}

              {/* More Actions Dropdown */}
              {actions.length > 3 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {actions.slice(3).map((action, index) => (
                      <div key={action.id}>
                        {index > 0 && action.variant === 'destructive' && (
                          <DropdownMenuSeparator />
                        )}
                        <DropdownMenuItem
                          onClick={() => handleActionClick(action)}
                          className={
                            action.variant === 'destructive'
                              ? 'text-red-600 focus:text-red-700'
                              : ''
                          }
                        >
                          <span className="mr-2">{action.icon}</span>
                          {action.label}
                        </DropdownMenuItem>
                      </div>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {currentAction?.confirmationTitle || 'Confirmar ação'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentAction?.confirmationDescription ||
                `Tem certeza que deseja executar esta ação em ${selectedIds.length} item(ns)?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => currentAction && executeAction(currentAction)}
              className={
                currentAction?.variant === 'destructive'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Hook para gerenciar seleção
export function useBulkSelection(initialIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const selectAll = (ids: string[]) => setSelectedIds(ids);
  const deselectAll = () => setSelectedIds([]);
  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };
  const isSelected = (id: string) => selectedIds.includes(id);

  return {
    selectedIds,
    setSelectedIds,
    selectAll,
    deselectAll,
    toggleItem,
    isSelected,
  };
}

// Exemplo de uso
export function BulkActionsExample() {
  const data = [
    { id: '1', nome: 'Item 1' },
    { id: '2', nome: 'Item 2' },
    { id: '3', nome: 'Item 3' },
  ];

  const { selectedIds, setSelectedIds } = useBulkSelection();

  const actions: BulkAction[] = [
    {
      id: 'approve',
      label: 'Aprovar',
      icon: <Check className="w-4 h-4" />,
      onExecute: async (ids) => {
        console.log('Aprovando:', ids);
      },
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onExecute: async (ids) => {
        console.log('Editando:', ids);
      },
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: <Download className="w-4 h-4" />,
      onExecute: async (ids) => {
        console.log('Exportando:', ids);
      },
    },
    {
      id: 'email',
      label: 'Enviar E-mail',
      icon: <Mail className="w-4 h-4" />,
      onExecute: async (ids) => {
        console.log('Enviando e-mail:', ids);
      },
    },
    {
      id: 'archive',
      label: 'Arquivar',
      icon: <Archive className="w-4 h-4" />,
      requireConfirmation: true,
      confirmationTitle: 'Arquivar itens',
      confirmationDescription: 'Os itens arquivados poderão ser restaurados posteriormente.',
      onExecute: async (ids) => {
        console.log('Arquivando:', ids);
      },
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive',
      requireConfirmation: true,
      confirmationTitle: 'Excluir itens',
      confirmationDescription:
        'Esta ação não pode ser desfeita. Os itens serão permanentemente excluídos.',
      onExecute: async (ids) => {
        console.log('Excluindo:', ids);
      },
    },
  ];

  return (
    <div className="space-y-4">
      <BulkActions
        data={data}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        actions={actions}
      />

      {/* Sua lista de itens aqui */}
    </div>
  );
}