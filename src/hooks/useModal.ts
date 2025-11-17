import { useState, useCallback } from 'react';
import type { UseModalReturn } from '../types';

/**
 * Hook reutilizável para gerenciar estado de modais
 * Elimina useState duplicado em todos os dashboards
 * 
 * @example
 * const novoModal = useModal();
 * const editarModal = useModal();
 * 
 * <Button onClick={novoModal.open}>Novo</Button>
 * <Modal isOpen={novoModal.isOpen} onClose={novoModal.close} />
 */
export function useModal(initialState = false): UseModalReturn {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Hook para gerenciar múltiplos modais
 * 
 * @example
 * const modals = useModals(['novo', 'editar', 'excluir']);
 * 
 * <Button onClick={() => modals.open('novo')}>Novo</Button>
 * <Modal isOpen={modals.isOpen('novo')} onClose={() => modals.close('novo')} />
 */
export function useModals<T extends string>(modalNames: T[]) {
  const [openModals, setOpenModals] = useState<Set<T>>(new Set());

  const open = useCallback((modalName: T) => {
    setOpenModals(prev => new Set(prev).add(modalName));
  }, []);

  const close = useCallback((modalName: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(modalName);
      return newSet;
    });
  }, []);

  const toggle = useCallback((modalName: T) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(modalName)) {
        newSet.delete(modalName);
      } else {
        newSet.add(modalName);
      }
      return newSet;
    });
  }, []);

  const isOpen = useCallback((modalName: T) => {
    return openModals.has(modalName);
  }, [openModals]);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  return {
    open,
    close,
    toggle,
    isOpen,
    closeAll,
  };
}