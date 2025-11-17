import { useState, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  onError?: (error: Error) => void;
}

interface UseErrorHandlerReturn {
  error: Error | null;
  clearError: () => void;
  handleError: (error: unknown) => void;
  wrapAsync: <T>(
    fn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ) => Promise<T | null>;
}

/**
 * Hook reutilizável para tratamento de erros
 * Elimina necessidade de try-catch em cada componente
 * 
 * @example
 * const { handleError, wrapAsync } = useErrorHandler();
 * 
 * // Uso 1: Wrapper automático
 * const handleSave = async () => {
 *   const result = await wrapAsync(async () => {
 *     return await saveData(formData);
 *   });
 *   
 *   if (result) {
 *     toast.success('Salvo com sucesso!');
 *   }
 * };
 * 
 * // Uso 2: Manual
 * try {
 *   await saveData(formData);
 * } catch (error) {
 *   handleError(error);
 * }
 */
export function useErrorHandler(
  defaultOptions: ErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const [error, setError] = useState<Error | null>(null);

  const {
    showToast = true,
    logToConsole = true,
    onError,
  } = defaultOptions;

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Processar erro
  const handleError = useCallback(
    (unknownError: unknown) => {
      const error = unknownError instanceof Error
        ? unknownError
        : new Error(String(unknownError));

      setError(error);

      if (logToConsole) {
        console.error('Error caught by useErrorHandler:', error);
      }

      if (showToast) {
        toast.error(error.message || 'Ocorreu um erro inesperado');
      }

      if (onError) {
        onError(error);
      }
    },
    [logToConsole, showToast, onError]
  );

  // Wrapper para funções assíncronas
  const wrapAsync = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      options?: ErrorHandlerOptions
    ): Promise<T | null> => {
      const opts = { ...defaultOptions, ...options };

      try {
        const result = await fn();
        clearError();
        return result;
      } catch (unknownError) {
        const error = unknownError instanceof Error
          ? unknownError
          : new Error(String(unknownError));

        setError(error);

        if (opts.logToConsole) {
          console.error('Error in wrapAsync:', error);
        }

        if (opts.showToast) {
          toast.error(error.message || 'Ocorreu um erro inesperado');
        }

        if (opts.onError) {
          opts.onError(error);
        }

        return null;
      }
    },
    [defaultOptions, clearError]
  );

  return {
    error,
    clearError,
    handleError,
    wrapAsync,
  };
}

/**
 * Helper para criar mensagens de erro customizadas
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Erros pré-definidos comuns
 */
export const CommonErrors = {
  NETWORK: new AppError('Erro de conexão. Verifique sua internet.', 'NETWORK_ERROR'),
  UNAUTHORIZED: new AppError('Você não tem permissão para esta ação.', 'UNAUTHORIZED', 401),
  NOT_FOUND: new AppError('Registro não encontrado.', 'NOT_FOUND', 404),
  VALIDATION: new AppError('Dados inválidos. Verifique os campos.', 'VALIDATION_ERROR', 400),
  SERVER: new AppError('Erro no servidor. Tente novamente mais tarde.', 'SERVER_ERROR', 500),
};
