import { useState } from 'react';
import { UsuariosDashboard } from '../UsuariosDashboard';
import { MOCK_USUARIOS_SISTEMA, MOCK_EMPRESAS } from '../../data/mockData';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState(MOCK_USUARIOS_SISTEMA || []);
  const [empresas] = useState(MOCK_EMPRESAS || []);

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setUsuarios([...MOCK_USUARIOS_SISTEMA]);
  };

  return (
    <UsuariosDashboard
      usuarios={usuarios}
      empresas={empresas}
    />
  );
}
