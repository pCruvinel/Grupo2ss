-- ============================================
-- SCHEMA SUPABASE - SISTEMA GESTÃO GRUPO 2S
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TIPOS ENUM
-- ============================================

CREATE TYPE perfil_usuario AS ENUM ('admin', 'financeiro', 'operacional', 'rh', 'cliente');
CREATE TYPE status_generico AS ENUM ('ativo', 'inativo');
CREATE TYPE tipo_empresa AS ENUM ('2s_locacoes', '2s_marketing', 'producoes_eventos');
CREATE TYPE tipo_pessoa AS ENUM ('pessoa_fisica', 'pessoa_juridica');
CREATE TYPE status_contrato AS ENUM ('ativo', 'concluido', 'cancelado');
CREATE TYPE tipo_contrato AS ENUM ('cliente', 'fornecedor');
CREATE TYPE status_parcela AS ENUM ('pendente', 'pago', 'inadimplente', 'cancelado');
CREATE TYPE tipo_parcelamento AS ENUM ('mensal', 'personalizado', 'vista');
CREATE TYPE categoria_despesa AS ENUM ('fixa', 'variavel', 'folha_pagamento');
CREATE TYPE tipo_contrato_colaborador AS ENUM ('pj', 'clt');
CREATE TYPE status_colaborador AS ENUM ('ativo', 'inativo', 'ferias', 'licenca');
CREATE TYPE status_ponto AS ENUM ('normal', 'falta', 'atraso', 'falta_justificada');
CREATE TYPE status_pagamento AS ENUM ('pendente', 'pago', 'cancelado');
CREATE TYPE status_material AS ENUM ('ativo', 'inativo', 'manutencao');
CREATE TYPE tipo_vinculacao AS ENUM ('locacao', 'consumo', 'patrimonio');
CREATE TYPE status_ordem_servico AS ENUM ('criada', 'em_andamento', 'concluida', 'cancelada');
CREATE TYPE status_veiculo AS ENUM ('disponivel', 'em_uso', 'manutencao');
CREATE TYPE status_nota_fiscal AS ENUM ('emitida', 'cancelada', 'inutilizada');
CREATE TYPE status_cliente AS ENUM ('ativo', 'inativo', 'inadimplente');

-- ============================================
-- TABELAS
-- ============================================

-- EMPRESAS
CREATE TABLE empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo tipo_empresa NOT NULL,
  status status_generico DEFAULT 'ativa',
  cnpj VARCHAR(18) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco_completo JSONB,
  dados_bancarios JSONB,
  timbrado_url TEXT,
  configuracoes JSONB DEFAULT '{}',
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- USERS (Perfil integrado com auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  empresa_id INTEGER REFERENCES empresas(id),
  perfil perfil_usuario NOT NULL,
  status status_generico DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT NOW(),
  ultimo_acesso TIMESTAMP,
  
  CONSTRAINT users_perfil_empresa CHECK (
    perfil = 'admin' OR empresa_id IS NOT NULL
  )
);

-- CLIENTES
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo tipo_pessoa NOT NULL,
  nome_razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  cpf_cnpj VARCHAR(18) NOT NULL,
  rg_ie VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  whatsapp VARCHAR(20),
  endereco_completo JSONB,
  dados_bancarios JSONB,
  observacoes TEXT,
  status status_cliente DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(empresa_id, cpf_cnpj)
);

-- FORNECEDORES
CREATE TABLE fornecedores (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  tipo tipo_pessoa NOT NULL,
  nome_razao_social VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  categoria_servico VARCHAR(100),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco_completo JSONB,
  dados_bancarios JSONB,
  status status_generico DEFAULT 'ativo',
  data_cadastro TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(empresa_id, cpf_cnpj)
);

-- CONTRATOS
CREATE TABLE contratos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  tipo tipo_contrato NOT NULL,
  cliente_id INTEGER REFERENCES clientes(id),
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  descricao TEXT,
  valor_total DECIMAL(12, 2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status status_contrato DEFAULT 'ativo',
  tipo_parcelamento tipo_parcelamento NOT NULL,
  numero_parcelas INTEGER,
  observacoes TEXT,
  arquivo_pdf_url TEXT,
  usuario_cadastro_id UUID REFERENCES users(id),
  data_cadastro TIMESTAMP DEFAULT NOW(),
  
  CHECK (
    (tipo = 'cliente' AND cliente_id IS NOT NULL) OR 
    (tipo = 'fornecedor' AND fornecedor_id IS NOT NULL)
  )
);

-- PARCELAS
CREATE TABLE parcelas (
  id SERIAL PRIMARY KEY,
  contrato_id INTEGER NOT NULL REFERENCES contratos(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status status_parcela DEFAULT 'pendente',
  forma_pagamento VARCHAR(50),
  comprovante_url TEXT,
  observacoes TEXT
);

-- DESPESAS
CREATE TABLE despesas (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  categoria categoria_despesa NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  forma_pagamento VARCHAR(50),
  fornecedor_id INTEGER REFERENCES fornecedores(id),
  status status_pagamento DEFAULT 'pendente',
  comprovante_url TEXT,
  rateio_empresas JSONB,
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT NOW()
);

-- CARGOS
CREATE TABLE cargos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  status status_generico DEFAULT 'ativo'
);

-- COLABORADORES
CREATE TABLE colaboradores (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  rg VARCHAR(20),
  data_nascimento DATE NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco_completo JSONB,
  tipo_contrato tipo_contrato_colaborador NOT NULL,
  cargo_id INTEGER REFERENCES cargos(id),
  salario_base DECIMAL(12, 2) NOT NULL,
  data_admissao DATE NOT NULL,
  data_demissao DATE,
  status status_colaborador DEFAULT 'ativo',
  rateio_empresas JSONB,
  observacoes TEXT,
  data_cadastro TIMESTAMP DEFAULT NOW()
);

-- REGISTROS DE PONTO
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

-- PAGAMENTOS
CREATE TABLE pagamentos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id INTEGER NOT NULL REFERENCES colaboradores(id),
  mes_referencia DATE NOT NULL,
  salario_base DECIMAL(12, 2) NOT NULL,
  vale_transporte DECIMAL(12, 2) DEFAULT 0,
  vale_alimentacao DECIMAL(12, 2) DEFAULT 0,
  bonus DECIMAL(12, 2) DEFAULT 0,
  outros_adicionais DECIMAL(12, 2) DEFAULT 0,
  plano_saude DECIMAL(12, 2) DEFAULT 0,
  adiantamentos DECIMAL(12, 2) DEFAULT 0,
  inss DECIMAL(12, 2) DEFAULT 0,
  irpf DECIMAL(12, 2) DEFAULT 0,
  outros_descontos DECIMAL(12, 2) DEFAULT 0,
  total_adicionais DECIMAL(12, 2) GENERATED ALWAYS AS (
    vale_transporte + vale_alimentacao + bonus + outros_adicionais
  ) STORED,
  total_descontos DECIMAL(12, 2) GENERATED ALWAYS AS (
    plano_saude + adiantamentos + inss + irpf + outros_descontos
  ) STORED,
  salario_liquido DECIMAL(12, 2) GENERATED ALWAYS AS (
    salario_base + (vale_transporte + vale_alimentacao + bonus + outros_adicionais) 
    - (plano_saude + adiantamentos + inss + irpf + outros_descontos)
  ) STORED,
  data_pagamento DATE,
  status status_pagamento DEFAULT 'pendente',
  comprovante_url TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(colaborador_id, mes_referencia)
);

-- CATEGORIAS MATERIAL
CREATE TABLE categorias_material (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo_vinculacao tipo_vinculacao DEFAULT 'consumo'
);

-- MATERIAIS
CREATE TABLE materiais (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo VARCHAR(50) UNIQUE,
  nome VARCHAR(255) NOT NULL,
  categoria_id INTEGER REFERENCES categorias_material(id),
  descricao TEXT,
  unidade_medida VARCHAR(20),
  estoque_atual DECIMAL(10, 2) DEFAULT 0,
  estoque_minimo DECIMAL(10, 2),
  estoque_maximo DECIMAL(10, 2),
  valor_unitario DECIMAL(12, 2),
  localizacao VARCHAR(100),
  status status_material DEFAULT 'ativo',
  imagem_url TEXT,
  data_cadastro TIMESTAMP DEFAULT NOW()
);

-- VEÍCULOS
CREATE TABLE veiculos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  placa VARCHAR(10) UNIQUE NOT NULL,
  modelo VARCHAR(100),
  marca VARCHAR(100),
  ano INTEGER,
  status status_veiculo DEFAULT 'disponivel',
  data_cadastro TIMESTAMP DEFAULT NOW()
);

-- ORDENS DE SERVIÇO
CREATE TABLE ordens_servico (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero_os VARCHAR(50) UNIQUE NOT NULL,
  contrato_id INTEGER REFERENCES contratos(id),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  descricao_evento TEXT NOT NULL,
  local_evento TEXT,
  data_montagem TIMESTAMP,
  data_desmontagem TIMESTAMP,
  responsavel_evento VARCHAR(255),
  veiculo_id INTEGER REFERENCES veiculos(id),
  motorista_id INTEGER REFERENCES colaboradores(id),
  status status_ordem_servico DEFAULT 'criada',
  observacoes TEXT,
  assinatura_entrega_url TEXT,
  assinatura_retirada_url TEXT,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- ITENS ORDEM DE SERVIÇO
CREATE TABLE itens_ordem_servico (
  id SERIAL PRIMARY KEY,
  ordem_servico_id INTEGER NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materiais(id),
  quantidade_solicitada DECIMAL(10, 2) NOT NULL,
  quantidade_entregue DECIMAL(10, 2) DEFAULT 0,
  observacoes TEXT
);

-- NOTAS FISCAIS
CREATE TABLE notas_fiscais (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  numero VARCHAR(50) UNIQUE NOT NULL,
  serie VARCHAR(10),
  cliente_id INTEGER NOT NULL REFERENCES clientes(id),
  contrato_id INTEGER REFERENCES contratos(id),
  data_emissao DATE NOT NULL,
  valor_servicos DECIMAL(12, 2) NOT NULL,
  base_calculo DECIMAL(12, 2),
  aliquota_iss DECIMAL(5, 2),
  valor_iss DECIMAL(12, 2),
  valor_total DECIMAL(12, 2),
  descricao_servicos TEXT,
  codigo_servico VARCHAR(20),
  status status_nota_fiscal DEFAULT 'emitida',
  xml_url TEXT,
  pdf_url TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_material ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_ordem_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para USERS
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Políticas RLS genéricas (filtra por empresa_id do usuário)
CREATE POLICY "Empresa filtering"
  ON clientes FOR ALL
  USING (
    empresa_id IN (
      SELECT empresa_id FROM users WHERE id = auth.uid()
    )
  );

-- Aplicar mesma política para todas as tabelas com empresa_id
CREATE POLICY "Empresa filtering" ON fornecedores FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON contratos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON despesas FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON cargos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON colaboradores FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON registros_ponto FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON pagamentos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON categorias_material FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON materiais FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON veiculos FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON ordens_servico FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Empresa filtering" ON notas_fiscais FOR ALL USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

-- Admin pode ver todas as empresas
CREATE POLICY "Admin can view all empresas"
  ON empresas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_clientes_empresa ON clientes(empresa_id);
CREATE INDEX idx_contratos_empresa ON contratos(empresa_id);
CREATE INDEX idx_contratos_cliente ON contratos(cliente_id);
CREATE INDEX idx_parcelas_contrato ON parcelas(contrato_id);
CREATE INDEX idx_colaboradores_empresa ON colaboradores(empresa_id);
CREATE INDEX idx_ponto_colaborador ON registros_ponto(colaborador_id);
CREATE INDEX idx_materiais_empresa ON materiais(empresa_id);
CREATE INDEX idx_os_empresa ON ordens_servico(empresa_id);
CREATE INDEX idx_os_cliente ON ordens_servico(cliente_id);

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

-- Inserir empresas
INSERT INTO empresas (nome, tipo, cnpj, email, status) VALUES
('2S Locações', '2s_locacoes', '12345678000101', 'contato@2slocacoes.com.br', 'ativa'),
('2S Marketing', '2s_marketing', '12345678000102', 'contato@2smarketing.com.br', 'ativa'),
('Produções e Eventos', 'producoes_eventos', '12345678000103', 'contato@producoeseseventos.com.br', 'ativa');

-- Nota: Usuários admin devem ser criados via Supabase Auth primeiro,
-- depois inseridos na tabela users com perfil 'admin'
