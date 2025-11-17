import { useState } from 'react';
import { MOCK_CARGOS } from '../../data/mockData';
import { DataTable } from '../shared/DataTable';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Plus, Briefcase } from 'lucide-react';
import type { Cargo } from '../../types';

export default function Cargos() {
  const [cargos] = useState<Cargo[]>(MOCK_CARGOS || []);

  const columns = [
    { 
      key: 'nome', 
      label: 'Cargo',
      sortable: true 
    },
    { 
      key: 'descricao', 
      label: 'Descrição',
      sortable: false 
    },
    { 
      key: 'nivel', 
      label: 'Nível',
      sortable: true 
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-gray-900 mb-2">Cargos</h1>
            <p className="text-gray-600">Gerencie os cargos da empresa</p>
          </div>
          <Button className="bg-[#1F4788] hover:bg-blue-800">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cargo
          </Button>
        </div>

        <Card className="p-6">
          {cargos.length > 0 ? (
            <DataTable
              data={cargos}
              columns={columns}
              searchable
              searchPlaceholder="Buscar cargos..."
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-gray-900 mb-2">Nenhum cargo cadastrado</h3>
              <p className="text-gray-600 mb-6">
                Comece criando o primeiro cargo da empresa
              </p>
              <Button className="bg-[#1F4788] hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Cargo
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}