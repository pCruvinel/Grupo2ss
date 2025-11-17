import { useState } from 'react';
import { MateriaisDashboard } from '../MateriaisDashboard';
import { MOCK_MATERIAIS, MOCK_EMPRESAS } from '../../data/mockData';

export default function Materiais() {
  const [materiais, setMateriais] = useState(MOCK_MATERIAIS || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);
  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setMateriais([...MOCK_MATERIAIS]);
  };

  return (
    <MateriaisDashboard
      materiais={materiais}
      empresas={empresas}
      empresaAtual={empresaAtual}
      onUpdate={handleUpdate}
    />
  );
}
