'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMockAuth } from '../../../hooks/useMockAuth';
import { MOCK_USERS } from '../../../data/mockData';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card } from '../../../components/ui/card';
import { Building2, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner@2.0.3';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useMockAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);
    
    if (result.success) {
      toast.success('Login realizado com sucesso!');
      
      // Redirecionar baseado no perfil
      if (result.user?.perfil === 'cliente') {
        router.push('/cliente/meus-contratos');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(result.error || 'Erro ao fazer login');
      toast.error('Credenciais inválidas');
    }
    
    setLoading(false);
  };

  // Quick login buttons para demo
  const quickLogin = (userKey: keyof typeof MOCK_USERS) => {
    const user = MOCK_USERS[userKey];
    setEmail(user.email);
    setPassword('demo123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1F4788] to-blue-900 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#1F4788] p-4 rounded-full mb-4">
            <Building2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-gray-900 text-center">Sistema de Gestão</h1>
          <p className="text-gray-600 text-center">Grupo 2S</p>
          <div className="mt-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
            <span className="text-xs text-blue-700">🎭 Modo Demo - Dados Mockados</span>
          </div>
        </div>

        {/* Info sobre credenciais demo */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Acesso Rápido (clique):</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => quickLogin('admin_grupo')}
                  className="block w-full text-left hover:underline"
                >
                  👑 Admin Grupo: diretoria@grupo2s.com
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('gestor')}
                  className="block w-full text-left hover:underline"
                >
                  🏢 Gestor: gestor@grupo2s.com
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('financeiro')}
                  className="block w-full text-left hover:underline"
                >
                  💼 Financeiro: financeiro@grupo2s.com
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('rh')}
                  className="block w-full text-left hover:underline"
                >
                  👥 RH: rh@grupo2s.com
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('operacional')}
                  className="block w-full text-left hover:underline"
                >
                  🚚 Operacional: operacional@grupo2s.com
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('cliente')}
                  className="block w-full text-left hover:underline"
                >
                  👤 Cliente: cliente@empresa.com
                </button>
              </div>
              <p className="mt-2 text-xs">Qualquer senha funciona no modo demo</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#1F4788] hover:bg-blue-800"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/recuperar-senha"
            className="text-sm text-[#1F4788] hover:underline"
          >
            Esqueceu sua senha?
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          © 2025 Grupo 2S - Todos os direitos reservados
        </div>
      </Card>
    </div>
  );
}