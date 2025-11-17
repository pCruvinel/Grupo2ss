/**
 * Cálculos automáticos do sistema
 */

/**
 * Calcula horas trabalhadas no ponto
 */
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

/**
 * Calcula banco de horas
 */
export function calcularBancoHoras(
  horasTrabalhadas: number,
  horasContratadas: number,
  bancoAnterior: number = 0
): number {
  const saldo = horasTrabalhadas - horasContratadas;
  return bancoAnterior + saldo;
}

/**
 * Calcula rateio de valor entre empresas
 */
export function calcularRateio(
  valorTotal: number,
  percentuais: Record<string, number>
): Record<string, number> {
  const rateio: Record<string, number> = {};
  
  Object.entries(percentuais).forEach(([empresaId, percentual]) => {
    rateio[empresaId] = (valorTotal * percentual) / 100;
  });
  
  return rateio;
}

/**
 * Gera parcelas mensais automaticamente
 */
export function gerarParcelasMensais(
  valorTotal: number,
  numeroParcelas: number,
  dataInicio: string
): Array<{ numero: number; valor: number; vencimento: string }> {
  const parcelas = [];
  const valorParcela = Math.floor((valorTotal / numeroParcelas) * 100) / 100;
  let resto = valorTotal - valorParcela * numeroParcelas;

  for (let i = 0; i < numeroParcelas; i++) {
    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + i);
    
    // Adiciona o resto na última parcela
    const valor = i === numeroParcelas - 1 ? valorParcela + resto : valorParcela;
    
    parcelas.push({
      numero: i + 1,
      valor: parseFloat(valor.toFixed(2)),
      vencimento: data.toISOString().split('T')[0],
    });
  }

  return parcelas;
}

/**
 * Calcula INSS sobre salário
 */
export function calcularINSS(salarioBase: number): number {
  // Tabela INSS 2024 (simplificada)
  if (salarioBase <= 1412.00) {
    return salarioBase * 0.075;
  } else if (salarioBase <= 2666.68) {
    return salarioBase * 0.09;
  } else if (salarioBase <= 4000.03) {
    return salarioBase * 0.12;
  } else if (salarioBase <= 7786.02) {
    return salarioBase * 0.14;
  }
  return 7786.02 * 0.14; // Teto
}

/**
 * Calcula IRPF sobre salário
 */
export function calcularIRPF(salarioBase: number, dependentes: number = 0): number {
  const deducaoDependente = 189.59 * dependentes;
  const baseCalculo = salarioBase - calcularINSS(salarioBase) - deducaoDependente;

  // Tabela IRPF 2024 (simplificada)
  if (baseCalculo <= 2112.00) {
    return 0;
  } else if (baseCalculo <= 2826.65) {
    return baseCalculo * 0.075 - 158.40;
  } else if (baseCalculo <= 3751.05) {
    return baseCalculo * 0.15 - 370.40;
  } else if (baseCalculo <= 4664.68) {
    return baseCalculo * 0.225 - 651.73;
  }
  return baseCalculo * 0.275 - 884.96;
}

/**
 * Calcula salário líquido
 */
export function calcularSalarioLiquido(
  salarioBase: number,
  adicionais: {
    valeTransporte?: number;
    valeAlimentacao?: number;
    bonus?: number;
    outros?: number;
  },
  descontos: {
    planoSaude?: number;
    adiantamentos?: number;
    outros?: number;
  }
): {
  totalAdicionais: number;
  totalDescontos: number;
  inss: number;
  irpf: number;
  salarioLiquido: number;
} {
  const totalAdicionais =
    (adicionais.valeTransporte || 0) +
    (adicionais.valeAlimentacao || 0) +
    (adicionais.bonus || 0) +
    (adicionais.outros || 0);

  const inss = calcularINSS(salarioBase);
  const irpf = calcularIRPF(salarioBase);

  const totalDescontos =
    (descontos.planoSaude || 0) +
    (descontos.adiantamentos || 0) +
    (descontos.outros || 0) +
    inss +
    irpf;

  const salarioLiquido = salarioBase + totalAdicionais - totalDescontos;

  return {
    totalAdicionais,
    totalDescontos,
    inss,
    irpf,
    salarioLiquido,
  };
}

/**
 * Calcula dias de atraso
 */
export function calcularDiasAtraso(dataVencimento: string): number {
  const vencimento = new Date(dataVencimento);
  const hoje = new Date();
  const diff = hoje.getTime() - vencimento.getTime();
  const dias = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
}

/**
 * Valida percentuais de rateio (deve somar 100%)
 */
export function validarRateio(rateio: Record<string, number>): boolean {
  const total = Object.values(rateio).reduce((acc, val) => acc + val, 0);
  return Math.abs(total - 100) < 0.01; // Tolerância para erros de arredondamento
}
