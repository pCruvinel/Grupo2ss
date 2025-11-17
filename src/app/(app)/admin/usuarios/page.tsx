'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE USUÁRIOS                                           ║
 * ║  Gestão dos 5 perfis: Admin, Diretoria, Gerente, RH, Operac. ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Users,
  Shield,
  List,
  Grid,
  Download,
  Edit,
  Eye,
  Mail,
  Building2,
  UserCheck,
  UserX,
  Crown,
  Briefcase,
  UserCog,
  HardHat,
} from 'lucide-react';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Checkbox } from '../../../components/ui/checkbox';
import { toast } from 'sonner';

// Inline mocks
const createClient = () => ({
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
      order: (column: string) => Promise.resolve({ data: [], error: null }),
    }),
    insert: (data: any) => Promise.resolve({ data: null, error: null }),
    update: (data: any) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: null, error: null }),
    }),
  }),
});

const useAuth = () => ({
  user: { id: '1', email: 'admin@grupo2s.com.br', perfil: 'admin', empresa_id: '1' },
  loading: false,
  signOut: () => {},
});

const LoadingSpinner = () => <div className="flex items-center justify-center p-8">Carregando...</div>;

const EmptyState = ({ title, description, actionLabel, onAction, icon }: any) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    {icon && <div className="mb-4 text-gray-400">{icon}</div>}
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        {actionLabel}
      </button>
    )}
  </div>
);

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR');

interface Usuario {
  id: string;
  email: string;
  nome: string;
  empresa_id: string;
  empresa?: {
    nome: string;
    tipo: string;
  };
  perfil: 'admin' | 'diretoria' | 'gerente' | 'rh' | 'operacional';
  status: 'ativo' | 'inativo';
  ultimo_acesso?: string;
  data_criacao: string;
}

interface Empresa {
  id: string;
  nome: string;
  tipo: string;
}

// Configuração dos perfis
const PERFIL_CONFIG = {
  admin: {
    label: 'Admin',
    icon: Crown,
    color: 'bg-purple-100 text-purple-700',
    description: 'Acesso total ao sistema',
  },
  diretoria: {
    label: 'Diretoria',
    icon: Briefcase,
    color: 'bg-blue-100 text-blue-700',
    description: 'Visão estratégica consolidada',
  },
  gerente: {
    label: 'Gerente',
    icon: UserCog,
    color: 'bg-green-100 text-green-700',
    description: 'Gestão de equipes e processos',
  },
  rh: {
    label: 'RH',
    icon: Users,
    color: 'bg-orange-100 text-orange-700',
    description: 'Recursos Humanos',
  },
  operacional: {
    label: 'Operacional',
    icon: HardHat,
    color: 'bg-gray-100 text-gray-700',
    description: 'Operações do dia a dia',
  },
};

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDetalhesOpen, setDialogDetalhesOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterPerfil, setFilterPerfil] = useState('todos');
  const [filterEmpresa, setFilterEmpresa] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    senha: '',
    empresa_id: '',
    perfil: 'operacional' as const,
    status: 'ativo' as const,
  });

  const supabase = createClient();

  // Verificar se é admin
  useEffect(() => {
    if (currentUser?.perfil !== 'admin') {
      window.location.href = '/dashboard';
    }
  }, [currentUser]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar empresas
      const { data: empresasData } = await supabase.from('empresas').select('id, nome, tipo').order('nome');

      // Buscar usuários
      const { data: usuariosData, error } = await supabase
        .from('users')
        .select('*, empresa:empresas(nome, tipo)')
        .order('nome');

      if (error) throw error;

      if (empresasData) setEmpresas(empresasData);
      if (usuariosData) setUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuários
  const usuariosFiltrados = useMemo(() => {
    let resultado = usuarios;

    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(
        (u) => u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo)
      );
    }

    if (filterStatus !== 'todos') {
      resultado = resultado.filter((u) => u.status === filterStatus);
    }

    if (filterPerfil !== 'todos') {
      resultado = resultado.filter((u) => u.perfil === filterPerfil);
    }

    if (filterEmpresa !== 'todos') {
      resultado = resultado.filter((u) => u.empresa_id === filterEmpresa);
    }

    return resultado;
  }, [usuarios, searchTerm, filterStatus, filterPerfil, filterEmpresa]);

  // Estatísticas
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.status === 'ativo').length,
    inativos: usuarios.filter((u) => u.status === 'inativo').length,
    porPerfil: {
      admin: usuarios.filter((u) => u.perfil === 'admin').length,
      diretoria: usuarios.filter((u) => u.perfil === 'diretoria').length,
      gerente: usuarios.filter((u) => u.perfil === 'gerente').length,
      rh: usuarios.filter((u) => u.perfil === 'rh').length,
      operacional: usuarios.filter((u) => u.perfil === 'operacional').length,
    },
  };

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
      <Badge className="bg-green-100 text-green-700">✅ Ativo</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-700">❌ Inativo</Badge>
    );
  };

  const getPerfilBadge = (perfil: string) => {
    const config = PERFIL_CONFIG[perfil as keyof typeof PERFIL_CONFIG];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleOpenDialog = (usuario?: Usuario) => {
    if (usuario) {
      setEditingUsuario(usuario);
      setFormData({
        email: usuario.email,
        nome: usuario.nome,
        senha: '',
        empresa_id: usuario.empresa_id,
        perfil: usuario.perfil,
        status: usuario.status,
      });
    } else {
      setEditingUsuario(null);
      setFormData({
        email: '',
        nome: '',
        senha: '',
        empresa_id: '',
        perfil: 'operacional',
        status: 'ativo',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.email || !formData.nome || !formData.empresa_id) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (!editingUsuario && !formData.senha) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    try {
      const usuarioData: any = {
        email: formData.email,
        nome: formData.nome,
        empresa_id: formData.empresa_id,
        perfil: formData.perfil,
        status: formData.status,
      };

      if (editingUsuario) {
        // Atualizar
        if (formData.senha) {
          usuarioData.senha_hash = formData.senha; // TODO: Hash da senha
        }

        const { error } = await supabase.from('users').update(usuarioData).eq('id', editingUsuario.id);

        if (error) throw error;
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar
        usuarioData.senha_hash = formData.senha; // TODO: Hash da senha

        const { error } = await supabase.from('users').insert(usuarioData);

        if (error) throw error;
        toast.success('Usuário cadastrado com sucesso!');
      }

      setDialogOpen(false);
      setEditingUsuario(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast.error(error.message || 'Erro ao salvar usuário');
    }
  };

  const handleOpenDetalhes = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setDialogDetalhesOpen(true);
  };

  // Colunas da tabela
  const columns: Column<Usuario>[] = [
    {
      key: 'nome',
      label: 'Nome',
      render: (_, item) => (
        <div>
          <p className="text-gray-900">{item.nome}</p>
          <p className="text-xs text-gray-500">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'empresa',
      label: 'Empresa',
      render: (_, item) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{item.empresa?.nome || '-'}</span>
        </div>
      ),
    },
    {
      key: 'perfil',
      label: 'Perfil',
      render: (_, item) => getPerfilBadge(item.perfil),
    },
    {
      key: 'ultimo_acesso',
      label: 'Último Acesso',
      render: (_, item) => (
        <span className="text-sm text-gray-600">
          {item.ultimo_acesso ? formatDate(item.ultimo_acesso) : 'Nunca'}
        </span>
      ),
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
  const customActions = (item: Usuario) => (
    <>
      <Button onClick={() => handleOpenDetalhes(item)} variant="ghost" size="sm" title="Ver Detalhes">
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
              <Users className="w-8 h-8 text-[#1F4788]" />
              Gestão de Usuários
            </h1>
            <p className="text-gray-600">Grupo 2S • {stats.total} usuário(s)</p>
            <Badge className="mt-2 bg-purple-100 text-purple-700">
              5 Perfis: Admin, Diretoria, Gerente, RH, Operacional
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
              Novo Usuário
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-8 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserCheck className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Ativos</p>
            </div>
            <p className="text-2xl text-green-600">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <UserX className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600">Inativos</p>
            </div>
            <p className="text-2xl text-red-600">{stats.inativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-purple-600 mb-1">Admin</p>
            <p className="text-xl text-purple-600">{stats.porPerfil.admin}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-blue-600 mb-1">Diretoria</p>
            <p className="text-xl text-blue-600">{stats.porPerfil.diretoria}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-green-600 mb-1">Gerente</p>
            <p className="text-xl text-green-600">{stats.porPerfil.gerente}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-orange-600 mb-1">RH</p>
            <p className="text-xl text-orange-600">{stats.porPerfil.rh}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-gray-600 mb-1">Operacional</p>
            <p className="text-xl text-gray-600">{stats.porPerfil.operacional}</p>
          </Card>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label className="text-xs mb-1">Buscar</Label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nome ou email..."
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
                <SelectItem value="ativo">✅ Ativo</SelectItem>
                <SelectItem value="inativo">❌ Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Perfil</Label>
            <Select value={filterPerfil} onValueChange={setFilterPerfil}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="admin">👑 Admin</SelectItem>
                <SelectItem value="diretoria">💼 Diretoria</SelectItem>
                <SelectItem value="gerente">👔 Gerente</SelectItem>
                <SelectItem value="rh">👥 RH</SelectItem>
                <SelectItem value="operacional">🔧 Operacional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Empresa</Label>
            <Select value={filterEmpresa} onValueChange={setFilterEmpresa}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      {usuariosFiltrados.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhum usuário encontrado"
            description="Ajuste os filtros ou cadastre um novo usuário"
            actionLabel="Novo Usuário"
            onAction={() => handleOpenDialog()}
            icon={<Users className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="p-6">
          <DataTable
            data={usuariosFiltrados}
            columns={columns}
            searchPlaceholder="Buscar usuários..."
            customActions={customActions}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuariosFiltrados.map((usuario) => {
            const config = PERFIL_CONFIG[usuario.perfil];
            const Icon = config.icon;
            return (
              <Card key={usuario.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900">{usuario.nome}</h3>
                      <p className="text-sm text-gray-500">{usuario.email}</p>
                    </div>
                  </div>
                  {getStatusBadge(usuario.status)}
                </div>

                <div className="space-y-3">
                  {getPerfilBadge(usuario.perfil)}

                  {usuario.empresa && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{usuario.empresa.nome}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cadastro:</span>
                      <span className="text-gray-900">{formatDate(usuario.data_criacao)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último acesso:</span>
                      <span className="text-gray-900">
                        {usuario.ultimo_acesso ? formatDate(usuario.ultimo_acesso) : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={() => handleOpenDetalhes(usuario)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                  <Button
                    onClick={() => handleOpenDialog(usuario)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>Preencha as informações do usuário</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="João da Silva"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="joao@empresa.com"
                  disabled={!!editingUsuario}
                />
                {editingUsuario && (
                  <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="senha">
                  Senha {editingUsuario ? '(Deixe em branco para não alterar)' : '*'}
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <Label htmlFor="empresa_id">Empresa *</Label>
                <Select
                  value={formData.empresa_id}
                  onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="perfil">Perfil *</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value: any) => setFormData({ ...formData, perfil: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">👑 Admin - Acesso Total</SelectItem>
                    <SelectItem value="diretoria">💼 Diretoria - Visão Estratégica</SelectItem>
                    <SelectItem value="gerente">👔 Gerente - Gestão de Equipes</SelectItem>
                    <SelectItem value="rh">👥 RH - Recursos Humanos</SelectItem>
                    <SelectItem value="operacional">🔧 Operacional - Dia a Dia</SelectItem>
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
                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                    <SelectItem value="inativo">❌ Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição do perfil selecionado */}
              <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Descrição:</strong> {PERFIL_CONFIG[formData.perfil].description}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingUsuario(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
              {editingUsuario ? 'Atualizar' : 'Cadastrar'} Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={dialogDetalhesOpen} onOpenChange={setDialogDetalhesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>

          {selectedUsuario && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
                <div
                  className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    PERFIL_CONFIG[selectedUsuario.perfil].color
                  }`}
                >
                  {(() => {
                    const Icon = PERFIL_CONFIG[selectedUsuario.perfil].icon;
                    return <Icon className="w-8 h-8" />;
                  })()}
                </div>
                <div>
                  <h3 className="text-xl text-gray-900">{selectedUsuario.nome}</h3>
                  <p className="text-sm text-gray-600">{selectedUsuario.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getPerfilBadge(selectedUsuario.perfil)}
                    {getStatusBadge(selectedUsuario.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📋 Informações</h4>
                  <div className="space-y-2 text-sm">
                    {selectedUsuario.empresa && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Empresa:</span>
                        <span className="text-gray-900">{selectedUsuario.empresa.nome}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Perfil:</span>
                      <span className="text-gray-900">{PERFIL_CONFIG[selectedUsuario.perfil].label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cadastrado em:</span>
                      <span className="text-gray-900">{formatDate(selectedUsuario.data_criacao)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último acesso:</span>
                      <span className="text-gray-900">
                        {selectedUsuario.ultimo_acesso ? formatDate(selectedUsuario.ultimo_acesso) : 'Nunca'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-3">🔒 Permissões do Perfil</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {PERFIL_CONFIG[selectedUsuario.perfil].description}
                  </p>
                  <div className="space-y-2">
                    {selectedUsuario.perfil === 'admin' && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Acesso total ao sistema</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Gestão de empresas e usuários</span>
                        </div>
                      </>
                    )}
                    {selectedUsuario.perfil === 'diretoria' && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Visão consolidada de todas empresas</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Relatórios executivos</span>
                        </div>
                      </>
                    )}
                    {selectedUsuario.perfil === 'gerente' && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Gestão de equipes e processos</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Aprovações e relatórios</span>
                        </div>
                      </>
                    )}
                    {selectedUsuario.perfil === 'rh' && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Gestão de funcionários</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Controle de ponto e folha</span>
                        </div>
                      </>
                    )}
                    {selectedUsuario.perfil === 'operacional' && (
                      <>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Acesso a operações do dia a dia</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Registro de atividades</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}