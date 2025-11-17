import { ChevronRight, Home } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeIcon?: boolean;
  maxItems?: number;
  separator?: React.ReactNode;
}

export function Breadcrumbs({
  items,
  homeIcon = true,
  maxItems = 4,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
}: BreadcrumbsProps) {
  // Se houver muitos items, colapsar os do meio
  const shouldCollapse = items.length > maxItems;
  const displayItems = shouldCollapse
    ? [
        items[0],
        { label: '...', collapsed: true },
        ...items.slice(items.length - (maxItems - 2)),
      ]
    : items;

  const collapsedItems = shouldCollapse
    ? items.slice(1, items.length - (maxItems - 2))
    : [];

  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      {/* Home Icon */}
      {homeIcon && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleItemClick({ label: 'Home', href: '/' })}
            className="h-8 px-2 text-gray-600 hover:text-gray-900"
          >
            <Home className="w-4 h-4" />
          </Button>
          {items.length > 0 && separator}
        </>
      )}

      {/* Breadcrumb Items */}
      {displayItems.map((item: any, index) => {
        const isLast = index === displayItems.length - 1;

        // Item colapsado (dropdown)
        if (item.collapsed) {
          return (
            <div key={index} className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-gray-600 hover:text-gray-900"
                  >
                    ...
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {collapsedItems.map((collapsedItem: BreadcrumbItem, idx) => (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => handleItemClick(collapsedItem)}
                    >
                      {collapsedItem.icon && (
                        <span className="mr-2">{collapsedItem.icon}</span>
                      )}
                      {collapsedItem.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {separator}
            </div>
          );
        }

        // Item normal
        return (
          <div key={index} className="flex items-center space-x-2">
            {isLast ? (
              <span className="text-gray-900 font-medium flex items-center gap-1">
                {item.icon && item.icon}
                {item.label}
              </span>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleItemClick(item)}
                  className="h-8 px-2 text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  {item.icon && item.icon}
                  {item.label}
                </Button>
                {separator}
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}

// Hook para gerenciar breadcrumbs
export function useBreadcrumbs(initialItems: BreadcrumbItem[] = []) {
  const [items, setItems] = React.useState<BreadcrumbItem[]>(initialItems);

  const addItem = (item: BreadcrumbItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const replaceItems = (newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  };

  const reset = () => {
    setItems(initialItems);
  };

  return {
    items,
    addItem,
    removeItem,
    replaceItems,
    reset,
  };
}

// Breadcrumbs simples (versão compacta)
export function SimpleBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {index === items.length - 1 ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-gray-900 hover:underline"
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// Exemplo de uso
export function BreadcrumbsExample() {
  const items: BreadcrumbItem[] = [
    { label: 'Gestão', onClick: () => console.log('Gestão') },
    { label: 'Veículos', onClick: () => console.log('Veículos') },
    { label: 'Frota 2S', onClick: () => console.log('Frota') },
    { label: 'ABC-1234' },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={items} />
      <SimpleBreadcrumbs items={items.slice(0, 3)} />
    </div>
  );
}
