import { useState } from 'react';
import { Filter, X, Calendar, DollarSign, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Separator } from '../ui/separator';

export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'numberRange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ActiveFilter {
  id: string;
  label: string;
  value: any;
  displayValue: string;
}

interface AdvancedFiltersProps {
  filterOptions: FilterOption[];
  onApplyFilters: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export function AdvancedFilters({
  filterOptions,
  onApplyFilters,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const handleFilterChange = (id: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleApply = () => {
    // Criar lista de filtros ativos para exibição
    const active: ActiveFilter[] = [];
    
    filterOptions.forEach((option) => {
      const value = filters[option.id];
      if (value !== undefined && value !== null && value !== '') {
        let displayValue = '';
        
        if (option.type === 'select' && option.options) {
          const selectedOption = option.options.find((opt) => opt.value === value);
          displayValue = selectedOption?.label || value;
        } else if (option.type === 'dateRange') {
          displayValue = `${value.start || ''} até ${value.end || ''}`;
        } else if (option.type === 'numberRange') {
          displayValue = `${value.min || 0} - ${value.max || '∞'}`;
        } else {
          displayValue = String(value);
        }
        
        active.push({
          id: option.id,
          label: option.label,
          value,
          displayValue,
        });
      }
    });
    
    setActiveFilters(active);
    onApplyFilters(filters);
    setOpen(false);
  };

  const handleClear = () => {
    setFilters({});
    setActiveFilters([]);
    onClearFilters();
  };

  const handleRemoveFilter = (id: string) => {
    const newFilters = { ...filters };
    delete newFilters[id];
    setFilters(newFilters);
    
    const newActive = activeFilters.filter((f) => f.id !== id);
    setActiveFilters(newActive);
    
    onApplyFilters(newFilters);
  };

  const renderFilterInput = (option: FilterOption) => {
    const value = filters[option.id];

    switch (option.type) {
      case 'text':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
            placeholder={option.placeholder}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleFilterChange(option.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={option.placeholder || 'Selecione'} />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
          />
        );

      case 'dateRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={value?.start || ''}
              onChange={(e) =>
                handleFilterChange(option.id, { ...value, start: e.target.value })
              }
              placeholder="De"
            />
            <Input
              type="date"
              value={value?.end || ''}
              onChange={(e) =>
                handleFilterChange(option.id, { ...value, end: e.target.value })
              }
              placeholder="Até"
            />
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleFilterChange(option.id, e.target.value)}
            placeholder={option.placeholder}
          />
        );

      case 'numberRange':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={value?.min || ''}
              onChange={(e) =>
                handleFilterChange(option.id, { ...value, min: e.target.value })
              }
              placeholder="Mínimo"
            />
            <Input
              type="number"
              value={value?.max || ''}
              onChange={(e) =>
                handleFilterChange(option.id, { ...value, max: e.target.value })
              }
              placeholder="Máximo"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Botão de Filtro */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
              {activeFilters.length > 0 && (
                <Badge className="ml-1 bg-blue-600 text-white">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <div className="flex flex-col max-h-[500px]">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Filtros Avançados</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-red-600 hover:text-red-700"
                  >
                    Limpar Todos
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filterOptions.map((option) => (
                  <div key={option.id}>
                    <Label className="mb-2 block">{option.label}</Label>
                    {renderFilterInput(option)}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleApply} className="flex-1 bg-[#1F4788]">
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Filtros Ativos */}
        {activeFilters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="gap-1 pr-1 pl-3 py-1.5"
          >
            <span className="text-xs">
              <strong>{filter.label}:</strong> {filter.displayValue}
            </span>
            <button
              onClick={() => handleRemoveFilter(filter.id)}
              className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Exemplo de uso
export function AdvancedFiltersExample() {
  const filterOptions: FilterOption[] = [
    {
      id: 'empresa',
      label: 'Empresa',
      type: 'select',
      options: [
        { value: '1', label: '2S Locações' },
        { value: '2', label: '2S Marketing' },
        { value: '3', label: '2S Produções' },
      ],
    },
    {
      id: 'periodo',
      label: 'Período',
      type: 'dateRange',
    },
    {
      id: 'valor',
      label: 'Valor',
      type: 'numberRange',
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
      ],
    },
  ];

  return (
    <AdvancedFilters
      filterOptions={filterOptions}
      onApplyFilters={(filters) => console.log('Filtros aplicados:', filters)}
      onClearFilters={() => console.log('Filtros limpos')}
    />
  );
}
