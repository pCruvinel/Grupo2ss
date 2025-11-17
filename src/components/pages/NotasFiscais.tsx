import { Card } from '../ui/card';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Button } from '../ui/button';

export default function NotasFiscais() {
  const notas = [
    {
      id: '1',
      numero: 'NF-2024-001234',
      contrato: 'CTR-2024-001',
      valor: 5000.00,
      dataEmissao: '15/04/2024',
      status: 'pago'
    },
    {
      id: '2',
      numero: 'NF-2024-001189',
      contrato: 'CTR-2024-001',
      valor: 5000.00,
      dataEmissao: '15/03/2024',
      status: 'pago'
    },
    {
      id: '3',
      numero: 'NF-2024-001098',
      contrato: 'CTR-2024-001',
      valor: 5000.00,
      dataEmissao: '15/02/2024',
      status: 'pago'
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Notas Fiscais</h1>
        <p className="text-gray-600">Consulte e baixe suas notas fiscais</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Notas</p>
              <p className="text-2xl text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponíveis</p>
              <p className="text-2xl text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Nota</p>
              <p className="text-2xl text-gray-900">15/04</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-gray-900 mb-4">Notas Fiscais Emitidas</h3>
        <div className="space-y-4">
          {notas.map((nota) => (
            <div key={nota.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{nota.numero}</span>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      Pago
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Contrato: {nota.contrato}</span>
                    <span>Emissão: {nota.dataEmissao}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-gray-900">
                      {nota.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}