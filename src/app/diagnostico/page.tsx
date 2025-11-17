'use client';

import { useEffect, useState } from 'react';

export default function DiagnosticoPage() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    setInfo({
      url: window.location.href,
      pathname: window.location.pathname,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Diagnóstico do Sistema</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">✅ Sistema Next.js Carregado!</h2>
          <p className="text-green-600 mb-4">
            Se você está vendo esta página, o Next.js App Router está funcionando corretamente!
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Informações do Sistema</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-2">
              <span className="font-bold">URL Atual:</span>
              <span className="text-blue-600">{info.url}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Pathname:</span>
              <span className="text-blue-600">{info.pathname}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Supabase URL:</span>
              <span className={info.hasSupabaseUrl ? 'text-green-600' : 'text-red-600'}>
                {info.hasSupabaseUrl ? '✅ Configurado' : '❌ Não configurado'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Supabase Key:</span>
              <span className={info.hasSupabaseKey ? 'text-green-600' : 'text-red-600'}>
                {info.hasSupabaseKey ? '✅ Configurado' : '❌ Não configurado'}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold">Timestamp:</span>
              <span className="text-gray-600">{info.timestamp}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🗺️ Páginas Disponíveis</h2>
          <div className="grid gap-2">
            <a href="/login" className="text-blue-600 hover:underline">→ /login - Página de Login</a>
            <a href="/recuperar-senha" className="text-blue-600 hover:underline">→ /recuperar-senha - Recuperar Senha</a>
            <a href="/dashboard" className="text-blue-600 hover:underline">→ /dashboard - Dashboard (requer login)</a>
            <a href="/financeiro/contratos" className="text-blue-600 hover:underline">→ /financeiro/contratos - Contratos (requer login)</a>
            <a href="/admin/usuarios" className="text-blue-600 hover:underline">→ /admin/usuarios - Usuários (requer login admin)</a>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">⚠️ Se não configurou o Supabase ainda</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Crie um arquivo <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> na raiz do projeto</li>
            <li>Adicione as variáveis:
              <pre className="bg-gray-800 text-white p-3 rounded mt-2 text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui`}
              </pre>
            </li>
            <li>Reinicie o servidor: <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code></li>
            <li>Acesse novamente esta página para verificar</li>
          </ol>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Ir para Login →
          </a>
        </div>
      </div>
    </div>
  );
}
