# 🚀 Guia Rápido: Multi-Tenancy Grupo 2S

## ⚡ Início Rápido

### 1. Executar Migration no Supabase

```bash
# No Supabase Dashboard:
# SQL Editor → New Query → Cole o arquivo:
/supabase/multi-tenancy-migration.sql

# Execute (Ctrl + Enter)
```

### 2. Usar o Context nas Páginas

```tsx
'use client';

import { useEmpresaContext } from '../contexts/EmpresaContext';

export default function MinhaPage() {
  const { empresaAtiva, isMasterAccess } = useEmpresaContext();

  return (
    <div>
      <h1>Empresa Atual: {empresaAtiva?.nome}</h1>
      {isMasterAccess && <p>👑 Acesso Master</p>}
    </div>
  );
}
```

### 3. Filtrar Dados por Empresa (Automático!)

```tsx
// O RLS filtra automaticamente!
const { data } = await supabase
  .from('contratos')
  .select('*');
// ✅ Retorna apenas dados da empresa do usuário
// ✅ Se Grupo 2S → retorna TUDO
```

---

## 🎨 Aplicar Cor Primária Dinamicamente

### Inline Style
```tsx
<div style={{ backgroundColor: 'var(--color-primary)' }}>
  Conteúdo
</div>
```

### Tailwind Class Customizada
```tsx
<div className="bg-primary-dynamic">
  Conteúdo
</div>
```

### Via Hook
```tsx
const { empresaAtiva } = useEmpresaContext();

<div style={{ color: empresaAtiva.primary }}>
  Texto com cor primária
</div>
```

---

## 🏢 Temas das Empresas

| Empresa | Cor Primária | Como Usar |
|---------|--------------|-----------|
| Grupo 2S | `#F97316` (Laranja) | `var(--color-primary)` |
| 2S Locações | `#3B82F6` (Azul) | `var(--color-primary)` |
| 2S Marketing | `#3B82F6` (Azul) | `var(--color-primary)` |
| 2S Produções | `#7E22CE` (Roxo) | `var(--color-primary)` |

**Cor Secundária:** `var(--color-secondary)`

---

## 🔐 Verificar Tipo de Acesso

```tsx
const { empresaAtiva, isMasterAccess } = useEmpresaContext();

if (isMasterAccess) {
  // Usuário é do Grupo 2S (Holding)
  // Tem acesso a TODAS as empresas
} else {
  // Usuário de empresa filial
  // Acesso restrito à sua empresa
}
```

---

## 🔄 Trocar Empresa Programaticamente

```tsx
const { setEmpresaAtiva } = useEmpresaContext();

// Trocar para 2S Marketing
setEmpresaAtiva('2s-marketing');
```

---

## 📝 Casos de Uso Comuns

### 1. Mostrar Nome da Empresa no Header
```tsx
function Header() {
  const { empresaAtiva } = useEmpresaContext();
  
  return (
    <header>
      <h1>{empresaAtiva?.nome}</h1>
    </header>
  );
}
```

### 2. Badge com Cor da Empresa
```tsx
function StatusBadge({ children }) {
  const { empresaAtiva } = useEmpresaContext();
  
  return (
    <span 
      className="px-2 py-1 rounded"
      style={{ 
        backgroundColor: empresaAtiva.primary,
        color: empresaAtiva.primaryForeground
      }}
    >
      {children}
    </span>
  );
}
```

### 3. Botão com Cor Primária
```tsx
function PrimaryButton({ children, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="px-4 py-2 rounded bg-primary-dynamic text-white"
    >
      {children}
    </button>
  );
}
```

### 4. Listar Todas as Empresas Disponíveis
```tsx
function EmpresasList() {
  const { empresasDisponiveis } = useEmpresaContext();
  
  return (
    <ul>
      {empresasDisponiveis.map(empresa => (
        <li key={empresa.id}>{empresa.nome}</li>
      ))}
    </ul>
  );
}
```

---

## 🔍 Debugging

### Ver Empresa Ativa no Console
```tsx
const { empresaAtiva } = useEmpresaContext();
console.log('Empresa Ativa:', empresaAtiva);
```

### Ver Todas as Empresas
```tsx
const { empresasDisponiveis } = useEmpresaContext();
console.log('Empresas Disponíveis:', empresasDisponiveis);
```

### Ver Variáveis CSS
```javascript
// No console do navegador:
const primary = getComputedStyle(document.documentElement)
  .getPropertyValue('--color-primary');
console.log('Cor Primária:', primary);
```

---

## ⚠️ Troubleshooting

### CompanySwitcher Não Aparece
**Causa:** Usuário tem acesso a apenas 1 empresa  
**Solução:** Adicione mais empresas para o usuário na tabela `user_empresas`

### Cores Não Mudam
**Causa:** Classe do tema não está sendo aplicada  
**Solução:** Verifique se `<EmpresaProvider>` envolve o app

### RLS Bloqueando Dados
**Causa:** Políticas RLS muito restritivas  
**Solução:** Execute a migration completa do `/supabase/multi-tenancy-migration.sql`

### Tema Padrão Aplicado
**Causa:** `empresaAtiva` está null  
**Solução:** Verifique se usuário tem `empresa_id` ou `empresas_ids` válidos

---

## 📋 Checklist de Uso

- [ ] Migration executada no Supabase
- [ ] `<EmpresaProvider>` envolvendo o app
- [ ] Hook `useEmpresaContext()` importado
- [ ] CSS variables usadas nos componentes
- [ ] RLS testado com diferentes usuários
- [ ] CompanySwitcher aparecendo para usuários multi-empresa
- [ ] Temas trocando corretamente

---

## 🎯 Exemplos Práticos

### Página com Filtro Automático
```tsx
'use client';

import { useEmpresaContext } from '../contexts/EmpresaContext';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '../lib/supabase/client';

export default function ContratosPage() {
  const { empresaAtiva, loading } = useEmpresaContext();
  const supabase = createClient();

  const { data: contratos } = useQuery({
    queryKey: ['contratos', empresaAtiva?.id],
    queryFn: async () => {
      // RLS filtra automaticamente!
      const { data } = await supabase
        .from('contratos')
        .select('*')
        .order('created_at', { ascending: false });
      
      return data;
    },
    enabled: !loading && !!empresaAtiva,
  });

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <h1 style={{ color: 'var(--color-primary)' }}>
        Contratos - {empresaAtiva?.nome}
      </h1>
      
      {/* Lista de contratos */}
      {contratos?.map(contrato => (
        <div key={contrato.id}>
          {contrato.numero}
        </div>
      ))}
    </div>
  );
}
```

### Card com Tema Dinâmico
```tsx
function EmpresaCard() {
  const { empresaAtiva } = useEmpresaContext();
  
  return (
    <div className="p-6 rounded-lg border">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: empresaAtiva.primary }}
      >
        <span className="text-white text-xl">
          {empresaAtiva.tipo === 'holding' ? '🏢' : '🏪'}
        </span>
      </div>
      
      <h3 className="font-medium text-gray-900">
        {empresaAtiva.nome}
      </h3>
      
      <p className="text-sm text-gray-500">
        {empresaAtiva.tipo === 'holding' ? 'Holding' : 'Filial'}
      </p>
    </div>
  );
}
```

---

## 🚀 Deploy

### Variáveis de Ambiente
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### Build
```bash
npm run build
npm start
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador
2. Verifique os logs do Supabase
3. Execute a migration novamente
4. Consulte `/MULTI_TENANCY_IMPLEMENTACAO.md` para detalhes técnicos

---

**Sistema:** ERP Grupo 2S  
**Versão:** 1.0  
**Status:** ✅ Pronto para Uso
