-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: MULTI-TENANCY SYSTEM - GRUPO 2S
-- Implementa sistema de múltiplas empresas com RLS
-- ═══════════════════════════════════════════════════════════════

-- 1. Atualizar tabela de empresas com informações de tema
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#1F4788';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#28A745';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS tema_id VARCHAR(50);
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'filial' CHECK (tipo IN ('holding', 'filial'));
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS acesso VARCHAR(20) DEFAULT 'restrito' CHECK (acesso IN ('master', 'restrito'));

-- 2. Popular dados das empresas com temas
UPDATE empresas SET 
  tema_id = 'grupo-2s',
  tipo = 'holding',
  acesso = 'master',
  primary_color = '#F97316',
  secondary_color = '#FB923C'
WHERE nome ILIKE '%grupo%' OR nome ILIKE '%holding%';

UPDATE empresas SET 
  tema_id = '2s-locacoes',
  tipo = 'filial',
  acesso = 'restrito',
  primary_color = '#3B82F6',
  secondary_color = '#60A5FA'
WHERE nome ILIKE '%locações%' OR nome ILIKE '%locacao%';

UPDATE empresas SET 
  tema_id = '2s-marketing',
  tipo = 'filial',
  acesso = 'restrito',
  primary_color = '#3B82F6',
  secondary_color = '#8B5CF6'
WHERE nome ILIKE '%marketing%';

UPDATE empresas SET 
  tema_id = '2s-producoes',
  tipo = 'filial',
  acesso = 'restrito',
  primary_color = '#7E22CE',
  secondary_color = '#3B82F6'
WHERE nome ILIKE '%produção%' OR nome ILIKE '%producao%' OR nome ILIKE '%eventos%';

-- 3. Criar tabela de associação usuário-empresa (many-to-many)
CREATE TABLE IF NOT EXISTS user_empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false, -- Empresa principal do usuário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, empresa_id)
);

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_empresas_user_id ON user_empresas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_empresas_empresa_id ON user_empresas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresas_tema_id ON empresas(tema_id);
CREATE INDEX IF NOT EXISTS idx_empresas_tipo ON empresas(tipo);

-- 5. Popular user_empresas com dados existentes
-- (Migra relação 1:1 para 1:N)
INSERT INTO user_empresas (user_id, empresa_id, is_primary)
SELECT DISTINCT 
  u.id as user_id, 
  u.empresa_id, 
  true as is_primary
FROM usuarios u
WHERE u.empresa_id IS NOT NULL
ON CONFLICT (user_id, empresa_id) DO NOTHING;

-- 6. Função para obter empresas de um usuário
CREATE OR REPLACE FUNCTION get_user_empresas(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  nome VARCHAR,
  tipo VARCHAR,
  acesso VARCHAR,
  tema_id VARCHAR,
  primary_color VARCHAR,
  secondary_color VARCHAR,
  logo_url TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.nome,
    e.tipo,
    e.acesso,
    e.tema_id,
    e.primary_color,
    e.secondary_color,
    e.logo_url,
    ue.is_primary
  FROM empresas e
  INNER JOIN user_empresas ue ON e.id = ue.empresa_id
  WHERE ue.user_id = p_user_id
    AND e.status = 'ativa'
  ORDER BY ue.is_primary DESC, e.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para verificar se usuário tem acesso master (Grupo 2S)
CREATE OR REPLACE FUNCTION has_master_access(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_empresas ue
    INNER JOIN empresas e ON ue.empresa_id = e.id
    WHERE ue.user_id = p_user_id
      AND e.acesso = 'master'
      AND e.tipo = 'holding'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) - POLÍTICAS DE ACESSO
-- ═══════════════════════════════════════════════════════════════

-- 8. Habilitar RLS em todas as tabelas principais
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico ENABLE ROW LEVEL SECURITY;
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE folha_pagamento ENABLE ROW LEVEL SECURITY;

-- 9. Política de SELECT - Contratos
DROP POLICY IF EXISTS "contratos_select_policy" ON contratos;
CREATE POLICY "contratos_select_policy" ON contratos
FOR SELECT
USING (
  -- Acesso master (Grupo 2S)
  has_master_access(auth.uid())
  OR
  -- Acesso restrito à empresa do usuário
  empresa_id IN (
    SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
  )
);

-- 10. Política de INSERT - Contratos
DROP POLICY IF EXISTS "contratos_insert_policy" ON contratos;
CREATE POLICY "contratos_insert_policy" ON contratos
FOR INSERT
WITH CHECK (
  -- Acesso master (Grupo 2S)
  has_master_access(auth.uid())
  OR
  -- Pode inserir apenas na empresa do usuário
  empresa_id IN (
    SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
  )
);

-- 11. Política de UPDATE - Contratos
DROP POLICY IF EXISTS "contratos_update_policy" ON contratos;
CREATE POLICY "contratos_update_policy" ON contratos
FOR UPDATE
USING (
  has_master_access(auth.uid())
  OR
  empresa_id IN (
    SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
  )
);

-- 12. Política de DELETE - Contratos
DROP POLICY IF EXISTS "contratos_delete_policy" ON contratos;
CREATE POLICY "contratos_delete_policy" ON contratos
FOR DELETE
USING (
  has_master_access(auth.uid())
  OR
  empresa_id IN (
    SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
  )
);

-- ═══════════════════════════════════════════════════════════════
-- APLICAR POLÍTICAS SIMILARES PARA OUTRAS TABELAS
-- ═══════════════════════════════════════════════════════════════

-- 13. Despesas
DROP POLICY IF EXISTS "despesas_select_policy" ON despesas;
CREATE POLICY "despesas_select_policy" ON despesas
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  empresa_id IN (SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()) OR
  -- RN-002: Despesas com rateio visíveis para empresas rateadas
  id IN (
    SELECT d.id FROM despesas d
    WHERE d.empresas_rateadas IS NOT NULL
      AND d.empresas_rateadas ? (
        SELECT e.id::text FROM empresas e
        INNER JOIN user_empresas ue ON e.id = ue.empresa_id
        WHERE ue.user_id = auth.uid()
      )
  )
);

-- 14. Colaboradores
DROP POLICY IF EXISTS "colaboradores_select_policy" ON colaboradores;
CREATE POLICY "colaboradores_select_policy" ON colaboradores
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  -- RN-002: Colaboradores com rateio visíveis para todas as empresas do rateio
  id IN (
    SELECT c.id FROM colaboradores c, jsonb_array_elements_text(c.empresas_ids) AS empresa_id
    WHERE empresa_id::uuid IN (
      SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
    )
  )
);

-- 15. Materiais
DROP POLICY IF EXISTS "materiais_select_policy" ON materiais;
CREATE POLICY "materiais_select_policy" ON materiais
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  empresa_id IN (SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid())
);

-- 16. Ordens de Serviço
DROP POLICY IF EXISTS "ordens_servico_select_policy" ON ordens_servico;
CREATE POLICY "ordens_servico_select_policy" ON ordens_servico
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  empresa_id IN (SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid())
);

-- 17. Veículos
DROP POLICY IF EXISTS "veiculos_select_policy" ON veiculos;
CREATE POLICY "veiculos_select_policy" ON veiculos
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  empresa_id IN (SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid())
);

-- 18. Registros de Ponto (RN-004: Centralizado)
DROP POLICY IF EXISTS "registros_ponto_select_policy" ON registros_ponto;
CREATE POLICY "registros_ponto_select_policy" ON registros_ponto
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  colaborador_id IN (
    SELECT c.id FROM colaboradores c, jsonb_array_elements_text(c.empresas_ids) AS empresa_id
    WHERE empresa_id::uuid IN (
      SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
    )
  )
);

-- 19. Folha de Pagamento (RN-002: Rateio)
DROP POLICY IF EXISTS "folha_pagamento_select_policy" ON folha_pagamento;
CREATE POLICY "folha_pagamento_select_policy" ON folha_pagamento
FOR SELECT USING (
  has_master_access(auth.uid()) OR
  colaborador_id IN (
    SELECT c.id FROM colaboradores c, jsonb_array_elements_text(c.empresas_ids) AS empresa_id
    WHERE empresa_id::uuid IN (
      SELECT empresa_id FROM user_empresas WHERE user_id = auth.uid()
    )
  )
);

-- ═══════════════════════════════════════════════════════════════
-- TRIGGERS E FUNÇÕES AUXILIARES
-- ═══════════════════════════════════════════════════════════════

-- 20. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_empresas_updated_at ON user_empresas;
CREATE TRIGGER update_user_empresas_updated_at
  BEFORE UPDATE ON user_empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- GRANTS E PERMISSÕES
-- ═══════════════════════════════════════════════════════════════

-- 21. Permitir acesso autenticado
GRANT SELECT ON user_empresas TO authenticated;
GRANT SELECT ON empresas TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_empresas(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_master_access(UUID) TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ═══════════════════════════════════════════════════════════════

COMMENT ON TABLE user_empresas IS 'Tabela de associação many-to-many entre usuários e empresas';
COMMENT ON TABLE empresas IS 'Tabela de empresas do Grupo 2S com informações de tema para multi-tenancy';
COMMENT ON FUNCTION get_user_empresas(UUID) IS 'Retorna todas as empresas que um usuário tem acesso';
COMMENT ON FUNCTION has_master_access(UUID) IS 'Verifica se usuário pertence à holding (acesso master)';

-- ═══════════════════════════════════════════════════════════════
-- FIM DA MIGRATION
-- ═══════════════════════════════════════════════════════════════
