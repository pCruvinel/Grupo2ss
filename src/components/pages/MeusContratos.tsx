import { Card } from '../ui/card';
import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export default function MeusContratos() {
  const contratos = [
    {
      id: '1',
      numero: 'CTR-2024-001',
      tipo: 'Locação de Equipamentos',
      valor: 15000.00,
      status: 'ativo',
      dataInicio: '15/01/2024',
      dataFim: '15/12/2024'
    },
    {
      id: '2',
      numero: 'CTR-2023-089',
      tipo: 'Serviços de Marketing',
      valor: 8500.00,
      status: 'concluido',
      dataInicio: '10/05/2023',
      dataFim: '10/11/2023'
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Meus Contratos</h1>
        <p className="text-gray-600">Acompanhe seus contratos e serviços</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Contratos Ativos</p>
              <p className="text-2xl text-gray-900">1</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Contratos</p>
              <p className="text-2xl text-gray-900">2</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-2xl text-gray-900">R$ 23.5k</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Lista de Contratos</h3>
        <div className="space-y-4">
          {contratos.map((contrato) => (
            <div key={contrato.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-900">{contrato.numero}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      contrato.status === 'ativo' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {contrato.status === 'ativo' ? 'Ativo' : 'Concluído'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{contrato.tipo}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Início: {contrato.dataInicio}</span>
                    <span>Término: {contrato.dataFim}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900">
                    {contrato.valor.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}