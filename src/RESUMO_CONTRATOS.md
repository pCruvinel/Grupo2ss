# 📄 Resumo: Módulo de Contratos

## 🎯 O Que É?

Sistema completo de gestão de contratos com clientes e fornecedores, implementando **parcelamento flexível (RN-003)** e integrado ao multi-tenancy do Grupo 2S.

---

## ✨ Funcionalidades

### 📝 **Criar Contratos**
- Modal com 3 abas (Cliente → Contrato → Parcelamento)
- Validações em tempo real
- Formatação automática (CPF/CNPJ, telefone)
- Dois tipos de parcelamento:
  - **Mensal:** Cálculo automático de parcelas
  - **Personalizado:** Valores e datas customizáveis

### 📊 **Listar Contratos**
- Visualização em **tabela** ou **cards**
- Filtros: busca, status, tipo
- Estatísticas em tempo real
- Exportação Excel/CSV

### 👁️ **Ver Detalhes**
- Informações completas do contrato
- Lista de parcelas com status
- Dados do cliente/fornecedor
- Cards de resumo (valor total, pago, pendente)

### 💰 **Gerenciar Parcelas**
- Modal com lista de parcelas
- Status: Pago ✅, Pendente ⏳, Atrasado 🔴
- Valor e vencimento de cada parcela

---

## 🏗️ Estrutura

```
/financeiro/contratos/
├── page.tsx                    # Listagem de contratos
├── [id]/page.tsx              # Detalhes do contrato
└── novo/                       # (futuro) Página de criação

/components/
├── modals/
│   └── NovoContratoModal.tsx  # Modal de criação (3 abas)
├── ContratosDashboard.tsx     # Dashboard completo
└── ContratoModal.tsx          # Modal legacy
```

---

## 📦 Dados

### **Contrato**
```typescript
{
  numero: "CT-2024-001",
  cliente_nome: "João Silva",
  cliente_cpf_cnpj: "123.456.789-00",
  empresa_id: "2s-locacoes",
  tipo: "Prestação de Serviços",
  valor_total: 12000,
  status: "ativo" | "concluido" | "cancelado",
  tipo_parcelamento: "mensal" | "personalizado",
  num_parcelas: 12,
  data_inicio: "2024-01-01",
  data_fim: "2024-12-31"
}
```

### **Parcela**
```typescript
{
  numero: 1,
  valor: 1000,
  vencimento: "2024-01-01",
  status: "pendente" | "pago" | "atrasado",
  data_pagamento?: "2024-01-05"
}
```

---

## 🎨 RN-003: Parcelamento Flexível

### **Tipo 1: Mensal**
```
✅ Automático
✅ Baseado em data_inicio e data_fim
✅ Parcelas mensais com mesmo valor

Exemplo:
Data: 01/01/2024 até 31/12/2024
Valor: R$ 12.000,00
Resultado: 12x de R$ 1.000,00
```

### **Tipo 2: Personalizado**
```
✅ Manual
✅ Usuário define número de parcelas
✅ Valores e datas customizáveis

Exemplo:
Parcela 1: R$ 5.000,00 - 15/01/2024
Parcela 2: R$ 3.000,00 - 20/02/2024
Parcela 3: R$ 4.000,00 - 10/03/2024
```

---

## 🔍 Filtros

| Filtro | Opções |
|--------|--------|
| **Busca** | Número, nome do cliente, CPF/CNPJ |
| **Status** | Todos, Ativo, Concluído, Cancelado |
| **Tipo** | Todos, Prestação de Serviços, Fornecimento, Locação, Outros |

---

## 📊 Estatísticas

| Métrica | Descrição |
|---------|-----------|
| **Total** | Número total de contratos |
| **Ativos** | Contratos em andamento |
| **Concluídos** | Contratos finalizados |
| **Cancelados** | Contratos cancelados |
| **Valor Total** | Soma de todos os contratos |
| **Valor Ativos** | Soma apenas dos ativos |

---

## 🎭 Status e Badges

### **Contratos**
- ✅ **Ativo** - Verde
- ✔️ **Concluído** - Azul
- ❌ **Cancelado** - Vermelho

### **Parcelas**
- ✅ **Pago** - Verde
- ⏳ **Pendente** - Amarelo
- 🔴 **Atrasado** - Vermelho

### **Parcelamento**
- 📅 **Mensal (12x)** - Azul
- ✏️ **Personalizado (6x)** - Roxo

---

## 🔄 Fluxo de Criação

```
1. Clica "Novo Contrato"
   ↓
2. Aba "Cliente"
   - Nome, CPF/CNPJ, Email, Telefone
   ↓
3. Aba "Contrato"
   - Tipo, Valor, Datas
   ↓
4. Aba "Parcelamento"
   - Escolhe: Mensal ou Personalizado
   - Se Mensal → Cálculo automático
   - Se Personalizado → Define parcelas
   ↓
5. Clica "Criar Contrato"
   ↓
6. Sistema valida
   ↓
7. Salva no Supabase
   ↓
8. Gera parcelas
   ↓
9. Toast de sucesso
```

---

## 🖥️ Telas

### **Listagem**
![Contratos - Listagem]
- Cards de estatísticas (6 cards)
- Filtros (busca, status, tipo)
- Toggle tabela/cards
- Botão "Novo Contrato"
- Exportar

### **Modal de Criação**
![Contratos - Modal]
- 3 abas navegáveis
- Campos formatados
- Validações inline
- Resumo do contrato

### **Detalhes**
![Contratos - Detalhes]
- Header com número e status
- 4 cards de resumo
- 3 abas (Detalhes, Parcelas, Cliente)
- Botões de ação

### **Modal de Parcelas**
![Contratos - Parcelas]
- Lista de parcelas
- Status colorido
- Valor e vencimento
- Resumo do contrato

---

## 🔐 Segurança

### **Multi-Tenancy**
```typescript
// Filtra automaticamente por empresa
.eq('empresa_id', empresa.id)
```

### **Row Level Security (RLS)**
```sql
-- Grupo 2S vê tudo
-- Empresas filhas veem apenas seus dados
```

---

## 📤 Exportação

**Formatos:**
- 📊 Excel (.xlsx)
- 📄 CSV (.csv)

**Dados Exportados:**
- Número, Cliente, Tipo, Valor
- Status, Parcelamento, Datas

---

## 🚀 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **React + TypeScript** | Frontend |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes |
| **Supabase** | Backend + RLS |
| **Sonner** | Toast notifications |
| **Motion** | Animações |

---

## 📈 Métricas

| Métrica | Valor |
|---------|-------|
| **Linhas de Código** | ~2.257 |
| **Componentes** | 4 principais |
| **Páginas** | 2 (listagem + detalhes) |
| **Modais** | 2 (criação + parcelas) |

---

## ✅ Checklist

- [x] Criação de contratos
- [x] Listagem com filtros
- [x] Visualização de detalhes
- [x] Sistema de parcelas
- [x] Parcelamento mensal (RN-003)
- [x] Parcelamento personalizado (RN-003)
- [x] Multi-tenancy
- [x] Validações
- [x] Formatação automática
- [x] Responsivo
- [x] Exportação
- [x] Integração Supabase
- [ ] Geração de PDF (futuro)
- [ ] Assinatura digital (futuro)
- [ ] Templates (futuro)

---

## 🎯 Status

✅ **COMPLETO E FUNCIONAL**

Módulo totalmente operacional com todas as funcionalidades básicas implementadas e testadas.

---

## 📝 Documentação Completa

Para detalhes técnicos completos, consulte:
- `/DOCUMENTACAO_CONTRATOS.md` - Documentação técnica detalhada

---

**Sistema:** ERP Grupo 2S  
**Versão:** 1.0  
**Última Atualização:** Novembro 2024
