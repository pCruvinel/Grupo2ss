# 📄 Documentação Completa: Módulo de Contratos

## 📋 Visão Geral

O módulo de Contratos é um sistema completo de gestão de contratos com clientes e fornecedores, implementando a **RN-003 (Parcelamento Flexível)** e integrado ao sistema de multi-tenancy do Grupo 2S.

---

## 🎯 Funcionalidades Principais

### ✅ **1. Gestão de Contratos**

#### **1.1 Criação de Contratos**
- **Localização:** Modal `NovoContratoModal` + Página `/financeiro/contratos/novo`
- **Formulário em 3 Abas:**
  1. **Cliente** - Dados do cliente (nome, CPF/CNPJ, email, telefone, endereço)
  2. **Contrato** - Tipo, descrição, valor, vigência
  3. **Parcelamento** - Tipo (mensal/personalizado) e número de parcelas

**Campos Obrigatórios:**
- ✅ Nome do cliente
- ✅ CPF/CNPJ do cliente
- ✅ Tipo de contrato
- ✅ Valor total
- ✅ Data de início
- ✅ Data de fim
- ✅ Tipo de parcelamento

**Validações:**
- Data de fim deve ser posterior à data de início
- Valor total deve ser maior que zero
- CPF/CNPJ formatado automaticamente
- Telefone formatado automaticamente

#### **1.2 Listagem de Contratos**
- **Localização:** `/app/(app)/financeiro/contratos/page.tsx`
- **Modos de Visualização:**
  - 📊 **Tabela** - Lista completa com colunas
  - 📱 **Cards** - Grid responsivo para mobile

**Colunas da Tabela:**
- Número do contrato (clicável)
- Cliente (nome + CPF/CNPJ)
- Tipo de contrato
- Valor total
- Parcelamento (badge RN-003)
- Vigência (início → fim)
- Status (badge colorido)
- Ações (ver parcelas, ver detalhes)

#### **1.3 Detalhes do Contrato**
- **Localização:** `/app/(app)/financeiro/contratos/[id]/page.tsx`
- **3 Abas:**
  1. **Detalhes** - Informações do contrato
  2. **Parcelas** - Lista de parcelas com status
  3. **Cliente/Fornecedor** - Dados completos da entidade

**Cards de Resumo:**
- 💰 Valor Total
- ✅ Total Pago
- ⏳ Total Pendente
- 📄 Número de Parcelas

---

## 🔢 **RN-003: Parcelamento Flexível**

### **Tipos de Parcelamento**

#### **1. Parcelamento Mensal**
- Cálculo automático do número de parcelas
- Baseado na diferença entre data início e data fim
- Vencimento automático todo dia do mês

**Exemplo:**
```
Data início: 01/01/2024
Data fim: 31/12/2024
Resultado: 12 parcelas mensais
```

**Algoritmo:**
```typescript
const inicio = new Date(formData.data_inicio);
const fim = new Date(formData.data_fim);
const meses = (fim.getFullYear() - inicio.getFullYear()) * 12 
              + (fim.getMonth() - inicio.getMonth()) + 1;
numParcelas = meses;
```

#### **2. Parcelamento Personalizado**
- Usuário define número de parcelas manualmente
- Valores das parcelas podem ser diferentes
- Datas de vencimento customizáveis

**Características:**
- Flexibilidade total
- Parcelas com valores distintos
- Vencimentos não uniformes

---

## 📊 Estatísticas e Métricas

### **Cards de Estatísticas**
```tsx
const stats = {
  total: contratos.length,                          // Total de contratos
  ativos: contratos.filter(c => c.status === 'ativo').length,
  concluidos: contratos.filter(c => c.status === 'concluido').length,
  cancelados: contratos.filter(c => c.status === 'cancelado').length,
  valorTotal: contratos.reduce((acc, c) => acc + c.valor_total, 0),
  valorAtivos: contratos.filter(c => c.status === 'ativo')
                        .reduce((acc, c) => acc + c.valor_total, 0)
};
```

**Exibição:**
- 📄 Total de contratos
- ✅ Contratos ativos
- ✔️ Contratos concluídos
- ❌ Contratos cancelados
- 💰 Valor total de todos os contratos
- 💵 Valor total dos contratos ativos

---

## 🔍 Sistema de Filtros

### **Filtros Disponíveis**

#### **1. Busca por Texto**
- Número do contrato
- Nome do cliente
- CPF/CNPJ do cliente

#### **2. Filtro por Status**
- ✅ Ativo
- ✔️ Concluído
- ❌ Cancelado
- 📋 Todos

#### **3. Filtro por Tipo**
- Prestação de Serviços
- Fornecimento
- Locação
- Outros

**Implementação:**
```typescript
const contratosFiltrados = contratos.filter((c) => {
  const matchSearch = c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     c.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
  const matchStatus = filterStatus === 'todos' || c.status === filterStatus;
  const matchTipo = filterTipo === 'todos' || c.tipo === filterTipo;
  
  return matchSearch && matchStatus && matchTipo;
});
```

---

## 📦 Estrutura de Dados

### **Interface Contrato**

```typescript
interface Contrato {
  id: string;
  numero: string;                    // Número do contrato (ex: "CT-2024-001")
  
  // Cliente
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  cliente_email?: string;
  cliente_telefone?: string;
  cliente_endereco?: string;
  
  // Dados do Contrato
  empresa_id: string;                // RN-001: Segregação por empresa
  tipo: string;                      // Tipo de contrato
  descricao?: string;                // Descrição detalhada
  valor_total: number;               // Valor total do contrato
  
  // Status e Vigência
  status: 'ativo' | 'concluido' | 'cancelado';
  data_inicio: string;               // Data de início (ISO)
  data_fim: string;                  // Data de término (ISO)
  
  // Parcelamento (RN-003)
  tipo_parcelamento: 'mensal' | 'personalizado';
  num_parcelas?: number;             // Número de parcelas
  parcelas?: Parcela[];              // Array de parcelas
  
  // Outros
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}
```

### **Interface Parcela**

```typescript
interface Parcela {
  id: string;
  contrato_id: string;               // Foreign key
  numero: number;                    // Número da parcela (1, 2, 3...)
  valor: number;                     // Valor da parcela
  vencimento: string;                // Data de vencimento
  status: 'pendente' | 'pago' | 'atrasado';
  data_pagamento?: string;           // Data do pagamento (se pago)
  forma_pagamento?: string;          // PIX, TED, Boleto, etc.
}
```

---

## 🎨 Componentes

### **1. NovoContratoModal**
**Path:** `/components/modals/NovoContratoModal.tsx`

**Props:**
```typescript
interface NovoContratoModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contrato: any) => void;
  empresa_id: string;
}
```

**Características:**
- 3 abas navegáveis
- Validações em tempo real
- Formatação automática (CPF/CNPJ, telefone)
- Cálculo automático de parcelas mensais
- Toast notifications
- Reset ao fechar

### **2. ContratosDashboard**
**Path:** `/components/ContratosDashboard.tsx`

**Props:**
```typescript
interface ContratosDashboardProps {
  contratos: Contrato[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
}
```

**Funcionalidades:**
- Toggle tabela/cards
- Sistema de filtros
- Paginação (10 itens por página)
- Modal de parcelas
- Exportação de dados
- Geração automática de parcelas (RN-003)

### **3. Página de Contratos**
**Path:** `/app/(app)/financeiro/contratos/page.tsx`

**Características:**
- Integração com Supabase
- Cards de estatísticas
- Sistema de filtros avançado
- Modos de visualização
- Empty state customizado
- Loading state

### **4. Página de Detalhes**
**Path:** `/app/(app)/financeiro/contratos/[id]/page.tsx`

**3 Abas:**
- **Detalhes:** Informações completas do contrato
- **Parcelas:** Lista com status de cada parcela
- **Cliente/Fornecedor:** Dados da entidade

---

## 🎭 Estados e Status

### **Status de Contrato**
```typescript
type ContratoStatus = 'ativo' | 'concluido' | 'cancelado';
```

**Badges:**
- ✅ **Ativo** - Verde (`bg-green-100 text-green-700`)
- ✔️ **Concluído** - Azul (`bg-blue-100 text-blue-700`)
- ❌ **Cancelado** - Vermelho (`bg-red-100 text-red-700`)

### **Status de Parcela**
```typescript
type ParcelaStatus = 'pendente' | 'pago' | 'atrasado';
```

**Badges:**
- ✅ **Pago** - Verde
- ⏳ **Pendente** - Amarelo
- 🔴 **Atrasado** - Vermelho

### **Tipo de Parcelamento**
```typescript
type TipoParcelamento = 'mensal' | 'personalizado';
```

**Badges:**
- 📅 **Mensal (Nx)** - Azul (`bg-blue-100 text-blue-700`)
- ✏️ **Personalizado (Nx)** - Roxo (`bg-purple-100 text-purple-700`)

---

## 🔄 Fluxos de Trabalho

### **Fluxo 1: Criar Novo Contrato**

```
1. Usuário clica em "Novo Contrato"
   ↓
2. Modal abre na aba "Cliente"
   ↓
3. Preenche dados do cliente
   - Nome, CPF/CNPJ, Email, Telefone
   - Formatação automática
   ↓
4. Avança para aba "Contrato"
   ↓
5. Preenche dados do contrato
   - Tipo, Valor, Datas
   - Validações em tempo real
   ↓
6. Avança para aba "Parcelamento"
   ↓
7. Escolhe tipo:
   
   SE Mensal:
   - Sistema calcula parcelas automaticamente
   - Baseado em data_inicio e data_fim
   
   SE Personalizado:
   - Usuário define número de parcelas
   - Pode customizar valores/datas
   ↓
8. Clica em "Criar Contrato"
   ↓
9. Validações finais
   ↓
10. Salva no Supabase
    ↓
11. Gera parcelas
    ↓
12. Toast de sucesso
    ↓
13. Retorna para listagem
```

### **Fluxo 2: Visualizar Parcelas**

```
1. Na listagem, clica no ícone "👁️ Ver Parcelas"
   ↓
2. Modal de parcelas abre
   ↓
3. Exibe:
   - Resumo do contrato
   - Lista de parcelas
   - Status de cada parcela
   ↓
4. Para cada parcela mostra:
   - Número (Parcela 1, 2, 3...)
   - Valor
   - Data de vencimento
   - Status (badge colorido)
   - Data de pagamento (se pago)
   ↓
5. Usuário pode:
   - Visualizar informações
   - (Futuro) Marcar como paga
   - (Futuro) Gerar boleto
```

### **Fluxo 3: Ver Detalhes do Contrato**

```
1. Clica no número do contrato ou em "Detalhes"
   ↓
2. Redireciona para /financeiro/contratos/[id]
   ↓
3. Carrega dados do Supabase:
   - Contrato
   - Parcelas
   - Cliente/Fornecedor
   ↓
4. Exibe header com:
   - Número do contrato
   - Status (badge)
   - Botões de ação (Editar, Baixar PDF)
   ↓
5. Cards de resumo:
   - Valor Total
   - Total Pago
   - Total Pendente
   - Número de Parcelas
   ↓
6. Abas navegáveis:
   - Detalhes do contrato
   - Lista de parcelas
   - Dados do cliente/fornecedor
```

---

## 📊 Geração Automática de Parcelas

### **Algoritmo para Parcelamento Mensal**

```typescript
const gerarParcelasMensais = (
  valorTotal: number, 
  numParcelas: number, 
  dataInicio: string
): Parcela[] => {
  const valorParcela = valorTotal / numParcelas;
  const parcelas: Parcela[] = [];
  const inicio = new Date(dataInicio);

  for (let i = 0; i < numParcelas; i++) {
    const vencimento = new Date(inicio);
    vencimento.setMonth(vencimento.getMonth() + i);
    
    parcelas.push({
      id: `parcela-${i + 1}`,
      numero: i + 1,
      valor: valorParcela,
      vencimento: vencimento.toISOString().split('T')[0],
      status: 'pendente'
    });
  }

  return parcelas;
};
```

**Exemplo:**
```
Valor Total: R$ 12.000,00
Data Início: 01/01/2024
Data Fim: 31/12/2024
Resultado: 12 parcelas de R$ 1.000,00

Parcela 1: R$ 1.000,00 - Vencimento: 01/01/2024
Parcela 2: R$ 1.000,00 - Vencimento: 01/02/2024
Parcela 3: R$ 1.000,00 - Vencimento: 01/03/2024
...
Parcela 12: R$ 1.000,00 - Vencimento: 01/12/2024
```

---

## 🎨 Interface do Usuário

### **Página de Listagem**

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Contratos                          [Tabela][Cards][Export]│
│ 2S Locações • 15 contrato(s)          [+ Novo Contrato]      │
│ [RN-003: Parcelamento Flexível]                             │
├─────────────────────────────────────────────────────────────┤
│ [Total: 15] [Ativos: 10] [Concluídos: 3] [Cancelados: 2]   │
│ [Valor Total: R$ 150k] [Ativos: R$ 120k]                    │
├─────────────────────────────────────────────────────────────┤
│ Buscar: [___________] Status: [Todos▼] Tipo: [Todos▼]      │
├─────────────────────────────────────────────────────────────┤
│ Nº         Cliente      Tipo    Valor   Parcelas   Status   │
│ CT-001     João Silva   Locação R$ 10k  12x Mensal ✅ Ativo │
│ CT-002     Maria Costa  Serviço R$ 5k   6x Person. ✅ Ativo │
│ CT-003     Tech Corp    Forne.  R$ 20k  24x Mensal ✔️ Concl.│
└─────────────────────────────────────────────────────────────┘
```

### **Modal de Criação**

```
┌─────────────────────────────────────────────────────┐
│ Novo Contrato                                       │
├─────────────────────────────────────────────────────┤
│ [Cliente] [Contrato] [Parcelamento]                 │
│                                                     │
│ ABA CLIENTE:                                        │
│ Nome: *[____________________________]               │
│ CPF/CNPJ: *[___.___.___-__]                        │
│ Email: [____________________________]               │
│ Telefone: [(__)_____-____]                         │
│                                                     │
│                           [Cancelar] [Próximo →]   │
└─────────────────────────────────────────────────────┘
```

### **Modal de Parcelas**

```
┌─────────────────────────────────────────────────────┐
│ 📅 Parcelas do Contrato - CT-001                    │
│ Parcelamento mensal com 12 parcelas                 │
├─────────────────────────────────────────────────────┤
│ Cliente: João Silva                                 │
│ Valor Total: R$ 12.000,00                          │
├─────────────────────────────────────────────────────┤
│ [Parcela 1] Vencimento: 01/01/2024  R$ 1.000 ✅ Pago│
│ [Parcela 2] Vencimento: 01/02/2024  R$ 1.000 ✅ Pago│
│ [Parcela 3] Vencimento: 01/03/2024  R$ 1.000 ⏳ Pend│
│ [Parcela 4] Vencimento: 01/04/2024  R$ 1.000 ⏳ Pend│
│ ...                                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Integração com Multi-Tenancy

### **Segregação por Empresa (RN-001)**

```typescript
// Ao carregar contratos
const { data: contratosData } = await supabase
  .from('contratos')
  .select('*')
  .eq('empresa_id', empresa.id)  // ← Filtra por empresa
  .order('data_inicio', { ascending: false });
```

### **Row Level Security (RLS)**

```sql
-- Política de SELECT
CREATE POLICY "contratos_select_policy" ON contratos
FOR SELECT USING (
  has_master_access(auth.uid())  -- Grupo 2S vê tudo
  OR
  empresa_id IN (
    SELECT empresa_id FROM user_empresas 
    WHERE user_id = auth.uid()
  )
);
```

---

## 📤 Exportação de Dados

### **Formatos Disponíveis**
- 📊 Excel (.xlsx)
- 📄 CSV (.csv)
- 📋 PDF (futuro)

**Dados Exportados:**
- Número do contrato
- Cliente (nome + CPF/CNPJ)
- Tipo
- Valor total
- Status
- Tipo de parcelamento
- Número de parcelas
- Data início
- Data fim

---

## 🚀 Funcionalidades Futuras

### **Planejadas**

- [ ] **Geração de PDF** - Contrato formatado para impressão
- [ ] **Assinatura Digital** - Integração com DocuSign/Clicksign
- [ ] **Templates de Contrato** - Modelos pré-definidos
- [ ] **Renovação Automática** - Contratos recorrentes
- [ ] **Alertas de Vencimento** - Notificações via email
- [ ] **Dashboard de Contratos** - Gráficos e métricas
- [ ] **Histórico de Alterações** - Auditoria completa
- [ ] **Anexos** - Upload de documentos
- [ ] **Integração com Boletos** - Geração automática
- [ ] **Integração com PIX** - QR Code para pagamento

---

## 📝 Exemplos de Uso

### **Criar Contrato via API**

```typescript
const novoContrato = {
  cliente_nome: 'João Silva',
  cliente_cpf_cnpj: '123.456.789-00',
  cliente_email: 'joao@email.com',
  empresa_id: '2s-locacoes',
  tipo: 'Prestação de Serviços',
  valor_total: 12000,
  data_inicio: '2024-01-01',
  data_fim: '2024-12-31',
  tipo_parcelamento: 'mensal',
  num_parcelas: 12,
  status: 'ativo'
};

const { data, error } = await supabase
  .from('contratos')
  .insert([novoContrato])
  .select()
  .single();
```

### **Buscar Contratos Ativos**

```typescript
const { data: contratosAtivos } = await supabase
  .from('contratos')
  .select('*')
  .eq('empresa_id', empresaAtiva.id)
  .eq('status', 'ativo')
  .order('data_inicio', { ascending: false });
```

### **Atualizar Status da Parcela**

```typescript
const { error } = await supabase
  .from('parcelas')
  .update({ 
    status: 'pago',
    data_pagamento: new Date().toISOString(),
    forma_pagamento: 'PIX'
  })
  .eq('id', parcelaId);
```

---

## ✨ Destaques

### **Pontos Fortes**

✅ **RN-003 Implementada** - Parcelamento flexível (mensal e personalizado)  
✅ **Interface Intuitiva** - 3 abas organizadas logicamente  
✅ **Validações Robustas** - Previne erros de entrada  
✅ **Formatação Automática** - CPF/CNPJ, telefone  
✅ **Responsivo** - Funciona em desktop e mobile  
✅ **Integrado** - Multi-tenancy, Supabase, RLS  
✅ **Extensível** - Fácil adicionar novos recursos  

### **Tecnologias**

- ⚛️ React + TypeScript
- 🎨 Tailwind CSS + shadcn/ui
- 🗄️ Supabase (PostgreSQL + RLS)
- 📊 DataTable customizado
- 🎭 Badges dinâmicos
- 🔔 Toast notifications (Sonner)

---

## 📊 Métricas

**Arquivos Principais:**
- `/app/(app)/financeiro/contratos/page.tsx` (535 linhas)
- `/app/(app)/financeiro/contratos/[id]/page.tsx` (422 linhas)
- `/components/modals/NovoContratoModal.tsx` (~500 linhas)
- `/components/ContratosDashboard.tsx` (~800 linhas)

**Total:** ~2.257 linhas de código

**Componentes shadcn/ui Utilizados:**
- Dialog, Card, Button, Badge, Input, Label
- Select, Tabs, Table, Pagination
- Toast (Sonner)

---

## 🎯 Status

✅ **FUNCIONALIDADE COMPLETA E OPERACIONAL**

- ✅ Criação de contratos
- ✅ Listagem com filtros
- ✅ Visualização de detalhes
- ✅ Sistema de parcelas
- ✅ RN-003 implementada
- ✅ Multi-tenancy integrado
- ✅ Responsivo
- ✅ Validações completas
- ✅ Integração Supabase

---

**Versão:** 1.0  
**Última Atualização:** Novembro 2024  
**Sistema:** ERP Grupo 2S
