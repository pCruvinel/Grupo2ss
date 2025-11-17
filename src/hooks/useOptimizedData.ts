import { useMemo } from 'react';

/**
 * Hook para otimizar filtragem de dados
 * Elimina re-cálculos desnecessários em listas grandes
 * 
 * @example
 * const despesasFiltradas = useOptimizedFilter(
 *   despesas,
 *   (despesa) => {
 *     if (filterStatus && despesa.status !== filterStatus) return false;
 *     if (filterEmpresa && despesa.empresa_id !== filterEmpresa) return false;
 *     return true;
 *   },
 *   [filterStatus, filterEmpresa]
 * );
 */
export function useOptimizedFilter<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  dependencies: unknown[]
): T[] {
  return useMemo(() => {
    return data.filter(filterFn);
  }, [data, ...dependencies]);
}

/**
 * Hook para otimizar ordenação de dados
 * 
 * @example
 * const despesasOrdenadas = useOptimizedSort(
 *   despesas,
 *   (a, b) => new Date(b.data_vencimento).getTime() - new Date(a.data_vencimento).getTime(),
 *   [sortField, sortDirection]
 * );
 */
export function useOptimizedSort<T>(
  data: T[],
  sortFn: (a: T, b: T) => number,
  dependencies: unknown[]
): T[] {
  return useMemo(() => {
    return [...data].sort(sortFn);
  }, [data, ...dependencies]);
}

/**
 * Hook para otimizar paginação de dados
 * 
 * @example
 * const despesasPaginadas = useOptimizedPagination(
 *   despesasFiltradas,
 *   currentPage,
 *   itemsPerPage
 * );
 */
export function useOptimizedPagination<T>(
  data: T[],
  page: number,
  itemsPerPage: number
): {
  items: T[];
  totalPages: number;
  startIndex: number;
  endIndex: number;
} {
  return useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = data.slice(startIndex, endIndex);
    
    return {
      items,
      totalPages,
      startIndex,
      endIndex,
    };
  }, [data, page, itemsPerPage]);
}

/**
 * Hook para otimizar busca em dados
 * 
 * @example
 * const resultadosBusca = useOptimizedSearch(
 *   colaboradores,
 *   searchTerm,
 *   (colaborador) => [colaborador.nome, colaborador.cpf, colaborador.email]
 * );
 */
export function useOptimizedSearch<T>(
  data: T[],
  searchTerm: string,
  getSearchableFields: (item: T) => (string | null | undefined)[]
): T[] {
  return useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    return data.filter((item) => {
      const fields = getSearchableFields(item);
      return fields.some((field) => 
        field?.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [data, searchTerm]);
}

/**
 * Hook combinado - filtra, ordena, busca e pagina em uma única operação otimizada
 * 
 * @example
 * const {
 *   items,
 *   totalPages,
 *   totalItems
 * } = useOptimizedDataProcessing({
 *   data: despesas,
 *   searchTerm,
 *   searchFields: (d) => [d.descricao, d.fornecedor?.nome],
 *   filterFn: (d) => filterStatus ? d.status === filterStatus : true,
 *   sortFn: (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime(),
 *   page: currentPage,
 *   itemsPerPage: 10,
 *   dependencies: [filterStatus, sortDirection]
 * });
 */
export function useOptimizedDataProcessing<T>(options: {
  data: T[];
  searchTerm?: string;
  searchFields?: (item: T) => (string | null | undefined)[];
  filterFn?: (item: T) => boolean;
  sortFn?: (a: T, b: T) => number;
  page: number;
  itemsPerPage: number;
  dependencies?: unknown[];
}): {
  items: T[];
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
} {
  const {
    data,
    searchTerm = '',
    searchFields,
    filterFn,
    sortFn,
    page,
    itemsPerPage,
    dependencies = [],
  } = options;

  return useMemo(() => {
    let processed = data;

    // 1. Busca
    if (searchTerm && searchFields) {
      const normalizedSearch = searchTerm.toLowerCase().trim();
      processed = processed.filter((item) => {
        const fields = searchFields(item);
        return fields.some((field) => 
          field?.toLowerCase().includes(normalizedSearch)
        );
      });
    }

    // 2. Filtro
    if (filterFn) {
      processed = processed.filter(filterFn);
    }

    // 3. Ordenação
    if (sortFn) {
      processed = [...processed].sort(sortFn);
    }

    // 4. Paginação
    const totalItems = processed.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = processed.slice(startIndex, endIndex);

    return {
      items,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
    };
  }, [data, searchTerm, page, itemsPerPage, ...dependencies]);
}

/**
 * Hook para calcular totais/agregações de forma otimizada
 * 
 * @example
 * const { total, count, average } = useOptimizedAggregation(
 *   despesas,
 *   (despesa) => despesa.valor,
 *   [filterStatus]
 * );
 */
export function useOptimizedAggregation<T>(
  data: T[],
  getValue: (item: T) => number,
  dependencies: unknown[]
): {
  total: number;
  count: number;
  average: number;
  min: number;
  max: number;
} {
  return useMemo(() => {
    if (data.length === 0) {
      return { total: 0, count: 0, average: 0, min: 0, max: 0 };
    }

    let total = 0;
    let min = Infinity;
    let max = -Infinity;

    for (const item of data) {
      const value = getValue(item);
      total += value;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }

    return {
      total,
      count: data.length,
      average: total / data.length,
      min: min === Infinity ? 0 : min,
      max: max === -Infinity ? 0 : max,
    };
  }, [data, ...dependencies]);
}
