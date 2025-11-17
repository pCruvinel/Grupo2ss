import { useState } from 'react';
import { VeiculosDashboard } from '../VeiculosDashboard';
import { MOCK_VEICULOS, MOCK_EMPRESAS } from '../../data/mockData';

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState(MOCK_VEICULOS || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setVeiculos([...MOCK_VEICULOS]);
  };

  return (
    <VeiculosDashboard
      veiculos={veiculos}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}
