/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE DESPESAS - RN-002                                  ║
 * ║  Rateio automático entre empresas do Grupo 2S                 ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { DespesasDashboard } from '../DespesasDashboard';
import { MOCK_DESPESAS, MOCK_EMPRESAS } from '../../data/mockData';

export default function Despesas() {
  const [despesas, setDespesas] = useState(MOCK_DESPESAS || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setDespesas([...MOCK_DESPESAS]);
  };

  return (
    <DespesasDashboard
      despesas={despesas}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}
