import { EmpresasDashboard } from '../EmpresasDashboard';
import { MOCK_EMPRESAS, MOCK_CONTRATOS, MOCK_COLABORADORES, MOCK_MATERIAIS } from '../../data/mockData';

export default function Empresas() {
  return (
    <EmpresasDashboard 
      empresas={MOCK_EMPRESAS}
      contratos={MOCK_CONTRATOS}
      colaboradores={MOCK_COLABORADORES}
      materiais={MOCK_MATERIAIS}
    />
  );
}