'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE DESPESAS - RN-002                                  ║
 * ║  Rateio automático entre empresas do Grupo 2S                 ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import { 
  createClient, 
  useEmpresa, 
  LoadingSpinner 
} from '../../../lib/figma-make-helpers';
import { DespesasDashboard } from '../../../components/DespesasDashboard';
import { toast } from 'sonner@2.0.3';

export default function DespesasPage() {
  const { empresa } = useEmpresa();
  const [despesas, setDespesas] = useState<any[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [empresa]);

  const fetchData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // Buscar despesas
      const { data: despesasData, error: despesasError } = await supabase
        .from('despesas')
        .select('*, fornecedor:fornecedores(*)')
        .eq('empresa_id', empresa.id)
        .order('data_vencimento', { ascending: false });

      if (despesasError) throw despesasError;

      // Buscar todas as empresas (para rateio)
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('*')
        .eq('status', 'ativo')
        .order('nome');

      if (despesasData) {
        // Mapear dados para o formato do componente
        const despesasMapeadas = despesasData.map(d => ({
          id: d.id,
          descricao: d.descricao,
          categoria: d.categoria,
          valor_total: d.valor_total || d.valor,
          data: d.data_vencimento,
          empresa_id: d.empresa_id,
          tipo_rateio: d.tipo_rateio || 'individual',
          rateio: d.rateio,
          valores_rateados: d.valores_rateados,
          status: d.status,
          tipo_despesa: d.tipo_despesa || 'variavel',
          recorrencia: d.recorrencia,
          fornecedor: d.fornecedor,
          data_vencimento: d.data_vencimento,
          data_pagamento: d.data_pagamento,
          forma_pagamento: d.forma_pagamento,
          observacoes: d.observacoes,
        }));
        setDespesas(despesasMapeadas);
      }
      
      if (empresasData) setEmpresas(empresasData);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      toast.error('Erro ao carregar despesas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DespesasDashboard
      despesas={despesas}
      empresas={empresas}
      empresaAtual={empresa?.id || ''}
      onUpdate={fetchData}
    />
  );
}