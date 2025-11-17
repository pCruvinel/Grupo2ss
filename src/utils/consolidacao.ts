// Utilitários para consolidação de dados do Grupo 2S

export interface ConsolidadoFinanceiro {
  receita_total: number;
  despesas_totais: number;
  lucro_liquido: number;
  margem_lucro: number;
  ticket_medio: number;
  crescimento_mom: number;
}

export interface ConsolidadoOperacional {
  total_contratos_ativos: number;
  total_ordens_servico: number;
  total_materiais: number;
  materiais_bloqueados: number;
  total_veiculos: number;
  veiculos_operacao: number;
  taxa_ocupacao_materiais: number;
}

export interface ConsolidadoRH {
  total_colaboradores: number;
  folha_pagamento_total: number;
  colaboradores_com_rateio: number;
  horas_trabalhadas: number;
}

export interface DadosPorEmpresa {
  empresa_id: string;
  empresa_nome: string;
  receita: number;
  despesas: number;
  lucro: number;
  margem: number;
  contratos: number;
  colaboradores: number;
  participacao: number; // % do faturamento total
  cor_primaria: string;
}

export interface ConsolidadoGrupo {
  financeiro: ConsolidadoFinanceiro;
  operacional: ConsolidadoOperacional;
  rh: ConsolidadoRH;
  por_empresa: DadosPorEmpresa[];
  periodo: {
    inicio: string;
    fim: string;
  };
}

// ===== FUNÇÕES DE CONSOLIDAÇÃO =====

/**
 * Consolida receitas de todas as empresas
 */
export function consolidarReceitas(
  contratos: any[],
  empresaIds: string[]
): number {
  return contratos
    .filter(c => empresaIds.includes(c.empresa_id) && c.status === 'ativo')
    .reduce((acc, c) => acc + (c.valor_total || 0), 0);
}

/**
 * Consolida despesas de todas as empresas
 * Considera RN-002: Rateio automático de despesas
 */
export function consolidarDespesas(
  despesas: any[],
  empresaIds: string[]
): number {
  return despesas
    .filter(d => empresaIds.includes(d.empresa_id))
    .reduce((acc, d) => acc + (d.valor || 0), 0);
}

/**
 * Calcula lucro líquido
 */
export function calcularLucroLiquido(
  receitas: number,
  despesas: number
): number {
  return receitas - despesas;
}

/**
 * Calcula margem de lucro percentual
 */
export function calcularMargemLucro(
  receitas: number,
  lucro: number
): number {
  if (receitas === 0) return 0;
  return (lucro / receitas) * 100;
}

/**
 * Calcula ticket médio de contratos
 */
export function calcularTicketMedio(
  contratos: any[]
): number {
  if (contratos.length === 0) return 0;
  const total = contratos.reduce((acc, c) => acc + (c.valor_total || 0), 0);
  return total / contratos.length;
}

/**
 * Consolida dados financeiros
 */
export function consolidarFinanceiro(
  contratos: any[],
  despesas: any[],
  empresaIds: string[]
): ConsolidadoFinanceiro {
  const contratosAtivos = contratos.filter(
    c => empresaIds.includes(c.empresa_id) && c.status === 'ativo'
  );
  
  const receita_total = consolidarReceitas(contratos, empresaIds);
  const despesas_totais = consolidarDespesas(despesas, empresaIds);
  const lucro_liquido = calcularLucroLiquido(receita_total, despesas_totais);
  const margem_lucro = calcularMargemLucro(receita_total, lucro_liquido);
  const ticket_medio = calcularTicketMedio(contratosAtivos);

  return {
    receita_total,
    despesas_totais,
    lucro_liquido,
    margem_lucro,
    ticket_medio,
    crescimento_mom: 0, // TODO: Calcular com dados históricos
  };
}

/**
 * Consolida dados operacionais
 */
export function consolidarOperacional(
  contratos: any[],
  ordensServico: any[],
  materiais: any[],
  veiculos: any[],
  empresaIds: string[]
): ConsolidadoOperacional {
  const contratosAtivos = contratos.filter(
    c => empresaIds.includes(c.empresa_id) && c.status === 'ativo'
  );
  
  const ordensAtivas = ordensServico.filter(
    os => empresaIds.includes(os.empresa_id) && os.status !== 'concluida'
  );
  
  const materiaisFiltrados = materiais.filter(
    m => empresaIds.includes(m.empresa_id)
  );
  
  const materiaisBloqueados = materiaisFiltrados.reduce(
    (acc, m) => acc + (m.quantidade_bloqueada || 0), 0
  );
  
  const totalMateriais = materiaisFiltrados.reduce(
    (acc, m) => acc + m.quantidade, 0
  );
  
  const veiculosFiltrados = veiculos.filter(
    v => empresaIds.includes(v.empresa_id)
  );
  
  const veiculosEmOperacao = veiculosFiltrados.filter(
    v => v.status === 'em_uso'
  ).length;

  const taxa_ocupacao_materiais = totalMateriais > 0 
    ? (materiaisBloqueados / totalMateriais) * 100 
    : 0;

  return {
    total_contratos_ativos: contratosAtivos.length,
    total_ordens_servico: ordensAtivas.length,
    total_materiais: materiaisFiltrados.length,
    materiais_bloqueados: materiaisBloqueados,
    total_veiculos: veiculosFiltrados.length,
    veiculos_operacao: veiculosEmOperacao,
    taxa_ocupacao_materiais,
  };
}

/**
 * Consolida dados de RH
 */
export function consolidarRH(
  colaboradores: any[],
  pagamentos: any[],
  empresaIds: string[]
): ConsolidadoRH {
  const colaboradoresFiltrados = colaboradores.filter(
    c => c.empresas.some((e: string) => empresaIds.includes(e))
  );
  
  const colaboradoresComRateio = colaboradoresFiltrados.filter(
    c => c.empresas.length > 1 && c.rateio
  );
  
  const folha_pagamento_total = pagamentos
    .filter(p => empresaIds.includes(p.empresa_id))
    .reduce((acc, p) => acc + (p.salario_liquido || 0), 0);

  return {
    total_colaboradores: colaboradoresFiltrados.length,
    folha_pagamento_total,
    colaboradores_com_rateio: colaboradoresComRateio.length,
    horas_trabalhadas: 0, // TODO: Calcular com dados de ponto
  };
}

/**
 * Consolida dados por empresa individual
 */
export function consolidarPorEmpresa(
  empresas: any[],
  contratos: any[],
  despesas: any[],
  colaboradores: any[]
): DadosPorEmpresa[] {
  const CORES_EMPRESAS: Record<string, string> = {
    '1': '#4459E2',
    '2': '#F08133',
    '3': '#3D3AE5',
  };

  const receitaTotal = consolidarReceitas(contratos, empresas.map(e => e.id));

  return empresas.map(empresa => {
    const receitaEmpresa = consolidarReceitas(contratos, [empresa.id]);
    const despesasEmpresa = consolidarDespesas(despesas, [empresa.id]);
    const lucroEmpresa = calcularLucroLiquido(receitaEmpresa, despesasEmpresa);
    const margemEmpresa = calcularMargemLucro(receitaEmpresa, lucroEmpresa);
    const contratosEmpresa = contratos.filter(
      c => c.empresa_id === empresa.id && c.status === 'ativo'
    ).length;
    const colaboradoresEmpresa = colaboradores.filter(
      c => c.empresas.includes(empresa.id)
    ).length;
    const participacao = receitaTotal > 0 
      ? (receitaEmpresa / receitaTotal) * 100 
      : 0;

    return {
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      receita: receitaEmpresa,
      despesas: despesasEmpresa,
      lucro: lucroEmpresa,
      margem: margemEmpresa,
      contratos: contratosEmpresa,
      colaboradores: colaboradoresEmpresa,
      participacao,
      cor_primaria: CORES_EMPRESAS[empresa.id] || '#1F4788',
    };
  }).sort((a, b) => b.receita - a.receita); // Ordenar por receita DESC
}

/**
 * Consolida todos os dados do grupo
 */
export function consolidarDadosGrupo(
  empresas: any[],
  contratos: any[],
  despesas: any[],
  colaboradores: any[],
  ordensServico: any[],
  materiais: any[],
  veiculos: any[],
  pagamentos: any[]
): ConsolidadoGrupo {
  const empresaIds = empresas.map(e => e.id);

  return {
    financeiro: consolidarFinanceiro(contratos, despesas, empresaIds),
    operacional: consolidarOperacional(contratos, ordensServico, materiais, veiculos, empresaIds),
    rh: consolidarRH(colaboradores, pagamentos, empresaIds),
    por_empresa: consolidarPorEmpresa(empresas, contratos, despesas, colaboradores),
    periodo: {
      inicio: new Date().toISOString(),
      fim: new Date().toISOString(),
    },
  };
}

/**
 * Rankeia empresas por diferentes critérios
 */
export function rankearEmpresas(
  dados: DadosPorEmpresa[],
  criterio: 'receita' | 'lucro' | 'margem' | 'participacao'
): DadosPorEmpresa[] {
  return [...dados].sort((a, b) => {
    switch (criterio) {
      case 'receita':
        return b.receita - a.receita;
      case 'lucro':
        return b.lucro - a.lucro;
      case 'margem':
        return b.margem - a.margem;
      case 'participacao':
        return b.participacao - a.participacao;
      default:
        return 0;
    }
  });
}

/**
 * Formata valor monetário
 */
export function formatarValor(valor: number, compacto: boolean = false): string {
  if (compacto) {
    if (valor >= 1000000) {
      return `R$ ${(valor / 1000000).toFixed(1)}M`;
    }
    if (valor >= 1000) {
      return `R$ ${(valor / 1000).toFixed(0)}k`;
    }
  }
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

/**
 * Formata percentual
 */
export function formatarPercentual(valor: number, casasDecimais: number = 1): string {
  return `${valor.toFixed(casasDecimais)}%`;
}

/**
 * Calcula variação percentual entre dois valores
 */
export function calcularVariacao(valorAtual: number, valorAnterior: number): number {
  if (valorAnterior === 0) return 0;
  return ((valorAtual - valorAnterior) / valorAnterior) * 100;
}
