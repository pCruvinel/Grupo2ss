import { useState } from 'react';
import { PontoDashboard } from '../PontoDashboard';
import { MOCK_REGISTROS_PONTO_30_DIAS } from '../../data/mockPontoData';

export default function Ponto() {
  const [registros, setRegistros] = useState(MOCK_REGISTROS_PONTO_30_DIAS || []);
  const perfilUsuario = 'gestor'; // TODO: Obter do contexto de autenticação

  const handleUpdate = () => {
    // Recarregar dados após atualização
    setRegistros([...MOCK_REGISTROS_PONTO_30_DIAS]);
  };

  return (
    <PontoDashboard
      registros={registros}
      perfilUsuario={perfilUsuario}
    />
  );
}