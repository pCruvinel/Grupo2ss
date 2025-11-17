'use client';

import { useState, useEffect } from 'react';
import './app/globals.css';
import Dashboard from './components/pages/Dashboard';
import Empresas from './components/pages/Empresas';
import Usuarios from './components/pages/Usuarios';
import DashboardFinanceiro from './components/pages/DashboardFinanceiro';
import Despesas from './components/pages/Despesas';
import Contratos from './components/pages/Contratos';
import Materiais from './components/pages/Materiais';
import OrdensServico from './components/pages/OrdensServico';
import Veiculos from './components/pages/Veiculos';
import DashboardRH from './components/pages/DashboardRH';
import Colaboradores from './components/pages/Colaboradores';
import Cargos from './components/pages/Cargos';
import Ponto from './components/pages/Ponto';
import FolhaPagamento from './components/pages/FolhaPagamento';
import Pagamentos from './components/pages/Pagamentos';
import MeusContratos from './components/pages/MeusContratos';
import NotasFiscais from './components/pages/NotasFiscais';
import Catalogos from './components/pages/Catalogos';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Badge } from './components/ui/badge';
import { CompanySwitcher } from './components/CompanySwitcher';
import { EmpresaProvider } from './contexts/EmpresaContext';
import { MOCK_USERS, MOCK_EMPRESAS, MOCK_SERVICOS_CATALOGO } from './data/mockData';
import type { Usuario } from './types';

export default function App() {
  const [user, setUser] = useState<Usuario | null>(null);
  const [email, setEmail] = useState('diretoria@grupo2s.com');
  const [password, setPassword] = useState('demo123');
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [loading, setLoading] = useState(false);

  // Carregar usuário do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('mock_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('mock_user');
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = Object.values(MOCK_USERS).find(u => u.email === email);
    
    if (foundUser) {
      // Mapeamento de IDs antigos para novos
      const empresaIdMap: Record<string, string> = {
        '1': '2s-locacoes',
        '2': '2s-marketing',
        '3': '2s-producoes',
        'grupo': 'grupo-2s'
      };

      const mapearEmpresaId = (id: string | null | undefined): string => {
        if (!id) return 'grupo-2s';
        return empresaIdMap[id] || 'grupo-2s';
      };

      const mapearEmpresasIds = (empresas: string[] | undefined): string[] => {
        if (!empresas || empresas.length === 0) return ['grupo-2s'];
        return empresas.map(id => empresaIdMap[id] || 'grupo-2s');
      };

      // Normalizar estrutura do usuário para o EmpresaContext
      const normalizedUser = {
        ...foundUser,
        empresa_id: mapearEmpresaId(foundUser.empresa_id),
        empresas_ids: foundUser.perfil === 'admin_grupo' || foundUser.perfil === 'admin'
          ? ['grupo-2s', '2s-locacoes', '2s-marketing', '2s-producoes']
          : mapearEmpresasIds(foundUser.empresas)
      };
      
      setUser(normalizedUser as Usuario);
      localStorage.setItem('mock_user', JSON.stringify(normalizedUser));
      
      // Disparar evento para notificar useAuth
      window.dispatchEvent(new Event('user-login'));
      
      // Redirecionar baseado no perfil
      if (normalizedUser.perfil === 'cliente') {
        setCurrentPath('/cliente/meus-contratos');
      } else {
        setCurrentPath('/dashboard');
      }
    } else {
      alert('Credenciais inválidas');
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mock_user');
    setCurrentPath('/login');
  };

  // Função para renderizar a página correta
  const renderPage = () => {
    switch (currentPath) {
      case '/dashboard':
        return <Dashboard />;
      case '/admin/empresas':
        return <Empresas />;
      case '/admin/usuarios':
        return <Usuarios />;
      case '/financeiro/dashboard':
        return <DashboardFinanceiro />;
      case '/financeiro/despesas':
        return <Despesas />;
      case '/financeiro/contratos':
        return <Contratos />;
      case '/estoque/materiais':
        return <Materiais />;
      case '/operacional/ordens':
        return <OrdensServico />;
      case '/operacional/veiculos':
        return <Veiculos />;
      case '/rh/dashboard':
        return <DashboardRH />;
      case '/rh/colaboradores':
        return <Colaboradores />;
      case '/rh/cargos':
        return <Cargos />;
      case '/rh/ponto':
        return <Ponto />;
      case '/rh/folha-pagamento':
        return <FolhaPagamento />;
      case '/rh/pagamentos':
        return <Pagamentos />;
      case '/cliente/meus-contratos':
        return <MeusContratos />;
      case '/cliente/notas-fiscais':
        return <NotasFiscais />;
      case '/catalogos':
        return <Catalogos servicos={MOCK_SERVICOS_CATALOGO} empresas={MOCK_EMPRESAS} empresaAtual="1" />;
      default:
        return <Dashboard />;
    }
  };

  // Página de Login
  if (!user) {
    return (
      <EmpresaProvider>
        <div className="min-h-screen bg-white flex">
          {/* Coluna Esquerda - Branding */}
          <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1F4788] via-[#2557a8] to-[#1F4788] relative overflow-hidden">
            {/* Padrão de fundo decorativo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
            </div>

            <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
              {/* Logo e Header */}
              <div>
                <div className="flex items-center gap-3 mb-12">
                  <div className="bg-white/10 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center border border-white/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl">Sistema ERP</h2>
                    <p className="text-white/80 text-sm">Grupo 2S</p>
                  </div>
                </div>

                {/* Destaque */}
                <div className="space-y-6 max-w-md">
                  <h1 className="text-4xl leading-tight">
                    Gestão Integrada para o Grupo 2S
                  </h1>
                  <p className="text-white/90 text-lg">
                    Controle completo de 3 empresas em uma única plataforma. Financeiro, RH, Estoque e muito mais.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Multi-empresa</h3>
                    <p className="text-white/70 text-sm">Gerencie 2S Locações, Marketing e Produções simultaneamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Segurança Avançada</h3>
                    <p className="text-white/70 text-sm">Autenticação JWT e controle de acesso por perfil</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Relatórios Completos</h3>
                    <p className="text-white/70 text-sm">Dashboards, PDFs e planilhas Excel automatizadas</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-white/60 text-sm">
                © 2025 Grupo 2S. Todos os direitos reservados.
              </div>
            </div>
          </div>

          {/* Coluna Direita - Formulário de Login */}
          <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
            <div className="w-full max-w-md">
              {/* Header Mobile */}
              <div className="lg:hidden text-center mb-8">
                <div className="bg-[#1F4788] w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-2xl text-gray-900 mb-1">Sistema ERP</h1>
                <p className="text-gray-600">Grupo 2S</p>
              </div>

              {/* Card de Login */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl text-gray-900 mb-2">Bem-vindo de volta</h2>
                  <p className="text-gray-600">Entre com suas credenciais para acessar o sistema</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1F4788] focus:border-transparent outline-none transition"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700" htmlFor="password">
                        Senha
                      </label>
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => alert('Funcionalidade de recuperação de senha será implementada em breve!')}
                        className="h-auto p-0 text-sm text-[#1F4788] hover:text-[#163761]"
                      >
                        Esqueceu a senha?
                      </Button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1F4788] focus:border-transparent outline-none transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {/* Lembrar-me */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-gray-300 text-[#1F4788] focus:ring-[#1F4788]"
                    />
                    <label htmlFor="remember" className="text-sm text-gray-700 cursor-pointer">
                      Lembrar-me por 30 dias
                    </label>
                  </div>

                  {/* Botão de Login */}
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full bg-[#1F4788] text-white hover:bg-[#163761]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Entrando...
                      </>
                    ) : (
                      'Entrar no Sistema'
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Credenciais de teste</span>
                  </div>
                </div>

                {/* Usuários de Teste */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmail('diretoria@grupo2s.com');
                      setPassword('demo123');
                    }}
                    className="w-full h-auto p-3 justify-between hover:border-[#1F4788] hover:bg-blue-50 group"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm group-hover:text-[#1F4788]">👑 Admin do Grupo</span>
                      <span className="text-xs text-gray-500">diretoria@grupo2s.com</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1F4788]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmail('financeiro.grupo@grupo2s.com');
                      setPassword('demo123');
                    }}
                    className="w-full h-auto p-3 justify-between hover:border-[#1F4788] hover:bg-blue-50 group"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm group-hover:text-[#1F4788]">💼 Financeiro - Grupo 2S</span>
                      <span className="text-xs text-gray-500">Acesso a todas as empresas</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1F4788]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEmail('financeiro.marketing@grupo2s.com');
                      setPassword('demo123');
                    }}
                    className="w-full h-auto p-3 justify-between hover:border-[#1F4788] hover:bg-blue-50 group"
                  >
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm group-hover:text-[#1F4788]">💰 Financeiro - 2S Marketing</span>
                      <span className="text-xs text-gray-500">Apenas 2S Marketing</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-[#1F4788]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>

                  <details className="group">
                    <summary className="cursor-pointer text-sm text-gray-600 hover:text-[#1F4788] transition list-none flex items-center gap-2">
                      <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Ver mais credenciais
                    </summary>
                    <div className="mt-2 space-y-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEmail('operacional.multi@grupo2s.com');
                          setPassword('demo123');
                        }}
                        className="w-full h-auto p-2 justify-start text-left hover:bg-blue-50"
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-sm">🚚 Operacional Multi-empresas</span>
                          <span className="text-xs text-gray-500">Locações, Marketing e Produções</span>
                        </div>
                      </Button>
                      
                      <div className="pl-2 text-xs space-y-1 text-gray-600 border-l-2 border-gray-200 ml-2 py-2">
                        <p><strong>Gestor:</strong> gestor@grupo2s.com</p>
                        <p><strong>RH:</strong> rh@grupo2s.com</p>
                        <p><strong>Operacional:</strong> operacional@grupo2s.com</p>
                        <p><strong>Cliente:</strong> cliente@empresa.com</p>
                        <p className="text-gray-500 mt-2">Senha para todos: <strong>demo123</strong></p>
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              {/* Footer Info */}
              <p className="text-center text-xs text-gray-500 mt-6">
                Ao entrar, você concorda com nossos{' '}
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#1F4788]">
                  Termos de Uso
                </Button>
                {' e '}
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-[#1F4788]">
                  Política de Privacidade
                </Button>
              </p>
            </div>
          </div>
        </div>
      </EmpresaProvider>
    );
  }

  // Sistema Logado - Dashboard Simples
  return (
    <EmpresaProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Simplificada */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <CompanySwitcher />
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => setCurrentPath('/dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  currentPath === '/dashboard' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm">Dashboard</span>
              </button>

              {/* Admin Menu */}
              {user.perfil === 'admin_grupo' && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-500 px-3">Administração</p>
                  </div>
                  <button
                    onClick={() => setCurrentPath('/admin/empresas')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/admin/empresas' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-sm">Empresas</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/admin/usuarios')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/admin/usuarios' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm">Usuários</span>
                  </button>
                </>
              )}

              {/* Financeiro Menu */}
              {(user.perfil === 'admin_grupo' || user.perfil === 'gestor' || user.perfil === 'financeiro') && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-500 px-3">Financeiro</p>
                  </div>
                  <button
                    onClick={() => setCurrentPath('/financeiro/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/financeiro/dashboard' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm">Dashboard</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/financeiro/contratos')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/financeiro/contratos' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Contratos</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/financeiro/despesas')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/financeiro/despesas' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm">Despesas</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/catalogos')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/catalogos' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-sm">Catálogos</span>
                  </button>
                </>
              )}

              {/* RH Menu */}
              {(user.perfil === 'admin_grupo' || user.perfil === 'gestor' || user.perfil === 'rh') && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-500 px-3">Recursos Humanos</p>
                  </div>
                  <button
                    onClick={() => setCurrentPath('/rh/dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/rh/dashboard' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm">Dashboard</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/rh/colaboradores')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/rh/colaboradores' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm">Colaboradores</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/rh/cargos')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/rh/cargos' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Cargos</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/rh/ponto')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/rh/ponto' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Ponto</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/rh/folha-pagamento')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/rh/folha-pagamento' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Folha de Pagamento</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/rh/pagamentos')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/rh/pagamentos' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm">Pagamentos</span>
                  </button>
                </>
              )}

              {/* Estoque Menu */}
              {(user.perfil === 'admin_grupo' || user.perfil === 'gestor' || user.perfil === 'operacional') && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-500 px-3">Estoque</p>
                  </div>
                  <button
                    onClick={() => setCurrentPath('/estoque/materiais')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/estoque/materiais' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="text-sm">Materiais</span>
                  </button>
                </>
              )}

              {/* Operacional Menu */}
              {(user.perfil === 'admin_grupo' || user.perfil === 'gestor' || user.perfil === 'operacional') && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-500 px-3">Operacional</p>
                  </div>
                  <button
                    onClick={() => setCurrentPath('/operacional/ordens')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/operacional/ordens' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm">Ordens de Serviço</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/operacional/veiculos')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/operacional/veiculos' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm">Veículos</span>
                  </button>
                </>
              )}

              {/* Cliente Menu */}
              {user.perfil === 'cliente' && (
                <>
                  <div className="pt-4 pb-2">
                    <p className="text-xs text-gray-500 px-3">Minha Área</p>
                  </div>
                  <button
                    onClick={() => setCurrentPath('/cliente/meus-contratos')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/cliente/meus-contratos' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Meus Contratos</span>
                  </button>
                  <button
                    onClick={() => setCurrentPath('/cliente/notas-fiscais')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      currentPath === '/cliente/notas-fiscais' ? 'bg-[#1F4788] text-white' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm">Notas Fiscais</span>
                  </button>
                </>
              )}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-[#1F4788]">
                <AvatarFallback className="bg-gradient-to-br from-[#1F4788] to-[#2557a8] text-white">
                  {user.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{user.nome}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="w-full justify-center mb-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
            >
              {user.perfil === 'admin' && '👑 Administrador'}
              {user.perfil === 'admin_grupo' && '👑 Admin do Grupo'}
              {user.perfil === 'gestor' && '🎯 Gestor'}
              {user.perfil === 'financeiro' && '💼 Financeiro'}
              {user.perfil === 'rh' && '👥 Recursos Humanos'}
              {user.perfil === 'operacional' && '🚚 Operacional'}
              {user.perfil === 'cliente' && '👤 Cliente'}
            </Badge>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair do Sistema
            </Button>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
        
        {/* Toast Notifications */}
        <Toaster position="top-right" />
      </div>
    </EmpresaProvider>
  );
}