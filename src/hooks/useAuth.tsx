'use client';

/**
 * Hook de autenticação simplificado para integração com o EmpresaContext
 */

import { useState, useEffect } from 'react';

interface User {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  empresa_id?: string;
  empresas_ids?: string[];
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    console.log('🔄 useAuth: loadUser chamado');
    
    // Carregar usuário do localStorage
    const savedUser = localStorage.getItem('mock_user');
    console.log('💾 useAuth: localStorage mock_user', savedUser ? 'encontrado' : 'não encontrado');
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('📦 useAuth: Usuário parseado', parsedUser);
        
        // Normalizar estrutura do usuário para o Context
        const normalizedUser: User = {
          id: parsedUser.id || '1',
          nome: parsedUser.nome || '',
          email: parsedUser.email || '',
          perfil: parsedUser.perfil || 'operacional',
          empresa_id: parsedUser.empresa_id || 'grupo-2s',
          empresas_ids: parsedUser.empresas_ids || ['grupo-2s'],
        };

        console.log('✅ useAuth: Usuário normalizado', normalizedUser);
        setUser(normalizedUser);
      } catch (e) {
        console.error('❌ useAuth: Erro ao carregar usuário:', e);
        setUser(null);
      }
    } else {
      // Usuário padrão (sem login) - para preview apenas
      console.log('⚠️ useAuth: Sem usuário salvo, usando padrão');
      setUser({
        id: '1',
        nome: 'Visitante',
        email: 'visitante@grupo2s.com',
        perfil: 'operacional',
        empresa_id: 'grupo-2s',
        empresas_ids: ['grupo-2s'],
      });
    }
  };

  useEffect(() => {
    loadUser();
    setLoading(false);

    // Escutar evento de login para atualizar
    const handleLoginEvent = () => {
      loadUser();
    };

    window.addEventListener('user-login', handleLoginEvent);

    return () => {
      window.removeEventListener('user-login', handleLoginEvent);
    };
  }, []);

  return { user, loading };
}