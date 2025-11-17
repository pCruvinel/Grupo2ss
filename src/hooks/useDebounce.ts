import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para busca em tempo real, evitando chamadas excessivas à API
 * @param value - Valor a ser debounced
 * @param delay - Delay em milissegundos (padrão: 500ms)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Exemplo de uso:
 * 
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     // Fazer chamada à API
 *     fetchResults(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
