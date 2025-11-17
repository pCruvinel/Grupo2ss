# Estrutura do Banco de Dados - Sistema ERP Grupo 2S

## 1. Diagrama de Entidades e Relacionamentos (ERD)

```
┌─────────────┐
│  empresas   │
└──────┬──────┘
       │ 1:N
       ├──────────────┬──────────────┬──────────────┬──────────────┐
       │              │              │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼─────┐
│  usuarios   │ │colaboradores│ │contratos │ │  despesas   │ │materiais │
└─────────────┘ └─────┬───────┘ └────┬─────┘ └─────────────┘ └──────────┘
                      │              │
                      │ 1:N          │ 1:N
                ┌─────▼──────┐ ┌─────▼────────┐
                │   pontos   │ │  parcelas    │
                └────────────┘ └──────────────┘
```

## 2. Tabelas Principais

### 2.1 empresas
Cadastro das empresas do Grupo 2S.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| nome | varchar(100) | NOT NULL | Nome fantasia |
| razao_social | varchar(200) | NOT NULL | Razão social |
| cnpj | varchar(18) | UNIQUE, NOT NULL | CNPJ formatado |
| cores_primaria | varchar(7) | NOT NULL | Cor primária (#HEX) |
| cores_secundaria | varchar(7) | NOT NULL | Cor secundária (#HEX) |
| cores_acento | varchar(7) | NOT NULL | Cor de acento (#HEX) |
| logo_url | text | NULL | URL do logo |
| ativo | boolean | DEFAULT true | Status da empresa |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Índices:**
- `idx_empresas_cnpj` em `cnpj`
- `idx_empresas_ativo` em `ativo`

**RLS Policies:**
```sql
-- Super Admin vê todas
CREATE POLICY "super_admin_all_empresas" ON empresas
  FOR ALL USING (auth.jwt() ->> 'perfil' = 'super_admin');

-- Admin vê apenas sua empresa
CREATE POLICY "admin_own_empresa" ON empresas
  FOR SELECT USING (id::text = auth.jwt() ->> 'empresa_id');
```

---

### 2.2 usuarios
Cadastro de usuários do sistema.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| email | varchar(255) | UNIQUE, NOT NULL | E-mail do usuário |
| nome | varchar(150) | NOT NULL | Nome completo |
| perfil | varchar(20) | NOT NULL | Perfil de acesso |
| avatar_url | text | NULL | URL do avatar |
| telefone | varchar(15) | NULL | Telefone |
| ativo | boolean | DEFAULT true | Status do usuário |
| ultimo_acesso | timestamp | NULL | Último login |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Perfis válidos:**
- `super_admin` - Acesso total a todas empresas
- `admin` - Administrador da empresa
- `gestor` - Gerente de departamento
- `operador` - Usuário operacional
- `cliente` - Cliente externo

**Índices:**
- `idx_usuarios_email` em `email`
- `idx_usuarios_empresa_id` em `empresa_id`
- `idx_usuarios_perfil` em `perfil`

**Constraints:**
```sql
ALTER TABLE usuarios
  ADD CONSTRAINT chk_perfil CHECK (
    perfil IN ('super_admin', 'admin', 'gestor', 'operador', 'cliente')
  );
```

**RLS Policies:**
```sql
-- Usuários veem apenas da sua empresa
CREATE POLICY "usuarios_own_empresa" ON usuarios
  FOR SELECT USING (empresa_id::text = auth.jwt() ->> 'empresa_id');

-- Super Admin vê todos
CREATE POLICY "super_admin_all_usuarios" ON usuarios
  FOR ALL USING (auth.jwt() ->> 'perfil' = 'super_admin');
```

---

### 2.3 colaboradores
Cadastro de colaboradores (funcionários).

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| nome | varchar(150) | NOT NULL | Nome completo |
| cpf | varchar(14) | UNIQUE, NOT NULL | CPF formatado |
| cargo_id | uuid | FK, NULL | Referência a cargos |
| departamento | varchar(100) | NULL | Departamento |
| email | varchar(255) | NULL | E-mail corporativo |
| telefone | varchar(15) | NULL | Telefone |
| data_admissao | date | NOT NULL | Data de admissão |
| data_demissao | date | NULL | Data de demissão |
| salario_base | decimal(10,2) | NOT NULL | Salário base |
| foto_url | text | NULL | URL da foto |
| status | varchar(20) | DEFAULT 'ativo' | Status do colaborador |
| deleted_at | timestamp | NULL | Exclusão lógica (RN-005) |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Status válidos:**
- `ativo` - Colaborador ativo
- `afastado` - Em afastamento
- `demitido` - Desligado
- `ferias` - Em férias

**Índices:**
- `idx_colaboradores_cpf` em `cpf`
- `idx_colaboradores_empresa_id` em `empresa_id`
- `idx_colaboradores_cargo_id` em `cargo_id`
- `idx_colaboradores_status` em `status`
- `idx_colaboradores_deleted_at` em `deleted_at`

**RLS Policies:**
```sql
CREATE POLICY "colaboradores_empresa_rls" ON colaboradores
  FOR SELECT USING (
    empresa_id::text = auth.jwt() ->> 'empresa_id' 
    AND deleted_at IS NULL
  );
```

---

### 2.4 cargos
Cadastro de cargos.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| nome | varchar(100) | NOT NULL | Nome do cargo |
| descricao | text | NULL | Descrição |
| salario_base | decimal(10,2) | NOT NULL | Salário base |
| nivel | varchar(50) | NULL | Nível hierárquico |
| ativo | boolean | DEFAULT true | Status do cargo |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

---

### 2.5 pontos
Registro de ponto eletrônico (RN-004).

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| colaborador_id | uuid | FK, NOT NULL | Referência a colaboradores |
| data | date | NOT NULL | Data do registro |
| entrada | time | NOT NULL | Horário de entrada |
| saida_almoco | time | NULL | Saída para almoço |
| retorno_almoco | time | NULL | Retorno do almoço |
| saida | time | NULL | Horário de saída |
| horas_trabalhadas | decimal(4,2) | NULL | Total de horas |
| tipo | varchar(20) | DEFAULT 'normal' | Tipo de registro |
| justificativa | text | NULL | Justificativa de ausência |
| aprovado_por | uuid | FK, NULL | Quem aprovou |
| latitude | decimal(10,8) | NULL | GPS - Latitude |
| longitude | decimal(11,8) | NULL | GPS - Longitude |
| created_at | timestamp | DEFAULT NOW() | Data de criação |

**Tipos válidos:**
- `normal` - Ponto normal
- `manual` - Registro manual
- `falta` - Falta justificada
- `falta_injustificada` - Falta sem justificativa
- `atestado` - Atestado médico
- `ferias` - Férias

**Índices:**
- `idx_pontos_colaborador_data` em `(colaborador_id, data)`
- `idx_pontos_data` em `data`

**Constraints:**
```sql
-- RN-004: Sistema centralizado de ponto
ALTER TABLE pontos
  ADD CONSTRAINT chk_horarios CHECK (
    entrada < COALESCE(saida_almoco, '23:59:59') AND
    COALESCE(retorno_almoco, '00:00:00') < COALESCE(saida, '23:59:59')
  );
```

---

### 2.6 contratos
Contratos de clientes.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| numero | varchar(50) | UNIQUE, NOT NULL | Número do contrato |
| cliente_nome | varchar(200) | NOT NULL | Nome do cliente |
| cliente_documento | varchar(18) | NOT NULL | CPF/CNPJ |
| valor_total | decimal(12,2) | NOT NULL | Valor total |
| data_inicio | date | NOT NULL | Data de início |
| data_fim | date | NULL | Data de término |
| status | varchar(20) | DEFAULT 'ativo' | Status do contrato |
| tipo_servico | varchar(100) | NOT NULL | Tipo de serviço |
| observacoes | text | NULL | Observações |
| rateio_empresas | jsonb | NULL | Rateio entre empresas (RN-002) |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Status válidos:**
- `ativo` - Contrato ativo
- `suspenso` - Temporariamente suspenso
- `cancelado` - Cancelado
- `finalizado` - Concluído

**Exemplo de rateio_empresas:**
```json
[
  { "empresa_id": "uuid-1", "percentual": 50 },
  { "empresa_id": "uuid-2", "percentual": 30 },
  { "empresa_id": "uuid-3", "percentual": 20 }
]
```

**Índices:**
- `idx_contratos_numero` em `numero`
- `idx_contratos_empresa_id` em `empresa_id`
- `idx_contratos_status` em `status`

---

### 2.7 parcelas
Parcelas de contratos (RN-003).

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| contrato_id | uuid | FK, NOT NULL | Referência a contratos |
| numero_parcela | int | NOT NULL | Número da parcela |
| valor | decimal(12,2) | NOT NULL | Valor da parcela |
| data_vencimento | date | NOT NULL | Data de vencimento |
| data_pagamento | date | NULL | Data do pagamento |
| status | varchar(20) | DEFAULT 'pendente' | Status da parcela |
| forma_pagamento | varchar(50) | NULL | Forma de pagamento |
| comprovante_url | text | NULL | URL do comprovante |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Status válidos:**
- `pendente` - Aguardando pagamento
- `pago` - Pago
- `atrasado` - Em atraso
- `cancelado` - Cancelado

**Índices:**
- `idx_parcelas_contrato_id` em `contrato_id`
- `idx_parcelas_status` em `status`
- `idx_parcelas_vencimento` em `data_vencimento`

**Constraints:**
```sql
-- RN-003: Parcelamento flexível
ALTER TABLE parcelas
  ADD CONSTRAINT chk_numero_parcela CHECK (numero_parcela > 0);
```

---

### 2.8 despesas
Registro de despesas.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Empresa principal |
| descricao | varchar(200) | NOT NULL | Descrição da despesa |
| categoria | varchar(100) | NOT NULL | Categoria |
| valor | decimal(12,2) | NOT NULL | Valor total |
| data | date | NOT NULL | Data da despesa |
| status | varchar(20) | DEFAULT 'pendente' | Status |
| fornecedor | varchar(150) | NULL | Fornecedor |
| tipo_rateio | varchar(20) | NULL | Tipo de rateio |
| rateio_empresas | jsonb | NULL | Rateio entre empresas |
| aprovado_por | uuid | FK, NULL | Quem aprovou |
| data_aprovacao | timestamp | NULL | Data de aprovação |
| comprovante_url | text | NULL | URL do comprovante |
| observacoes | text | NULL | Observações |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Categorias:**
- `alimentacao` - Alimentação
- `transporte` - Transporte
- `material` - Material de consumo
- `equipamento` - Equipamentos
- `servico` - Serviços
- `outros` - Outros

**Tipos de Rateio (RN-002):**
- `unica` - Apenas uma empresa
- `percentual` - Rateio por percentual
- `igual` - Rateio igual

**Status:**
- `pendente` - Aguardando aprovação
- `aprovado` - Aprovado
- `rejeitado` - Rejeitado
- `pago` - Pago

---

### 2.9 materiais
Controle de estoque de materiais.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| codigo | varchar(50) | UNIQUE, NOT NULL | Código do material |
| nome | varchar(150) | NOT NULL | Nome do material |
| descricao | text | NULL | Descrição |
| categoria | varchar(100) | NOT NULL | Categoria |
| unidade | varchar(10) | NOT NULL | Unidade (un, kg, l) |
| quantidade_estoque | decimal(10,2) | DEFAULT 0 | Quantidade em estoque |
| quantidade_minima | decimal(10,2) | DEFAULT 0 | Estoque mínimo |
| preco_unitario | decimal(10,2) | NOT NULL | Preço unitário |
| bloqueado | boolean | DEFAULT false | Bloqueado para uso (RN-006) |
| motivo_bloqueio | text | NULL | Motivo do bloqueio |
| bloqueado_por | uuid | FK, NULL | Quem bloqueou |
| data_bloqueio | timestamp | NULL | Data do bloqueio |
| deleted_at | timestamp | NULL | Exclusão lógica (RN-005) |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Índices:**
- `idx_materiais_codigo` em `codigo`
- `idx_materiais_empresa_id` em `empresa_id`
- `idx_materiais_categoria` em `categoria`
- `idx_materiais_bloqueado` em `bloqueado`

**Constraints:**
```sql
-- RN-006: Bloqueio de estoque
ALTER TABLE materiais
  ADD CONSTRAINT chk_bloqueio CHECK (
    (bloqueado = false AND motivo_bloqueio IS NULL) OR
    (bloqueado = true AND motivo_bloqueio IS NOT NULL)
  );
```

---

### 2.10 movimentacoes_estoque
Histórico de movimentações de estoque.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| material_id | uuid | FK, NOT NULL | Referência a materiais |
| tipo | varchar(20) | NOT NULL | Tipo de movimentação |
| quantidade | decimal(10,2) | NOT NULL | Quantidade |
| quantidade_anterior | decimal(10,2) | NOT NULL | Saldo anterior |
| quantidade_nova | decimal(10,2) | NOT NULL | Novo saldo |
| motivo | text | NULL | Motivo |
| usuario_id | uuid | FK, NOT NULL | Quem realizou |
| referencia_id | uuid | NULL | ID de referência |
| created_at | timestamp | DEFAULT NOW() | Data da movimentação |

**Tipos de movimentação:**
- `entrada` - Entrada de material
- `saida` - Saída de material
- `ajuste` - Ajuste de estoque
- `transferencia` - Transferência
- `devolucao` - Devolução

---

### 2.11 veiculos
Gestão de frota.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| placa | varchar(8) | UNIQUE, NOT NULL | Placa do veículo |
| modelo | varchar(100) | NOT NULL | Modelo |
| marca | varchar(50) | NOT NULL | Marca |
| ano | int | NOT NULL | Ano de fabricação |
| tipo | varchar(50) | NOT NULL | Tipo de veículo |
| km_atual | int | DEFAULT 0 | Quilometragem atual |
| status | varchar(20) | DEFAULT 'ativo' | Status |
| gps_ativo | boolean | DEFAULT false | GPS habilitado |
| ultima_localizacao | jsonb | NULL | Última posição GPS |
| proximo_manutencao_km | int | NULL | Próxima manutenção (km) |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Exemplo de ultima_localizacao:**
```json
{
  "latitude": -23.550520,
  "longitude": -46.633308,
  "timestamp": "2024-01-15T14:30:00Z"
}
```

---

### 2.12 ordens_servico
Ordens de serviço operacionais.

| Campo | Tipo | Restrições | Descrição |
|-------|------|------------|-----------|
| id | uuid | PK, NOT NULL | Identificador único |
| empresa_id | uuid | FK, NOT NULL | Referência a empresas |
| numero | varchar(50) | UNIQUE, NOT NULL | Número da OS |
| contrato_id | uuid | FK, NULL | Referência a contrato |
| tipo_servico | varchar(100) | NOT NULL | Tipo de serviço |
| descricao | text | NOT NULL | Descrição |
| local | varchar(200) | NOT NULL | Local do serviço |
| data_abertura | timestamp | DEFAULT NOW() | Data de abertura |
| data_prevista | date | NULL | Data prevista |
| data_conclusao | timestamp | NULL | Data de conclusão |
| status | varchar(20) | DEFAULT 'aberta' | Status da OS |
| prioridade | varchar(20) | DEFAULT 'media' | Prioridade |
| responsavel_id | uuid | FK, NULL | Colaborador responsável |
| observacoes | text | NULL | Observações |
| created_at | timestamp | DEFAULT NOW() | Data de criação |
| updated_at | timestamp | DEFAULT NOW() | Data de atualização |

**Status:**
- `aberta` - Aberta
- `em_andamento` - Em andamento
- `pausada` - Pausada
- `concluida` - Concluída
- `cancelada` - Cancelada

**Prioridades:**
- `baixa` - Baixa
- `media` - Média
- `alta` - Alta
- `urgente` - Urgente

---

## 3. Triggers e Funções

### 3.1 Trigger: Atualizar updated_at
Atualiza automaticamente o campo `updated_at`.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar em todas as tabelas
CREATE TRIGGER update_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Repetir para todas as tabelas...
```

### 3.2 Trigger: Registrar movimentação de estoque
Registra automaticamente movimentações ao alterar quantidade.

```sql
CREATE OR REPLACE FUNCTION registrar_movimentacao_estoque()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.quantidade_estoque != NEW.quantidade_estoque THEN
        INSERT INTO movimentacoes_estoque (
            material_id,
            tipo,
            quantidade,
            quantidade_anterior,
            quantidade_nova,
            motivo,
            usuario_id
        ) VALUES (
            NEW.id,
            CASE 
                WHEN NEW.quantidade_estoque > OLD.quantidade_estoque THEN 'entrada'
                ELSE 'saida'
            END,
            ABS(NEW.quantidade_estoque - OLD.quantidade_estoque),
            OLD.quantidade_estoque,
            NEW.quantidade_estoque,
            'Ajuste automático',
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_movimentacao_estoque
    AFTER UPDATE ON materiais
    FOR EACH ROW EXECUTE FUNCTION registrar_movimentacao_estoque();
```

### 3.3 Função: Calcular horas trabalhadas
Calcula automaticamente horas trabalhadas no ponto.

```sql
CREATE OR REPLACE FUNCTION calcular_horas_trabalhadas(
    p_entrada time,
    p_saida_almoco time,
    p_retorno_almoco time,
    p_saida time
) RETURNS decimal(4,2) AS $$
DECLARE
    horas_manha decimal(4,2);
    horas_tarde decimal(4,2);
    total decimal(4,2);
BEGIN
    -- Período manhã
    IF p_saida_almoco IS NOT NULL THEN
        horas_manha := EXTRACT(EPOCH FROM (p_saida_almoco - p_entrada)) / 3600;
    ELSE
        horas_manha := 0;
    END IF;
    
    -- Período tarde
    IF p_retorno_almoco IS NOT NULL AND p_saida IS NOT NULL THEN
        horas_tarde := EXTRACT(EPOCH FROM (p_saida - p_retorno_almoco)) / 3600;
    ELSE
        horas_tarde := 0;
    END IF;
    
    total := horas_manha + horas_tarde;
    RETURN ROUND(total, 2);
END;
$$ LANGUAGE plpgsql;
```

---

## 4. Views Úteis

### 4.1 View: Colaboradores Ativos
```sql
CREATE VIEW v_colaboradores_ativos AS
SELECT 
    c.*,
    cg.nome AS cargo_nome,
    e.nome AS empresa_nome
FROM colaboradores c
LEFT JOIN cargos cg ON c.cargo_id = cg.id
LEFT JOIN empresas e ON c.empresa_id = e.id
WHERE c.status = 'ativo' 
  AND c.deleted_at IS NULL;
```

### 4.2 View: Dashboard Financeiro
```sql
CREATE VIEW v_dashboard_financeiro AS
SELECT 
    e.id AS empresa_id,
    e.nome AS empresa_nome,
    COUNT(DISTINCT c.id) AS total_contratos,
    SUM(c.valor_total) AS valor_total_contratos,
    COUNT(DISTINCT d.id) AS total_despesas,
    SUM(d.valor) AS valor_total_despesas,
    SUM(c.valor_total) - COALESCE(SUM(d.valor), 0) AS saldo
FROM empresas e
LEFT JOIN contratos c ON e.id = c.empresa_id AND c.status = 'ativo'
LEFT JOIN despesas d ON e.id = d.empresa_id AND d.status = 'aprovado'
GROUP BY e.id, e.nome;
```

### 4.3 View: Estoque Baixo
```sql
CREATE VIEW v_materiais_estoque_baixo AS
SELECT 
    m.*,
    e.nome AS empresa_nome,
    (m.quantidade_estoque / NULLIF(m.quantidade_minima, 0) * 100) AS percentual_estoque
FROM materiais m
JOIN empresas e ON m.empresa_id = e.id
WHERE m.quantidade_estoque <= m.quantidade_minima
  AND m.bloqueado = false
  AND m.deleted_at IS NULL
ORDER BY percentual_estoque ASC;
```

---

## 5. Índices de Performance

```sql
-- Índices compostos para queries frequentes
CREATE INDEX idx_pontos_colaborador_mes ON pontos(colaborador_id, EXTRACT(YEAR FROM data), EXTRACT(MONTH FROM data));
CREATE INDEX idx_despesas_empresa_status ON despesas(empresa_id, status);
CREATE INDEX idx_contratos_empresa_status ON contratos(empresa_id, status);
CREATE INDEX idx_parcelas_vencimento_status ON parcelas(data_vencimento, status) WHERE status != 'pago';

-- Índices para buscas de texto
CREATE INDEX idx_colaboradores_nome ON colaboradores USING gin(to_tsvector('portuguese', nome));
CREATE INDEX idx_materiais_nome ON materiais USING gin(to_tsvector('portuguese', nome));
```

---

## 6. Backup e Manutenção

### 6.1 Backup Diário
```sql
-- Comando para backup (executar via cron)
pg_dump -h localhost -U postgres -d erp_grupo2s -F c -b -v -f backup_$(date +%Y%m%d).backup
```

### 6.2 Limpeza de Dados Antigos
```sql
-- Arquivar pontos com mais de 2 anos
CREATE TABLE pontos_arquivo AS 
SELECT * FROM pontos WHERE data < NOW() - INTERVAL '2 years';

DELETE FROM pontos WHERE data < NOW() - INTERVAL '2 years';
```

---

## 7. Migrations Importantes

### 7.1 Migration: Adicionar RLS
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos ENABLE ROW LEVEL SECURITY;
```

### 7.2 Migration: Adicionar campos de auditoria
```sql
ALTER TABLE colaboradores ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE materiais ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE contratos ADD COLUMN deleted_at TIMESTAMP;

CREATE INDEX idx_colaboradores_deleted ON colaboradores(deleted_at);
CREATE INDEX idx_materiais_deleted ON materiais(deleted_at);
CREATE INDEX idx_contratos_deleted ON contratos(deleted_at);
```

---

## 8. Regras de Negócio no Banco

### RN-001: Segregação por empresa_id
✅ Implementado via RLS Policies em todas as tabelas

### RN-002: Rateio automático
✅ Campo `rateio_empresas` (JSONB) em contratos e despesas

### RN-003: Parcelamento flexível
✅ Tabela `parcelas` com FK para contratos

### RN-004: Sistema centralizado de ponto
✅ Tabela `pontos` com campos de GPS e cálculo de horas

### RN-005: Exclusão lógica
✅ Campo `deleted_at` em tabelas principais

### RN-006: Bloqueio de estoque
✅ Campos `bloqueado`, `motivo_bloqueio`, `bloqueado_por` em materiais

### RN-007: Separação bônus/descontos
✅ Campos separados na folha de pagamento
