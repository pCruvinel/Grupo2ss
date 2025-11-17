import { useState } from 'react';
import { Plus, Edit, Search, List, Grid, Users, Download, Upload, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner@2.0.3';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  empresas: string[];
  status: 'ativo' | 'inativo';
  ultimo_acesso: string;
}

interface UsuariosDashboardProps {
  usuarios: Usuario[];
  empresas: { id: string; nome: string }[];
}

export function UsuariosDashboard({ usuarios, empresas }: UsuariosDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const usuariosFiltrados = usuarios.filter(u => {
    const matchSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getPerfilBadge = (perfil: string) => {
    switch (perfil) {
      case 'admin': return { icon: '👑', label: 'Admin', color: 'bg-purple-100 text-purple-700' };
      case 'financeiro': return { icon: '💼', label: 'Financeiro', color: 'bg-blue-100 text-blue-700' };
      case 'rh': return { icon: '👥', label: 'RH', color: 'bg-green-100 text-green-700' };
      case 'operacional': return { icon: '🚚', label: 'Operacional', color: 'bg-orange-100 text-orange-700' };
      case 'cliente': return { icon: '👤', label: 'Cliente', color: 'bg-gray-100 text-gray-700' };
      default: return { icon: '👤', label: perfil, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleNovoUsuario = () => {
    toast.success('Funcionalidade em desenvolvimento', {
      description: 'Formulário de novo usuário será aberto em breve'
    });
  };

  const handleExportar = () => {
    toast.success('Exportando dados...', {
      description: `${usuariosFiltrados.length} usuários serão exportados`
    });
  };

  const handleImportar = () => {
    toast.info('Funcionalidade em desenvolvimento', {
      description: 'Importação em massa de usuários'
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Usuários do Sistema</h1>
            <p className="text-gray-600">Gestão de acessos e permissões</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleImportar}>
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportar}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" onClick={handleNovoUsuario} className="bg-[#1F4788] hover:bg-[#163761] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">✓ Ativos</option>
            <option value="inativo">✗ Inativos</option>
          </select>
          <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl text-gray-900 mt-1">{usuarios.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {usuarios.filter(u => u.status === 'ativo').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {usuarios.filter(u => u.perfil === 'admin').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👑</span>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários Inativos</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {usuarios.filter(u => u.status === 'inativo').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Empresas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.map((usuario) => {
                const perfilInfo = getPerfilBadge(usuario.perfil);
                return (
                  <TableRow key={usuario.id}>
                    <TableCell className="text-gray-900">{usuario.nome}</TableCell>
                    <TableCell className="text-sm text-gray-600">{usuario.email}</TableCell>
                    <TableCell>
                      <Badge className={perfilInfo.color}>
                        {perfilInfo.icon} {perfilInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {usuario.empresas.map((empId) => {
                          const emp = empresas.find(e => e.id === empId);
                          return (
                            <Badge key={empId} variant="outline" className="text-xs">
                              {emp?.nome}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.status === 'ativo' ? 'success' : 'secondary' as any}>
                        {usuario.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {new Date(usuario.ultimo_acesso).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-4">
          {usuariosFiltrados.map((usuario) => {
            const perfilInfo = getPerfilBadge(usuario.perfil);
            return (
              <Card key={usuario.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg text-gray-900">{usuario.nome}</h3>
                      <Badge className={perfilInfo.color}>
                        {perfilInfo.icon} {perfilInfo.label}
                      </Badge>
                      <Badge variant={usuario.status === 'ativo' ? 'success' : 'secondary' as any}>
                        {usuario.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{usuario.email}</p>
                    <div className="flex gap-2 mb-2">
                      {usuario.empresas.map((empId) => {
                        const emp = empresas.find(e => e.id === empId);
                        return (
                          <Badge key={empId} variant="outline">
                            {emp?.nome}
                          </Badge>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Último acesso: {new Date(usuario.ultimo_acesso).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}