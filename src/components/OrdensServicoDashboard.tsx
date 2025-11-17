import { useState } from 'react';
import { Plus, Edit, Search, List, Grid, FileText, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { NovaOrdemServicoModal } from './NovaOrdemServicoModal';
import { Pagination } from './shared/Pagination';
import { ExportButton } from './shared/ExportButton';

interface OrdemServico {
  id: string;
  numero: string;
  cliente_nome: string;
  contrato_id?: string;
  empresa_id: string;
  tipo?: string;
  descricao: string;
  data_inicio: string;
  data_fim: string;
  status: 'aberta' | 'em_andamento' | 'concluida' | 'cancelada' | 'planejada';
  materiais_vinculados?: Array<{ material_id: string; quantidade: number; tipo: string }>;
  responsavel: string;
  valor?: number;
  valor_total?: number;
}

interface OrdensServicoDashboardProps {
  ordens: OrdemServico[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
  clientes?: any[];
  materiais?: any[];
}

export function OrdensServicoDashboard({ ordens, empresas, empresaAtual, onUpdate, clientes = [], materiais = [] }: OrdensServicoDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const ordensFiltradas = ordens.filter(o => {
    const matchSearch = o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       o.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Paginação
  const totalPages = Math.ceil(ordensFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const ordensExibidas = ordensFiltradas.slice(startIndex, endIndex);

  const handleSaveOrdem = (novaOS: any) => {
    console.log('Nova OS criada:', novaOS);
    onUpdate?.();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberta': return 'default';
      case 'em_andamento': return 'warning';
      case 'concluida': return 'success';
      case 'cancelada': return 'destructive';
      case 'planejada': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'aberta': return 'Aberta';
      case 'em_andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      case 'planejada': return 'Planejada';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Ordens de Serviço</h1>
            <p className="text-gray-600">Gestão de ordens de serviço e operações</p>
            <Badge className="mt-2 bg-red-100 text-red-700">RN-006: Bloqueio Automático de Materiais</Badge>
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
            <ExportButton
              data={ordensFiltradas}
              filename="ordens_servico"
              type="ordens"
              formats={['excel', 'csv']}
            />
            <Button className="bg-[#1F4788] hover:bg-blue-800" onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova OS
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="todos">Todos os Status</option>
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
            <option value="planejada">Planejada</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Materiais Vinculados</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensExibidas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma ordem de serviço encontrada
                  </TableCell>
                </TableRow>
              ) : (
                ordensExibidas.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell className="text-gray-900">{os.numero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{os.cliente_nome}</p>
                        {os.contrato_id && (
                          <p className="text-xs text-gray-500">Contrato vinculado</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{os.tipo}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(os.data_inicio).toLocaleDateString('pt-BR')} - {new Date(os.data_fim).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(os.status) as any}>
                        {getStatusLabel(os.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {os.materiais_vinculados?.length > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          <Lock className="w-3 h-3 mr-1" />
                          {os.materiais_vinculados.length} item(ns)
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">Nenhum</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{os.responsavel}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {ordensExibidas.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma ordem de serviço encontrada</p>
            </Card>
          ) : (
            ordensExibidas.map((os) => (
              <Card key={os.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg text-gray-900">{os.numero}</h3>
                      <Badge variant={getStatusColor(os.status) as any}>
                        {getStatusLabel(os.status)}
                      </Badge>
                      {os.materiais_vinculados?.length > 0 && (
                        <Badge variant="outline">
                          <Lock className="w-3 h-3 mr-1" />
                          {os.materiais_vinculados.length} bloqueados (RN-006)
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{os.cliente_nome} • {os.tipo}</p>
                    <p className="text-sm text-gray-500 mb-2">{os.descricao}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(os.data_inicio).toLocaleDateString('pt-BR')} - {new Date(os.data_fim).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Responsável: {os.responsavel}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </Card>
            ))
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      <NovaOrdemServicoModal
        open={showModal}
        onClose={() => setShowModal(false)}
        empresas={empresas}
        clientes={clientes}
        materiais={materiais}
        onSave={handleSaveOrdem}
      />
    </div>
  );
}