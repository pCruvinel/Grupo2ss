import { useState, useCallback, useMemo } from 'react';
import type { FilterParams, UseFilterReturn } from '../types';

/**
 * Hook reutilizável para gerenciar filtros
 * Elimina lógica duplicada de filtros em dashboards
 * 
 * @example
 * const { 
 *   filters, 
 *   setFilter, 
 *   clearAllFilters,
 *   hasActiveFilters 
 * } = useFilters();
 * 
 * // Aplicar filtro
 * setFilter('status', 'ativo');
 * setFilter('empresa_id', '1');
 * 
 * // Limpar filtros
 * clearAllFilters();
 */
export function useFilters(initialFilters: FilterParams = {}): UseFilterReturn {
  const [filters, setFilters] = useState<FilterParams>(initialFilters);

  // Definir um filtro específico
  const setFilter = useCallback((key: string, value: string | number | boolean | null) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Limpar um filtro específico
  const clearFilter = useCallback((key: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Limpar todos os filtros
  const clearAllFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0;
  }, [filters]);

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
  };
}