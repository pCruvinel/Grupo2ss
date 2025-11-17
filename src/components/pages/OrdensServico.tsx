import { useState } from 'react';
import { OrdensServicoDashboard } from '../OrdensServicoDashboard';
import { MOCK_ORDENS_SERVICO, MOCK_EMPRESAS } from '../../data/mockData';

export default function OrdensServico() {
  const [ordens, setOrdens] = useState(MOCK_ORDENS_SERVICO || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setOrdens([...MOCK_ORDENS_SERVICO]);
  };

  return (
    <OrdensServicoDashboard
      ordens={ordens}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}
