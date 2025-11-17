import { useState } from 'react';
import { Plus, Edit, Search, List, Grid, Truck, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  ano: number;
  tipo: string;
  empresa_id: string;
  status: 'ativo' | 'manutencao' | 'inativo';
  km_atual: number;
  gps_ativo: boolean;
  localizacao_atual?: { lat: number; lng: number; endereco: string };
  ultimo_tracking?: string;
  motorista_atual?: string | null;
}

interface VeiculosDashboardProps {
  veiculos: Veiculo[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
}

export function VeiculosDashboard({ veiculos, empresas, empresaAtual }: VeiculosDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  const veiculosFiltrados = veiculos.filter(v =>
    v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Veículos e Rastreamento</h1>
            <p className="text-gray-600">Gestão de frota com GPS</p>
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
            <Button className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>

        <Input
          placeholder="Buscar por placa ou modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>KM Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GPS</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Motorista</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {veiculosFiltrados.map((veiculo) => (
                <TableRow key={veiculo.id}>
                  <TableCell className="text-gray-900">{veiculo.placa}</TableCell>
                  <TableCell className="text-gray-900">{veiculo.modelo}</TableCell>
                  <TableCell className="text-sm text-gray-600">{veiculo.ano}</TableCell>
                  <TableCell className="text-sm text-gray-600">{veiculo.tipo}</TableCell>
                  <TableCell className="text-sm text-gray-600">{veiculo.km_atual.toLocaleString('pt-BR')} km</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        veiculo.status === 'ativo' ? 'success' :
                        veiculo.status === 'manutencao' ? 'warning' : 'secondary' as any
                      }
                    >
                      {veiculo.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {veiculo.gps_ativo ? (
                      <Badge variant="success" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {veiculo.localizacao_atual?.endereco || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {veiculo.motorista_atual || '-'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-4">
          {veiculosFiltrados.map((veiculo) => (
            <Card key={veiculo.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg text-gray-900">{veiculo.placa}</h3>
                    <Badge variant={veiculo.status === 'ativo' ? 'success' : 'warning' as any}>
                      {veiculo.status}
                    </Badge>
                    {veiculo.gps_ativo && (
                      <Badge variant="success">
                        <MapPin className="w-3 h-3 mr-1" />
                        GPS Ativo
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{veiculo.modelo} • {veiculo.ano} • {veiculo.tipo}</p>
                  <p className="text-sm text-gray-500">KM: {veiculo.km_atual.toLocaleString('pt-BR')}</p>
                  {veiculo.localizacao_atual && (
                    <p className="text-xs text-gray-500 mt-2">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {veiculo.localizacao_atual.endereco}
                    </p>
                  )}
                  {veiculo.motorista_atual && (
                    <p className="text-xs text-gray-500 mt-1">Motorista: {veiculo.motorista_atual}</p>
                  )}
                </div>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}