'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE EMPRESAS - RN-001                                  ║
 * ║  Gestão das 4 empresas do Grupo 2S com identidade visual      ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Building2,
  List,
  Grid,
  Download,
  Edit,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { DataTable, Column } from '../../../../components/shared/DataTable';
import { LoadingSpinner } from '../../../../components/shared/LoadingSpinner';
import { EmptyState } from '../../../../components/shared/EmptyState';
import { Card } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { toast } from 'sonner@2.0.3';

// Inline utils
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

// Mock Supabase Client
const createClient = () => ({
  from: (table: string) => ({
    select: (query: string = '*') => ({
      order: (field: string) => ({
        then: (callback: any) => callback({ data: [], error: null }),
      }),
      eq: (field: string, value: any) => ({
        single: () => ({ data: null, error: null }),
      }),
    }),
    insert: (data: any) => ({ error: null }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({ error: null }),
    }),
  }),
});

interface Empresa {
  id: string;
  nome: string;
  tipo: '2s_locacoes' | '2s_marketing' | 'producoes_eventos' | 'holding';
  cnpj?: string;
  telefone?: string;
  email?: string;
  status: 'ativa' | 'inativa';
  cor_primaria?: string;
  cor_secundaria?: string;
  logo_url?: string;
  endereco_completo?: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  dados_bancarios?: {
    banco: string;
    agencia: string;
    conta: string;
    tipo_conta: 'corrente' | 'poupanca';
    pix?: string;
  };
  data_criacao: string;
}

// Identidade visual por empresa
const EMPRESA_COLORS: Record<string, { primary: string; secondary: string; bg: string }> = {
  '2s_locacoes': {
    primary: '#1F4788',
    secondary: '#2563EB',
    bg: 'bg-blue-50',
  },
  '2s_marketing': {
    primary: '#28A745',
    secondary: '#22C55E',
    bg: 'bg-green-50',
  },
  producoes_eventos: {
    primary: '#DC3545',
    secondary: '#EF4444',
    bg: 'bg-red-50',
  },
  holding: {
    primary: '#6C757D',
    secondary: '#64748B',
    bg: 'bg-gray-50',
  },
};

const EMPRESA_LABELS: Record<string, string> = {
  '2s_locacoes': '2S Locações',
  '2s_marketing': '2S Marketing',
  producoes_eventos: 'Produções e Eventos',
  holding: 'Holding',
};

export default function EmpresasPage() {
  const { user: currentUser } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '2s_locacoes' as const,
    cnpj: '',
    telefone: '',
    email: '',
    status: 'ativa' as const,
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    // Dados bancários
    banco: '',
    agencia: '',
    conta: '',
    tipo_conta: 'corrente' as const,
    pix: '',
  });

  const supabase = createClient();

  // Verificar se é admin
  useEffect(() => {
    if (currentUser?.perfil !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [currentUser]);

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('empresas').select('*').order('nome');

      if (error) throw error;
      if (data) setEmpresas(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar empresas
  const empresasFiltradas = useMemo(() => {
    let resultado = empresas;

    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (e) =>
          e.nome.toLowerCase().includes(termo) ||
          e.cnpj?.toLowerCase().includes(termo) ||
          e.email?.toLowerCase().includes(termo)
      );
    }

    if (filterStatus !== 'todos') {
      resultado = resultado.filter((e) => e.status === filterStatus);
    }

    if (filterTipo !== 'todos') {
      resultado = resultado.filter((e) => e.tipo === filterTipo);
    }

    return resultado;
  }, [empresas, searchTerm, filterStatus, filterTipo]);

  // Estatísticas
  const stats = {
    total: empresas.length,
    ativas: empresas.filter((e) => e.status === 'ativa').length,
    inativas: empresas.filter((e) => e.status === 'inativa').length,
    ultima:
      empresas.length > 0
        ? empresas.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())[0]
        : null,
  };

  const getStatusBadge = (status: string) => {
    return status === 'ativa' ? (
      <Badge className="bg-green-100 text-green-700">✅ Ativa</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">❌ Inativa</Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const colors = EMPRESA_COLORS[tipo];
    return (
      <Badge style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
        {EMPRESA_LABELS[tipo]}
      </Badge>
    );
  };

  const handleOpenDialog = (empresa?: Empresa) => {
    if (empresa) {
      setEditingEmpresa(empresa);
      setFormData({
        nome: empresa.nome,
        tipo: empresa.tipo,
        cnpj: empresa.cnpj || '',
        telefone: empresa.telefone || '',
        email: empresa.email || '',
        status: empresa.status,
        cep: empresa.endereco_completo?.cep || '',
        logradouro: empresa.endereco_completo?.logradouro || '',
        numero: empresa.endereco_completo?.numero || '',
        complemento: empresa.endereco_completo?.complemento || '',
        bairro: empresa.endereco_completo?.bairro || '',
        cidade: empresa.endereco_completo?.cidade || '',
        estado: empresa.endereco_completo?.estado || '',
        banco: empresa.dados_bancarios?.banco || '',
        agencia: empresa.dados_bancarios?.agencia || '',
        conta: empresa.dados_bancarios?.conta || '',
        tipo_conta: empresa.dados_bancarios?.tipo_conta || 'corrente',
        pix: empresa.dados_bancarios?.pix || '',
      });
    } else {
      setEditingEmpresa(null);
      setFormData({
        nome: '',
        tipo: '2s_locacoes',
        cnpj: '',
        telefone: '',
        email: '',
        status: 'ativa',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        banco: '',
        agencia: '',
        conta: '',
        tipo_conta: 'corrente',
        pix: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome || !formData.tipo) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    try {
      const empresaData = {
        nome: formData.nome,
        tipo: formData.tipo,
        cnpj: formData.cnpj || null,
        telefone: formData.telefone || null,
        email: formData.email || null,
        status: formData.status,
        cor_primaria: EMPRESA_COLORS[formData.tipo].primary,
        cor_secundaria: EMPRESA_COLORS[formData.tipo].secondary,
        endereco_completo:
          formData.cep && formData.logradouro
            ? {
                cep: formData.cep,
                logradouro: formData.logradouro,
                numero: formData.numero,
                complemento: formData.complemento,
                bairro: formData.bairro,
                cidade: formData.cidade,
                estado: formData.estado,
              }
            : null,
        dados_bancarios:
          formData.banco && formData.agencia && formData.conta
            ? {
                banco: formData.banco,
                agencia: formData.agencia,
                conta: formData.conta,
                tipo_conta: formData.tipo_conta,
                pix: formData.pix || undefined,
              }
            : null,
      };

      if (editingEmpresa) {
        const { error } = await supabase.from('empresas').update(empresaData).eq('id', editingEmpresa.id);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const { error } = await supabase.from('empresas').insert(empresaData);

        if (error) throw error;
        toast.success('Empresa cadastrada com sucesso!');
      }

      setDialogOpen(false);
      setEditingEmpresa(null);
      fetchEmpresas();
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      toast.error(error.message || 'Erro ao salvar empresa');
    }
  };

  const handleOpenDetalhes = (empresa: Empresa) => {
    setSelectedEmpresa(empresa);
    setDialogDetalhesOpen(true);
  };

  // Colunas da tabela
  const columns: Column<Empresa>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: EMPRESA_COLORS[item.tipo].primary }}
          />
          <span className="text-gray-900">{item.nome}</span>
        </div>
      ),
    },
    {
      key: 'tipo',
      label: 'Tipo',
      render: (_, item) => getTipoBadge(item.tipo),
    },
    {
      key: 'cnpj',
      label: 'CNPJ',
      render: (_, item) => (
        <span className="font-mono text-sm text-gray-600">{item.cnpj || '-'}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (_, item) => <span className="text-sm text-gray-600">{item.email || '-'}</span>,
    },
    {
      key: 'data_criacao',
      label: 'Cadastro',
      render: (_, item) => <span className="text-sm text-gray-600">{formatDate(item.data_criacao)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, item) => getStatusBadge(item.status),
    },
  ];

  // Ações customizadas
  const customActions = (item: Empresa) => (
    <>
      <Button
        onClick={() => handleOpenDetalhes(item)}
        variant="ghost"
        size="sm"
        title="Ver Detalhes"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button onClick={() => handleOpenDialog(item)} variant="ghost" size="sm" title="Editar">
        <Edit className="w-4 h-4" />
      </Button>
    </>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2 flex items-center gap-2">
              <Building2 className="w-8 h-8 text-[#1F4788]" />
              Gestão de Empresas
            </h1>
            <p className="text-gray-600">Grupo 2S • {stats.total} empresa(s)</p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              RN-001: Segregação de Dados por Empresa
            </Badge>
          </div>
          <div className="flex gap-2">
            {/* Toggle de visualização */}
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

            <Button variant="outline" className="border-[#1F4788] text-[#1F4788]">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>

            <Button onClick={() => handleOpenDialog()} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Ativas</p>
            </div>
            <p className="text-2xl text-green-600">{stats.ativas}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600">Inativas</p>
            </div>
            <p className="text-2xl text-red-600">{stats.inativas}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">Última Cadastrada</p>
            </div>
            <p className="text-sm text-blue-600">{stats.ultima?.nome || '-'}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs mb-1">Buscar</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome, CNPJ ou email..."
            />
          </div>
          <div>
            <Label className="text-xs mb-1">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativa">✅ Ativa</SelectItem>
                <SelectItem value="inativa">❌ Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Tipo</Label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="2s_locacoes">2S Locações</SelectItem>
                <SelectItem value="2s_marketing">2S Marketing</SelectItem>
                <SelectItem value="producoes_eventos">Produções e Eventos</SelectItem>
                <SelectItem value="holding">Holding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {empresasFiltradas.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhuma empresa encontrada"
            description="Ajuste os filtros ou cadastre uma nova empresa"
            actionLabel="Nova Empresa"
            onAction={() => handleOpenDialog()}
            icon={<Building2 className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="p-6">
          <DataTable
            data={empresasFiltradas}
            columns={columns}
            searchPlaceholder="Buscar empresas..."
            customActions={customActions}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {empresasFiltradas.map((empresa) => {
            const colors = EMPRESA_COLORS[empresa.tipo];
            return (
              <Card
                key={empresa.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
                style={{ borderTop: `4px solid ${colors.primary}` }}
              >
                <div className={colors.bg + ' p-6 pb-4'}>
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    {getStatusBadge(empresa.status)}
                  </div>
                  <h3 className="text-lg text-gray-900 mb-1">{empresa.nome}</h3>
                  {getTipoBadge(empresa.tipo)}
                </div>

                <div className="p-6 space-y-3">
                  {empresa.cnpj && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-gray-600">{empresa.cnpj}</span>
                    </div>
                  )}

                  {empresa.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">{empresa.email}</span>
                    </div>
                  )}

                  {empresa.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{empresa.telefone}</span>
                    </div>
                  )}

                  {empresa.endereco_completo && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {empresa.endereco_completo.cidade}/{empresa.endereco_completo.estado}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t text-xs text-gray-500">
                    Cadastrada em {formatDate(empresa.data_criacao)}
                  </div>
                </div>

                <div className="p-4 border-t flex gap-2">
                  <Button
                    onClick={() => handleOpenDetalhes(empresa)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                  <Button
                    onClick={() => handleOpenDialog(empresa)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    style={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}</DialogTitle>
            <DialogDescription>Preencha as informações da empresa</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave}>
            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="bancarios">Dados Bancários</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="nome">Nome da Empresa *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: 2S Locações"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2s_locacoes">🔵 2S Locações</SelectItem>
                        <SelectItem value="2s_marketing">🟢 2S Marketing</SelectItem>
                        <SelectItem value="producoes_eventos">🔴 Produções e Eventos</SelectItem>
                        <SelectItem value="holding">⚪ Holding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativa">✅ Ativa</SelectItem>
                        <SelectItem value="inativa">❌ Inativa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="endereco" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                  </div>

                  <div>
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input
                      id="logradouro"
                      value={formData.logradouro}
                      onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
                      placeholder="Rua, Avenida, etc"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      placeholder="123"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                      placeholder="Sala, Andar, etc"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                      placeholder="Nome do bairro"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                      placeholder="Nome da cidade"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bancarios" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="banco">Banco</Label>
                    <Input
                      id="banco"
                      value={formData.banco}
                      onChange={(e) => setFormData({ ...formData, banco: e.target.value })}
                      placeholder="Nome do banco"
                    />
                  </div>

                  <div>
                    <Label htmlFor="agencia">Agência</Label>
                    <Input
                      id="agencia"
                      value={formData.agencia}
                      onChange={(e) => setFormData({ ...formData, agencia: e.target.value })}
                      placeholder="0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="conta">Conta</Label>
                    <Input
                      id="conta"
                      value={formData.conta}
                      onChange={(e) => setFormData({ ...formData, conta: e.target.value })}
                      placeholder="00000-0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo_conta">Tipo de Conta</Label>
                    <Select
                      value={formData.tipo_conta}
                      onValueChange={(value: any) => setFormData({ ...formData, tipo_conta: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corrente">Conta Corrente</SelectItem>
                        <SelectItem value="poupanca">Poupança</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="pix">Chave PIX (Opcional)</Label>
                    <Input
                      id="pix"
                      value={formData.pix}
                      onChange={(e) => setFormData({ ...formData, pix: e.target.value })}
                      placeholder="CPF, CNPJ, Email ou Telefone"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-6 border-t mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingEmpresa(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#1F4788] hover:bg-blue-800">
                {editingEmpresa ? 'Atualizar' : 'Cadastrar'} Empresa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={dialogDetalhesOpen} onOpenChange={setDialogDetalhesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Empresa</DialogTitle>
          </DialogHeader>

          {selectedEmpresa && (
            <div className="space-y-6">
              <div
                className="p-6 rounded-lg"
                style={{ backgroundColor: EMPRESA_COLORS[selectedEmpresa.tipo].primary + '10' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: EMPRESA_COLORS[selectedEmpresa.tipo].primary }}
                  >
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl text-gray-900">{selectedEmpresa.nome}</h3>
                    <div className="flex gap-2 mt-1">
                      {getTipoBadge(selectedEmpresa.tipo)}
                      {getStatusBadge(selectedEmpresa.status)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📄 Dados Gerais</h4>
                  <div className="space-y-2 text-sm">
                    {selectedEmpresa.cnpj && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">CNPJ:</span>
                        <span className="font-mono text-gray-900">{selectedEmpresa.cnpj}</span>
                      </div>
                    )}
                    {selectedEmpresa.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900">{selectedEmpresa.email}</span>
                      </div>
                    )}
                    {selectedEmpresa.telefone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Telefone:</span>
                        <span className="text-gray-900">{selectedEmpresa.telefone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cadastrada em:</span>
                      <span className="text-gray-900">{formatDate(selectedEmpresa.data_criacao)}</span>
                    </div>
                  </div>
                </div>

                {selectedEmpresa.endereco_completo && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">📍 Endereço</h4>
                    <div className="text-sm text-gray-600">
                      <p>
                        {selectedEmpresa.endereco_completo.logradouro}, {selectedEmpresa.endereco_completo.numero}
                      </p>
                      {selectedEmpresa.endereco_completo.complemento && (
                        <p>{selectedEmpresa.endereco_completo.complemento}</p>
                      )}
                      <p>
                        {selectedEmpresa.endereco_completo.bairro} -{' '}
                        {selectedEmpresa.endereco_completo.cidade}/{selectedEmpresa.endereco_completo.estado}
                      </p>
                      <p>CEP: {selectedEmpresa.endereco_completo.cep}</p>
                    </div>
                  </div>
                )}

                {selectedEmpresa.dados_bancarios && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-3">💳 Dados Bancários</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Banco:</span>
                        <span className="text-gray-900">{selectedEmpresa.dados_bancarios.banco}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Agência:</span>
                        <span className="font-mono text-gray-900">{selectedEmpresa.dados_bancarios.agencia}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conta:</span>
                        <span className="font-mono text-gray-900">{selectedEmpresa.dados_bancarios.conta}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="text-gray-900">
                          {selectedEmpresa.dados_bancarios.tipo_conta === 'corrente'
                            ? 'Conta Corrente'
                            : 'Poupança'}
                        </span>
                      </div>
                      {selectedEmpresa.dados_bancarios.pix && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">PIX:</span>
                          <span className="font-mono text-gray-900">{selectedEmpresa.dados_bancarios.pix}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}