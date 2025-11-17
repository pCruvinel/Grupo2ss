'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE COLABORADORES - NEXT.JS                            ║
 * ║  Com filtros avançados, ações em lote e exportação            ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useMemo } from 'react';
import { Plus, Search, Users, Mail, Phone, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
  Breadcrumbs,
  AdvancedFilters,
  BulkActions,
  useBulkSelection,
  ExportData,
  ResponsiveTable,
  NoColaboradoresEmptyState,
  TableSkeleton,
  NoSearchResultsEmptyState,
  SectionErrorBoundary,
} from '../../../components/shared';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { MOCK_EMPRESAS, formatDate, formatCPFCNPJ as formatCPF, formatPhone, formatCurrency } from '../../../lib/figma-make-helpers';

// Inline mocks for hooks
const useDebounce = (value: any, delay: number) => value;
const usePagination = (config: any) => ({
  currentPage: 1,
  totalPages: Math.ceil(config.totalItems / config.itemsPerPage),
  startIndex: 0,
  endIndex: config.itemsPerPage,
  hasPreviousPage: false,
  hasNextPage: config.totalItems > config.itemsPerPage,
  goToPreviousPage: () => {},
  goToNextPage: () => {},
  goToPage: (page: number) => {},
});
const useIsMobile = () => false;

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  salario: number;
  status: 'ativo' | 'inativo' | 'ferias';
  data_admissao: string;
  empresas: string[]; // RN-002: Pode trabalhar em múltiplas empresas
  rateio?: Record<string, number>; // RN-002: Percentual de custo por empresa
}

// ═══════════════════════════════════════════════════════════════
// DADOS MOCK
// ═══════════════════════════════════════════════════════════════

const MOCK_COLABORADORES: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva',
    cpf: '12345678900',
    email: 'joao.silva@2s.com.br',
    telefone: '11999999999',
    cargo: 'Desenvolvedor',
    departamento: 'TI',
    salario: 8000,
    status: 'ativo',
    data_admissao: '2023-01-15',
    empresas: ['1'],
  },
  {
    id: '2',
    nome: 'Maria Santos',
    cpf: '98765432100',
    email: 'maria.santos@2s.com.br',
    telefone: '11988888888',
    cargo: 'Designer',
    departamento: 'Marketing',
    salario: 6500,
    status: 'ativo',
    data_admissao: '2023-03-20',
    empresas: ['1', '2'], // RN-002: Trabalha em 2 empresas
    rateio: { '1': 60, '2': 40 }, // RN-002: Rateio 60/40
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    cpf: '45678912300',
    email: 'pedro.costa@2s.com.br',
    telefone: '11977777777',
    cargo: 'Gerente de Vendas',
    departamento: 'Comercial',
    salario: 10000,
    status: 'ferias',
    data_admissao: '2022-06-10',
    empresas: ['2'],
  },
  {
    id: '4',
    nome: 'Ana Oliveira',
    cpf: '78912345600',
    email: 'ana.oliveira@2s.com.br',
    telefone: '11966666666',
    cargo: 'Analista Financeiro',
    departamento: 'Financeiro',
    salario: 7000,
    status: 'ativo',
    data_admissao: '2023-05-01',
    empresas: ['1', '2', '3'], // RN-002: Trabalha nas 3 empresas
    rateio: { '1': 50, '2': 30, '3': 20 }, // RN-002: Rateio 50/30/20
  },
  {
    id: '5',
    nome: 'Carlos Mendes',
    cpf: '32165498700',
    email: 'carlos.mendes@2s.com.br',
    telefone: '11955555555',
    cargo: 'Operador de Logística',
    departamento: 'Operacional',
    salario: 4500,
    status: 'inativo',
    data_admissao: '2021-08-15',
    empresas: ['3'],
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ColaboradoresPage() {
  // TODO: Obter empresaAtual do contexto/session Next.js
  const empresaAtual = '1'; // Temporário

  const [colaboradores, setColaboradores] = useState<Colaborador[]>(MOCK_COLABORADORES);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { selectedIds, setSelectedIds, toggleItem } = useBulkSelection();
  const isMobile = useIsMobile();

  // Filtrar colaboradores
  const colaboradoresFiltrados = useMemo(() => {
    let resultado = colaboradores;

    // Filtro por empresa (RN-001)
    resultado = resultado.filter(c => c.empresas.includes(empresaAtual));

    // Busca
    if (debouncedSearch) {
      const termo = debouncedSearch.toLowerCase();
      resultado = resultado.filter(
        c =>
          c.nome.toLowerCase().includes(termo) ||
          c.email.toLowerCase().includes(termo) ||
          c.cargo.toLowerCase().includes(termo) ||
          c.cpf.replace(/\D/g, '').includes(termo.replace(/\D/g, ''))
      );
    }

    // Filtros avançados
    if (filters.status) {
      resultado = resultado.filter(c => c.status === filters.status);
    }
    if (filters.departamento) {
      resultado = resultado.filter(c => c.departamento === filters.departamento);
    }
    if (filters.salario_min) {
      resultado = resultado.filter(c => c.salario >= parseFloat(filters.salario_min));
    }
    if (filters.salario_max) {
      resultado = resultado.filter(c => c.salario <= parseFloat(filters.salario_max));
    }
    if (filters.com_rateio === 'sim') {
      resultado = resultado.filter(c => c.rateio && Object.keys(c.rateio).length > 1);
    }

    return resultado;
  }, [colaboradores, empresaAtual, debouncedSearch, filters]);

  // Paginação
  const pagination = usePagination({
    totalItems: colaboradoresFiltrados.length,
    itemsPerPage: 10,
  });

  const colaboradoresPaginados = colaboradoresFiltrados.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  // Colunas da tabela
  const columns = [
    { key: 'nome', label: 'Nome' },
    {
      key: 'cpf',
      label: 'CPF',
      render: (value: string) => (
        <span className="font-mono text-sm">{formatCPF(value)}</span>
      ),
    },
    {
      key: 'email',
      label: 'E-mail',
      render: (value: string) => (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline text-sm">
          {value}
        </a>
      ),
    },
    { key: 'cargo', label: 'Cargo' },
    { key: 'departamento', label: 'Departamento' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors = {
          ativo: 'bg-green-100 text-green-700',
          inativo: 'bg-red-100 text-red-700',
          ferias: 'bg-blue-100 text-blue-700',
        };
        const labels = {
          ativo: 'Ativo',
          inativo: 'Inativo',
          ferias: 'Férias',
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {labels[value as keyof typeof labels]}
          </Badge>
        );
      },
    },
    {
      key: 'rateio',
      label: 'Rateio',
      render: (value: Record<string, number> | undefined, row: Colaborador) => {
        if (!value || Object.keys(value).length <= 1) {
          return <span className="text-gray-400 text-sm">-</span>;
        }
        return (
          <div className="flex gap-1">
            {Object.entries(value).map(([empId, perc]) => (
              <Badge key={empId} variant="outline" className="text-xs">
                {MOCK_EMPRESAS.find(e => e.id === empId)?.nome.split(' ')[0]}: {perc}%
              </Badge>
            ))}
          </div>
        );
      },
    },
  ];

  // Opções de filtros avançados
  const filterOptions = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
        { value: 'ferias', label: 'Férias' },
      ],
    },
    {
      id: 'departamento',
      label: 'Departamento',
      type: 'select' as const,
      options: [
        { value: 'TI', label: 'TI' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Comercial', label: 'Comercial' },
        { value: 'Financeiro', label: 'Financeiro' },
        { value: 'Operacional', label: 'Operacional' },
        { value: 'RH', label: 'RH' },
      ],
    },
    {
      id: 'salario_min',
      label: 'Salário Mínimo',
      type: 'number' as const,
      placeholder: '4000',
    },
    {
      id: 'salario_max',
      label: 'Salário Máximo',
      type: 'number' as const,
      placeholder: '15000',
    },
    {
      id: 'com_rateio',
      label: 'Com Rateio (RN-002)',
      type: 'select' as const,
      options: [
        { value: 'sim', label: 'Sim' },
        { value: 'nao', label: 'Não' },
      ],
    },
  ];

  // Ações em lote
  const bulkActions = [
    {
      id: 'activate',
      label: 'Ativar',
      icon: <CheckCircle className="w-4 h-4" />,
      onExecute: async (ids: string[]) => {
        setColaboradores(prev =>
          prev.map(c => (ids.includes(c.id) ? { ...c, status: 'ativo' as const } : c))
        );
        toast.success(`${ids.length} colaborador(es) ativado(s)!`);
        setSelectedIds([]);
      },
    },
    {
      id: 'deactivate',
      label: 'Inativar',
      icon: <XCircle className="w-4 h-4" />,
      requireConfirmation: true,
      confirmationTitle: 'Inativar colaboradores',
      confirmationDescription: 'Tem certeza que deseja inativar os colaboradores selecionados?',
      onExecute: async (ids: string[]) => {
        setColaboradores(prev =>
          prev.map(c => (ids.includes(c.id) ? { ...c, status: 'inativo' as const } : c))
        );
        toast.success(`${ids.length} colaborador(es) inativado(s)!`);
        setSelectedIds([]);
      },
    },
    {
      id: 'email',
      label: 'Enviar E-mail',
      icon: <Mail className="w-4 h-4" />,
      onExecute: async (ids: string[]) => {
        const emails = colaboradores
          .filter(c => ids.includes(c.id))
          .map(c => c.email)
          .join(';');
        window.location.href = `mailto:${emails}`;
        toast.info('Cliente de e-mail aberto');
      },
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive' as const,
      requireConfirmation: true,
      confirmationTitle: 'Excluir colaboradores',
      confirmationDescription:
        'Esta ação não pode ser desfeita. Os colaboradores serão permanentemente excluídos.',
      onExecute: async (ids: string[]) => {
        setColaboradores(prev => prev.filter(c => !ids.includes(c.id)));
        toast.success(`${ids.length} colaborador(es) excluído(s)!`);
        setSelectedIds([]);
      },
    },
  ];

  const empresaNome = MOCK_EMPRESAS.find(e => e.id === empresaAtual)?.nome || 'Empresa';

  // Estatísticas rápidas
  const stats = {
    total: colaboradoresFiltrados.length,
    ativos: colaboradoresFiltrados.filter(c => c.status === 'ativo').length,
    comRateio: colaboradoresFiltrados.filter(c => c.rateio && Object.keys(c.rateio).length > 1).length,
    folhaPagamento: colaboradoresFiltrados.reduce((sum, c) => {
      if (c.rateio && c.rateio[empresaAtual]) {
        return sum + (c.salario * c.rateio[empresaAtual]) / 100;
      }
      return sum + c.salario;
    }, 0),
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <SectionErrorBoundary>
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Breadcrumbs */}
        {!isMobile && (
          <Breadcrumbs
            items={[
              { label: 'Início', onClick: () => {} },
              { label: 'RH', onClick: () => {} },
              { label: 'Colaboradores' },
            ]}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">Gestão de Colaboradores</h1>
            <p className="text-sm md:text-base text-gray-600">
              {empresaNome} • {stats.total} colaborador(es) • {stats.ativos} ativo(s)
            </p>
          </div>
          <div className="flex gap-2">
            <ExportData
              data={colaboradoresFiltrados}
              filename={`colaboradores-${empresaNome}`}
              columns={columns}
            />
            <Button className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>
        </div>

        {/* Stats Cards - RN-002 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Ativos</p>
            <p className="text-2xl text-green-600">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Com Rateio</p>
            <p className="text-2xl text-orange-600">{stats.comRateio}</p>
            <Badge className="mt-1 text-xs bg-orange-100 text-orange-700">RN-002</Badge>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Folha de Pagamento</p>
            <p className="text-2xl text-gray-900">{formatCurrency(stats.folhaPagamento)}</p>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, e-mail, CPF ou cargo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <AdvancedFilters
              filterOptions={filterOptions}
              onApplyFilters={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>
        </Card>

        {/* Ações em Lote */}
        {colaboradoresFiltrados.length > 0 && (
          <BulkActions
            data={colaboradoresFiltrados}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            actions={bulkActions}
          />
        )}

        {/* Tabela */}
        {loading ? (
          <TableSkeleton />
        ) : colaboradoresFiltrados.length === 0 && !debouncedSearch && Object.keys(filters).length === 0 ? (
          <NoColaboradoresEmptyState onAdd={() => {}} />
        ) : colaboradoresFiltrados.length === 0 ? (
          <NoSearchResultsEmptyState
            onClear={() => {
              setSearchTerm('');
              setFilters({});
            }}
          />
        ) : (
          <ResponsiveTable
            columns={columns}
            data={colaboradoresPaginados}
            onRowClick={colab => {
              toast.info(`Editar colaborador: ${colab.nome}`, {
                description: 'Modal será implementado em breve',
              });
            }}
            selectable
            selectedIds={selectedIds}
            onSelectChange={toggleItem}
          />
        )}

        {/* Paginação */}
        {colaboradoresFiltrados.length > 10 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.goToPreviousPage}
                disabled={!pagination.hasPreviousPage}
              >
                Anterior
              </Button>
              <span className="text-sm text-gray-600">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={pagination.goToNextPage}
                disabled={!pagination.hasNextPage}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionErrorBoundary>
  );
}