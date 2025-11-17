import { Building2, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Empresa {
  id: string;
  nome: string;
  nomeCompleto?: string;
  logo?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
}

interface EmpresaSelectorProps {
  empresas: Empresa[];
  empresaAtual: string;
  onSelectEmpresa: (empresaId: string) => void;
  userEmpresas?: string[]; // IDs das empresas que o usuário tem acesso
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

export function EmpresaSelector({
  empresas,
  empresaAtual,
  onSelectEmpresa,
  userEmpresas,
  showIcon = true,
  variant = 'default',
}: EmpresaSelectorProps) {
  // Filtrar apenas empresas que o usuário tem acesso
  const empresasDisponiveis = userEmpresas
    ? empresas.filter((e) => userEmpresas.includes(e.id))
    : empresas;

  const empresaSelecionada = empresas.find((e) => e.id === empresaAtual);

  // Se o usuário só tem acesso a 1 empresa, não mostrar o seletor
  if (empresasDisponiveis.length <= 1 && variant === 'default') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200">
        {showIcon && <Building2 className="w-4 h-4 text-gray-600" />}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {empresaSelecionada?.nome || 'Empresa'}
          </span>
          {empresaSelecionada?.nomeCompleto && empresaSelecionada.nomeCompleto !== empresaSelecionada.nome && (
            <span className="text-xs text-gray-500">
              {empresaSelecionada.nomeCompleto}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between gap-2 bg-white hover:bg-gray-50 ${
            variant === 'compact' ? 'h-9 px-3' : 'h-10 px-4'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {showIcon && <Building2 className="w-4 h-4 flex-shrink-0" />}
            <div className="flex flex-col items-start min-w-0">
              <span className={`font-medium truncate ${variant === 'compact' ? 'text-xs' : 'text-sm'}`}>
                {empresaSelecionada?.nome || 'Selecione'}
              </span>
              {variant === 'default' && empresaSelecionada?.nomeCompleto && 
               empresaSelecionada.nomeCompleto !== empresaSelecionada.nome && (
                <span className="text-xs text-gray-500 truncate">
                  {empresaSelecionada.nomeCompleto}
                </span>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="ml-2 flex-shrink-0">
            {empresasDisponiveis.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Selecionar Empresa
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {empresasDisponiveis.map((empresa) => {
          const isSelected = empresa.id === empresaAtual;
          
          return (
            <DropdownMenuItem
              key={empresa.id}
              onClick={() => onSelectEmpresa(empresa.id)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 w-full">
                {/* Indicador de cor da empresa */}
                {empresa.colors && (
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: empresa.colors.primary }}
                  />
                )}
                
                {/* Nome da empresa */}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm truncate">
                    {empresa.nome}
                  </span>
                  {empresa.nomeCompleto && empresa.nomeCompleto !== empresa.nome && (
                    <span className="text-xs text-gray-500 truncate">
                      {empresa.nomeCompleto}
                    </span>
                  )}
                </div>
                
                {/* Check se selecionada */}
                {isSelected && (
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
