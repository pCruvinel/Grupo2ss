// Re-export all hooks for easier imports
export { useAuth } from './useAuth';
export { useMockAuth } from './useMockAuth';
export { useDebounce } from './useDebounce';
export { useEmpresa } from './useEmpresa';
export { useLocalStorage } from './useLocalStorage';
export { useMediaQuery } from './useMediaQuery';
export { usePagination } from './usePagination';

// ========================================
// NOVOS HOOKS REUTILIZÁVEIS
// ========================================
export { useTable } from './useTable';
export { useFilters } from './useFilters';
export { useModal, useModals } from './useModal';
export { useFormValidation } from './useFormValidation';
export { useErrorHandler, AppError, CommonErrors } from './useErrorHandler';

// ========================================
// HOOKS DE OTIMIZAÇÃO DE PERFORMANCE
// ========================================
export {
  useOptimizedFilter,
  useOptimizedSort,
  useOptimizedPagination,
  useOptimizedSearch,
  useOptimizedDataProcessing,
  useOptimizedAggregation,
} from './useOptimizedData';