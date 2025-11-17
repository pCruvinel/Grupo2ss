import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { User, Mail, Lock, Building2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

interface NovoUsuarioModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (usuario: any) => void;
  editingUsuario?: any;
  empresas: Array<{ id: string; nome: string }>;
}

export function NovoUsuarioModal({ open, onClose, onSave, editingUsuario, empresas }: NovoUsuarioModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    empresa_id: '',
    perfil: 'operacional',
    status: 'ativo',
  });

  useEffect(() => {
    if (editingUsuario) {
      setFormData({
        nome: editingUsuario.nome || '',
        email: editingUsuario.email || '',
        senha: '',
        empresa_id: editingUsuario.empresa_id || '',
        perfil: editingUsuario.perfil || 'operacional',
        status: editingUsuario.status || 'ativo',
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        senha: '',
        empresa_id: '',
        perfil: 'operacional',
        status: 'ativo',
      });
    }
  }, [editingUsuario, open]);

  const handleSave = () => {
    // Validações
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    if (!editingUsuario && !formData.senha) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    if (!formData.empresa_id) {
      toast.error('Empresa é obrigatória');
      return;
    }

    onSave(formData);
  };

  const perfilInfo = {
    admin: {
      label: '👑 Admin - Acesso Total',
      description: 'Controle completo do sistema',
      color: 'bg-purple-100 text-purple-700',
    },
    diretoria: {
      label: '💼 Diretoria - Visão Estratégica',
      description: 'Relatórios e dashboards consolidados',
      color: 'bg-blue-100 text-blue-700',
    },
    gerente: {
      label: '👔 Gerente - Gestão de Equipes',
      description: 'Gestão de sua área',
      color: 'bg-cyan-100 text-cyan-700',
    },
    rh: {
      label: '👥 RH - Recursos Humanos',
      description: 'Gestão de colaboradores e ponto',
      color: 'bg-orange-100 text-orange-700',
    },
    operacional: {
      label: '🔧 Operacional - Operações',
      description: 'Gestão operacional',
      color: 'bg-gray-100 text-gray-700',
    },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1F4788]" />
            {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
          </DialogTitle>
          <DialogDescription>
            {editingUsuario
              ? 'Atualize as informações do usuário'
              : 'Preencha as informações para criar um novo usuário'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nome Completo */}
          <div>
            <Label htmlFor="nome" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome Completo *
            </Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="João da Silva"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email *
            </Label>
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

          {/* Senha */}
          <div>
            <Label htmlFor="senha" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
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

          <div className="grid grid-cols-2 gap-4">
            {/* Empresa */}
            <div>
              <Label htmlFor="empresa_id" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Empresa *
              </Label>
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

            {/* Perfil */}
            <div>
              <Label htmlFor="perfil" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Perfil *
              </Label>
              <Select
                value={formData.perfil}
                onValueChange={(value) => setFormData({ ...formData, perfil: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">👑 Admin</SelectItem>
                  <SelectItem value="diretoria">💼 Diretoria</SelectItem>
                  <SelectItem value="gerente">👔 Gerente</SelectItem>
                  <SelectItem value="rh">👥 RH</SelectItem>
                  <SelectItem value="operacional">🔧 Operacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Info do Perfil Selecionado */}
          {formData.perfil && perfilInfo[formData.perfil as keyof typeof perfilInfo] && (
            <div className={`p-4 rounded-lg ${perfilInfo[formData.perfil as keyof typeof perfilInfo].color}`}>
              <p className="font-medium mb-1">
                {perfilInfo[formData.perfil as keyof typeof perfilInfo].label}
              </p>
              <p className="text-sm">
                {perfilInfo[formData.perfil as keyof typeof perfilInfo].description}
              </p>
            </div>
          )}

          {/* Status */}
          <div>
            <Label>Status</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={formData.status === 'ativo' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, status: 'ativo' })}
                className="flex-1"
              >
                Ativo
              </Button>
              <Button
                type="button"
                variant={formData.status === 'inativo' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, status: 'inativo' })}
                className="flex-1"
              >
                Inativo
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
            {editingUsuario ? 'Atualizar' : 'Criar'} Usuário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
