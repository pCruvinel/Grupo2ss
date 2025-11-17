import { useState } from 'react';
import { Plus, Edit, Search, List, Grid, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface RegistroPonto {
  id: string;
  colaborador_id: string;
  colaborador_nome: string;
  data: string;
  entrada_manha: string;
  saida_almoco: string;
  entrada_tarde: string;
  saida_tarde: string;
  horas_trabalhadas: number;
  horas_extras: number;
  observacao: string;
  editado_por: string | null;
}

interface PontoDashboardProps {
  registros: RegistroPonto[];
  perfilUsuario: string;
}

export function PontoDashboard({ registros, perfilUsuario }: PontoDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  const podeEditar = perfilUsuario === 'admin' || perfilUsuario === 'rh';

  const registrosFiltrados = registros.filter(r =>
    r.colaborador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.data.includes(searchTerm)
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Controle de Ponto</h1>
            <p className="text-gray-600">RN-004: Controle Centralizado - Apenas RH/Admin pode editar</p>
            {podeEditar ? (
              <Badge className="mt-2 bg-blue-100 text-blue-700">✅ Você tem permissão para editar</Badge>
            ) : (
              <Badge className="mt-2 bg-gray-100 text-gray-700">👁️ Apenas visualização</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
            {podeEditar && (
              <Button className="bg-[#1F4788] hover:bg-blue-800">
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
              </Button>
            )}
          </div>
        </div>

        <Input
          placeholder="Buscar por colaborador ou data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Entrada Manhã</TableHead>
                <TableHead>Saída Almoço</TableHead>
                <TableHead>Entrada Tarde</TableHead>
                <TableHead>Saída Tarde</TableHead>
                <TableHead>Horas Trabalhadas</TableHead>
                <TableHead>Horas Extras</TableHead>
                <TableHead>Editado Por (RN-004)</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrosFiltrados.map((registro) => (
                <TableRow key={registro.id}>
                  <TableCell className="text-sm text-gray-900">
                    {new Date(registro.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="text-gray-900">{registro.colaborador_nome}</TableCell>
                  <TableCell className="text-sm text-gray-600">{registro.entrada_manha}</TableCell>
                  <TableCell className="text-sm text-gray-600">{registro.saida_almoco}</TableCell>
                  <TableCell className="text-sm text-gray-600">{registro.entrada_tarde}</TableCell>
                  <TableCell className="text-sm text-gray-600">{registro.saida_tarde}</TableCell>
                  <TableCell>
                    <Badge variant="default">{registro.horas_trabalhadas}h</Badge>
                  </TableCell>
                  <TableCell>
                    {registro.horas_extras > 0 ? (
                      <Badge variant="warning" className="bg-orange-100 text-orange-700">
                        +{registro.horas_extras}h
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {registro.editado_por ? (
                      <Badge variant="outline" className="text-xs bg-blue-50">
                        {registro.editado_por}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {podeEditar && (
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrosFiltrados.map((registro) => (
            <Card key={registro.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg text-gray-900">{registro.colaborador_nome}</h3>
                    <Badge>{registro.horas_trabalhadas}h</Badge>
                    {registro.horas_extras > 0 && (
                      <Badge variant="warning" className="bg-orange-100 text-orange-700">
                        +{registro.horas_extras}h extras
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {new Date(registro.data).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Entrada Manhã</p>
                      <p className="text-gray-900">{registro.entrada_manha}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Saída Almoço</p>
                      <p className="text-gray-900">{registro.saida_almoco}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Entrada Tarde</p>
                      <p className="text-gray-900">{registro.entrada_tarde}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Saída Tarde</p>
                      <p className="text-gray-900">{registro.saida_tarde}</p>
                    </div>
                  </div>
                  {registro.observacao && (
                    <p className="text-sm text-gray-600 mt-3">Obs: {registro.observacao}</p>
                  )}
                  {registro.editado_por && (
                    <p className="text-xs text-blue-600 mt-2">
                      ✏️ Editado por: {registro.editado_por} (RN-004)
                    </p>
                  )}
                </div>
                {podeEditar && (
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}