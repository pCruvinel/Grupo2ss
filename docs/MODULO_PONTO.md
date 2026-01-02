# Documentação Técnica - Módulo de Folha de Ponto

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Componentes Frontend](#componentes-frontend)
5. [Regras de Negócio](#regras-de-negócio)
6. [Cálculos de Horas](#cálculos-de-horas)
7. [Modais e Interações](#modais-e-interações)
8. [Validações](#validações)
9. [Integrações](#integrações)
10. [Casos de Uso](#casos-de-uso)

---

## Visão Geral

O **Módulo de Folha de Ponto** (Ponto Eletrônico) é responsável pelo controle centralizado de registros de ponto de todos os colaboradores do Grupo 2S, implementando a regra de negócio **RN-004** (Controle Centralizado).

### Características Principais

- ✅ Controle de ponto centralizado para todas as empresas (RN-004)
- ✅ Registro de entrada, saída para almoço, retorno e saída
- ✅ Cálculo automático de horas trabalhadas
- ✅ Cálculo de horas extras e banco de horas
- ✅ Registro manual com justificativa obrigatória
- ✅ Controle de permissões (apenas RH/Admin pode editar)
- ✅ Rastreamento de localização (entrada/saída)
- ✅ Status: completo, incompleto, falta
- ✅ Filtros por data e status
- ✅ Dashboard com estatísticas
- ✅ Exportação de relatórios

### Regra de Negócio Principal: RN-004

**RN-004 - Controle de Ponto Centralizado**

O controle de ponto é centralizado para todas as empresas do Grupo 2S. Usuários com perfil de RH ou Admin podem visualizar e editar registros de ponto de colaboradores de todas as empresas, independentemente da empresa à qual pertencem.

---

## Arquitetura

### Estrutura de Arquivos

```
src/
├── app/(app)/rh/ponto/
│   └── page.tsx                             # Página principal do módulo
├── components/
│   ├── PontoDashboard.tsx                   # Dashboard simplificado
│   ├── PontoModal.tsx                       # Modal básico de registro
│   ├── pages/
│   │   └── Ponto.tsx                        # Wrapper com dados mock
│   └── modals/
│       └── RegistroPontoManualModal.tsx     # Modal de registro manual
├── data/
│   └── mockPontoData.ts                     # Dados mock para desenvolvimento
├── lib/
│   ├── formatters.ts                        # Formatação de horas e datas
│   ├── validators.ts                        # Validações de horários
│   └── calculations.ts                      # Cálculo de horas trabalhadas
├── types/
│   ├── index.ts                             # Tipos globais
│   └── modals.ts                            # Tipos de modais
└── supabase/
    └── schema.sql                           # Schema do banco de dados
```

### Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Next.js 14
- **UI Components**: shadcn/ui (Radix UI)
- **Estilização**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **State Management**: React Hooks (useState, useEffect, useMemo)
- **Notificações**: Sonner (toast)
- **Ícones**: Lucide React

---

## Estrutura de Dados

### Tabela: `registros_ponto` (PostgreSQL)

```sql
CREATE TABLE registros_ponto (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  entrada_manha TIME,
  saida_almoco TIME,
  entrada_tarde TIME,
  saida_noite TIME,
  horas_trabalhadas DECIMAL(5, 2),
  horas_extras DECIMAL(5, 2) DEFAULT 0,
  horas_contratadas DECIMAL(5, 2) DEFAULT 8,
  banco_horas DECIMAL(5, 2),
  observacoes TEXT,
  status status_ponto DEFAULT 'normal',
  usuario_cadastro_id UUID REFERENCES users(id),
  data_criacao TIMESTAMP DEFAULT NOW(),

  UNIQUE(colaborador_id, data)
);
```

### Tipos Enum

```sql
-- Status do Ponto
CREATE TYPE status_ponto AS ENUM (
  'normal',              -- Registro normal
  'falta',               -- Colaborador faltou
  'atraso',              -- Chegou atrasado
  'falta_justificada'    -- Falta com justificativa
);
```

### Interface TypeScript

```typescript
interface RegistroPonto {
  id: string;
  colaborador_id: string;
  colaborador?: {
    nome: string;
    cpf: string;
    cargo: string;
    empresa_id: string;
  };
  data: string;                        // Data do registro (YYYY-MM-DD)
  entrada?: string;                    // Horário de entrada (HH:MM)
  saida_almoco?: string;               // Horário de saída para almoço
  volta_almoco?: string;               // Horário de retorno do almoço
  saida?: string;                      // Horário de saída
  localizacao_entrada?: string;        // Local de entrada
  localizacao_saida?: string;          // Local de saída
  observacoes?: string;
  status: 'completo' | 'incompleto' | 'falta';
  horas_trabalhadas?: number;          // Em minutos
  horas_extras?: number;
  banco_horas?: number;
  tipo_registro?: 'automatico' | 'manual';
  criado_por?: string;                 // Quem criou o registro manual
  justificativa?: string;              // Justificativa para registro manual
}
```

### Campos Calculados

#### `horas_trabalhadas`
Calcula total de minutos trabalhados no dia:

```typescript
const calcularHorasTrabalhadas = (
  entrada: string,
  saida: string,
  saida_almoco?: string,
  volta_almoco?: string
): number => {
  const entradaTime = new Date(`1970-01-01T${entrada}`);
  const saidaTime = new Date(`1970-01-01T${saida}`);

  let totalMinutos = (saidaTime.getTime() - entradaTime.getTime()) / 60000;

  // Descontar horário de almoço
  if (saida_almoco && volta_almoco) {
    const saidaAlmocoTime = new Date(`1970-01-01T${saida_almoco}`);
    const voltaAlmocoTime = new Date(`1970-01-01T${volta_almoco}`);
    const almocoMinutos = (voltaAlmocoTime.getTime() - saidaAlmocoTime.getTime()) / 60000;
    totalMinutos -= almocoMinutos;
  }

  return totalMinutos;
};
```

#### `status`
Determinado automaticamente:

```typescript
let status: 'completo' | 'incompleto' | 'falta' = 'falta';

if (entrada && saida) {
  status = 'completo';
} else if (entrada) {
  status = 'incompleto';
}
```

---

## Componentes Frontend

### 1. `page.tsx` - Página Principal

**Localização**: `src/app/(app)/rh/ponto/page.tsx`

**Responsabilidades**:
- Gerenciamento de autenticação e empresa atual
- Busca de registros do Supabase
- Cálculo de horas trabalhadas
- Controle de modais de criação/edição
- Aplicação da RN-004 (centralização)

**Estados Principais**:

```typescript
const [registros, setRegistros] = useState<RegistroPonto[]>([]);
const [colaboradores, setColaboradores] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [dialogOpen, setDialogOpen] = useState(false);
const [editingRegistro, setEditingRegistro] = useState<RegistroPonto | null>(null);

// Filtros
const [filterData, setFilterData] = useState(new Date().toISOString().split('T')[0]);
const [filterStatus, setFilterStatus] = useState('todos');
```

**Busca de Dados** (RN-004):

```typescript
const fetchData = async () => {
  // RN-004: Buscar colaboradores de TODAS as empresas (centralizado)
  const { data: colaboradoresData } = await supabase
    .from('colaboradores')
    .select('*')
    .eq('status', 'ativo')
    .order('nome');

  // Buscar registros de ponto filtrados por data
  const { data: registrosData } = await supabase
    .from('registros_ponto')
    .select(`
      *,
      colaborador:colaboradores(nome, cpf, cargo, empresa_id)
    `)
    .eq('data', filterData)
    .order('entrada', { ascending: false });

  // Processar e calcular horas
  const registrosProcessados = registrosData?.map((r) => {
    let horasTrabalhadas = 0;
    let status: 'completo' | 'incompleto' | 'falta' = 'falta';

    if (r.entrada && r.saida) {
      // Calcular horas
      const entrada = new Date(`${r.data}T${r.entrada}`);
      const saida = new Date(`${r.data}T${r.saida}`);
      const almoco = r.saida_almoco && r.volta_almoco
        ? (new Date(`${r.data}T${r.volta_almoco}`).getTime() -
           new Date(`${r.data}T${r.saida_almoco}`).getTime()) / 60000
        : 60; // Padrão 1h

      horasTrabalhadas = Math.floor((saida.getTime() - entrada.getTime()) / 60000 - almoco);
      status = 'completo';
    } else if (r.entrada) {
      status = 'incompleto';
    }

    return {
      ...r,
      horas_trabalhadas: horasTrabalhadas,
      status,
    };
  });

  setColaboradores(colaboradoresData);
  setRegistros(registrosProcessados);
};
```

**Estatísticas**:

```typescript
const stats = {
  total: registros.length,
  completos: registros.filter((r) => r.status === 'completo').length,
  incompletos: registros.filter((r) => r.status === 'incompleto').length,
  faltas: registros.filter((r) => r.status === 'falta').length,
  horasTotais: registros.reduce((sum, r) => sum + (r.horas_trabalhadas || 0), 0),
};
```

**Cards de Métricas**:

```typescript
// 1. Total de Registros
<Card>
  <Users className="w-4 h-4" />
  <p>Total</p>
  <p className="text-2xl">{stats.total}</p>
</Card>

// 2. Completos
<Card>
  <CheckCircle className="w-4 h-4 text-green-600" />
  <p>Completos</p>
  <p className="text-2xl text-green-600">{stats.completos}</p>
</Card>

// 3. Incompletos
<Card>
  <AlertCircle className="w-4 h-4 text-yellow-600" />
  <p>Incompletos</p>
  <p className="text-2xl text-yellow-600">{stats.incompletos}</p>
</Card>

// 4. Faltas
<Card>
  <XCircle className="w-4 h-4 text-red-600" />
  <p>Faltas</p>
  <p className="text-2xl text-red-600">{stats.faltas}</p>
</Card>

// 5. Horas Totais
<Card>
  <Clock className="w-4 h-4 text-blue-600" />
  <p>Horas Totais</p>
  <p className="text-2xl text-blue-600">{formatarHoras(stats.horasTotais)}</p>
</Card>
```

---

### 2. `PontoDashboard.tsx` - Dashboard Simplificado

**Localização**: `src/components/PontoDashboard.tsx`

**Responsabilidades**:
- Exibir registros de ponto em tabela ou cards
- Aplicar filtros de busca
- Controlar permissões de edição (RN-004)
- Exibir indicadores visuais de status

**Controle de Permissões**:

```typescript
const podeEditar = perfilUsuario === 'admin' || perfilUsuario === 'rh';

{podeEditar ? (
  <Badge className="bg-blue-100 text-blue-700">
    ✅ Você tem permissão para editar
  </Badge>
) : (
  <Badge className="bg-gray-100 text-gray-700">
    👁️ Apenas visualização
  </Badge>
)}
```

**Filtro de Busca**:

```typescript
const registrosFiltrados = registros.filter(r =>
  r.colaborador_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
  r.data.includes(searchTerm)
);
```

**Visualização em Tabela**:

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Data</TableHead>
      <TableHead>Colaborador</TableHead>
      <TableHead>Entrada Manhã</TableHead>
      <TableHead>Saída Almoço</TableHead>
      <TableHead>Entrada Tarde</TableHead>
      <TableHead>Saída Tarde</TableHead>
      <TableHead>Horas Trabalhadas</TableHead>
      <TableHead>Horas Extras</TableHead>
      <TableHead>Editado Por (RN-004)</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {registrosFiltrados.map((registro) => (
      <TableRow key={registro.id}>
        <TableCell>
          {new Date(registro.data).toLocaleDateString('pt-BR')}
        </TableCell>
        <TableCell>{registro.colaborador_nome}</TableCell>
        <TableCell>{registro.entrada_manha}</TableCell>
        <TableCell>{registro.saida_almoco}</TableCell>
        <TableCell>{registro.entrada_tarde}</TableCell>
        <TableCell>{registro.saida_tarde}</TableCell>
        <TableCell>
          <Badge>{registro.horas_trabalhadas}h</Badge>
        </TableCell>
        <TableCell>
          {registro.horas_extras > 0 ? (
            <Badge className="bg-orange-100 text-orange-700">
              +{registro.horas_extras}h
            </Badge>
          ) : '-'}
        </TableCell>
        <TableCell>
          {registro.editado_por ? (
            <Badge variant="outline" className="bg-blue-50">
              {registro.editado_por}
            </Badge>
          ) : '-'}
        </TableCell>
        <TableCell>
          {podeEditar && (
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 3. `PontoModal.tsx` - Modal de Registro Simples

**Localização**: `src/components/PontoModal.tsx`

**Responsabilidades**:
- Formulário para registro de ponto
- Cálculo em tempo real de horas
- Validação de horários

**Campos do Formulário**:

```typescript
const [formData, setFormData] = useState({
  data: '',
  entradaManha: '',
  saidaAlmoco: '',
  entradaTarde: '',
  saida: '',
  almoco: '1',                    // Horas de almoço
  horasContratadas: '8',          // Jornada contratada
});

const [calculado, setCalculado] = useState({
  saldo: 0,
  trabalhadas: 0,
  banco: 0,
});
```

**Função de Cálculo**:

```typescript
const calcularHoras = (inicio: string, fim: string): number => {
  if (!inicio || !fim) return 0;

  const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
  const [horaFim, minutoFim] = fim.split(':').map(Number);

  const inicioMinutos = horaInicio * 60 + minutoInicio;
  const fimMinutos = horaFim * 60 + minutoFim;

  return (fimMinutos - inicioMinutos) / 60;
};

const handleCalcular = () => {
  const horasManha = calcularHoras(formData.entradaManha, formData.saidaAlmoco);
  const horasTarde = calcularHoras(formData.entradaTarde, formData.saida);
  const almoco = parseFloat(formData.almoco) || 1;
  const contratadas = parseFloat(formData.horasContratadas) || 8;

  const trabalhadas = horasManha + horasTarde;
  const saldo = trabalhadas - contratadas;

  setCalculado({
    saldo,
    trabalhadas,
    banco: saldo,
  });
};
```

**Exibição do Resultado**:

```typescript
{calculado.trabalhadas > 0 && (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3>Resultado do Cálculo</h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <p className="text-sm text-gray-600">Horas Trabalhadas</p>
        <p className="text-gray-900">{calculado.trabalhadas.toFixed(2)}h</p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Saldo do Dia</p>
        <p className={calculado.saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
          {calculado.saldo >= 0 ? '+' : ''}{calculado.saldo.toFixed(2)}h
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-600">Banco Atualizado</p>
        <p className={calculado.banco >= 0 ? 'text-green-600' : 'text-red-600'}>
          {calculado.banco >= 0 ? '+' : ''}{calculado.banco.toFixed(2)}h
        </p>
      </div>
    </div>
  </div>
)}
```

---

### 4. `RegistroPontoManualModal.tsx` - Modal de Registro Manual

**Localização**: `src/components/modals/RegistroPontoManualModal.tsx`

**Responsabilidades**:
- Registro manual de ponto por RH/Admin
- Justificativa obrigatória
- Validações rigorosas de horários
- Seleção de colaborador e tipo de trabalho

**Campos do Formulário**:

```typescript
const [formData, setFormData] = useState({
  colaborador_id: '',
  data: new Date().toISOString().split('T')[0],
  entrada: '',
  saida_almoco: '',
  retorno_almoco: '',
  saida: '',
  tipo: 'presencial',           // presencial, home_office, externo, hibrido
  justificativa: '',            // OBRIGATÓRIA
});
```

**Alerta de Registro Manual**:

```typescript
<div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
  <div className="flex items-start gap-2">
    <AlertTriangle className="w-5 h-5 text-orange-600" />
    <div>
      <h3 className="font-medium text-orange-900">Atenção: Registro Manual</h3>
      <p className="text-sm text-orange-700">
        Este registro será marcado como manual e requer justificativa.
        Use apenas em casos excepcionais como esquecimento de registro,
        problemas técnicos ou ajustes autorizados.
      </p>
    </div>
  </div>
</div>
```

**Seleção de Colaborador**:

```typescript
<Select
  value={formData.colaborador_id}
  onValueChange={(value) => setFormData({ ...formData, colaborador_id: value })}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecione o colaborador" />
  </SelectTrigger>
  <SelectContent>
    {colaboradores?.map((col) => (
      <SelectItem key={col.id} value={col.id}>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {col.nome}
        </div>
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**Tipo de Trabalho**:

```typescript
<Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
  <SelectTrigger>
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="presencial">🏢 Presencial</SelectItem>
    <SelectItem value="home_office">🏠 Home Office</SelectItem>
    <SelectItem value="externo">🚗 Externo</SelectItem>
    <SelectItem value="hibrido">🔄 Híbrido</SelectItem>
  </SelectContent>
</Select>
```

**Cálculo de Horas em Tempo Real**:

```typescript
const calcularHoras = () => {
  if (!formData.entrada || !formData.saida) return '00:00';

  const [entH, entM] = formData.entrada.split(':').map(Number);
  const [saiH, saiM] = formData.saida.split(':').map(Number);

  let totalMinutos = (saiH * 60 + saiM) - (entH * 60 + entM);

  // Descontar horário de almoço
  if (formData.saida_almoco && formData.retorno_almoco) {
    const [saAlmH, saAlmM] = formData.saida_almoco.split(':').map(Number);
    const [retAlmH, retAlmM] = formData.retorno_almoco.split(':').map(Number);
    const almocoMinutos = (retAlmH * 60 + retAlmM) - (saAlmH * 60 + saAlmM);
    totalMinutos -= almocoMinutos;
  }

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
};
```

**Justificativa Obrigatória**:

```typescript
<div>
  <Label>Justificativa *</Label>
  <Textarea
    value={formData.justificativa}
    onChange={(e) => setFormData({ ...formData, justificativa: e.target.value })}
    placeholder="Descreva o motivo do registro manual (ex: esquecimento, falha no sistema, ajuste autorizado...)"
    rows={4}
    maxLength={500}
  />
  <p className="text-xs text-gray-500 mt-1">
    {formData.justificativa.length}/500 caracteres
  </p>
</div>
```

---

## Regras de Negócio

### RN-004: Controle de Ponto Centralizado

**Descrição**: O controle de ponto é centralizado para todas as empresas do Grupo 2S. Não há segregação por empresa na visualização de registros.

**Requisitos**:

1. ✅ RH e Admin podem visualizar registros de todas as empresas
2. ✅ RH e Admin podem editar/criar registros de qualquer colaborador
3. ✅ Colaboradores normais têm acesso apenas de leitura
4. ✅ Registros incluem empresa do colaborador para rastreamento
5. ✅ Filtros por data e status aplicam-se a todos os registros
6. ✅ Estatísticas consolidadas de todas as empresas

**Implementação**:

```typescript
// Buscar colaboradores de TODAS as empresas
const { data: colaboradoresData } = await supabase
  .from('colaboradores')
  .select('*')
  .eq('status', 'ativo')
  .order('nome');
// Não há filtro por empresa_id!

// Buscar registros de ponto (sem filtro de empresa)
const { data: registrosData } = await supabase
  .from('registros_ponto')
  .select(`
    *,
    colaborador:colaboradores(nome, cpf, cargo, empresa_id)
  `)
  .eq('data', filterData)
  .order('entrada', { ascending: false });
```

**Row Level Security (RLS)**:

```sql
-- RN-004: Centralizado - Admin e RH veem tudo
CREATE POLICY "registros_ponto_select_policy" ON registros_ponto
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  colaborador_id IN (
    SELECT id FROM colaboradores
    WHERE id = (SELECT colaborador_id FROM users WHERE id = auth.uid())
  )
);
```

### Regras de Horário

**Horários de Trabalho Padrão**:
- Jornada: 8 horas/dia (configurável)
- Almoço: 1 hora (padrão)
- Entrada: Flexível
- Saída: Calculada com base nas horas trabalhadas

**Cálculo de Horas Extras**:

```typescript
const horasContratadas = 8; // ou valor configurado
const horasTrabalhadas = calcularHorasTrabalhadas(...);
const horasExtras = Math.max(0, horasTrabalhadas - horasContratadas);
```

**Banco de Horas**:

```typescript
const saldoDia = horasTrabalhadas - horasContratadas;
const bancoAtualizado = bancoAnterior + saldoDia;
```

### Status do Registro

```typescript
type StatusRegistro =
  | 'completo'     // Entrada e saída registradas
  | 'incompleto'   // Apenas entrada registrada
  | 'falta';       // Sem registros no dia
```

**Determinação Automática**:

```typescript
if (entrada && saida) {
  status = 'completo';
} else if (entrada) {
  status = 'incompleto';
} else {
  status = 'falta';
}
```

### Registro Manual

**Requisitos**:
1. Apenas RH e Admin podem criar registros manuais
2. Justificativa é obrigatória
3. Registro deve ser marcado com flag `tipo_registro = 'manual'`
4. Deve registrar quem criou (`criado_por`)
5. Data máxima: data atual (não permite registros futuros)

---

## Cálculos de Horas

### 1. Calcular Horas Trabalhadas

**Implementação** (`src/lib/calculations.ts`):

```typescript
export function calcularHorasTrabalhadas(
  entradaManha: string | null,
  saidaAlmoco: string | null,
  entradaTarde: string | null,
  saidaNoite: string | null
): number {
  if (!entradaManha || !saidaNoite) return 0;

  const calcularDiferencaHoras = (inicio: string, fim: string): number => {
    const [horaInicio, minutoInicio] = inicio.split(':').map(Number);
    const [horaFim, minutoFim] = fim.split(':').map(Number);

    const inicioMinutos = horaInicio * 60 + minutoInicio;
    const fimMinutos = horaFim * 60 + minutoFim;

    return (fimMinutos - inicioMinutos) / 60;
  };

  let horasManha = 0;
  let horasTarde = 0;

  if (entradaManha && saidaAlmoco) {
    horasManha = calcularDiferencaHoras(entradaManha, saidaAlmoco);
  }

  if (entradaTarde && saidaNoite) {
    horasTarde = calcularDiferencaHoras(entradaTarde, saidaNoite);
  }

  return horasManha + horasTarde;
}
```

**Exemplo**:

```typescript
// Entrada: 08:00, Saída Almoço: 12:00, Entrada Tarde: 13:00, Saída: 17:00
const horas = calcularHorasTrabalhadas('08:00', '12:00', '13:00', '17:00');
// Resultado: 8 horas (4h manhã + 4h tarde)
```

### 2. Calcular Banco de Horas

**Implementação** (`src/lib/calculations.ts`):

```typescript
export function calcularBancoHoras(
  horasTrabalhadas: number,
  horasContratadas: number,
  bancoAnterior: number = 0
): number {
  const saldo = horasTrabalhadas - horasContratadas;
  return bancoAnterior + saldo;
}
```

**Exemplo**:

```typescript
// Trabalhou 9h, contratado para 8h, banco anterior +2h
const banco = calcularBancoHoras(9, 8, 2);
// Resultado: +3h (banco anterior 2h + saldo do dia 1h)
```

### 3. Formatação de Horas

**Converter minutos para HH:MM**:

```typescript
const formatarHoras = (minutos: number): string => {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return `${horas}h${mins.toString().padStart(2, '0')}`;
};

// Exemplo: 130 minutos -> "2h10"
```

**Converter HH:MM para minutos**:

```typescript
const converterParaMinutos = (tempo: string): number => {
  const [horas, minutos] = tempo.split(':').map(Number);
  return horas * 60 + minutos;
};

// Exemplo: "2:30" -> 150 minutos
```

---

## Modais e Interações

### Modal 1: Novo Registro de Ponto

**Trigger**: Botão "Novo Registro" (apenas RH/Admin)

**Layout**: Dialog com formulário

**Campos**:
- Colaborador* (Select)
- Data* (Input date, máx hoje)
- Entrada (Input time)
- Saída Almoço (Input time)
- Volta Almoço (Input time)
- Saída (Input time)
- Localização Entrada (Input text, opcional)
- Localização Saída (Input text, opcional)
- Observações (Textarea, opcional)

**Validações**:

```typescript
if (!formData.colaborador_id || !formData.data) {
  toast.error('Selecione o colaborador e a data');
  return;
}

// Horários devem estar em ordem
if (formData.saida_almoco && formData.saida_almoco <= formData.entrada) {
  toast.error('Horário de saída para almoço deve ser após a entrada');
  return;
}

if (formData.volta_almoco && formData.volta_almoco <= formData.saida_almoco) {
  toast.error('Horário de retorno deve ser após a saída para almoço');
  return;
}

if (formData.saida && formData.saida <= (formData.volta_almoco || formData.entrada)) {
  toast.error('Horário de saída deve ser após o retorno do almoço');
  return;
}
```

**Ações**:
- **Cancelar**: Fecha modal sem salvar
- **Salvar Registro**: Valida e insere no banco

---

### Modal 2: Registro Manual de Ponto

**Trigger**: Funcionalidade específica para ajustes manuais

**Layout**: Dialog com alerta de atenção

**Diferenças do Modal Normal**:
1. Alerta visual de registro manual
2. Justificativa obrigatória (500 caracteres)
3. Campo "Tipo de Trabalho" (presencial, home office, externo, híbrido)
4. Cálculo de horas em tempo real
5. Marca registro como `tipo_registro = 'manual'`

**Validações Adicionais**:

```typescript
if (!formData.justificativa.trim()) {
  toast.error('A justificativa é obrigatória para registro manual');
  return;
}

// Data não pode ser futura
if (formData.data > new Date().toISOString().split('T')[0]) {
  toast.error('Não é permitido registrar ponto em datas futuras');
  return;
}
```

**Auditoria**:

```typescript
const registro = {
  ...formData,
  tipo_registro: 'manual',
  criado_por: usuarioLogado.nome,
  criado_em: new Date().toISOString(),
  justificativa: formData.justificativa,
};
```

---

### Modal 3: Editar Registro de Ponto

**Trigger**: Botão "Editar" na linha da tabela (apenas RH/Admin)

**Layout**: Mesmo do Modal 1, pré-preenchido

**Comportamento**:
- Carrega dados do registro existente
- Permite edição de todos os campos
- Atualiza registro no banco
- Registra quem editou (auditoria)

---

## Validações

### Validações de Formulário

| Campo | Regra | Mensagem de Erro |
|-------|-------|------------------|
| Colaborador | Obrigatório | "Selecione o colaborador" |
| Data | Obrigatório, <= hoje | "Data não pode ser futura" |
| Entrada | Formato HH:MM | "Formato inválido" |
| Saída Almoço | Deve ser > Entrada | "Saída deve ser após entrada" |
| Retorno Almoço | Deve ser > Saída Almoço | "Retorno deve ser após saída" |
| Saída | Deve ser > Retorno | "Saída deve ser após retorno" |
| Justificativa (manual) | Obrigatório, max 500 | "Justificativa obrigatória" |

### Validações de Horário

```typescript
const validarSequenciaHorarios = (
  entrada: string,
  saida_almoco?: string,
  volta_almoco?: string,
  saida?: string
): { valido: boolean; erro?: string } => {
  if (saida_almoco && saida_almoco <= entrada) {
    return { valido: false, erro: 'Saída para almoço deve ser após entrada' };
  }

  if (volta_almoco && volta_almoco <= (saida_almoco || entrada)) {
    return { valido: false, erro: 'Retorno do almoço deve ser após saída' };
  }

  if (saida && saida <= (volta_almoco || saida_almoco || entrada)) {
    return { valido: false, erro: 'Saída deve ser após retorno do almoço' };
  }

  return { valido: true };
};
```

### Validações de Negócio

1. **Registro único por dia**: Não pode haver dois registros do mesmo colaborador no mesmo dia
2. **Data não futura**: Não permite registrar ponto em datas futuras
3. **Jornada máxima**: Alerta se horas trabalhadas > 12h (possível erro)
4. **Permissão de edição**: Apenas RH e Admin podem editar
5. **Justificativa em manuais**: Registro manual obriga justificativa

---

## Integrações

### Supabase

#### Queries Principais

**1. Buscar Registros de Ponto por Data**

```typescript
const { data: registrosData } = await supabase
  .from('registros_ponto')
  .select(`
    *,
    colaborador:colaboradores(nome, cpf, cargo, empresa_id)
  `)
  .eq('data', filterData)
  .order('entrada', { ascending: false });
```

**2. Buscar Colaboradores Ativos (Todas as Empresas)**

```typescript
// RN-004: Centralizado - busca de todas as empresas
const { data: colaboradoresData } = await supabase
  .from('colaboradores')
  .select('*')
  .eq('status', 'ativo')
  .order('nome');
```

**3. Criar Registro de Ponto**

```typescript
const { data, error } = await supabase
  .from('registros_ponto')
  .insert({
    colaborador_id: formData.colaborador_id,
    data: formData.data,
    entrada: formData.entrada || null,
    saida_almoco: formData.saida_almoco || null,
    volta_almoco: formData.volta_almoco || null,
    saida: formData.saida || null,
    localizacao_entrada: formData.localizacao_entrada || null,
    localizacao_saida: formData.localizacao_saida || null,
    observacoes: formData.observacoes || null,
    usuario_cadastro_id: auth.user.id,
  })
  .select();
```

**4. Atualizar Registro de Ponto**

```typescript
const { error } = await supabase
  .from('registros_ponto')
  .update({
    entrada: formData.entrada,
    saida_almoco: formData.saida_almoco,
    volta_almoco: formData.volta_almoco,
    saida: formData.saida,
    observacoes: formData.observacoes,
  })
  .eq('id', registroId);
```

#### Row Level Security (RLS)

```sql
-- RN-004: Controle Centralizado
-- Admin e RH veem todos os registros
CREATE POLICY "registros_ponto_select_policy" ON registros_ponto
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  colaborador_id IN (
    SELECT id FROM colaboradores
    WHERE id = (SELECT colaborador_id FROM users WHERE id = auth.uid())
  )
);

-- Apenas RH e Admin podem inserir/atualizar
CREATE POLICY "registros_ponto_insert_policy" ON registros_ponto
FOR INSERT WITH CHECK (
  has_master_access(auth.uid())
);

CREATE POLICY "registros_ponto_update_policy" ON registros_ponto
FOR UPDATE USING (
  has_master_access(auth.uid())
);
```

### Biblioteca de Utilidades

**Formatação** (`src/lib/formatters.ts`):
- `formatarData(data)`: 01/01/2024
- `formatarDataHora(data)`: 01/01/2024 14:30

**Cálculos** (`src/lib/calculations.ts`):
- `calcularHorasTrabalhadas(entrada, saidaAlmoco, entradaTarde, saida)`
- `calcularBancoHoras(trabalhadas, contratadas, bancoAnterior)`

---

## Casos de Uso

### Caso de Uso 1: Registrar Ponto Manualmente (RH)

**Ator**: Usuário RH

**Cenário**:
1. RH acessa RH > Ponto
2. Clica em "Novo Registro"
3. Modal abre
4. Seleciona colaborador: "João Silva"
5. Data: hoje
6. Preenche horários:
   - Entrada: 08:00
   - Saída Almoço: 12:00
   - Retorno: 13:00
   - Saída: 17:00
7. Adiciona observação: "Ajuste de ponto autorizado"
8. Clica em "Salvar Registro"
9. Sistema calcula: 8h trabalhadas
10. Toast de sucesso
11. Registro aparece na tabela

**Resultado**:
- Registro criado no banco
- Status: completo
- Horas trabalhadas: 8h
- Horas extras: 0h

---

### Caso de Uso 2: Registrar Ponto Manual com Justificativa

**Ator**: Usuário Admin

**Cenário**:
1. Admin acessa modal de registro manual
2. Vê alerta laranja sobre registro manual
3. Seleciona colaborador: "Maria Santos"
4. Data: ontem (esqueceu de registrar)
5. Horários:
   - Entrada: 07:30
   - Saída: 18:00 (sem intervalo de almoço)
6. Tipo: "Home Office"
7. Justificativa: "Colaboradora esqueceu de registrar ponto ontem. Confirmado com gestor que trabalhou em home office das 07:30 às 18:00 sem pausa para almoço devido a projeto urgente."
8. Clica em "Registrar Ponto Manual"
9. Sistema valida justificativa
10. Calcula: 10h30 trabalhadas, 2h30 de extras
11. Toast de sucesso

**Resultado**:
- Registro criado com flag `tipo_registro = 'manual'`
- Justificativa salva
- Auditoria: criado por Admin
- Horas extras: 2h30
- Alerta de jornada longa

---

### Caso de Uso 3: Visualizar Registros do Dia (RN-004)

**Ator**: Usuário RH

**Cenário**:
1. RH acessa dashboard de ponto
2. Filtro de data: hoje
3. Sistema exibe:
   - Total: 45 registros (todas as empresas)
   - Completos: 38
   - Incompletos: 5
   - Faltas: 2
   - Horas Totais: 304h
4. Tabela mostra colaboradores de:
   - 2S Locações
   - 2S Marketing
   - Produções e Eventos
5. RH pode filtrar por status: "Incompleto"
6. Visualiza 5 colaboradores que esqueceram de registrar saída

**Resultado**:
- Visualização centralizada (RN-004)
- Todas as empresas visíveis
- Filtros aplicados

---

### Caso de Uso 4: Editar Registro com Erro

**Ator**: Usuário RH

**Cenário**:
1. RH identifica erro em registro de "Carlos Oliveira"
2. Data: hoje
3. Entrada registrada: 18:00 (deveria ser 08:00)
4. Clica em "Editar" na linha
5. Modal abre pré-preenchido
6. Corrige entrada: 08:00
7. Clica em "Atualizar Registro"
8. Sistema recalcula horas trabalhadas
9. Registro atualizado
10. Marca "editado_por: João Santos (RH)"

**Resultado**:
- Registro corrigido
- Auditoria mantida
- Horas recalculadas automaticamente

---

### Caso de Uso 5: Filtrar e Exportar Relatório

**Ator**: Usuário Admin

**Cenário**:
1. Admin acessa ponto
2. Seleciona filtros:
   - Data: 01/12/2024 a 31/12/2024
   - Status: Todos
3. Clica em "Exportar Relatório"
4. Sistema gera Excel com:
   - Data
   - Colaborador
   - Empresa
   - Entrada, Saídas, Retornos
   - Horas Trabalhadas
   - Horas Extras
   - Banco de Horas
5. Download automático

**Resultado**:
- Relatório completo exportado
- Formato Excel
- Dados consolidados de dezembro

---

## Melhorias Futuras

### Funcionalidades Planejadas

1. **Registro de Ponto via App Mobile**
   - Biometria facial
   - Geolocalização
   - Foto de comprovação

2. **Dashboard Analítico**
   - Gráficos de presença por dia/semana/mês
   - Ranking de horas extras
   - Análise de padrões de atraso
   - Previsão de banco de horas

3. **Notificações Automáticas**
   - Lembrar de registrar ponto
   - Alertar sobre esquecimento
   - Notificar gestor sobre faltas

4. **Integração com Folha de Pagamento**
   - Sincronização automática de horas
   - Cálculo de adicionais noturnos
   - Cálculo de DSR

5. **Justificativa de Faltas Online**
   - Colaborador pode justificar falta
   - Upload de atestado médico
   - Aprovação por gestor

6. **Gestão de Escalas**
   - Definir escalas de trabalho
   - Turnos alternados
   - Jornadas flexíveis

7. **Relatórios Avançados**
   - Comparativo mensal
   - Custo de horas extras
   - Absenteísmo por setor

8. **Integração com Catracas Eletrônicas**
   - Registro automático por RFID
   - Sincronização bidirecional
   - Validação de duplicidades

---

## Guia de Desenvolvimento

### Como Adicionar um Novo Tipo de Trabalho

1. Editar `RegistroPontoManualModal.tsx`:

```typescript
<SelectContent>
  <SelectItem value="presencial">🏢 Presencial</SelectItem>
  <SelectItem value="home_office">🏠 Home Office</SelectItem>
  <SelectItem value="externo">🚗 Externo</SelectItem>
  <SelectItem value="hibrido">🔄 Híbrido</SelectItem>
  <SelectItem value="novo_tipo">🆕 Novo Tipo</SelectItem>
</SelectContent>
```

2. Atualizar tipos TypeScript em `src/types/modals.ts`:

```typescript
export type TipoTrabalho =
  | 'presencial'
  | 'home_office'
  | 'externo'
  | 'hibrido'
  | 'novo_tipo';
```

### Como Modificar Cálculo de Horas

Editar `src/lib/calculations.ts`:

```typescript
export function calcularHorasTrabalhadas(
  entradaManha: string | null,
  saidaAlmoco: string | null,
  entradaTarde: string | null,
  saidaNoite: string | null
): number {
  // Sua lógica customizada aqui
  return horasCalculadas;
}
```

### Como Adicionar Validação Customizada

```typescript
// Exemplo: Alerta se trabalhou mais de 10h
if (horasTrabalhadas > 10) {
  toast.warning('Atenção: Jornada superior a 10 horas!');
}
```

---

## Troubleshooting

### Problema: Horas não calculadas corretamente

**Causa**: Formato de horário incorreto ou horários em ordem errada

**Solução**:
1. Verificar formato HH:MM
2. Validar sequência: entrada < saída_almoco < volta_almoco < saída
3. Verificar se almoço está sendo descontado

### Problema: Registros não aparecem para RH

**Causa**: RLS bloqueando acesso

**Checklist**:
1. Verificar perfil do usuário no banco
2. Verificar função `has_master_access()`
3. Verificar políticas RLS em `registros_ponto`
4. Testar com usuário admin

### Problema: Não consegue criar registro manual

**Causa**: Validação de justificativa ou permissões

**Checklist**:
1. Verificar se justificativa foi preenchida
2. Verificar perfil do usuário (RH ou Admin)
3. Verificar se data não é futura
4. Verificar horários em sequência correta

---

## Referências

- **Código-fonte**: `src/app/(app)/rh/ponto/`
- **Componentes**: `src/components/PontoDashboard.tsx`, `src/components/PontoModal.tsx`, `src/components/modals/RegistroPontoManualModal.tsx`
- **Schema**: `src/supabase/schema.sql` (linhas 196-216)
- **Tipos**: `src/types/index.ts`, `src/types/modals.ts`
- **Utilitários**: `src/lib/calculations.ts`, `src/lib/formatters.ts`
- **Dados Mock**: `src/data/mockPontoData.ts`

---

**Documento gerado em**: 02/01/2026
**Versão**: 1.0.0
**Autor**: Claude (Documentação Técnica Automatizada)
