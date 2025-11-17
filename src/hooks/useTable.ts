import { useState, useMemo, useCallback } from 'react';
import type { 
  SortConfig, 
  FilterParams,
  UseTableReturn 
} from '../types';

interface UseTableOptions<T> {
  initialData?: T[];
  initialPage?: number;
  initialLimit?: number;
  fetchData?: (params: {
    page: number;
    limit: number;
    filters?: FilterParams;
    sort?: SortConfig;
  }) => Promise<{ data: T[]; total: number }>;
}

/**
 * Hook reutilizável para gerenciar estado de tabelas
 * Substitui 12+ useState em componentes Dashboard
 * 
 * @example
 * const {
 *   data,
 *   loading,
 *   page,
 *   setPage,
 *   setFilters,
 *   refresh
 * } = useTable<Contrato>({
 *   fetchData: async ({ page, limit, filters }) => {
 *     const result = await fetchContratos(page, limit, filters);
 *     return { data: result.data, total: result.total };
 *   }
 * });
 */
export function useTable<T>(options: UseTableOptions<T> = {}): UseTableReturn<T> {
  const {
    initialData = [],
    initialPage = 1,
    initialLimit = 10,
    fetchData,
  } = options;

  const [state, setState] = useState<TableState<T>>({
    data: initialData,
    loading: false,
    error: null,
    pagination: {
      page: initialPage,
      limit: initialLimit,
      total: 0,
    },
    sort: undefined,
    filters: undefined,
  });

  // Buscar dados
  const loadData = useCallback(async () => {
    if (!fetchData) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await fetchData({
        page: state.pagination.page,
        limit: state.pagination.limit,
        filters: state.filters,
        sort: state.sort,
      });

      setState(prev => ({
        ...prev,
        data: result.data,
        pagination: {
          ...prev.pagination,
          total: result.total,
        },
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao carregar dados',
        loading: false,
      }));
    }
  }, [fetchData, state.pagination.page, state.pagination.limit, state.filters, state.sort]);

  // Definir página
  const setPage = useCallback((page: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, page },
    }));
  }, []);

  // Definir limite
  const setLimit = useCallback((limit: number) => {
    setState(prev => ({
      ...prev,
      pagination: { ...prev.pagination, limit, page: 1 },
    }));
  }, []);

  // Definir filtros
  const setFilters = useCallback((filters: FilterParams) => {
    setState(prev => ({
      ...prev,
      filters,
      pagination: { ...prev.pagination, page: 1 },
    }));
  }, []);

  // Definir ordenação
  const setSort = useCallback((sort: SortConfig) => {
    setState(prev => ({ ...prev, sort }));
  }, []);

  // Atualizar dados
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.ceil(state.pagination.total / state.pagination.limit);
  }, [state.pagination.total, state.pagination.limit]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    page: state.pagination.page,
    limit: state.pagination.limit,
    total: state.pagination.total,
    totalPages,
    setPage,
    setLimit,
    setFilters,
    setSort,
    refresh,
  };
}