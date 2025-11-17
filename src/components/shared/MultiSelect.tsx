import { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  searchPlaceholder?: string;
  selectAllLabel?: string;
  clearAllLabel?: string;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Selecione...',
  maxDisplay = 3,
  searchPlaceholder = 'Buscar...',
  selectAllLabel = 'Selecionar Todos',
  clearAllLabel = 'Limpar Seleção',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOptions = options.filter((option) => value.includes(option.value));

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    const allValues = filteredOptions
      .filter((opt) => !opt.disabled)
      .map((opt) => opt.value);
    onChange(allValues);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto"
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <>
                {selectedOptions.slice(0, maxDisplay).map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="gap-1"
                  >
                    {option.icon && <span className="h-3 w-3">{option.icon}</span>}
                    {option.label}
                    <button
                      onClick={(e) => handleRemove(option.value, e)}
                      className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedOptions.length > maxDisplay && (
                  <Badge variant="secondary">
                    +{selectedOptions.length - maxDisplay} mais
                  </Badge>
                )}
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between px-2 py-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="h-8 text-xs"
          >
            <Check className="h-3 w-3 mr-1" />
            {selectAllLabel}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-8 text-xs text-red-600 hover:text-red-700"
          >
            <X className="h-3 w-3 mr-1" />
            {clearAllLabel}
          </Button>
        </div>
        <Separator />
        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Nenhum resultado encontrado
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-2 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-100 ${
                    option.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => !option.disabled && handleToggle(option.value)}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
                    disabled={option.disabled}
                    onCheckedChange={() => !option.disabled && handleToggle(option.value)}
                  />
                  {option.icon && <span className="h-4 w-4">{option.icon}</span>}
                  <span className="flex-1 text-sm">{option.label}</span>
                  {value.includes(option.value) && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// Exemplo de uso
export function MultiSelectExample() {
  const [selected, setSelected] = useState<string[]>([]);

  const options = [
    { value: '1', label: '2S Locações' },
    { value: '2', label: '2S Marketing' },
    { value: '3', label: '2S Produções' },
  ];

  return (
    <div className="w-full max-w-md">
      <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        placeholder="Selecione as empresas"
      />
    </div>
  );
}

// Variante com grupos
interface GroupedOption {
  group: string;
  options: MultiSelectOption[];
}

export function GroupedMultiSelect({
  groups,
  value = [],
  onChange,
  placeholder = 'Selecione...',
}: {
  groups: GroupedOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const allOptions = groups.flatMap((g) => g.options);
  const selectedOptions = allOptions.filter((option) => value.includes(option.value));

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <span>
            {selectedOptions.length === 0
              ? placeholder
              : `${selectedOptions.length} selecionado(s)`}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <ScrollArea className="h-80">
          {groups.map((group) => (
            <div key={group.group} className="p-2">
              <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.options.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center space-x-2 rounded-md px-2 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleToggle(option.value)}
                  >
                    <Checkbox checked={value.includes(option.value)} />
                    <span className="flex-1 text-sm">{option.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
