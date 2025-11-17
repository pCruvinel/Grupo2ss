/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE PAGAMENTOS - RN-007                                ║
 * ║  Bônus e descontos separados no pagamento                     ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Plus,
  Search,
  Filter,
  Eye,
  Download,
  List,
  Grid,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { NovoPagamentoModal } from '../modals/NovoPagamentoModal';
import { toast } from 'sonner';
import { ExportButton } from '../shared/ExportButton';
import { Pagination } from '../shared/Pagination';

// Mock de dados de pagamentos
const MOCK_PAGAMENTOS = [
  {
    id: '1',
    colaborador_id: '1',
    colaborador_nome: 'João Silva',
    colaborador_cargo: 'Gerente de Operações',
    tipo: 'salario',
    valor_base: 8500,
    bonus: 1500,
    descontos: 850,
    valor_liquido: 9150,
    data_pagamento: '2024-11-05',
    mes_referencia: '2024-11',
    status: 'pago',
    forma_pagamento: 'transferencia',
    empresa_id: '1',
    observacoes: 'Bônus por cumprimento de meta trimestral'
  },
  {
    id: '2',
    colaborador_id: '2',
    colaborador_nome: 'Maria Santos',
    colaborador_cargo: 'Coordenadora RH',
    tipo: 'salario',
    valor_base: 6500,
    bonus: 0,
    descontos: 650,
    valor_liquido: 5850,
    data_pagamento: '2024-11-05',
    mes_referencia: '2024-11',
    status: 'pago',
    forma_pagamento: 'transferencia',
    empresa_id: '1',
    observacoes: ''
  },
  {
    id: '3',
    colaborador_id: '3',
    colaborador_nome: 'Carlos Oliveira',
    colaborador_cargo: 'Analista Financeiro',
    tipo: 'salario',
    valor_base: 5500,
    bonus: 800,
    descontos: 550,
    valor_liquido: 5750,
    data_pagamento: '2024-11-05',
    mes_referencia: '2024-11',
    status: 'pago',
    forma_pagamento: 'pix',
    empresa_id: '2',
    observacoes: 'Bônus por projeto especial concluído'
  },
  {
    id: '4',
    colaborador_id: '4',
    colaborador_nome: 'Ana Paula Costa',
    colaborador_cargo: 'Assistente Administrativo',
    tipo: 'salario',
    valor_base: 3800,
    bonus: 200,
    descontos: 380,
    valor_liquido: 3620,
    data_pagamento: '',
    mes_referencia: '2024-11',
    status: 'pendente',
    forma_pagamento: 'transferencia',
    empresa_id: '1',
    observacoes: ''
  },
  {
    id: '5',
    colaborador_id: '5',
    colaborador_nome: 'Pedro Henrique',
    colaborador_cargo: 'Técnico de Manutenção',
    tipo: 'salario',
    valor_base: 4200,
    bonus: 500,
    descontos: 420,
    valor_liquido: 4280,
    data_pagamento: '',
    mes_referencia: '2024-11',
    status: 'pendente',
    forma_pagamento: 'transferencia',
    empresa_id: '3',
    observacoes: 'Bônus por horas extras'
  },
  {
    id: '6',
    colaborador_id: '6',
    colaborador_nome: 'Juliana Ferreira',
    colaborador_cargo: 'Supervisora de Vendas',
    tipo: 'salario',
    valor_base: 7000,
    bonus: 2100,
    descontos: 700,
    valor_liquido: 8400,
    data_pagamento: '2024-11-05',
    mes_referencia: '2024-11',
    status: 'pago',
    forma_pagamento: 'transferencia',
    empresa_id: '2',
    observacoes: 'Bônus por atingimento de meta de vendas'
  },
  {
    id: '7',
    colaborador_id: '1',
    colaborador_nome: 'João Silva',
    colaborador_cargo: 'Gerente de Operações',
    tipo: 'adiantamento',
    valor_base: 0,
    bonus: 0,
    descontos: 0,
    valor_liquido: 2000,
    data_pagamento: '2024-11-15',
    mes_referencia: '2024-11',
    status: 'pago',
    forma_pagamento: 'pix',
    empresa_id: '1',
    observacoes: 'Adiantamento salarial'
  }
];

const MOCK_COLABORADORES = [
  { id: '1', nome: 'João Silva', cargo: 'Gerente de Operações', empresa_id: '1' },
  { id: '2', nome: 'Maria Santos', cargo: 'Coordenadora RH', empresa_id: '1' },
  { id: '3', nome: 'Carlos Oliveira', cargo: 'Analista Financeiro', empresa_id: '2' },
  { id: '4', nome: 'Ana Paula Costa', cargo: 'Assistente Administrativo', empresa_id: '1' },
  { id: '5', nome: 'Pedro Henrique', cargo: 'Técnico de Manutenção', empresa_id: '3' },
  { id: '6', nome: 'Juliana Ferreira', cargo: 'Supervisora de Vendas', empresa_id: '2' },
];

const MOCK_EMPRESAS = [
  { id: '1', nome: '2S Locações' },
  { id: '2', nome: '2S Marketing' },
  { id: '3', nome: 'Produções e Eventos' },
];

export default function Pagamentos() {
  const [pagamentos, setPagamentos] = useState(MOCK_PAGAMENTOS);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterMes, setFilterMes] = useState('2024-11');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const empresaAtual = '1'; // TODO: Obter do contexto de autenticação

  // Estatísticas
  const stats = useMemo(() => {
    const pagos = pagamentos.filter(p => p.status === 'pago');
    const pendentes = pagamentos.filter(p => p.status === 'pendente');
    const totalPago = pagos.reduce((sum, p) => sum + p.valor_liquido, 0);
    const totalPendente = pendentes.reduce((sum, p) => sum + p.valor_liquido, 0);
    
    return {
      totalPagos: pagos.length,
      totalPendentes: pendentes.length,
      valorPago: totalPago,
      valorPendente: totalPendente,
    };
  }, [pagamentos]);

  // Filtros
  const pagamentosFiltrados = useMemo(() => {
    return pagamentos.filter(pagamento => {
      const matchSearch = searchTerm === '' || 
        pagamento.colaborador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pagamento.colaborador_cargo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus === 'todos' || pagamento.status === filterStatus;
      const matchTipo = filterTipo === 'todos' || pagamento.tipo === filterTipo;
      const matchMes = filterMes === 'todos' || pagamento.mes_referencia === filterMes;
      
      return matchSearch && matchStatus && matchTipo && matchMes;
    });
  }, [pagamentos, searchTerm, filterStatus, filterTipo, filterMes]);

  // Paginação
  const totalPages = Math.ceil(pagamentosFiltrados.length / itemsPerPage);
  const paginatedData = pagamentosFiltrados.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSavePagamento = (novoPagamento: any) => {
    const colaborador = MOCK_COLABORADORES.find(c => c.id === novoPagamento.colaborador_id);
    
    const pagamento = {
      id: String(pagamentos.length + 1),
      ...novoPagamento,
      colaborador_nome: colaborador?.nome || '',
      colaborador_cargo: colaborador?.cargo || '',
      status: 'pendente',
    };

    setPagamentos([...pagamentos, pagamento]);
    setModalOpen(false);
    toast.success('Pagamento registrado com sucesso!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-700">Pago</Badge>;
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-700">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'salario':
        return <Badge variant="outline">Salário</Badge>;
      case 'bonus':
        return <Badge className="bg-green-100 text-green-700">Bônus</Badge>;
      case 'comissao':
        return <Badge className="bg-blue-100 text-blue-700">Comissão</Badge>;
      case 'adiantamento':
        return <Badge className="bg-purple-100 text-purple-700">Adiantamento</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Pagamentos</h1>
            <p className="text-gray-600">Controle de pagamentos de colaboradores</p>
            <Badge className="mt-2 bg-emerald-100 text-emerald-700">
              RN-007: Bônus e Descontos Separados
            </Badge>
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
              data={pagamentosFiltrados}
              filename="pagamentos"
              type="pagamentos"
              formats={['excel', 'csv']}
            />
            <Button onClick={() => setModalOpen(true)} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pagos</p>
              <p className="text-2xl text-gray-900">{stats.totalPagos}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.valorPago)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-2xl text-gray-900">{stats.totalPendentes}</p>
              <p className="text-xs text-gray-500">{formatCurrency(stats.valorPendente)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Pago</p>
              <p className="text-xl text-gray-900">{formatCurrency(stats.valorPago)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Geral</p>
              <p className="text-xl text-gray-900">
                {formatCurrency(stats.valorPago + stats.valorPendente)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Nome ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo</Label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="salario">Salário</SelectItem>
                <SelectItem value="bonus">Bônus</SelectItem>
                <SelectItem value="comissao">Comissão</SelectItem>
                <SelectItem value="adiantamento">Adiantamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Mês de Referência</Label>
            <Select value={filterMes} onValueChange={setFilterMes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="2024-11">Novembro 2024</SelectItem>
                <SelectItem value="2024-10">Outubro 2024</SelectItem>
                <SelectItem value="2024-09">Setembro 2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabela ou Cards */}
      {viewMode === 'table' ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor Base</TableHead>
                <TableHead>Bônus</TableHead>
                <TableHead>Descontos</TableHead>
                <TableHead>Valor Líquido</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((pagamento) => (
                <TableRow key={pagamento.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{pagamento.colaborador_nome}</p>
                      <p className="text-sm text-gray-500">{pagamento.colaborador_cargo}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getTipoBadge(pagamento.tipo)}</TableCell>
                  <TableCell className="font-mono">{formatCurrency(pagamento.valor_base)}</TableCell>
                  <TableCell className="font-mono text-green-600">
                    {pagamento.bonus > 0 ? `+${formatCurrency(pagamento.bonus)}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-red-600">
                    {pagamento.descontos > 0 ? `-${formatCurrency(pagamento.descontos)}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    {formatCurrency(pagamento.valor_liquido)}
                  </TableCell>
                  <TableCell>
                    {pagamento.data_pagamento 
                      ? new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </TableCell>
                  <TableCell>{getStatusBadge(pagamento.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((pagamento) => (
            <Card key={pagamento.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900">{pagamento.colaborador_nome}</p>
                  <p className="text-sm text-gray-500">{pagamento.colaborador_cargo}</p>
                </div>
                {getStatusBadge(pagamento.status)}
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipo:</span>
                  {getTipoBadge(pagamento.tipo)}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor Base:</span>
                  <span className="font-mono">{formatCurrency(pagamento.valor_base)}</span>
                </div>
                {pagamento.bonus > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bônus:</span>
                    <span className="font-mono text-green-600">
                      +{formatCurrency(pagamento.bonus)}
                    </span>
                  </div>
                )}
                {pagamento.descontos > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Descontos:</span>
                    <span className="font-mono text-red-600">
                      -{formatCurrency(pagamento.descontos)}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500">Valor Líquido</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(pagamento.valor_liquido)}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>

              {pagamento.observacoes && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {pagamento.observacoes}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* RN-007 Explicação */}
      <Card className="mt-6 p-6 bg-emerald-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-900 mb-1">
              RN-007: Separação de Bônus e Descontos
            </p>
            <p className="text-sm text-emerald-700">
              Todos os pagamentos exibem <strong>bônus e descontos de forma separada</strong>,
              permitindo rastreabilidade completa da composição salarial. O valor líquido é
              calculado automaticamente: <strong>Valor Base + Bônus - Descontos</strong>.
            </p>
          </div>
        </div>
      </Card>

      {/* Modal de Novo Pagamento */}
      <NovoPagamentoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePagamento}
        colaboradores={MOCK_COLABORADORES}
        empresas={MOCK_EMPRESAS}
        empresa_id={empresaAtual}
      />
    </div>
  );
}
