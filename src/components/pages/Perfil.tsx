import { useState } from 'react';
import { User, Mail, Phone, MapPin, Building2, Shield, Key, Camera, Save, X, Edit2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface PerfilProps {
  usuario: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    perfil: string;
    empresa: string;
    empresas: string[];
    cpf?: string;
    cargo?: string;
    dataAdmissao?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  empresasDisponiveis: Array<{
    id: string;
    nome: string;
    nomeCompleto?: string;
  }>;
  onUpdatePerfil?: (dados: any) => void;
}

export function Perfil({ usuario, empresasDisponiveis, onUpdatePerfil }: PerfilProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone || '',
    cargo: usuario.cargo || '',
    endereco: usuario.endereco || '',
    cidade: usuario.cidade || '',
    estado: usuario.estado || '',
    cep: usuario.cep || '',
  });

  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = () => {
    if (onUpdatePerfil) {
      onUpdatePerfil(formData);
    }
    setEditMode(false);
    toast.success('Perfil atualizado com sucesso!');
  };

  const handleCancelEdit = () => {
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      cargo: usuario.cargo || '',
      endereco: usuario.endereco || '',
      cidade: usuario.cidade || '',
      estado: usuario.estado || '',
      cep: usuario.cep || '',
    });
    setEditMode(false);
  };

  const handleChangePassword = () => {
    if (!senhaData.senhaAtual || !senhaData.novaSenha || !senhaData.confirmarSenha) {
      toast.error('Preencha todos os campos de senha');
      return;
    }

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (senhaData.novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    // Aqui seria a integração com o backend
    toast.success('Senha alterada com sucesso!');
    setSenhaData({
      senhaAtual: '',
      novaSenha: '',
      confirmarSenha: '',
    });
  };

  const empresasUsuario = empresasDisponiveis.filter(emp => 
    usuario.empresas.includes(emp.id)
  );

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - Avatar e Info Básica */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-3xl">
                      {getInitials(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg"
                    variant="default"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <h3 className="text-gray-900 text-center mb-1">{usuario.nome}</h3>
                <p className="text-gray-600 text-sm mb-4">{usuario.email}</p>

                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {usuario.perfil}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="h-3 w-3" />
                    {usuario.empresa}
                  </Badge>
                </div>

                <Separator className="my-4" />

                <div className="w-full space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <User className="h-4 w-4" />
                    <span>ID: {usuario.id}</span>
                  </div>
                  {usuario.cpf && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>CPF: {usuario.cpf}</span>
                    </div>
                  )}
                  {usuario.dataAdmissao && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>Admissão: {usuario.dataAdmissao}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empresas Vinculadas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Empresas Vinculadas</CardTitle>
              <CardDescription>Empresas que você tem acesso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {empresasUsuario.map((empresa) => (
                  <div
                    key={empresa.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                  >
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{empresa.nomeCompleto || empresa.nome}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="seguranca">Segurança</TabsTrigger>
              <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            </TabsList>

            {/* Dados Pessoais */}
            <TabsContent value="dados">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Informações Pessoais</CardTitle>
                      <CardDescription>
                        Atualize suas informações de perfil
                      </CardDescription>
                    </div>
                    {!editMode ? (
                      <Button onClick={() => setEditMode(true)} className="gap-2">
                        <Edit2 className="h-4 w-4" />
                        Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={handleSaveProfile} className="gap-2">
                          <Check className="h-4 w-4" />
                          Salvar
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" className="gap-2">
                          <X className="h-4 w-4" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        disabled={!editMode}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cargo">Cargo</Label>
                      <Input
                        id="cargo"
                        value={formData.cargo}
                        onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <Separator />

                  <h4 className="text-gray-900">Endereço</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="endereco">Rua/Avenida</Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={formData.cidade}
                        onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                        disabled={!editMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={formData.cep}
                        onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                        disabled={!editMode}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Segurança */}
            <TabsContent value="seguranca">
              <Card>
                <CardHeader>
                  <CardTitle>Segurança da Conta</CardTitle>
                  <CardDescription>
                    Altere sua senha e gerencie configurações de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual">Senha Atual</Label>
                    <Input
                      id="senhaAtual"
                      type="password"
                      value={senhaData.senhaAtual}
                      onChange={(e) => setSenhaData({ ...senhaData, senhaAtual: e.target.value })}
                      placeholder="Digite sua senha atual"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <Input
                      id="novaSenha"
                      type="password"
                      value={senhaData.novaSenha}
                      onChange={(e) => setSenhaData({ ...senhaData, novaSenha: e.target.value })}
                      placeholder="Digite sua nova senha"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmarSenha"
                      type="password"
                      value={senhaData.confirmarSenha}
                      onChange={(e) => setSenhaData({ ...senhaData, confirmarSenha: e.target.value })}
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  <div className="pt-2">
                    <Button onClick={handleChangePassword} className="gap-2">
                      <Key className="h-4 w-4" />
                      Alterar Senha
                    </Button>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="text-gray-900 mb-2">Requisitos de Senha</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Mínimo de 6 caracteres</li>
                      <li>• Recomendado: letras maiúsculas e minúsculas</li>
                      <li>• Recomendado: pelo menos um número</li>
                      <li>• Recomendado: pelo menos um caractere especial</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferências */}
            <TabsContent value="preferencias">
              <Card>
                <CardHeader>
                  <CardTitle>Preferências do Sistema</CardTitle>
                  <CardDescription>
                    Personalize sua experiência no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Notificações por E-mail</p>
                      <p className="text-sm text-gray-600">Receba atualizações por e-mail</p>
                    </div>
                    <Button variant="outline" size="sm">Configurar</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Tema do Sistema</p>
                      <p className="text-sm text-gray-600">Claro ou escuro</p>
                    </div>
                    <Button variant="outline" size="sm">Em breve</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Idioma</p>
                      <p className="text-sm text-gray-600">Português (Brasil)</p>
                    </div>
                    <Button variant="outline" size="sm">Alterar</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Fuso Horário</p>
                      <p className="text-sm text-gray-600">GMT-3 (Brasília)</p>
                    </div>
                    <Button variant="outline" size="sm">Alterar</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}