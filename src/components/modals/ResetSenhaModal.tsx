import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Key, Mail, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/badge';

interface ResetSenhaModalProps {
  open: boolean;
  onClose: () => void;
  onReset: (data: any) => void;
  usuarios?: { id: string; nome: string; email: string; perfil: string }[];
  modoAdmin?: boolean; // Se true, permite resetar senha de outros usuários
}

export function ResetSenhaModal({ open, onClose, onReset, usuarios = [], modoAdmin = false }: ResetSenhaModalProps) {
  const [step, setStep] = useState<'selecao' | 'confirmacao' | 'sucesso'>('selecao');
  const [formData, setFormData] = useState({
    usuario_id: '',
    email: '',
    metodo_envio: 'email',
    gerar_temporaria: true,
  });

  const [senhaTemporaria, setSenhaTemporaria] = useState('');

  const usuarioSelecionado = usuarios.find(u => u.id === formData.usuario_id);

  const gerarSenhaTemporaria = () => {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$';
    let senha = '';
    for (let i = 0; i < 12; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  };

  const handleConfirmar = () => {
    if (modoAdmin && !formData.usuario_id) {
      toast.error('Selecione um usuário');
      return;
    }

    if (!modoAdmin && !formData.email) {
      toast.error('Informe seu e-mail');
      return;
    }

    setStep('confirmacao');
  };

  const handleReset = () => {
    const novaSenha = gerarSenhaTemporaria();
    setSenhaTemporaria(novaSenha);

    onReset({
      ...formData,
      senha_temporaria: novaSenha,
      usuario_nome: usuarioSelecionado?.nome,
      resetado_em: new Date().toISOString(),
      resetado_por: 'Gestor Sistema', // Em produção viria do usuário logado
    });

    if (modoAdmin) {
      toast.success(`Senha resetada para ${usuarioSelecionado?.nome}`);
    } else {
      toast.success('Link de redefinição enviado para seu e-mail');
    }

    setStep('sucesso');
  };

  const handleClose = () => {
    setStep('selecao');
    setFormData({
      usuario_id: '',
      email: '',
      metodo_envio: 'email',
      gerar_temporaria: true,
    });
    setSenhaTemporaria('');
    onClose();
  };

  const copiarSenha = () => {
    navigator.clipboard.writeText(senhaTemporaria);
    toast.success('Senha copiada para a área de transferência!');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-indigo-600" />
            {modoAdmin ? 'Reset de Senha de Usuário' : 'Redefinir Minha Senha'}
          </DialogTitle>
          <DialogDescription>
            {modoAdmin 
              ? 'Gere uma nova senha temporária para um usuário' 
              : 'Solicite um link para redefinir sua senha'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Seleção */}
        {step === 'selecao' && (
          <div className="space-y-4">
            {modoAdmin ? (
              <>
                {/* Modo Admin - Selecionar Usuário */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900 mb-1">Permissão de Gestor</h3>
                      <p className="text-sm text-amber-700">
                        Você está prestes a resetar a senha de outro usuário. Esta ação gerará uma senha temporária 
                        que deverá ser alterada no primeiro acesso.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Selecione o Usuário *</Label>
                  <Select value={formData.usuario_id} onValueChange={(value) => {
                    const user = usuarios.find(u => u.id === value);
                    setFormData({ 
                      ...formData, 
                      usuario_id: value,
                      email: user?.email || ''
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{user.nome}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {usuarioSelecionado && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">{usuarioSelecionado.nome}</p>
                          <p className="text-xs text-blue-700">{usuarioSelecionado.email}</p>
                        </div>
                        <Badge className="bg-blue-600 text-white">
                          {usuarioSelecionado.perfil}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Método de Envio</Label>
                  <Select value={formData.metodo_envio} onValueChange={(value) => setFormData({ ...formData, metodo_envio: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">📧 E-mail</SelectItem>
                      <SelectItem value="manual">👤 Informar Manualmente</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.metodo_envio === 'email' 
                      ? 'A senha será enviada para o e-mail do usuário' 
                      : 'Você receberá a senha para informar ao usuário pessoalmente'}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Modo Usuário - Próprio Reset */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Redefinição por E-mail</h3>
                      <p className="text-sm text-blue-700">
                        Um link seguro será enviado para o seu e-mail com instruções para criar uma nova senha. 
                        O link expira em 1 hora.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Seu E-mail *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Confirme o e-mail cadastrado no sistema
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Confirmação */}
        {step === 'confirmacao' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900 mb-1">Confirme a Ação</h3>
                  <p className="text-sm text-red-700">
                    {modoAdmin 
                      ? `Você está prestes a resetar a senha de ${usuarioSelecionado?.nome}. A senha atual será invalidada.`
                      : 'Você receberá um e-mail com instruções para criar uma nova senha. Sua senha atual continuará válida até que você conclua o processo.'}
                  </p>
                </div>
              </div>
            </div>

            {modoAdmin && usuarioSelecionado && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Dados do Usuário</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nome:</span>
                    <span className="font-medium">{usuarioSelecionado.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">E-mail:</span>
                    <span className="font-medium">{usuarioSelecionado.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Perfil:</span>
                    <Badge className="bg-blue-600 text-white">{usuarioSelecionado.perfil}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Método:</span>
                    <span className="font-medium">
                      {formData.metodo_envio === 'email' ? '📧 E-mail' : '👤 Manual'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Sucesso */}
        {step === 'sucesso' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Senha Resetada com Sucesso!</h3>
                  <p className="text-sm text-green-700">
                    {modoAdmin 
                      ? formData.metodo_envio === 'email'
                        ? `Um e-mail foi enviado para ${usuarioSelecionado?.email} com a nova senha temporária.`
                        : 'A senha temporária foi gerada. Copie e informe ao usuário com segurança.'
                      : 'Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.'}
                  </p>
                </div>
              </div>
            </div>

            {modoAdmin && formData.metodo_envio === 'manual' && senhaTemporaria && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-yellow-900 mb-3">Senha Temporária</h3>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={senhaTemporaria}
                    readOnly
                    className="font-mono bg-white"
                  />
                  <Button onClick={copiarSenha} variant="outline">
                    Copiar
                  </Button>
                </div>
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ Esta senha deve ser alterada no primeiro acesso. Informe ao usuário com segurança.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'selecao' && (
            <>
              <Button onClick={handleClose} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleConfirmar} className="bg-indigo-600 hover:bg-indigo-700">
                Continuar
              </Button>
            </>
          )}
          {step === 'confirmacao' && (
            <>
              <Button onClick={() => setStep('selecao')} variant="outline">
                Voltar
              </Button>
              <Button onClick={handleReset} className="bg-red-600 hover:bg-red-700">
                Confirmar Reset
              </Button>
            </>
          )}
          {step === 'sucesso' && (
            <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}