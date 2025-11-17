# Documentação Técnica - Sistema ERP Grupo 2S

## 1. Visão Geral do Sistema

### 1.1 Descrição
Sistema ERP completo desenvolvido para o Grupo 2S, gerenciando 3 empresas distintas com segregação total de dados e 7 módulos principais integrados.

### 1.2 Tecnologias Utilizadas

#### Frontend
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript 5.x
- **Estilização**: Tailwind CSS v4.0
- **Componentes UI**: shadcn/ui
- **Ícones**: lucide-react
- **Gráficos**: recharts
- **Gerenciamento de Estado**: React Context API
- **Formulários**: React Hook Form 7.55.0

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Autenticação**: JWT com Supabase Auth
- **Segurança**: Row Level Security (RLS)
- **API**: Supabase REST API

#### Bibliotecas Auxiliares
- **Exportação Excel**: SheetJS (xlsx)
- **PDF**: jsPDF, html2canvas
- **Notificações**: Sonner 2.0.3
- **Validação**: Zod
- **Utilitários**: date-fns, clsx, tailwind-merge

### 1.3 Arquitetura

```
┌─────────────────────────────────────────────────┐
│           Frontend (Next.js 15)                 │
├─────────────────────────────────────────────────┤
│  App Router  │  Pages  │  Components  │ Hooks  │
├─────────────────────────────────────────────────┤
│         Context API (Estado Global)             │
├─────────────────────────────────────────────────┤
│           Supabase Client SDK                   │
└─────────────────────────────────────────────────┘
                      ↓ ↑
┌─────────────────────────────────────────────────┐
│        Supabase Backend (PostgreSQL)            │
├─────────────────────────────────────────────────┤
│  Auth JWT  │  RLS Policies  │  Database        │
├─────────────────────────────────────────────────┤
│  Row Level Security (empresa_id segregation)    │
└─────────────────────────────────────────────────┘
```

## 2. Estrutura do Projeto

```
/
├── app/                          # Next.js App Router
│   ├── (app)/                   # Rotas protegidas (autenticadas)
│   │   ├── admin/               # Módulo Administrativo
│   │   ├── cliente/             # Portal do Cliente
│   │   ├── dashboard/           # Dashboard Principal
│   │   ├── estoque/             # Módulo de Estoque
│   │   ├── financeiro/          # Módulo Financeiro
│   │   ├── operacional/         # Módulo Operacional
│   │   ├── rh/                  # Módulo de Recursos Humanos
│   │   └── layout.tsx           # Layout com Sidebar
│   ├── (auth)/                  # Rotas de autenticação
│   │   ├── login/
│   │   └── recuperar-senha/
│   ├── demo-regras/             # Página de demonstração RN
│   ├── diagnostico/             # Ferramentas de diagnóstico
│   ├── globals.css              # Estilos globais
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Página inicial
├── components/                   # Componentes React
│   ├── ui/                      # shadcn/ui components
│   ├── shared/                  # Componentes compartilhados
│   ├── layout/                  # Componentes de layout
│   ├── modals/                  # Modais reutilizáveis
│   ├── grupo/                   # Componentes do Painel Grupo
│   ├── widgets/                 # Widgets do Dashboard
│   └── [diversos].tsx           # Componentes específicos
├── lib/                         # Bibliotecas e utilitários
│   ├── supabase/                # Cliente Supabase
│   ├── export/                  # Funções de exportação
│   ├── calculations.ts          # Cálculos e rateios
│   ├── utils.ts                 # Funções utilitárias
│   ├── validators.ts            # Validações
│   └── figma-make-helpers.tsx   # Helpers globais (mocks)
├── hooks/                       # Custom React Hooks
│   ├── useAuth.ts               # Hook de autenticação
│   ├── useEmpresa.ts            # Hook de empresa
│   ├── useMockAuth.ts           # Mock de autenticação
│   └── [outros].ts
├── contexts/                    # React Contexts
│   └── ThemeContext.tsx         # Tema dinâmico por empresa
├── types/                       # TypeScript types/interfaces
│   └── index.ts
├── data/                        # Dados mockados
│   ├── mockData.ts
│   ├── mockHistorico.ts
│   └── mockPontoData.ts
├── utils/                       # Utilitários globais
│   ├── formatters.ts
│   ├── validators.ts
│   └── consolidacao.ts
├── styles/                      # Estilos
│   └── globals.css              # Tailwind + tokens CSS
├── supabase/                    # Schema do banco
│   └── schema.sql
└── docs/                        # Documentação
```

## 3. Módulos do Sistema

### 3.1 Módulo Administrativo
- **Gestão de Empresas**: CRUD completo, configurações
- **Gestão de Usuários**: Perfis, permissões, reset de senha
- **Painel Grupo 2S**: Visão consolidada das 3 empresas

### 3.2 Módulo Financeiro
- **Dashboard Financeiro**: KPIs, gráficos, análises
- **Contratos**: Gestão completa, parcelamento, rateio
- **Despesas**: Categorização, aprovação, rateio por empresa
- **Contas a Pagar/Receber**: Controle de fluxo de caixa

### 3.3 Módulo de RH
- **Dashboard RH**: Métricas de colaboradores
- **Colaboradores**: CRUD, documentos, histórico
- **Cargos**: Gestão de cargos e salários
- **Ponto Eletrônico**: Registro, justificativas, relatórios
- **Folha de Pagamento**: Cálculos, bônus, descontos
- **Pagamentos**: Histórico, comprovantes

### 3.4 Módulo Operacional
- **Ordens de Serviço**: Criação, acompanhamento, finalização
- **Veículos**: Gestão de frota, rastreamento GPS
- **Manutenções**: Agendamento, histórico

### 3.5 Módulo de Estoque
- **Materiais**: CRUD, controle de estoque
- **Bloqueio de Materiais**: RN-006 implementada
- **Histórico**: Movimentações, auditoria

### 3.6 Portal do Cliente
- **Contratos**: Visualização de contratos ativos
- **Notas Fiscais**: Download e consulta

### 3.7 Dashboard Principal
- **Visão Geral**: KPIs consolidados
- **Widgets Personalizados**: Por perfil de usuário
- **Busca Global**: Pesquisa em todo o sistema

## 4. Perfis de Usuário e Permissões

### 4.1 Perfis Implementados

| Perfil | Descrição | Acesso |
|--------|-----------|---------|
| **Super Admin** | Administrador do Grupo 2S | Todas as empresas, todos os módulos |
| **Admin** | Administrador de empresa | Empresa específica, todos os módulos |
| **Gestor** | Gerente de departamento | Empresa específica, módulos autorizados |
| **Operador** | Usuário operacional | Empresa específica, funcionalidades limitadas |
| **Cliente** | Cliente externo | Apenas portal do cliente |

### 4.2 Matriz de Permissões

| Funcionalidade | Super Admin | Admin | Gestor | Operador | Cliente |
|----------------|-------------|-------|--------|----------|---------|
| Painel Grupo 2S | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestão Empresas | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gestão Usuários | ✅ | ✅ | ❌ | ❌ | ❌ |
| Financeiro | ✅ | ✅ | ✅ | ✅* | ❌ |
| RH | ✅ | ✅ | ✅ | ✅* | ❌ |
| Operacional | ✅ | ✅ | ✅ | ✅ | ❌ |
| Estoque | ✅ | ✅ | ✅ | ✅ | ❌ |
| Portal Cliente | ✅ | ✅ | ❌ | ❌ | ✅ |
| Exportar Dados | ✅ | ✅ | ✅ | ❌ | ❌ |
| Aprovar Despesas | ✅ | ✅ | ✅ | ❌ | ❌ |

\* Funcionalidades limitadas (somente visualização ou operações básicas)

## 5. Identidade Visual por Empresa

### 5.1 2S Facilities
```typescript
{
  id: '1',
  nome: '2S Facilities',
  razao_social: '2S Facilities Ltda',
  cnpj: '12.345.678/0001-90',
  cores: {
    primaria: '#1F4788',    // Azul corporativo
    secundaria: '#28A745',   // Verde
    acento: '#FFC107'        // Amarelo
  },
  logo: '/logos/2s-facilities.svg'
}
```

### 5.2 2S Portaria
```typescript
{
  id: '2',
  nome: '2S Portaria',
  razao_social: '2S Portaria e Segurança Ltda',
  cnpj: '12.345.678/0002-71',
  cores: {
    primaria: '#1F4788',    // Azul corporativo
    secundaria: '#DC3545',   // Vermelho
    acento: '#17A2B8'        // Ciano
  },
  logo: '/logos/2s-portaria.svg'
}
```

### 5.3 2S Limpeza
```typescript
{
  id: '3',
  nome: '2S Limpeza',
  razao_social: '2S Limpeza e Conservação Ltda',
  cnpj: '12.345.678/0003-52',
  cores: {
    primaria: '#1F4788',    // Azul corporativo
    secundaria: '#28A745',   // Verde
    acento: '#6C757D'        // Cinza
  },
  logo: '/logos/2s-limpeza.svg'
}
```

## 6. Autenticação e Segurança

### 6.1 Fluxo de Autenticação

```typescript
// 1. Login
POST /auth/login
{
  email: "usuario@exemplo.com",
  password: "senha"
}

// 2. Resposta com JWT
{
  access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "uuid",
    email: "usuario@exemplo.com",
    perfil: "admin",
    empresa_id: "1"
  }
}

// 3. Headers subsequentes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 6.2 Row Level Security (RLS)

Todas as tabelas possuem políticas RLS baseadas em `empresa_id`:

```sql
-- Exemplo: Política RLS para tabela colaboradores
CREATE POLICY "Usuarios veem apenas colaboradores de sua empresa"
ON colaboradores
FOR SELECT
USING (empresa_id = auth.jwt() ->> 'empresa_id');

-- Super Admin tem acesso total
CREATE POLICY "Super Admin acessa tudo"
ON colaboradores
FOR ALL
USING (
  (auth.jwt() ->> 'perfil') = 'super_admin'
);
```

## 7. Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# Ambiente
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Features (opcional)
NEXT_PUBLIC_ENABLE_GPS=true
NEXT_PUBLIC_ENABLE_PDF_EXPORT=true
```

## 8. Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (porta 3000)

# Build
npm run build            # Cria build de produção
npm run start            # Inicia servidor de produção

# Testes
npm run lint             # Executa ESLint
npm run type-check       # Verifica tipos TypeScript

# Supabase (se instalado localmente)
npx supabase start       # Inicia Supabase local
npx supabase db reset    # Reseta banco com schema.sql
npx supabase migration new nome  # Cria nova migration
```

## 9. Convenções de Código

### 9.1 Nomenclatura
- **Componentes**: PascalCase (`DashboardFinanceiro.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`)
- **Utilitários**: camelCase (`formatCurrency.ts`)
- **Tipos**: PascalCase com sufixo quando necessário (`Usuario`, `ContratoDetalhes`)

### 9.2 Estrutura de Componentes
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from './components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
}

// 3. Component
export function Component({ title }: ComponentProps) {
  // 3.1 Hooks
  const [state, setState] = useState();
  
  // 3.2 Handlers
  const handleClick = () => {};
  
  // 3.3 Render
  return <div>{title}</div>;
}
```

### 9.3 Imports
- **Absolutos**: Para componentes UI e shared
  ```typescript
  import { Button } from './components/ui/button';
  ```
- **Relativos**: Para arquivos locais
  ```typescript
  import { formatCurrency } from '../../utils/formatters';
  ```

## 10. Performance e Otimização

### 10.1 Code Splitting
- Uso de dynamic imports para componentes pesados
- Lazy loading de modais e componentes não críticos

### 10.2 Caching
- SWR/React Query para cache de dados da API
- LocalStorage para preferências do usuário

### 10.3 Bundle Size
- Tree-shaking automático com Next.js
- Importações específicas de bibliotecas

## 11. Tratamento de Erros

### 11.1 Error Boundaries
```typescript
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
```

### 11.2 Toast Notifications
```typescript
import { toast } from 'sonner@2.0.3';

toast.success('Operação realizada com sucesso!');
toast.error('Erro ao processar requisição');
toast.warning('Atenção: dados incompletos');
toast.info('Informação importante');
```

## 12. Responsividade

### 12.1 Breakpoints Tailwind
```typescript
sm:   640px   // Mobile landscape
md:   768px   // Tablet
lg:   1024px  // Desktop
xl:   1280px  // Desktop large
2xl:  1536px  // Desktop XL
```

### 12.2 Estratégia Mobile-First
- Design mobile como base
- Progressive enhancement para telas maiores
- Sidebar colapsável em mobile
- Tabelas responsivas com scroll horizontal

## 13. Acessibilidade (a11y)

- Labels semânticos em formulários
- ARIA labels para ícones e botões
- Navegação por teclado
- Contraste de cores WCAG AA
- Focus visible em elementos interativos

## 14. Deploy

### 14.1 Vercel (Recomendado)
```bash
npm run build
vercel deploy
```

### 14.2 Outros Provedores
- Build: `npm run build`
- Start: `npm start`
- Porta: 3000 (configurável)

## 15. Manutenção e Suporte

### 15.1 Logs
- Console.error para erros críticos
- Toast para feedback ao usuário
- Sentry (opcional) para monitoramento

### 15.2 Versionamento
- Semantic Versioning (SemVer)
- Git flow com branches: main, develop, feature/*

### 15.3 Documentação de APIs
- Comentários JSDoc em funções complexas
- README em módulos principais
- Tipos TypeScript documentam contratos
