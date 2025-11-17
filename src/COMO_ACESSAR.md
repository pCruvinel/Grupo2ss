# ✅ Como Acessar o Sistema ERP Grupo 2S

## 🚀 Estrutura do Projeto (Figma Make)

Este projeto está configurado para **Figma Make** e usa uma estrutura **SPA (Single Page Application)**.

### ⚡ Arquitetura Figma Make

```
FIGMA MAKE (SPA)
├── App.tsx                       # ✅ PONTO DE ENTRADA PRINCIPAL
│   └── Gerencia:
│       ├── Autenticação (localStorage)
│       ├── Roteamento interno (useState)
│       ├── Sidebar de navegação
│       └── Renderização de páginas
│
└── Importa páginas de:
    └── /app/(app)/*/page.tsx     # Componentes das páginas
```

### 📂 Estrutura de Arquivos Completa

```
/
├── App.tsx                       # ⭐ ARQUIVO PRINCIPAL (Figma Make)
│   └── Importa todas as páginas e gerencia roteamento SPA
│
├── app/                          # Páginas Next.js (importadas pelo App.tsx)
│   ├── globals.css              # Estilos globais
│   │
│   ├── (app)/                   # Páginas funcionais
│   │   ├── dashboard/page.tsx   # 🏠 Dashboard Principal
│   │   │
│   │   ├── admin/               # Módulo Administrativo
│   │   │   ├── empresas/        # Gestão de empresas
│   │   │   └── usuarios/        # Gestão de usuários
│   │   │
│   │   ├── financeiro/          # Módulo Financeiro
│   │   │   ├── dashboard/       # Dashboard financeiro
│   │   │   ├── contratos/       # Gestão de contratos
│   │   │   └── despesas/        # Gestão de despesas
│   │   │
│   │   ├── rh/                  # Módulo RH
│   │   │   ├── dashboard/       # Dashboard RH
│   │   │   ├── colaboradores/   # Gestão de colaboradores
│   │   │   ├── cargos/          # Gestão de cargos
│   │   │   ├── ponto/           # Controle de ponto
│   │   │   ├── folha-pagamento/ # Folha de pagamento
│   │   │   └── pagamentos/      # Pagamentos
│   │   │
│   │   ├── estoque/             # Módulo Estoque
│   │   │   └── materiais/       # Gestão de materiais
│   │   │
│   │   ├── operacional/         # Módulo Operacional
│   │   │   ├── ordens/          # Ordens de serviço
│   │   │   └── veiculos/        # Gestão de veículos
│   │   │
│   │   └── cliente/             # Portal do Cliente
│   │       ├── meus-contratos/  # Contratos do cliente
│   │       └── notas-fiscais/   # Notas fiscais
│   │
│   └── (auth)/                  # ⚠️ Não usado no Figma Make
│       ├── login/page.tsx       # (Login está em App.tsx)
│       └── layout.tsx           # (Layout está em App.tsx)
│
├── components/                   # ✅ Componentes React
│   ├── ui/                      # shadcn/ui components (29 componentes)
│   ├── shared/                  # Componentes compartilhados (18 componentes)
│   ├── layout/                  # Sidebar, ResponsiveLayout
│   ├── modals/                  # Modais específicos
│   ├── grupo/                   # Painel Grupo 2S
│   └── *.tsx                    # Dashboards principais
│
├── hooks/                        # ✅ Custom Hooks (11 hooks)
│   ├── useAuth.ts               # Autenticação
│   ├── useTable.ts              # Tabelas otimizadas
│   ├── useFilters.ts            # Filtros reutilizáveis
│   ├── useModal.ts              # Gerenciamento de modais
│   ├── useOptimizedData.ts      # ⭐ 6 hooks de performance (NOVO)
│   └── index.ts                 # Re-exports
│
├── lib/                          # ✅ Bibliotecas e Utilitários
│   ├── toast.ts                 # ⭐ Toast centralizado (NOVO)
│   ├── badge-variants.ts        # ⭐ Helpers type-safe (NOVO)
│   ├── calculations.ts          # Cálculos reutilizáveis
│   ├── validators.ts            # Validações
│   ├── mock-data.ts             # ⭐ Re-export de dados mockados (NOVO)
│   └── utils.ts                 # Utilitários gerais
│
├── data/                         # ✅ Dados Mockados
│   ├── mockData.ts              # Dados principais consolidados
│   ├── mockHistorico.ts         # Históricos
│   └── mockPontoData.ts         # Dados de ponto
│
├── types/                        # ✅ TypeScript Types
│   └── index.ts                 # 850+ linhas, 100% tipado
│
└── docs/                         # ✅ Documentação Completa
    ├── README.md                # Índice de documentação
    ├── DOCUMENTACAO_TECNICA.md  # Arquitetura completa
    ├── GUIA_OTIMIZACAO.md       # ⭐ Guia de performance (NOVO)
    ├── PROBLEMAS_ALTA_SEVERIDADE.md # ⭐ Problemas 9-13 (NOVO)
    └── ... 8 outros documentos
```

---

## 🎯 Como Funciona (Figma Make)

### Fluxo do Sistema

```
┌─────────────────────┐
│    Figma Make       │
│    Renderiza:       │
│    /App.tsx         │ ⭐ PONTO DE ENTRADA
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   App.tsx           │
│   useState para:    │
│   - user            │
│   - currentPath     │
│   - email/password  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Não logado?       │
│   Mostra tela       │
│   de login          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   handleLogin()     │
│   Valida em         │
│   MOCK_USERS        │
│   Salva em          │
│   localStorage      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Logado!           │
│   Renderiza:        │
│   - Sidebar         │
│   - renderPage()    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   renderPage()      │
│   Switch case       │
│   currentPath       │
│   Importa e         │
│   renderiza página  │
└─────────────────────┘
```

### Diferenças: Next.js vs Figma Make

| Recurso | Next.js Real | Figma Make (Este Projeto) |
|---------|--------------|---------------------------|
| **Arquivo principal** | `/app/page.tsx` | `/App.tsx` ✅ |
| **Roteamento** | App Router automático | useState + switch case ✅ |
| **Autenticação** | Server Components | localStorage ✅ |
| **Navegação** | `<Link>` / `useRouter()` | `onClick={() => setCurrentPath()}` ✅ |
| **Layouts** | `layout.tsx` aninhados | Sidebar em App.tsx ✅ |
| **Build** | `next build` | Não requer build ✅ |

---

## 🔐 Como Acessar o Sistema

### Passo 1: Visualizar no Figma Make

O Figma Make automaticamente renderiza o arquivo `/App.tsx`.

**Você verá**:
- Tela de login com fundo azul degradê
- Logo do Grupo 2S
- Formulário de email/senha
- Lista de usuários de teste

### Passo 2: Escolher Perfil de Usuário

Usuários disponíveis (qualquer senha funciona):

| Perfil | Email | Descrição |
|--------|-------|-----------|
| 👑 **Admin Grupo** | diretoria@grupo2s.com | Acesso total a todas empresas |
| 🏢 **Gestor** | gestor@grupo2s.com | 2S Locações + Produções |
| 💼 **Financeiro** | financeiro@grupo2s.com | Módulo Financeiro completo |
| 👥 **RH** | rh@grupo2s.com | Módulo RH + todas empresas |
| 🚚 **Operacional** | operacional@grupo2s.com | Módulo Operacional |
| 👤 **Cliente** | cliente@empresa.com | Portal do Cliente limitado |

### Passo 3: Navegar no Sistema

Após login:
- **Sidebar** aparece à esquerda
- **Menu** mostra apenas opções permitidas para o perfil
- **Clique** nos itens do menu para navegar
- **Logout** no rodapé da sidebar