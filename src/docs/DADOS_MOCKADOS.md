# Dados Mockados - Sistema ERP Grupo 2S

## 1. Visão Geral

Este documento descreve todos os dados mockados (simulados) utilizados no sistema para desenvolvimento e testes. Os dados estão organizados por módulo e podem ser encontrados nos arquivos:

- `/data/mockData.ts` - Dados principais
- `/data/mockHistorico.ts` - Histórico de movimentações
- `/data/mockPontoData.ts` - Dados de ponto eletrônico
- `/lib/mock-data.ts` - Dados auxiliares
- `/lib/figma-make-helpers.tsx` - Mocks e helpers globais

## 2. Empresas Mockadas

### 2.1 2S Facilities
```typescript
{
  id: '1',
  nome: '2S Facilities',
  razao_social: '2S Facilities Serviços Ltda',
  cnpj: '12.345.678/0001-90',
  cores: {
    primaria: '#1F4788',
    secundaria: '#28A745',
    acento: '#FFC107'
  },
  logo: '/logos/2s-facilities.svg',
  ativo: true,
  created_at: '2023-01-15T10:00:00Z'
}
```

### 2.2 2S Portaria
```typescript
{
  id: '2',
  nome: '2S Portaria',
  razao_social: '2S Portaria e Segurança Ltda',
  cnpj: '12.345.678/0002-71',
  cores: {
    primaria: '#1F4788',
    secundaria: '#DC3545',
    acento: '#17A2B8'
  },
  logo: '/logos/2s-portaria.svg',
  ativo: true,
  created_at: '2023-01-15T10:00:00Z'
}
```

### 2.3 2S Limpeza
```typescript
{
  id: '3',
  nome: '2S Limpeza',
  razao_social: '2S Limpeza e Conservação Ltda',
  cnpj: '12.345.678/0003-52',
  cores: {
    primaria: '#1F4788',
    secundaria: '#28A745',
    acento: '#6C757D'
  },
  logo: '/logos/2s-limpeza.svg',
  ativo: true,
  created_at: '2023-01-15T10:00:00Z'
}
```

## 3. Usuários Mockados

### 3.1 Super Admin
```typescript
{
  id: 'user-super-admin',
  email: 'admin@grupo2s.com.br',
  senha: 'Admin@2024',
  nome: 'Administrador Grupo 2S',
  perfil: 'super_admin',
  empresa_id: null, // Acesso a todas as empresas
  avatar_url: 'https://ui-avatars.com/api/?name=Admin+Grupo&background=1F4788&color=fff',
  telefone: '(11) 99999-0001',
  ativo: true
}
```

### 3.2 Admin 2S Facilities
```typescript
{
  id: 'user-admin-facilities',
  email: 'admin.facilities@grupo2s.com.br',
  senha: 'Admin@123',
  nome: 'João Silva',
  perfil: 'admin',
  empresa_id: '1',
  avatar_url: 'https://ui-avatars.com/api/?name=Joao+Silva&background=1F4788&color=fff',
  telefone: '(11) 99999-0002',
  ativo: true
}
```

### 3.3 Gestor RH
```typescript
{
  id: 'user-gestor-rh',
  email: 'gestor.rh@grupo2s.com.br',
  senha: 'Gestor@123',
  nome: 'Maria Santos',
  perfil: 'gestor',
  empresa_id: '1',
  avatar_url: 'https://ui-avatars.com/api/?name=Maria+Santos&background=28A745&color=fff',
  telefone: '(11) 99999-0003',
  ativo: true
}
```

### 3.4 Operador
```typescript
{
  id: 'user-operador',
  email: 'operador@grupo2s.com.br',
  senha: 'Operador@123',
  nome: 'Carlos Oliveira',
  perfil: 'operador',
  empresa_id: '2',
  avatar_url: 'https://ui-avatars.com/api/?name=Carlos+Oliveira&background=DC3545&color=fff',
  telefone: '(11) 99999-0004',
  ativo: true
}
```

### 3.5 Cliente
```typescript
{
  id: 'user-cliente',
  email: 'cliente@empresa.com.br',
  senha: 'Cliente@123',
  nome: 'Ana Costa',
  perfil: 'cliente',
  empresa_id: '1',
  avatar_url: 'https://ui-avatars.com/api/?name=Ana+Costa&background=6C757D&color=fff',
  telefone: '(11) 99999-0005',
  ativo: true
}
```

## 4. Colaboradores Mockados

### 4.1 Exemplos de Colaboradores (2S Facilities)
```typescript
[
  {
    id: 'col-001',
    empresa_id: '1',
    nome: 'Pedro Henrique Santos',
    cpf: '123.456.789-01',
    cargo_id: 'cargo-001',
    cargo: 'Zelador',
    departamento: 'Operacional',
    email: 'pedro.santos@grupo2s.com.br',
    telefone: '(11) 98888-0001',
    data_admissao: '2023-06-15',
    salario_base: 2500.00,
    status: 'ativo'
  },
  {
    id: 'col-002',
    empresa_id: '1',
    nome: 'Juliana Ferreira',
    cpf: '234.567.890-12',
    cargo_id: 'cargo-002',
    cargo: 'Supervisor',
    departamento: 'Operacional',
    email: 'juliana.ferreira@grupo2s.com.br',
    telefone: '(11) 98888-0002',
    data_admissao: '2022-03-10',
    salario_base: 4500.00,
    status: 'ativo'
  },
  {
    id: 'col-003',
    empresa_id: '1',
    nome: 'Roberto Lima',
    cpf: '345.678.901-23',
    cargo_id: 'cargo-003',
    cargo: 'Gerente Operacional',
    departamento: 'Gerência',
    email: 'roberto.lima@grupo2s.com.br',
    telefone: '(11) 98888-0003',
    data_admissao: '2021-01-20',
    salario_base: 8000.00,
    status: 'ativo'
  },
  {
    id: 'col-004',
    empresa_id: '1',
    nome: 'Fernanda Costa',
    cpf: '456.789.012-34',
    cargo_id: 'cargo-001',
    cargo: 'Zelador',
    departamento: 'Operacional',
    email: 'fernanda.costa@grupo2s.com.br',
    telefone: '(11) 98888-0004',
    data_admissao: '2023-09-01',
    salario_base: 2500.00,
    status: 'ferias'
  }
]
```

### 4.2 Estatísticas de Colaboradores
```typescript
{
  total: 45,
  por_empresa: {
    '1': 18, // 2S Facilities
    '2': 15, // 2S Portaria
    '3': 12  // 2S Limpeza
  },
  por_status: {
    ativo: 38,
    ferias: 4,
    afastado: 2,
    demitido: 1
  }
}
```

## 5. Cargos Mockados

```typescript
[
  {
    id: 'cargo-001',
    empresa_id: '1',
    nome: 'Zelador',
    descricao: 'Responsável pela limpeza e manutenção básica',
    salario_base: 2500.00,
    nivel: 'Operacional',
    ativo: true
  },
  {
    id: 'cargo-002',
    empresa_id: '1',
    nome: 'Supervisor',
    descricao: 'Supervisiona equipe operacional',
    salario_base: 4500.00,
    nivel: 'Supervisão',
    ativo: true
  },
  {
    id: 'cargo-003',
    empresa_id: '1',
    nome: 'Gerente Operacional',
    descricao: 'Gerencia operações da unidade',
    salario_base: 8000.00,
    nivel: 'Gerência',
    ativo: true
  },
  {
    id: 'cargo-004',
    empresa_id: '2',
    nome: 'Porteiro',
    descricao: 'Controle de acesso e segurança',
    salario_base: 2800.00,
    nivel: 'Operacional',
    ativo: true
  },
  {
    id: 'cargo-005',
    empresa_id: '3',
    nome: 'Auxiliar de Limpeza',
    descricao: 'Serviços de limpeza e conservação',
    salario_base: 2300.00,
    nivel: 'Operacional',
    ativo: true
  }
]
```

## 6. Contratos Mockados

```typescript
[
  {
    id: 'contrato-001',
    empresa_id: '1',
    numero: 'CONT-2024-001',
    cliente_nome: 'Shopping Center Alpha',
    cliente_documento: '98.765.432/0001-10',
    valor_total: 150000.00,
    data_inicio: '2024-01-01',
    data_fim: '2024-12-31',
    status: 'ativo',
    tipo_servico: 'Facilities Management',
    observacoes: 'Contrato anual com renovação automática',
    rateio_empresas: [
      { empresa_id: '1', percentual: 60 },
      { empresa_id: '3', percentual: 40 }
    ],
    parcelas: 12,
    valor_parcela: 12500.00
  },
  {
    id: 'contrato-002',
    empresa_id: '2',
    numero: 'CONT-2024-002',
    cliente_nome: 'Condomínio Residencial Beta',
    cliente_documento: '87.654.321/0001-21',
    valor_total: 84000.00,
    data_inicio: '2024-02-01',
    data_fim: '2025-01-31',
    status: 'ativo',
    tipo_servico: 'Portaria e Segurança 24h',
    observacoes: 'Inclui sistema de monitoramento',
    rateio_empresas: [
      { empresa_id: '2', percentual: 100 }
    ],
    parcelas: 12,
    valor_parcela: 7000.00
  },
  {
    id: 'contrato-003',
    empresa_id: '3',
    numero: 'CONT-2024-003',
    cliente_nome: 'Hospital São Lucas',
    cliente_documento: '76.543.210/0001-32',
    valor_total: 240000.00,
    data_inicio: '2024-01-15',
    data_fim: '2024-12-31',
    status: 'ativo',
    tipo_servico: 'Limpeza Hospitalar',
    observacoes: 'Serviço especializado com protocolo hospitalar',
    rateio_empresas: [
      { empresa_id: '3', percentual: 100 }
    ],
    parcelas: 12,
    valor_parcela: 20000.00
  }
]
```

## 7. Despesas Mockadas

```typescript
[
  {
    id: 'desp-001',
    empresa_id: '1',
    descricao: 'Material de Limpeza - Janeiro',
    categoria: 'material',
    valor: 3500.00,
    data: '2024-01-10',
    status: 'aprovado',
    fornecedor: 'Distribuidora Clean Pro',
    tipo_rateio: 'percentual',
    rateio_empresas: [
      { empresa_id: '1', percentual: 50, valor: 1750.00 },
      { empresa_id: '3', percentual: 50, valor: 1750.00 }
    ],
    aprovado_por: 'user-admin-facilities',
    data_aprovacao: '2024-01-11T10:00:00Z',
    comprovante_url: '/documentos/nota-fiscal-001.pdf'
  },
  {
    id: 'desp-002',
    empresa_id: '2',
    descricao: 'Uniformes Equipe Portaria',
    categoria: 'equipamento',
    valor: 2800.00,
    data: '2024-01-15',
    status: 'aprovado',
    fornecedor: 'Uniformes Total',
    tipo_rateio: 'unica',
    rateio_empresas: [
      { empresa_id: '2', percentual: 100, valor: 2800.00 }
    ],
    aprovado_por: 'user-super-admin',
    data_aprovacao: '2024-01-16T09:30:00Z'
  },
  {
    id: 'desp-003',
    empresa_id: '1',
    descricao: 'Vale Transporte - Janeiro',
    categoria: 'transporte',
    valor: 4200.00,
    data: '2024-01-05',
    status: 'pago',
    fornecedor: 'SPTrans',
    tipo_rateio: 'percentual',
    rateio_empresas: [
      { empresa_id: '1', percentual: 40, valor: 1680.00 },
      { empresa_id: '2', percentual: 35, valor: 1470.00 },
      { empresa_id: '3', percentual: 25, valor: 1050.00 }
    ],
    aprovado_por: 'user-super-admin',
    data_aprovacao: '2024-01-06T08:00:00Z'
  }
]
```

## 8. Materiais de Estoque Mockados

```typescript
[
  {
    id: 'mat-001',
    empresa_id: '1',
    codigo: 'MAT-001',
    nome: 'Detergente Neutro 5L',
    descricao: 'Detergente neutro para limpeza geral',
    categoria: 'Limpeza',
    unidade: 'un',
    quantidade_estoque: 45,
    quantidade_minima: 20,
    preco_unitario: 28.50,
    bloqueado: false,
    foto_url: '/imagens/detergente.jpg'
  },
  {
    id: 'mat-002',
    empresa_id: '1',
    codigo: 'MAT-002',
    nome: 'Álcool Gel 70% - 500ml',
    descricao: 'Álcool em gel para higienização',
    categoria: 'Higiene',
    unidade: 'un',
    quantidade_estoque: 120,
    quantidade_minima: 50,
    preco_unitario: 12.90,
    bloqueado: false
  },
  {
    id: 'mat-003',
    empresa_id: '1',
    codigo: 'MAT-003',
    nome: 'Luva de Procedimento G',
    descricao: 'Caixa com 100 unidades',
    categoria: 'EPI',
    unidade: 'cx',
    quantidade_estoque: 15,
    quantidade_minima: 30,
    preco_unitario: 45.00,
    bloqueado: false
  },
  {
    id: 'mat-004',
    empresa_id: '2',
    codigo: 'MAT-004',
    nome: 'Lanterna Tática LED',
    descricao: 'Lanterna profissional recarregável',
    categoria: 'Equipamento',
    unidade: 'un',
    quantidade_estoque: 8,
    quantidade_minima: 10,
    preco_unitario: 89.90,
    bloqueado: false
  },
  {
    id: 'mat-005',
    empresa_id: '3',
    codigo: 'MAT-005',
    nome: 'MOP Profissional 60cm',
    descricao: 'Mop com cabo telescópico',
    categoria: 'Limpeza',
    unidade: 'un',
    quantidade_estoque: 0,
    quantidade_minima: 15,
    preco_unitario: 125.00,
    bloqueado: true,
    motivo_bloqueio: 'Aguardando nova remessa - qualidade inadequada',
    bloqueado_por: 'user-gestor-rh',
    data_bloqueio: '2024-01-20T14:30:00Z'
  }
]
```

## 9. Registros de Ponto Mockados

```typescript
// Exemplo de semana de ponto (colaborador col-001)
[
  {
    id: 'ponto-001',
    colaborador_id: 'col-001',
    colaborador_nome: 'Pedro Henrique Santos',
    data: '2024-01-15',
    entrada: '08:00',
    saida_almoco: '12:00',
    retorno_almoco: '13:00',
    saida: '17:00',
    horas_trabalhadas: 8.00,
    tipo: 'normal',
    latitude: -23.550520,
    longitude: -46.633308
  },
  {
    id: 'ponto-002',
    colaborador_id: 'col-001',
    data: '2024-01-16',
    entrada: '08:05',
    saida_almoco: '12:00',
    retorno_almoco: '13:00',
    saida: '17:10',
    horas_trabalhadas: 8.08,
    tipo: 'normal',
    latitude: -23.550520,
    longitude: -46.633308
  },
  {
    id: 'ponto-003',
    colaborador_id: 'col-001',
    data: '2024-01-17',
    entrada: null,
    saida_almoco: null,
    retorno_almoco: null,
    saida: null,
    horas_trabalhadas: 0,
    tipo: 'atestado',
    justificativa: 'Atestado médico - Consulta oftalmológica',
    aprovado_por: 'user-gestor-rh'
  },
  {
    id: 'ponto-004',
    colaborador_id: 'col-001',
    data: '2024-01-18',
    entrada: '08:00',
    saida_almoco: '12:00',
    retorno_almoco: '13:00',
    saida: '17:00',
    horas_trabalhadas: 8.00,
    tipo: 'normal',
    latitude: -23.550520,
    longitude: -46.633308
  }
]
```

## 10. Veículos Mockados

```typescript
[
  {
    id: 'veic-001',
    empresa_id: '1',
    placa: 'ABC-1234',
    modelo: 'Fiorino',
    marca: 'Fiat',
    ano: 2020,
    tipo: 'Utilitário',
    km_atual: 45230,
    status: 'ativo',
    gps_ativo: true,
    ultima_localizacao: {
      latitude: -23.550520,
      longitude: -46.633308,
      timestamp: '2024-01-20T15:30:00Z',
      endereco: 'Av. Paulista, 1000 - São Paulo/SP'
    },
    proximo_manutencao_km: 50000
  },
  {
    id: 'veic-002',
    empresa_id: '2',
    placa: 'DEF-5678',
    modelo: 'Spin',
    marca: 'Chevrolet',
    ano: 2021,
    tipo: 'Van',
    km_atual: 32100,
    status: 'ativo',
    gps_ativo: true,
    ultima_localizacao: {
      latitude: -23.561414,
      longitude: -46.656180,
      timestamp: '2024-01-20T15:35:00Z',
      endereco: 'Rua Augusta, 500 - São Paulo/SP'
    },
    proximo_manutencao_km: 40000
  },
  {
    id: 'veic-003',
    empresa_id: '1',
    placa: 'GHI-9012',
    modelo: 'Strada',
    marca: 'Fiat',
    ano: 2019,
    tipo: 'Pickup',
    km_atual: 78900,
    status: 'manutencao',
    gps_ativo: true,
    ultima_localizacao: {
      latitude: -23.533773,
      longitude: -46.625290,
      timestamp: '2024-01-18T10:00:00Z',
      endereco: 'Oficina Auto Center - São Paulo/SP'
    },
    proximo_manutencao_km: 80000
  }
]
```

## 11. Ordens de Serviço Mockadas

```typescript
[
  {
    id: 'os-001',
    empresa_id: '1',
    numero: 'OS-2024-001',
    contrato_id: 'contrato-001',
    tipo_servico: 'Limpeza de Fachada',
    descricao: 'Limpeza completa da fachada externa do shopping',
    local: 'Shopping Center Alpha - Fachada Principal',
    data_abertura: '2024-01-10T09:00:00Z',
    data_prevista: '2024-01-15',
    data_conclusao: '2024-01-14T16:30:00Z',
    status: 'concluida',
    prioridade: 'alta',
    responsavel_id: 'col-002',
    responsavel_nome: 'Juliana Ferreira',
    observacoes: 'Serviço realizado conforme planejado'
  },
  {
    id: 'os-002',
    empresa_id: '2',
    numero: 'OS-2024-002',
    contrato_id: 'contrato-002',
    tipo_servico: 'Troca de Turno',
    descricao: 'Substituição de porteiro em turno noturno',
    local: 'Condomínio Residencial Beta - Portaria',
    data_abertura: '2024-01-12T18:00:00Z',
    data_prevista: '2024-01-12',
    status: 'em_andamento',
    prioridade: 'urgente',
    responsavel_id: 'col-010',
    responsavel_nome: 'Marcos Paulo',
    observacoes: 'Porteiro titular em atestado médico'
  },
  {
    id: 'os-003',
    empresa_id: '3',
    numero: 'OS-2024-003',
    contrato_id: 'contrato-003',
    tipo_servico: 'Limpeza Terminal',
    descricao: 'Limpeza terminal em UTI - Protocolo hospitalar',
    local: 'Hospital São Lucas - UTI 3º Andar',
    data_abertura: '2024-01-18T06:00:00Z',
    data_prevista: '2024-01-18',
    status: 'aberta',
    prioridade: 'alta',
    responsavel_id: 'col-025',
    responsavel_nome: 'Sandra Lima',
    observacoes: 'Seguir protocolo de limpeza hospitalar rigorosamente'
  }
]
```

## 12. Parcelas Mockadas

```typescript
// Parcelas do contrato-001 (Shopping Center Alpha)
[
  {
    id: 'parc-001',
    contrato_id: 'contrato-001',
    numero_parcela: 1,
    valor: 12500.00,
    data_vencimento: '2024-01-05',
    data_pagamento: '2024-01-04',
    status: 'pago',
    forma_pagamento: 'Transferência Bancária',
    comprovante_url: '/documentos/comprovante-001.pdf'
  },
  {
    id: 'parc-002',
    contrato_id: 'contrato-001',
    numero_parcela: 2,
    valor: 12500.00,
    data_vencimento: '2024-02-05',
    data_pagamento: '2024-02-03',
    status: 'pago',
    forma_pagamento: 'Transferência Bancária',
    comprovante_url: '/documentos/comprovante-002.pdf'
  },
  {
    id: 'parc-003',
    contrato_id: 'contrato-001',
    numero_parcela: 3,
    valor: 12500.00,
    data_vencimento: '2024-03-05',
    data_pagamento: null,
    status: 'pendente',
    forma_pagamento: null
  }
]
```

## 13. Dados Consolidados (Painel Grupo)

```typescript
{
  kpis_consolidados: {
    receita_total: 474000.00, // Soma de todos os contratos ativos
    despesas_total: 156300.00, // Soma de todas as despesas aprovadas
    lucro_bruto: 317700.00,
    margem_lucro: 67.03, // Em percentual
    total_colaboradores: 45,
    total_contratos: 12,
    total_veiculos: 8
  },
  por_empresa: {
    '1': { // 2S Facilities
      receita: 210000.00,
      despesas: 68200.00,
      lucro: 141800.00,
      margem: 67.52,
      colaboradores: 18,
      contratos: 5,
      veiculos: 3
    },
    '2': { // 2S Portaria
      receita: 144000.00,
      despesas: 45100.00,
      lucro: 98900.00,
      margem: 68.68,
      colaboradores: 15,
      contratos: 4,
      veiculos: 2
    },
    '3': { // 2S Limpeza
      receita: 120000.00,
      despesas: 43000.00,
      lucro: 77000.00,
      margem: 64.17,
      colaboradores: 12,
      contratos: 3,
      veiculos: 3
    }
  },
  tendencias_mensais: [
    { mes: 'Jan', receita: 39500, despesa: 13025 },
    { mes: 'Fev', receita: 39500, despesa: 12800 },
    { mes: 'Mar', receita: 39500, despesa: 13500 }
  ]
}
```

## 14. Localização dos Dados

### 14.1 Arquivo: /data/mockData.ts
- Empresas (3)
- Usuários (5+)
- Colaboradores (45)
- Contratos (12)
- Despesas (30+)
- Materiais (50+)

### 14.2 Arquivo: /data/mockHistorico.ts
- Movimentações de estoque (100+)
- Auditoria de alterações
- Logs de sistema

### 14.3 Arquivo: /data/mockPontoData.ts
- Registros de ponto (500+)
- Justificativas
- Aprovações

### 14.4 Arquivo: /lib/figma-make-helpers.tsx
- Hooks mockados (useAuth, useEmpresa)
- Funções auxiliares
- Formatadores

## 15. Como Usar os Dados Mockados

### 15.1 Importação
```typescript
import { mockEmpresas, mockUsuarios } from '@/data/mockData';
import { mockPontos } from '@/data/mockPontoData';
```

### 15.2 Uso em Componentes
```typescript
// Exemplo: Listar empresas
function EmpresasList() {
  const [empresas, setEmpresas] = useState(mockEmpresas);
  
  return (
    <div>
      {empresas.map(empresa => (
        <div key={empresa.id}>{empresa.nome}</div>
      ))}
    </div>
  );
}
```

### 15.3 Filtragem por Empresa
```typescript
// Exemplo: Colaboradores de uma empresa específica
const colaboradoresFacilities = mockColaboradores.filter(
  col => col.empresa_id === '1'
);
```

## 16. Geração de Dados Adicionais

Para gerar mais dados mockados para testes:

```typescript
// Exemplo: Gerar 100 registros de ponto
function gerarPontosMock(colaborador_id: string, dias: number) {
  const pontos = [];
  const dataInicio = new Date('2024-01-01');
  
  for (let i = 0; i < dias; i++) {
    const data = new Date(dataInicio);
    data.setDate(data.getDate() + i);
    
    // Pular fins de semana
    if (data.getDay() === 0 || data.getDay() === 6) continue;
    
    pontos.push({
      id: `ponto-${i}`,
      colaborador_id,
      data: data.toISOString().split('T')[0],
      entrada: '08:00',
      saida_almoco: '12:00',
      retorno_almoco: '13:00',
      saida: '17:00',
      horas_trabalhadas: 8.00,
      tipo: 'normal'
    });
  }
  
  return pontos;
}
```

## 17. Dados de Teste para Login

Use estas credenciais para testar diferentes perfis:

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Super Admin | admin@grupo2s.com.br | Admin@2024 |
| Admin Facilities | admin.facilities@grupo2s.com.br | Admin@123 |
| Gestor RH | gestor.rh@grupo2s.com.br | Gestor@123 |
| Operador | operador@grupo2s.com.br | Operador@123 |
| Cliente | cliente@empresa.com.br | Cliente@123 |

## 18. Observações Importantes

1. **Dados Fictícios**: Todos os CPFs, CNPJs, endereços e telefones são fictícios
2. **Consistência**: Os IDs referenciados entre tabelas são consistentes
3. **Regras de Negócio**: Os dados respeitam as 7 regras de negócio (RN-001 a RN-007)
4. **Quantidade**: Dados suficientes para testar paginação, filtros e relatórios
5. **Variabilidade**: Dados com diferentes status para testar todos os fluxos

## 19. Manutenção dos Dados

Os dados mockados são atualizados conforme:
- Novos recursos são implementados
- Bugs são identificados nos dados
- Necessidade de cenários de teste específicos
- Feedback dos testes de usuário
