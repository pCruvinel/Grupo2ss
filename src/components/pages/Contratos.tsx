import { ContratosDashboard } from '../ContratosDashboard';
import { useState, useEffect } from 'react';
import { MOCK_CONTRATOS, MOCK_EMPRESAS, filterByEmpresa } from '../../data/mockData';

export default function Contratos() {
  const [contratos, setContratos] = useState(MOCK_CONTRATOS || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setContratos([...MOCK_CONTRATOS]);
  };

  return (
    <ContratosDashboard 
      contratos={contratos}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}