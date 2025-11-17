/**
 * Helper utilities for Figma Make environment
 * Import this file instead of using @/ aliases
 */

import React from 'react';
import { Badge as ShadcnBadge } from '../components/ui/badge';

// ============================================================================
// SUPABASE MOCK CLIENT
// ============================================================================

export const createClient = () => ({
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      filter: (column: string, operator: string, value: any) => Promise.resolve({ data: [], error: null }),
      order: (column: string, options?: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
        then: () => Promise.resolve({ data: [], error: null }),
      }),
      single: () => Promise.resolve({ data: null, error: null }),
    }),
    insert: (data: any) => Promise.resolve({ data: null, error: null }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
  }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
  },
  storage: {
    from: (bucket: string) => ({
      upload: (path: string, file: any) => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: '' } }),
    }),
  },
});

// ============================================================================
// HOOKS MOCKS
// ============================================================================

export const useEmpresa = () => ({
  empresa: { 
    id: '1', 
    nome: '2S Locações', 
    tipo: '2s_locacoes',
    cor_primaria: '#1F4788',
    cor_secundaria: '#28A745'
  },
  empresas: [
    { id: '1', nome: '2S Locações', tipo: '2s_locacoes' },
    { id: '2', nome: '2S Marketing', tipo: '2s_marketing' },
    { id: '3', nome: '2S Produções e Eventos', tipo: 'producoes_eventos' },
    { id: '4', nome: 'Grupo 2S (Holding)', tipo: 'holding' },
  ],
  loading: false,
  changeEmpresa: (empresaId: string) => {},
});

export const useAuth = () => ({
  user: {
    id: '1',
    email: 'admin@grupo2s.com.br',
    nome: 'Carlos Silva',
    perfil: 'admin',
    empresa_id: '1',
    ativo: true,
  },
  loading: false,
  signOut: () => {},
});

// ============================================================================
// SHARED COMPONENTS
// ============================================================================

export const LoadingSpinner = ({ size = 'md', message }: { size?: 'sm' | 'md' | 'lg'; message?: string }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin`}></div>
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};

export const EmptyState = ({
  title = 'Nenhum registro encontrado',
  description,
  actionLabel,
  onAction,
  icon,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; className: string }> = {
    ativo: { label: 'Ativo', className: 'bg-green-100 text-green-700' },
    inativo: { label: 'Inativo', className: 'bg-gray-100 text-gray-700' },
    pago: { label: 'Pago', className: 'bg-green-100 text-green-700' },
    pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
    atrasado: { label: 'Atrasado', className: 'bg-red-100 text-red-700' },
    cancelado: { label: 'Cancelado', className: 'bg-gray-100 text-gray-700' },
    concluido: { label: 'Concluído', className: 'bg-blue-100 text-blue-700' },
    criada: { label: 'Criada', className: 'bg-yellow-100 text-yellow-700' },
    em_andamento: { label: 'Em Andamento', className: 'bg-blue-100 text-blue-700' },
  };

  const config = statusMap[status.toLowerCase()] || { label: status, className: 'bg-gray-100 text-gray-700' };

  return <ShadcnBadge className={config.className}>{config.label}</ShadcnBadge>;
};

// ============================================================================
// FORMAT UTILITIES
// ============================================================================

// Re-export from centralized formatters
export { 
  formatarMoeda as formatCurrency,
  formatarData as formatDate,
  formatarCPFouCNPJ as formatCPFCNPJ,
  formatarTelefone as formatPhone,
} from './formatters';

// ============================================================================
// CN UTILITY
// ============================================================================

export function cn(...inputs: any[]) {
  const classes = inputs.filter(Boolean);
  return classes.join(' ');
}

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_EMPRESAS = [
  {
    id: '1',
    nome: '2S Locações',
    tipo: '2s_locacoes',
    cnpj: '12.345.678/0001-01',
    cor_primaria: '#1F4788',
    cor_secundaria: '#28A745',
    status: 'ativa' as const
  },
  {
    id: '2',
    nome: '2S Marketing',
    tipo: '2s_marketing',
    cnpj: '12.345.678/0002-02',
    cor_primaria: '#DC3545',
    cor_secundaria: '#FFC107',
    status: 'ativa' as const
  },
  {
    id: '3',
    nome: '2S Produções e Eventos',
    tipo: 'producoes_eventos',
    cnpj: '12.345.678/0003-03',
    cor_primaria: '#17A2B8',
    cor_secundaria: '#6610F2',
    status: 'ativa' as const
  },
  {
    id: '4',
    nome: 'Grupo 2S (Holding)',
    tipo: 'holding',
    cnpj: '12.345.678/0004-04',
    cor_primaria: '#6C757D',
    cor_secundaria: '#343A40',
    status: 'ativa' as const
  },
];

export const hasPermission = (userPerfil: string, requiredPermissions: string[]) => {
  const hierarchyMap: Record<string, number> = {
    admin: 5,
    diretoria: 4,
    gerente: 3,
    rh: 2,
    operacional: 1,
  };
  
  const userLevel = hierarchyMap[userPerfil] || 0;
  return requiredPermissions.some(perm => hierarchyMap[perm] <= userLevel);
};