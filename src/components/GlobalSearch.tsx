import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Users, DollarSign, Package, Truck, Clock, TrendingUp, X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'Página' | 'Funcionalidade' | 'Módulo' | 'Relatório' | 'Cadastro';
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export function GlobalSearch({ isOpen, onClose, onNavigate }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Database de resultados de busca
  const allResults: SearchResult[] = [
    // Dashboard
    {
      id: 'dashboard',
      title: 'Dashboard Principal',
      description: 'Visão geral do sistema',
      category: 'Página',
      icon: <TrendingUp className="h-4 w-4" />,
      action: () => onNavigate('dashboard'),
      keywords: ['dashboard', 'inicio', 'home', 'visão geral'],
    },
    {
      id: 'dashboard_rh',
      title: 'Dashboard RH',
      description: 'Visão geral de Recursos Humanos',
      category: 'Página',
      icon: <Users className="h-4 w-4" />,
      action: () => onNavigate('dashboard_rh'),
      keywords: ['dashboard', 'rh', 'recursos humanos', 'colaboradores'],
    },

    // Financeiro
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: 'Módulo financeiro completo',
      category: 'Módulo',
      icon: <DollarSign className="h-4 w-4" />,
      action: () => onNavigate('financeiro'),
      keywords: ['financeiro', 'dinheiro', 'pagamentos'],
    },
    {
      id: 'contratos',
      title: 'Contratos',
      description: 'Gerenciar contratos e locações',
      category: 'Cadastro',
      icon: <FileText className="h-4 w-4" />,
      action: () => onNavigate('contratos'),
      keywords: ['contratos', 'locação', 'aluguel'],
    },
    {
      id: 'despesas',
      title: 'Despesas',
      description: 'Controle de despesas e custos',
      category: 'Cadastro',
      icon: <DollarSign className="h-4 w-4" />,
      action: () => onNavigate('despesas'),
      keywords: ['despesas', 'custos', 'gastos', 'contas'],
    },
    {
      id: 'cotacoes',
      title: 'Cotações',
      description: 'Sistema de cotações',
      category: 'Funcionalidade',
      icon: <FileText className="h-4 w-4" />,
      action: () => onNavigate('cotacoes'),
      keywords: ['cotações', 'orçamento', 'preço'],
    },

    // RH
    {
      id: 'colaboradores',
      title: 'Colaboradores',
      description: 'Cadastro e gestão de colaboradores',
      category: 'Cadastro',
      icon: <Users className="h-4 w-4" />,
      action: () => onNavigate('colaboradores'),
      keywords: ['colaboradores', 'funcionários', 'equipe', 'time'],
    },
    {
      id: 'ponto',
      title: 'Controle de Ponto',
      description: 'Registro de ponto eletrônico',
      category: 'Funcionalidade',
      icon: <Clock className="h-4 w-4" />,
      action: () => onNavigate('ponto'),
      keywords: ['ponto', 'registro', 'horário', 'entrada', 'saída'],
    },
    {
      id: 'folha_pagamento',
      title: 'Folha de Pagamento',
      description: 'Processamento de folha de pagamento',
      category: 'Funcionalidade',
      icon: <DollarSign className="h-4 w-4" />,
      action: () => onNavigate('folha_pagamento'),
      keywords: ['folha', 'pagamento', 'salário', 'holerite'],
    },

    // Operacional
    {
      id: 'veiculos',
      title: 'Veículos',
      description: 'Gestão de frota e veículos',
      category: 'Cadastro',
      icon: <Truck className="h-4 w-4" />,
      action: () => onNavigate('veiculos'),
      keywords: ['veículos', 'frota', 'carros', 'caminhões'],
    },
    {
      id: 'ordens',
      title: 'Ordens de Serviço',
      description: 'Gerenciamento de ordens de serviço',
      category: 'Funcionalidade',
      icon: <FileText className="h-4 w-4" />,
      action: () => onNavigate('ordens'),
      keywords: ['ordens', 'serviço', 'os', 'manutenção'],
    },

    // Estoque
    {
      id: 'materiais',
      title: 'Materiais',
      description: 'Controle de estoque de materiais',
      category: 'Cadastro',
      icon: <Package className="h-4 w-4" />,
      action: () => onNavigate('materiais'),
      keywords: ['materiais', 'estoque', 'produtos', 'inventário'],
    },
    {
      id: 'catalogo',
      title: 'Catálogo de Serviços',
      description: 'Catálogo completo de serviços',
      category: 'Funcionalidade',
      icon: <FileText className="h-4 w-4" />,
      action: () => onNavigate('catalogo'),
      keywords: ['catálogo', 'serviços', 'produtos'],
    },
  ];

  // Filtrar resultados baseado na query
  const filteredResults = query.trim() === '' 
    ? allResults.slice(0, 8) // Mostrar alguns resultados populares quando vazio
    : allResults.filter(result => {
        const searchTerm = query.toLowerCase();
        return (
          result.title.toLowerCase().includes(searchTerm) ||
          result.description.toLowerCase().includes(searchTerm) ||
          result.category.toLowerCase().includes(searchTerm) ||
          result.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm))
        );
      });

  // Agrupar por categoria
  const groupedResults = filteredResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelectResult(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults]);

  // Reset ao abrir
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelectResult = (result: SearchResult) => {
    result.action();
    onClose();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Página': 'bg-blue-100 text-blue-700',
      'Funcionalidade': 'bg-green-100 text-green-700',
      'Módulo': 'bg-purple-100 text-purple-700',
      'Relatório': 'bg-orange-100 text-orange-700',
      'Cadastro': 'bg-pink-100 text-pink-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        {/* Header com busca */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Buscar páginas, funcionalidades, módulos..."
              className="pl-10 pr-10 h-12 text-base border-0 focus-visible:ring-0"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        <ScrollArea className="max-h-[60vh]">
          <div className="p-2">
            {filteredResults.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum resultado encontrado</p>
                <p className="text-sm mt-1">Tente buscar por outro termo</p>
              </div>
            ) : (
              <>
                {query.trim() === '' && (
                  <div className="px-3 py-2 text-xs text-gray-500">
                    Páginas Populares
                  </div>
                )}
                
                {Object.entries(groupedResults).map(([category, results]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    {query.trim() !== '' && (
                      <div className="px-3 py-2 text-xs text-gray-500">
                        {category}s
                      </div>
                    )}
                    {results.map((result, index) => {
                      const globalIndex = filteredResults.indexOf(result);
                      const isSelected = globalIndex === selectedIndex;
                      
                      return (
                        <button
                          key={result.id}
                          onClick={() => handleSelectResult(result)}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${
                            isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {result.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-900">{result.title}</p>
                            <p className="text-sm text-gray-500">{result.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getCategoryColor(result.category)}`}
                            >
                              {result.category}
                            </Badge>
                            {isSelected && (
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer com atalhos */}
        <div className="border-t px-4 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↑</kbd>
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">↓</kbd>
              <span>Navegar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Enter</kbd>
              <span>Selecionar</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Esc</kbd>
              <span>Fechar</span>
            </div>
          </div>
          <div>
            {filteredResults.length} resultado(s)
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
