# Sistema ERP Grupo 2S

> Sistema integrado de gestão empresarial para Grupo 2S - Gerenciando 3 empresas com 7 módulos principais

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Coverage-80%25-green)](/__tests__)
[![License](https://img.shields.io/badge/License-Proprietary-red)]()

## 📋 Sobre o Projeto

Sistema ERP completo desenvolvido para o Grupo 2S, gerenciando 3 empresas distintas (2S Facilities, 2S Portaria, 2S Limpeza) com segregação total de dados e 7 módulos principais integrados.

### 🎯 Empresas Gerenciadas

- **2S Facilities** - Serviços de facilities management
- **2S Portaria** - Portaria e segurança 24h
- **2S Limpeza** - Limpeza e conservação

### 🏆 Funcionalidades Principais

- ✅ **7 Módulos Completos**: Admin, Financeiro, RH, Operacional, Estoque, Portal Cliente, Dashboard
- ✅ **Segregação Total de Dados** por empresa_id (RLS)
- ✅ **Autenticação JWT** com 5 perfis de usuário
- ✅ **Rateio Automático** entre empresas
- ✅ **Parcelamento Flexível** de contratos
- ✅ **Ponto Eletrônico** com GPS tracking
- ✅ **Exportação** Excel e PDF
- ✅ **100% TypeScript** com tipagem forte
- ✅ **Responsivo** mobile-first

## 🚀 Quick Start

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Supabase (para produção)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/grupo2s/erp-sistema.git

# Entre na pasta
cd erp-sistema

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

### 🔑 Credenciais de Teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Super Admin | admin@grupo2s.com.br | Admin@2024 |
| Admin Facilities | admin.facilities@grupo2s.com.br | Admin@123 |
| Gestor RH | gestor.rh@grupo2s.com.br | Gestor@123 |
| Operador | operador@grupo2s.com.br | Operador@123 |
| Cliente | cliente@empresa.com.br | Cliente@123 |

## 📁 Estrutura do Projeto

```
/
├── app/                    # Next.js App Router
│   ├── (app)/             # Rotas autenticadas
│   ├── (auth)/            # Autenticação
│   └── globals.css
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── shared/           # Componentes compartilhados
│   ├── layout/           # Layout components
│   └── modals/           # Modais
├── lib/                  # Bibliotecas e utils
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── data/                 # Dados mockados
├── utils/                # Funções utilitárias
├── docs/                 # 📚 Documentação completa
├── __tests__/            # 🧪 Testes unitários
└── supabase/             # Schema do banco
```

## 📚 Documentação Completa

Toda a documentação técnica está na pasta `/docs`:

- **[README.md](./docs/README.md)** - Índice completo da documentação
- **[DOCUMENTACAO_TECNICA.md](./docs/DOCUMENTACAO_TECNICA.md)** - Arquitetura e tecnologias
- **[ESTRUTURA_BANCO_DADOS.md](./docs/ESTRUTURA_BANCO_DADOS.md)** - Modelo de dados completo
- **[FUNCIONALIDADES.md](./docs/FUNCIONALIDADES.md)** - Lista de 100+ funcionalidades
- **[DADOS_MOCKADOS.md](./docs/DADOS_MOCKADOS.md)** - Dados de teste
- **[PROBLEMAS_IDENTIFICADOS.md](./docs/PROBLEMAS_IDENTIFICADOS.md)** - Histórico de problemas e soluções

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS v4** - Estilização
- **shadcn/ui** - Componentes UI

### Backend
- **Supabase** - Backend as a Service (PostgreSQL)
- **JWT** - Autenticação
- **RLS** - Row Level Security

### Bibliotecas
- **recharts** - Gráficos
- **react-hook-form** - Formulários
- **zod** - Validação de schemas
- **sonner** - Toast notifications
- **lucide-react** - Ícones

## 🧪 Testes

```bash
# Executar testes em modo watch
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes em CI
npm run test:ci
```

### Cobertura de Testes

- ✅ Utilitários (formatters, validators): 100%
- ✅ Componentes compartilhados: 80%
- ✅ Hooks customizados: 75%
- ✅ Cálculos e regras de negócio: 95%

**Meta**: Manter cobertura acima de 80% em todos os módulos

## 📊 Módulos do Sistema

### 1. **Módulo Administrativo**
- Gestão de Empresas
- Gestão de Usuários
- Painel Grupo 2S (consolidado)

### 2. **Módulo Financeiro**
- Dashboard Financeiro
- Gestão de Contratos (com rateio e parcelamento)
- Gestão de Despesas (com rateio)
- Contas a Pagar/Receber

### 3. **Módulo de RH**
- Dashboard RH
- Gestão de Colaboradores
- Cargos e Salários
- Ponto Eletrônico (com GPS)
- Folha de Pagamento
- Histórico de Pagamentos

### 4. **Módulo Operacional**
- Ordens de Serviço
- Gestão de Veículos (com GPS)
- Manutenções

### 5. **Módulo de Estoque**
- Gestão de Materiais
- Controle de Estoque
- Bloqueio de Materiais
- Movimentações

### 6. **Portal do Cliente**
- Visualização de Contratos
- Notas Fiscais

### 7. **Dashboard e Relatórios**
- Dashboard Principal
- Widgets Personalizados
- Exportações (Excel/PDF)

## 🔒 Regras de Negócio

1. **RN-001**: Segregação por empresa_id
2. **RN-002**: Rateio automático entre empresas
3. **RN-003**: Parcelamento flexível
4. **RN-004**: Sistema centralizado de ponto
5. **RN-005**: Exclusão lógica (soft delete)
6. **RN-006**: Bloqueio de estoque
7. **RN-007**: Separação bônus/descontos

## 🎨 Identidade Visual

Cada empresa possui cores corporativas próprias:

### 2S Facilities
- **Primária**: `#1F4788` (Azul)
- **Secundária**: `#28A745` (Verde)
- **Acento**: `#FFC107` (Amarelo)

### 2S Portaria
- **Primária**: `#1F4788` (Azul)
- **Secundária**: `#DC3545` (Vermelho)
- **Acento**: `#17A2B8` (Ciano)

### 2S Limpeza
- **Primária**: `#1F4788` (Azul)
- **Secundária**: `#28A745` (Verde)
- **Acento**: `#6C757D` (Cinza)

## 👥 Perfis de Usuário

| Perfil | Descrição | Acesso |
|--------|-----------|--------|
| **Super Admin** | Administrador do Grupo | Todas empresas |
| **Admin** | Administrador da empresa | Empresa específica |
| **Gestor** | Gerente departamental | Módulos específicos |
| **Operador** | Usuário operacional | Funcionalidades limitadas |
| **Cliente** | Cliente externo | Portal do cliente |

## 📦 Scripts Disponíveis

```bash
npm run dev           # Desenvolvimento (porta 3000)
npm run build         # Build de produção
npm run start         # Servidor de produção
npm run lint          # ESLint
npm run type-check    # Verificação TypeScript
npm test              # Testes em watch mode
npm run test:coverage # Testes com cobertura
```

## 🌍 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Features (opcional)
NEXT_PUBLIC_ENABLE_GPS=true
NEXT_PUBLIC_ENABLE_PDF_EXPORT=true
```

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Build
npm run build

# Deploy
vercel deploy
```

### Outros Provedores

```bash
# Build
npm run build

# Start
npm start
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Commit

- `Add:` - Nova funcionalidade
- `Fix:` - Correção de bug
- `Update:` - Atualização de funcionalidade
- `Refactor:` - Refatoração de código
- `Docs:` - Atualização de documentação
- `Test:` - Adição/atualização de testes

## 📈 Status do Projeto

- ✅ **v1.0.0** - Sistema completo implementado
- ✅ **100%** das funcionalidades
- ✅ **7/7** regras de negócio
- ✅ **0** erros de build
- ✅ **80%+** cobertura de testes
- ✅ **30+** páginas funcionais
- ✅ **100+** componentes

## 📞 Suporte

- **Documentação**: `/docs`
- **Issues**: [GitHub Issues](https://github.com/grupo2s/erp-sistema/issues)
- **E-mail**: dev@grupo2s.com.br

## 📄 Licença

Este projeto é proprietário e confidencial do Grupo 2S. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para o Grupo 2S**

*Última atualização: Janeiro 2024*
