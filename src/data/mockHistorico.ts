// Dados históricos para análise temporal do Grupo 2S
// Últimos 6 meses de dados financeiros e operacionais

export interface DadosMensais {
  mes: string;
  ano: number;
  empresa_id: string;
  receita: number;
  despesas: number;
  lucro: number;
  margem: number;
  contratos_novos: number;
  contratos_cancelados: number;
  colaboradores_ativos: number;
  ticket_medio: number;
}

// Junho a Novembro de 2025
export const MOCK_HISTORICO_MENSAL: DadosMensais[] = [
  // 2S LOCAÇÕES (empresa_id: '1')
  { mes: 'Jun', ano: 2025, empresa_id: '1', receita: 38000, despesas: 18000, lucro: 20000, margem: 52.6, contratos_novos: 3, contratos_cancelados: 1, colaboradores_ativos: 8, ticket_medio: 12666 },
  { mes: 'Jul', ano: 2025, empresa_id: '1', receita: 42000, despesas: 19500, lucro: 22500, margem: 53.6, contratos_novos: 4, contratos_cancelados: 0, colaboradores_ativos: 8, ticket_medio: 10500 },
  { mes: 'Ago', ano: 2025, empresa_id: '1', receita: 45000, despesas: 20000, lucro: 25000, margem: 55.6, contratos_novos: 5, contratos_cancelados: 1, colaboradores_ativos: 9, ticket_medio: 9000 },
  { mes: 'Set', ano: 2025, empresa_id: '1', receita: 48000, despesas: 21000, lucro: 27000, margem: 56.3, contratos_novos: 4, contratos_cancelados: 2, colaboradores_ativos: 9, ticket_medio: 12000 },
  { mes: 'Out', ano: 2025, empresa_id: '1', receita: 52000, despesas: 22500, lucro: 29500, margem: 56.7, contratos_novos: 6, contratos_cancelados: 1, colaboradores_ativos: 9, ticket_medio: 8666 },
  { mes: 'Nov', ano: 2025, empresa_id: '1', receita: 55000, despesas: 23000, lucro: 32000, margem: 58.2, contratos_novos: 5, contratos_cancelados: 0, colaboradores_ativos: 10, ticket_medio: 11000 },
  
  // 2S MARKETING (empresa_id: '2')
  { mes: 'Jun', ano: 2025, empresa_id: '2', receita: 22000, despesas: 11000, lucro: 11000, margem: 50.0, contratos_novos: 2, contratos_cancelados: 0, colaboradores_ativos: 5, ticket_medio: 11000 },
  { mes: 'Jul', ano: 2025, empresa_id: '2', receita: 24000, despesas: 12000, lucro: 12000, margem: 50.0, contratos_novos: 3, contratos_cancelados: 1, colaboradores_ativos: 5, ticket_medio: 8000 },
  { mes: 'Ago', ano: 2025, empresa_id: '2', receita: 26000, despesas: 13500, lucro: 12500, margem: 48.1, contratos_novos: 2, contratos_cancelados: 0, colaboradores_ativos: 6, ticket_medio: 13000 },
  { mes: 'Set', ano: 2025, empresa_id: '2', receita: 28000, despesas: 14000, lucro: 14000, margem: 50.0, contratos_novos: 4, contratos_cancelados: 1, colaboradores_ativos: 6, ticket_medio: 7000 },
  { mes: 'Out', ano: 2025, empresa_id: '2', receita: 30000, despesas: 15500, lucro: 14500, margem: 48.3, contratos_novos: 3, contratos_cancelados: 0, colaboradores_ativos: 6, ticket_medio: 10000 },
  { mes: 'Nov', ano: 2025, empresa_id: '2', receita: 32000, despesas: 15000, lucro: 17000, margem: 53.1, contratos_novos: 4, contratos_cancelados: 1, colaboradores_ativos: 6, ticket_medio: 8000 },
  
  // 2S PRODUÇÕES (empresa_id: '3')
  { mes: 'Jun', ano: 2025, empresa_id: '3', receita: 18000, despesas: 10000, lucro: 8000, margem: 44.4, contratos_novos: 2, contratos_cancelados: 1, colaboradores_ativos: 4, ticket_medio: 9000 },
  { mes: 'Jul', ano: 2025, empresa_id: '3', receita: 20000, despesas: 11000, lucro: 9000, margem: 45.0, contratos_novos: 3, contratos_cancelados: 0, colaboradores_ativos: 4, ticket_medio: 6666 },
  { mes: 'Ago', ano: 2025, empresa_id: '3', receita: 22000, despesas: 12000, lucro: 10000, margem: 45.5, contratos_novos: 2, contratos_cancelados: 1, colaboradores_ativos: 5, ticket_medio: 11000 },
  { mes: 'Set', ano: 2025, empresa_id: '3', receita: 24000, despesas: 13000, lucro: 11000, margem: 45.8, contratos_novos: 4, contratos_cancelados: 0, colaboradores_ativos: 5, ticket_medio: 6000 },
  { mes: 'Out', ano: 2025, empresa_id: '3', receita: 26000, despesas: 14000, lucro: 12000, margem: 46.2, contratos_novos: 3, contratos_cancelados: 1, colaboradores_ativos: 5, ticket_medio: 8666 },
  { mes: 'Nov', ano: 2025, empresa_id: '3', receita: 28000, despesas: 15000, lucro: 13000, margem: 46.4, contratos_novos: 5, contratos_cancelados: 0, colaboradores_ativos: 5, ticket_medio: 5600 },
];

// Consolidar dados por mês (todas empresas)
export function consolidarPorMes(): any[] {
  const meses = ['Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov'];
  
  return meses.map(mes => {
    const dadosMes = MOCK_HISTORICO_MENSAL.filter(d => d.mes === mes);
    const receita_total = dadosMes.reduce((acc, d) => acc + d.receita, 0);
    const despesas_totais = dadosMes.reduce((acc, d) => acc + d.despesas, 0);
    const lucro_total = receita_total - despesas_totais;
    const margem_media = (lucro_total / receita_total) * 100;
    
    return {
      mes,
      receita_total,
      despesas_totais,
      lucro_total,
      margem_media,
      // Por empresa
      receita_locacoes: dadosMes.find(d => d.empresa_id === '1')?.receita || 0,
      receita_marketing: dadosMes.find(d => d.empresa_id === '2')?.receita || 0,
      receita_producoes: dadosMes.find(d => d.empresa_id === '3')?.receita || 0,
    };
  });
}

// Obter crescimento MoM (Month over Month)
export function calcularCrescimentoMoM(empresaId?: string): number {
  const dados = empresaId 
    ? MOCK_HISTORICO_MENSAL.filter(d => d.empresa_id === empresaId)
    : consolidarPorMes();
  
  if (dados.length < 2) return 0;
  
  const mesAtual = dados[dados.length - 1];
  const mesAnterior = dados[dados.length - 2];
  
  const receitaAtual = empresaId ? (mesAtual as DadosMensais).receita : (mesAtual as any).receita_total;
  const receitaAnterior = empresaId ? (mesAnterior as DadosMensais).receita : (mesAnterior as any).receita_total;
  
  if (receitaAnterior === 0) return 0;
  return ((receitaAtual - receitaAnterior) / receitaAnterior) * 100;
}

// Metas do Grupo 2S
export const METAS_GRUPO = {
  receita_mensal: 120000, // R$ 120k
  margem_lucro_minima: 50, // 50%
  crescimento_mensal: 5, // 5% MoM
  contratos_novos_mensal: 12, // 12 novos contratos/mês
  ticket_medio: 10000, // R$ 10k por contrato
};

// Metas por empresa
export const METAS_POR_EMPRESA = {
  '1': { // 2S Locações
    receita_mensal: 50000,
    margem_lucro: 55,
    contratos_novos: 5,
    ticket_medio: 10000,
  },
  '2': { // 2S Marketing
    receita_mensal: 35000,
    margem_lucro: 50,
    contratos_novos: 4,
    ticket_medio: 8750,
  },
  '3': { // 2S Produções
    receita_mensal: 30000,
    margem_lucro: 45,
    contratos_novos: 3,
    ticket_medio: 10000,
  },
};

// Calcular performance vs meta
export function calcularPerformanceMeta(
  valorAtual: number,
  valorMeta: number
): number {
  if (valorMeta === 0) return 0;
  return (valorAtual / valorMeta) * 100;
}

// Índice de eficiência operacional
export function calcularIndiceEficiencia(
  receita: number,
  despesas: number
): number {
  if (despesas === 0) return 0;
  return receita / despesas;
}
