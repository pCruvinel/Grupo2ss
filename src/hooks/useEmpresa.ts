'use client';

import { useEffect, useState } from 'react';
import { createClient } from '../lib/figma-make-helpers';
import { useAuth } from './useAuth';

interface Empresa {
  id: string;
  nome: string;
  tipo: string;
  status?: string;
}

export function useEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchEmpresa = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Se é admin, busca todas as empresas
        if (user.perfil === 'admin') {
          const { data } = await supabase
            .from('empresas')
            .select('*')
            .eq('status', 'ativa')
            .order('nome');

          if (data) {
            setEmpresas(data);
            // Define primeira empresa como padrão
            if (data.length > 0) {
              setEmpresa(data[0]);
            }
          }
        } else if (user.empresa_id) {
          // Busca empresa do usuário
          const { data } = await supabase
            .from('empresas')
            .select('*')
            .eq('id', user.empresa_id)
            .single();

          if (data) {
            setEmpresa(data);
            setEmpresas([data]);
          }
        }
      } catch (error) {
        console.error('Error fetching empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresa();
  }, [user, supabase]);

  const setEmpresaAtual = (empresaId: number) => {
    const empresaEncontrada = empresas.find((e) => e.id === empresaId);
    if (empresaEncontrada) {
      setEmpresa(empresaEncontrada);
    }
  };

  return { empresa, empresas, loading, setEmpresaAtual };
}