/**
 * Hook useDebounce - Sistema ERP Grupo 2S
 * 
 * Hook para debounce de valores, útil para inputs de busca e validações.
 */

import { useEffect, useState } from 'react';

/**
 * Hook que retorna um valor com debounce
 * @param value - Valor a ser "debouncado"
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Valor com debounce aplicado
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Criar timeout para atualizar o valor após o delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpar timeout se o valor mudar antes do delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook que executa callback com debounce
 * @param callback - Função a ser executada
 * @param delay - Delay em milissegundos (padrão: 500ms)
 * @returns Função com debounce aplicado
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    // Limpar timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Criar novo timeout
    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}
