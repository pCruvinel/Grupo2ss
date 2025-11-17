import { useState } from 'react';
import { ColaboradoresDashboard } from '../ColaboradoresDashboard';
import { MOCK_COLABORADORES, MOCK_EMPRESAS } from '../../data/mockData';

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState(MOCK_COLABORADORES || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setColaboradores([...MOCK_COLABORADORES]);
  };

  return (
    <ColaboradoresDashboard
      colaboradores={colaboradores}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}
