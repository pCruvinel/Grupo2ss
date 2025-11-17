// Re-export all shared components
export { DataTable } from './DataTable';
export { EmptyState } from './EmptyState';
export { StatusBadge } from './StatusBadge';
export { LoadingSpinner } from './LoadingSpinner';
export { ConfirmDialog } from './ConfirmDialog';
export { Pagination } from './Pagination';
export { Breadcrumbs } from './Breadcrumbs';
export { FileUpload } from './FileUpload';
export { ErrorBoundary } from './ErrorBoundary';

// Re-export modals
export { NovoVeiculoModal } from '../modals/NovoVeiculoModal';
export { EditarVeiculoModal } from '../modals/EditarVeiculoModal';
export { NovoUsuarioModal } from '../modals/NovoUsuarioModal';
export { NovoContratoModal } from '../modals/NovoContratoModal';
export { NovoPagamentoModal } from '../modals/NovoPagamentoModal';
export { RegistroPontoManualModal } from '../modals/RegistroPontoManualModal';
export { JustificativaAusenciaModal } from '../modals/JustificativaAusenciaModal';
export { ResetSenhaModal } from '../modals/ResetSenhaModal';

// Re-export skeleton components
export { TableSkeleton, CardsSkeleton } from './SkeletonLoaders';
export { NoSearchResultsEmptyState, NoDataEmptyState } from './EmptyStates';
export { SectionErrorBoundary, GlobalErrorBoundary } from './ErrorBoundary';