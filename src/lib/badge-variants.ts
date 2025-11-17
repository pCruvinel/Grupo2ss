/**
 * Helper seguro para variantes de Badge
 * Elimina necessidade de 'as any' em componentes
 */

import type {
  StatusContrato,
  StatusDespesa,
  StatusOrdemServico,
  StatusVeiculo,
  StatusColaborador,
  StatusMaterial,
  StatusPagamento,
  TipoDespesa,
  StatusGenerico,
  VarianteBadge
} from '../types';

/**
 * Mapeia status de contrato para variante de badge
 */
export function getContratoVariant(status: StatusContrato): VarianteBadge {
  const map: Record<StatusContrato, VarianteBadge> = {
    'ativo': 'success',
    'concluido': 'default',
    'cancelado': 'error',
    'suspenso': 'warning',
    'finalizado': 'info',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status de despesa para variante de badge
 */
export function getDespesaVariant(status: StatusDespesa): VarianteBadge {
  const map: Record<StatusDespesa, VarianteBadge> = {
    'pendente': 'warning',
    'pago': 'success',
    'cancelado': 'error',
    'aprovado': 'info',
    'rejeitado': 'error',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status de ordem de serviço para variante de badge
 */
export function getOrdemServicoVariant(status: StatusOrdemServico): VarianteBadge {
  const map: Record<StatusOrdemServico, VarianteBadge> = {
    'criada': 'default',
    'em_andamento': 'info',
    'concluida': 'success',
    'cancelada': 'error',
    'aberta': 'warning',
    'pausada': 'warning',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status de veículo para variante de badge
 */
export function getVeiculoVariant(status: StatusVeiculo): VarianteBadge {
  const map: Record<StatusVeiculo, VarianteBadge> = {
    'disponivel': 'success',
    'em_uso': 'info',
    'manutencao': 'warning',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status de colaborador para variante de badge
 */
export function getColaboradorVariant(status: StatusColaborador): VarianteBadge {
  const map: Record<StatusColaborador, VarianteBadge> = {
    'ativo': 'success',
    'inativo': 'default',
    'ferias': 'info',
    'licenca': 'warning',
    'afastado': 'warning',
    'demitido': 'error',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status de material para variante de badge
 */
export function getMaterialVariant(status: StatusMaterial): VarianteBadge {
  const map: Record<StatusMaterial, VarianteBadge> = {
    'ativo': 'success',
    'inativo': 'default',
    'manutencao': 'warning',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status de pagamento para variante de badge
 */
export function getPagamentoVariant(status: StatusPagamento): VarianteBadge {
  const map: Record<StatusPagamento, VarianteBadge> = {
    'pendente': 'warning',
    'pago': 'success',
    'cancelado': 'error',
    'aprovado': 'info',
    'rejeitado': 'error',
  };
  return map[status] || 'default';
}

/**
 * Mapeia status genérico para variante de badge
 */
export function getGenericoVariant(status: StatusGenerico): VarianteBadge {
  const map: Record<StatusGenerico, VarianteBadge> = {
    'ativo': 'success',
    'inativo': 'default',
  };
  return map[status] || 'default';
}

/**
 * Mapeia qualquer status para cor de texto legível
 */
export function getStatusTextColor(variant: VarianteBadge): string {
  const map: Record<VarianteBadge, string> = {
    'default': 'text-gray-700',
    'success': 'text-green-700',
    'error': 'text-red-700',
    'warning': 'text-yellow-700',
    'info': 'text-blue-700',
  };
  return map[variant] || 'text-gray-700';
}

/**
 * Mapeia qualquer status para cor de fundo
 */
export function getStatusBgColor(variant: VarianteBadge): string {
  const map: Record<VarianteBadge, string> = {
    'default': 'bg-gray-100',
    'success': 'bg-green-100',
    'error': 'bg-red-100',
    'warning': 'bg-yellow-100',
    'info': 'bg-blue-100',
  };
  return map[variant] || 'bg-gray-100';
}

/**
 * Helper genérico - detecta tipo de status automaticamente
 * e retorna a variante correta
 */
export function getStatusVariant(status: string): VarianteBadge {
  // Mapa de palavras-chave para variantes
  const keywords: Record<string, VarianteBadge> = {
    'ativo': 'success',
    'pago': 'success',
    'concluido': 'success',
    'concluída': 'success',
    'disponivel': 'success',
    'emitida': 'success',
    
    'pendente': 'warning',
    'atraso': 'warning',
    'manutencao': 'warning',
    'ferias': 'warning',
    'licenca': 'warning',
    'pausada': 'warning',
    'aberta': 'warning',
    
    'cancelado': 'error',
    'cancelada': 'error',
    'inadimplente': 'error',
    'falta': 'error',
    'rejeitado': 'error',
    'inutilizada': 'error',
    'demitido': 'error',
    'atrasado': 'error',
    
    'andamento': 'info',
    'em_andamento': 'info',
    'em_uso': 'info',
    'aprovado': 'info',
    'atestado': 'info',
    'falta_justificada': 'info',
    
    'inativo': 'default',
    'criada': 'default',
    'finalizado': 'default',
  };
  
  const normalized = status.toLowerCase().replace(/\s+/g, '_');
  return keywords[normalized] || 'default';
}