import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setItemsPerPage: (items: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  paginateData: (data: T[]) => T[];
}

/**
 * Hook para gerenciar paginação
 * @param totalItems - Total de itens
 * @param itemsPerPage - Itens por página (padrão: 10)
 * @param initialPage - Página inicial (padrão: 1)
 */
export function usePagination<T = any>({
  totalItems,
  itemsPerPage: initialItemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / itemsPerPage);
  }, [totalItems, itemsPerPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * itemsPerPage;
  }, [currentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage, totalItems);
  }, [startIndex, itemsPerPage, totalItems]);

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (canGoPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSetItemsPerPage = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset para primeira página
  };

  const paginateData = (data: T[]): T[] => {
    return data.slice(startIndex, endIndex);
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    previousPage,
    setItemsPerPage: handleSetItemsPerPage,
    canGoNext,
    canGoPrevious,
    paginateData,
  };
}

/**
 * Exemplo de uso:
 * 
 * const data = [...]; // Array de dados
 * const pagination = usePagination({
 *   totalItems: data.length,
 *   itemsPerPage: 10,
 * });
 * 
 * const paginatedData = pagination.paginateData(data);
 * 
 * return (
 *   <div>
 *     {paginatedData.map(item => <ItemCard key={item.id} {...item} />)}
 *     <Pagination {...pagination} />
 *   </div>
 * );
 */
