'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE VEÍCULOS - NEXT.JS                                 ║
 * ║  Com filtros avançados, ações em lote e exportação            ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useMemo } from 'react';
import { Plus, Search, Car, Edit, Trash2, Download, CheckCircle, XCircle } from 'lucide-react';
import {
  Breadcrumbs,
  AdvancedFilters,
  BulkActions,
  useBulkSelection,
  ExportData,
  ResponsiveTable,
  NoVeiculosEmptyState,
  TableSkeleton,
  NoSearchResultsEmptyState,
  SectionErrorBoundary,
  NovoVeiculoModal,
  EditarVeiculoModal,
} from '../../../components/shared';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import { MOCK_EMPRESAS, formatDate } from '../../../lib/figma-make-helpers';

// Inline mocks for hooks and utilities
const useDebounce = (value: any, delay: number) => value;
const usePagination = (totalItems: number, itemsPerPage: number) => ({
  currentPage: 1,
  totalPages: Math.ceil(totalItems / itemsPerPage),
  nextPage: () => {},
  previousPage: () => {},
  goToPage: (page: number) => {},
});
const useIsMobile = () => false;

const formatPlaca = (placa: string) => {
  if (!placa) return '';
  const clean = placa.replace(/[^A-Z0-9]/g, '');
  if (clean.length === 7) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return placa;
};

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Veiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  tipo: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  empresa_id: string;
  km_atual: number;
  ultima_revisao: string;
}

// ═══════════════════════════════════════════════════════════════
// DADOS MOCK
// ═══════════════════════════════════════════════════════════════

const MOCK_VEICULOS: Veiculo[] = [
  {
    id: '1',
    placa: 'ABC1234',
    marca: 'Toyota',
    modelo: 'Corolla',
    ano: 2022,
    tipo: 'Carro',
    status: 'ativo',
    empresa_id: '1',
    km_atual: 25000,
    ultima_revisao: '2024-10-15',
  },
  {
    id: '2',
    placa: 'DEF5678',
    marca: 'Ford',
    modelo: 'Ranger',
    ano: 2021,
    tipo: 'Caminhonete',
    status: 'ativo',
    empresa_id: '1',
    km_atual: 45000,
    ultima_revisao: '2024-09-20',
  },
  {
    id: '3',
    placa: 'GHI9012',
    marca: 'Volkswagen',
    modelo: 'Gol',
    ano: 2020,
    tipo: 'Carro',
    status: 'manutencao',
    empresa_id: '2',
    km_atual: 78000,
    ultima_revisao: '2024-08-10',
  },
  {
    id: '4',
    placa: 'JKL3456',
    marca: 'Mercedes-Benz',
    modelo: 'Sprinter',
    ano: 2023,
    tipo: 'Van',
    status: 'ativo',
    empresa_id: '2',
    km_atual: 12000,
    ultima_revisao: '2024-11-01',
  },
  {
    id: '5',
    placa: 'MNO7890',
    marca: 'Fiat',
    modelo: 'Ducato',
    ano: 2019,
    tipo: 'Van',
    status: 'inativo',
    empresa_id: '3',
    km_atual: 95000,
    ultima_revisao: '2024-07-15',
  },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function VeiculosPage() {
  // TODO: Obter empresaAtual do contexto/session do Next.js
  const empresaAtual = '1'; // Temporário

  const [veiculos, setVeiculos] = useState<Veiculo[]>(MOCK_VEICULOS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 500);
  const { selectedIds, setSelectedIds, isSelected, toggleItem } = useBulkSelection();
  const isMobile = useIsMobile();

  // Filtrar veículos
  const veiculosFiltrados = useMemo(() => {
    let resultado = veiculos;

    // Filtro por empresa (RN-001)
    resultado = resultado.filter(v => v.empresa_id === empresaAtual);

    // Busca
    if (debouncedSearch) {
      const termo = debouncedSearch.toLowerCase();
      resultado = resultado.filter(
        v =>
          v.placa.toLowerCase().includes(termo) ||
          v.marca.toLowerCase().includes(termo) ||
          v.modelo.toLowerCase().includes(termo)
      );
    }

    // Filtros avançados
    if (filters.status) {
      resultado = resultado.filter(v => v.status === filters.status);
    }
    if (filters.tipo) {
      resultado = resultado.filter(v => v.tipo === filters.tipo);
    }
    if (filters.ano_min) {
      resultado = resultado.filter(v => v.ano >= parseInt(filters.ano_min));
    }
    if (filters.ano_max) {
      resultado = resultado.filter(v => v.ano <= parseInt(filters.ano_max));
    }

    return resultado;
  }, [veiculos, empresaAtual, debouncedSearch, filters]);

  // Paginação
  const pagination = usePagination({
    totalItems: veiculosFiltrados.length,
    itemsPerPage: 10,
  });

  const veiculosPaginados = veiculosFiltrados.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  // Colunas da tabela
  const columns = [
    { 
      key: 'placa', 
      label: 'Placa', 
      render: (value: string) => (
        <span className="font-mono font-medium">{formatPlaca(value)}</span>
      )
    },
    { key: 'marca', label: 'Marca' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'ano', label: 'Ano' },
    { key: 'tipo', label: 'Tipo' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const colors = {
          ativo: 'bg-green-100 text-green-700',
          inativo: 'bg-red-100 text-red-700',
          manutencao: 'bg-yellow-100 text-yellow-700',
        };
        const labels = {
          ativo: 'Ativo',
          inativo: 'Inativo',
          manutencao: 'Manutenção',
        };
        return (
          <Badge className={colors[value as keyof typeof colors]}>
            {labels[value as keyof typeof labels]}
          </Badge>
        );
      },
    },
    { 
      key: 'km_atual', 
      label: 'KM Atual',
      render: (value: number) => value.toLocaleString('pt-BR') + ' km'
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
        { value: 'manutencao', label: 'Manutenção' },
      ],
    },
    {
      id: 'tipo',
      label: 'Tipo',
      type: 'select' as const,
      options: [
        { value: 'Carro', label: 'Carro' },
        { value: 'Caminhonete', label: 'Caminhonete' },
        { value: 'Van', label: 'Van' },
        { value: 'Caminhão', label: 'Caminhão' },
      ],
    },
    {
      id: 'ano_min',
      label: 'Ano Mínimo',
      type: 'number' as const,
      placeholder: '2020',
    },
    {
      id: 'ano_max',
      label: 'Ano Máximo',
      type: 'number' as const,
      placeholder: '2024',
    },
  ];

  // Ações em lote
  const bulkActions = [
    {
      id: 'activate',
      label: 'Ativar',
      icon: <CheckCircle className="w-4 h-4" />,
      onExecute: async (ids: string[]) => {
        setVeiculos(prev =>
          prev.map(v => (ids.includes(v.id) ? { ...v, status: 'ativo' as const } : v))
        );
        toast.success(`${ids.length} veículo(s) ativado(s) com sucesso!`);
        setSelectedIds([]);
      },
    },
    {
      id: 'deactivate',
      label: 'Inativar',
      icon: <XCircle className="w-4 h-4" />,
      requireConfirmation: true,
      confirmationTitle: 'Inativar veículos',
      confirmationDescription: 'Tem certeza que deseja inativar os veículos selecionados?',
      onExecute: async (ids: string[]) => {
        setVeiculos(prev =>
          prev.map(v => (ids.includes(v.id) ? { ...v, status: 'inativo' as const } : v))
        );
        toast.success(`${ids.length} veículo(s) inativado(s) com sucesso!`);
        setSelectedIds([]);
      },
    },
    {
      id: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'destructive' as const,
      requireConfirmation: true,
      confirmationTitle: 'Excluir veículos',
      confirmationDescription:
        'Esta ação não pode ser desfeita. Os veículos serão permanentemente excluídos.',
      onExecute: async (ids: string[]) => {
        setVeiculos(prev => prev.filter(v => !ids.includes(v.id)));
        toast.success(`${ids.length} veículo(s) excluído(s) com sucesso!`);
        setSelectedIds([]);
      },
    },
  ];

  // Handlers
  const handleRowClick = (veiculo: Veiculo) => {
    setVeiculoSelecionado(veiculo);
    setShowEditarModal(true);
  };

  const handleSaveNovo = (veiculo: any) => {
    const novoVeiculo: Veiculo = {
      id: Date.now().toString(),
      ...veiculo,
      status: 'ativo' as const,
      empresa_id: empresaAtual,
      km_atual: 0,
      ultima_revisao: new Date().toISOString().split('T')[0],
    };
    setVeiculos(prev => [...prev, novoVeiculo]);
    setShowNovoModal(false);
    toast.success('Veículo cadastrado com sucesso!');
  };

  const handleSaveEditar = (veiculo: any) => {
    setVeiculos(prev =>
      prev.map(v => (v.id === veiculo.id ? { ...v, ...veiculo } : v))
    );
    setShowEditarModal(false);
    setVeiculoSelecionado(null);
    toast.success('Veículo atualizado com sucesso!');
  };

  const empresaNome = MOCK_EMPRESAS.find(e => e.id === empresaAtual)?.nome || 'Empresa';

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
              { label: 'Operacional', onClick: () => {} },
              { label: 'Veículos' },
            ]}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl text-gray-900 mb-2">Gestão de Veículos</h1>
            <p className="text-sm md:text-base text-gray-600">
              {empresaNome} • {veiculosFiltrados.length} veículo(s)
            </p>
          </div>
          <div className="flex gap-2">
            <ExportData
              data={veiculosFiltrados}
              filename={`veiculos-${empresaNome}-${formatDate(new Date())}`}
              columns={columns}
            />
            <Button
              onClick={() => setShowNovoModal(true)}
              className="bg-[#1F4788] hover:bg-blue-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>

        {/* Filtros e Busca */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por placa, marca ou modelo..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros Avançados */}
            <AdvancedFilters
              filterOptions={filterOptions}
              onApplyFilters={setFilters}
              onClearFilters={() => setFilters({})}
            />
          </div>
        </Card>

        {/* Ações em Lote */}
        {veiculosFiltrados.length > 0 && (
          <BulkActions
            data={veiculosFiltrados}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            actions={bulkActions}
          />
        )}

        {/* Tabela */}
        {loading ? (
          <TableSkeleton />
        ) : veiculosFiltrados.length === 0 && !debouncedSearch && Object.keys(filters).length === 0 ? (
          <NoVeiculosEmptyState onAdd={() => setShowNovoModal(true)} />
        ) : veiculosFiltrados.length === 0 ? (
          <NoSearchResultsEmptyState
            onClear={() => {
              setSearchTerm('');
              setFilters({});
            }}
          />
        ) : (
          <ResponsiveTable
            columns={columns}
            data={veiculosPaginados}
            onRowClick={handleRowClick}
            selectable
            selectedIds={selectedIds}
            onSelectChange={toggleItem}
          />
        )}

        {/* Paginação */}
        {veiculosFiltrados.length > 10 && (
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

        {/* Modais */}
        <NovoVeiculoModal
          open={showNovoModal}
          onClose={() => setShowNovoModal(false)}
          onSave={handleSaveNovo}
          empresas={MOCK_EMPRESAS}
        />

        <EditarVeiculoModal
          open={showEditarModal}
          onClose={() => {
            setShowEditarModal(false);
            setVeiculoSelecionado(null);
          }}
          onSave={handleSaveEditar}
          veiculo={veiculoSelecionado}
          empresas={MOCK_EMPRESAS}
        />
      </div>
    </SectionErrorBoundary>
  );
}