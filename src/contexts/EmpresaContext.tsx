'use client';

/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  CONTEXT DE EMPRESA - MULTI-TENANCY                            ║
 * ║  Gerencia a empresa ativa e aplica temas dinâmicos            ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Definição de temas por empresa
export const EMPRESA_THEMES = {
  'grupo-2s': {
    id: 'grupo-2s',
    nome: 'Grupo 2S',
    tipo: 'holding',
    primary: '#F97316', // Laranja
    primaryForeground: '#FFFFFF',
    secondary: '#FB923C',
    logo: '/logos/grupo-2s.svg',
    className: 'theme-grupo-2s',
    acesso: 'master', // Acesso a todas as empresas
  },
  '2s-locacoes': {
    id: '2s-locacoes',
    nome: '2S Locações',
    tipo: 'filial',
    primary: '#3B82F6', // Azul
    primaryForeground: '#FFFFFF',
    secondary: '#60A5FA',
    logo: '/logos/2s-locacoes.svg',
    className: 'theme-2s-locacoes',
    acesso: 'restrito',
  },
  '2s-marketing': {
    id: '2s-marketing',
    nome: '2S Marketing',
    tipo: 'filial',
    primary: '#3B82F6', // Azul
    primaryForeground: '#FFFFFF',
    secondary: '#8B5CF6', // Ametista
    logo: '/logos/2s-marketing.svg',
    className: 'theme-2s-marketing',
    acesso: 'restrito',
  },
  '2s-producoes': {
    id: '2s-producoes',
    nome: '2S Produções e Eventos',
    tipo: 'filial',
    primary: '#7E22CE', // Roxo
    primaryForeground: '#FFFFFF',
    secondary: '#3B82F6', // Azul
    logo: '/logos/2s-producoes.svg',
    className: 'theme-2s-producoes',
    acesso: 'restrito',
  },
};

export interface Empresa {
  id: string;
  nome: string;
  tipo: 'holding' | 'filial';
  primary: string;
  primaryForeground: string;
  secondary: string;
  logo: string;
  className: string;
  acesso: 'master' | 'restrito';
}

interface EmpresaContextType {
  empresaAtiva: Empresa | null;
  empresasDisponiveis: Empresa[];
  setEmpresaAtiva: (empresaId: string) => void;
  isMasterAccess: boolean;
  loading: boolean;
}

const EmpresaContext = createContext<EmpresaContextType | undefined>(undefined);

interface EmpresaProviderProps {
  children: ReactNode;
}

export function EmpresaProvider({ children }: EmpresaProviderProps) {
  const { user } = useAuth();
  const [empresaAtiva, setEmpresaAtivaState] = useState<Empresa | null>(null);
  const [empresasDisponiveis, setEmpresasDisponiveis] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 EmpresaContext: useEffect disparado', { user });
    
    if (!user) {
      console.log('⚠️ EmpresaContext: Usuário não encontrado');
      setLoading(false);
      return;
    }

    console.log('👤 EmpresaContext: Usuário encontrado', {
      nome: user.nome,
      empresa_id: user.empresa_id,
      empresas_ids: user.empresas_ids,
      perfil: user.perfil
    });

    // Determinar empresas disponíveis baseado no perfil do usuário
    const empresas: Empresa[] = [];

    // Se user.empresas_ids existe (array de IDs de empresas que o usuário tem acesso)
    const empresasIds = user.empresas_ids || [user.empresa_id];
    console.log('📋 EmpresaContext: IDs de empresas', empresasIds);

    empresasIds.forEach((empresaId: string) => {
      const tema = EMPRESA_THEMES[empresaId as keyof typeof EMPRESA_THEMES];
      if (tema) {
        empresas.push(tema);
        console.log('✅ EmpresaContext: Empresa adicionada', tema.nome);
      } else {
        console.log('❌ EmpresaContext: Tema não encontrado para ID', empresaId);
      }
    });

    // Se não encontrou empresas válidas, usar empresa_id do usuário
    if (empresas.length === 0 && user.empresa_id) {
      const temaDefault = EMPRESA_THEMES[user.empresa_id as keyof typeof EMPRESA_THEMES];
      if (temaDefault) {
        empresas.push(temaDefault);
        console.log('✅ EmpresaContext: Empresa padrão adicionada', temaDefault.nome);
      }
    }

    // Se é Grupo 2S (holding), dar acesso a todas as empresas
    const isGrupo2S = user.empresa_id === 'grupo-2s' || user.perfil === 'admin' || user.perfil === 'admin_grupo';
    console.log('👑 EmpresaContext: É admin?', isGrupo2S);
    
    if (isGrupo2S) {
      // Adicionar todas as empresas
      Object.values(EMPRESA_THEMES).forEach(tema => {
        if (!empresas.find(e => e.id === tema.id)) {
          empresas.push(tema);
          console.log('✅ EmpresaContext: Empresa admin adicionada', tema.nome);
        }
      });
    }

    console.log('📊 EmpresaContext: Total de empresas disponíveis', empresas.length);
    setEmpresasDisponiveis(empresas);

    // Definir empresa ativa
    // Verificar se há empresa salva no localStorage
    const empresaSalva = typeof window !== 'undefined' 
      ? localStorage.getItem('empresaAtiva')
      : null;

    console.log('💾 EmpresaContext: Empresa salva no localStorage', empresaSalva);

    if (empresaSalva && empresas.find(e => e.id === empresaSalva)) {
      const empresa = empresas.find(e => e.id === empresaSalva);
      if (empresa) {
        console.log('✅ EmpresaContext: Definindo empresa salva', empresa.nome);
        setEmpresaAtivaState(empresa);
        applyTheme(empresa);
      }
    } else if (empresas.length > 0) {
      // Definir primeira empresa como padrão
      console.log('✅ EmpresaContext: Definindo primeira empresa', empresas[0].nome);
      setEmpresaAtivaState(empresas[0]);
      applyTheme(empresas[0]);
    }

    setLoading(false);
    console.log('✅ EmpresaContext: Inicialização completa');
  }, [user]);

  const applyTheme = (empresa: Empresa) => {
    if (typeof window === 'undefined') return;

    // Remover classes de tema anteriores
    document.documentElement.classList.remove(
      'theme-grupo-2s',
      'theme-2s-locacoes',
      'theme-2s-marketing',
      'theme-2s-producoes'
    );

    // Adicionar classe do novo tema
    document.documentElement.classList.add(empresa.className);

    // Atualizar CSS variables
    document.documentElement.style.setProperty('--color-primary', empresa.primary);
    document.documentElement.style.setProperty('--color-primary-foreground', empresa.primaryForeground);
    document.documentElement.style.setProperty('--color-secondary', empresa.secondary);

    // Salvar no localStorage
    localStorage.setItem('empresaAtiva', empresa.id);
  };

  const setEmpresaAtiva = (empresaId: string) => {
    const empresa = empresasDisponiveis.find(e => e.id === empresaId);
    if (empresa) {
      setEmpresaAtivaState(empresa);
      applyTheme(empresa);
    }
  };

  const isMasterAccess = empresaAtiva?.acesso === 'master';

  const value = {
    empresaAtiva,
    empresasDisponiveis,
    setEmpresaAtiva,
    isMasterAccess,
    loading,
  };

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresaContext() {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    throw new Error('useEmpresaContext must be used within an EmpresaProvider');
  }
  return context;
}