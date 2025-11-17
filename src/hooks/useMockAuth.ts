'use client';

import { useState, useEffect } from 'react';

// Mock users inline para evitar imports
const MOCK_USERS = {
  admin: {
    id: '1',
    nome: 'Carlos Silva',
    email: 'admin@grupo2s.com.br',
    perfil: 'admin',
    empresa_id: '1',
    ativo: true,
  },
  financeiro: {
    id: '2',
    nome: 'Maria Santos',
    email: 'financeiro@grupo2s.com.br',
    perfil: 'financeiro',
    empresa_id: '1',
    ativo: true,
  },
  rh: {
    id: '3',
    nome: 'João Oliveira',
    email: 'rh@grupo2s.com.br',
    perfil: 'rh',
    empresa_id: '1',
    ativo: true,
  },
  operacional: {
    id: '4',
    nome: 'Ana Costa',
    email: 'operacional@grupo2s.com.br',
    perfil: 'operacional',
    empresa_id: '2',
    ativo: true,
  },
  cliente: {
    id: '5',
    nome: 'Pedro Almeida',
    email: 'cliente@exemplo.com.br',
    perfil: 'cliente',
    empresa_id: null,
    ativo: true,
  },
};

let CURRENT_USER: any = null;

export function useMockAuth() {
  const [user, setUser] = useState(CURRENT_USER);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar credenciais mockadas
    const foundUser = Object.values(MOCK_USERS).find(u => u.email === email);
    
    if (foundUser) {
      CURRENT_USER = foundUser;
      setUser(foundUser);
      
      // Salvar no localStorage para persistência
      if (typeof window !== 'undefined') {
        localStorage.setItem('mock_user', JSON.stringify(foundUser));
      }
      
      setLoading(false);
      return { success: true, user: foundUser };
    }
    
    setLoading(false);
    return { success: false, error: 'Credenciais inválidas' };
  };

  const logout = () => {
    CURRENT_USER = null;
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mock_user');
    }
  };

  const changeUser = (userKey: keyof typeof MOCK_USERS) => {
    const newUser = MOCK_USERS[userKey];
    CURRENT_USER = newUser;
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_user', JSON.stringify(newUser));
    }
  };

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('mock_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          CURRENT_USER = parsedUser;
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('mock_user');
        }
      }
    }
  }, []);

  return {
    user,
    loading,
    login,
    logout,
    changeUser,
    signOut: logout, // Alias para compatibilidade
  };
}