/**
 * Validadores - Sistema ERP Grupo 2S
 * 
 * Funções de validação para formulários e modais.
 * Complementa /lib/formatters.ts com validações específicas.
 */

// Re-exportar validadores do formatters para centralização
export { validarCPF, validarCNPJ, validarEmail } from './formatters';

/**
 * Valida CPF ou CNPJ automaticamente
 * @param documento - String com CPF ou CNPJ
 * @returns Boolean indicando se é válido
 */
export function validarCPFouCNPJ(documento: string): boolean {
  const numeros = documento.replace(/\D/g, '');
  
  if (numeros.length === 11) {
    // Importar validarCPF
    const { validarCPF } = require('./formatters');
    return validarCPF(documento);
  } else if (numeros.length === 14) {
    // Importar validarCNPJ
    const { validarCNPJ } = require('./formatters');
    return validarCNPJ(documento);
  }
  
  return false;
}

/**
 * Valida força de senha
 * @param senha - String com a senha
 * @returns Objeto com validação e mensagens
 */
export function validarSenha(senha: string): { 
  valida: boolean; 
  forcaLabel: 'fraca' | 'media' | 'forte';
  mensagens: string[];
} {
  const mensagens: string[] = [];
  let pontos = 0;
  
  if (senha.length < 8) {
    mensagens.push('Senha deve ter no mínimo 8 caracteres');
  } else {
    pontos++;
  }
  
  if (!/[A-Z]/.test(senha)) {
    mensagens.push('Deve conter pelo menos uma letra maiúscula');
  } else {
    pontos++;
  }
  
  if (!/[a-z]/.test(senha)) {
    mensagens.push('Deve conter pelo menos uma letra minúscula');
  } else {
    pontos++;
  }
  
  if (!/[0-9]/.test(senha)) {
    mensagens.push('Deve conter pelo menos um número');
  } else {
    pontos++;
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(senha)) {
    mensagens.push('Deve conter pelo menos um caractere especial');
  } else {
    pontos++;
  }
  
  let forcaLabel: 'fraca' | 'media' | 'forte';
  if (pontos <= 2) {
    forcaLabel = 'fraca';
  } else if (pontos <= 4) {
    forcaLabel = 'media';
  } else {
    forcaLabel = 'forte';
  }
  
  return {
    valida: pontos >= 4,
    forcaLabel,
    mensagens,
  };
}

/**
 * Valida se data é futura
 * @param data - String ou Date
 * @returns Boolean indicando se é futura
 */
export function validarDataFutura(data: string | Date): boolean {
  const dataInput = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  return dataInput > hoje;
}

/**
 * Valida se data é passada
 * @param data - String ou Date
 * @returns Boolean indicando se é passada
 */
export function validarDataPassada(data: string | Date): boolean {
  const dataInput = new Date(data);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  return dataInput < hoje;
}

/**
 * Valida se intervalo entre datas é maior que mínimo (em dias)
 * @param dataInicio - Data de início
 * @param dataFim - Data de fim
 * @param diasMinimos - Número mínimo de dias
 * @returns Boolean indicando se intervalo é válido
 */
export function validarIntervaloMinimo(
  dataInicio: string | Date, 
  dataFim: string | Date, 
  diasMinimos: number
): boolean {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  
  const diferencaMilissegundos = fim.getTime() - inicio.getTime();
  const diferencaDias = diferencaMilissegundos / (1000 * 60 * 60 * 24);
  
  return diferencaDias >= diasMinimos;
}

/**
 * Verifica se data é dia útil (seg-sex, excluindo feriados nacionais fixos)
 * @param data - String ou Date
 * @returns Boolean indicando se é dia útil
 */
export function ehDiaUtil(data: string | Date): boolean {
  const dataInput = new Date(data);
  const diaSemana = dataInput.getDay();
  
  // Sábado (6) ou Domingo (0)
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }
  
  // Feriados nacionais fixos (formato: MM-DD)
  const feriadosFixos = [
    '01-01', // Ano Novo
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalho
    '09-07', // Independência
    '10-12', // Nossa Senhora Aparecida
    '11-02', // Finados
    '11-15', // Proclamação da República
    '12-25', // Natal
  ];
  
  const mes = String(dataInput.getMonth() + 1).padStart(2, '0');
  const dia = String(dataInput.getDate()).padStart(2, '0');
  const dataFormatada = `${mes}-${dia}`;
  
  return !feriadosFixos.includes(dataFormatada);
}

/**
 * Valida número de telefone brasileiro (fixo ou celular)
 * @param telefone - String com telefone
 * @returns Boolean indicando se é válido
 */
export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/\D/g, '');
  
  // Telefone fixo: 10 dígitos (DDD + 8 dígitos)
  // Celular: 11 dígitos (DDD + 9 dígitos)
  if (numeros.length !== 10 && numeros.length !== 11) {
    return false;
  }
  
  // DDD válido (11 a 99)
  const ddd = parseInt(numeros.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  
  // Celular deve começar com 9
  if (numeros.length === 11) {
    const primeiroDigito = numeros.charAt(2);
    if (primeiroDigito !== '9') {
      return false;
    }
  }
  
  return true;
}

/**
 * Valida CEP brasileiro
 * @param cep - String com CEP
 * @returns Boolean indicando se é válido
 */
export function validarCEP(cep: string): boolean {
  const numeros = cep.replace(/\D/g, '');
  return numeros.length === 8 && /^\d{8}$/.test(numeros);
}

/**
 * Valida placa de veículo (Mercosul e antiga)
 * @param placa - String com placa
 * @returns Boolean indicando se é válida
 */
export function validarPlaca(placa: string): boolean {
  const placaLimpa = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Placa Mercosul: ABC1D23
  const regexMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  // Placa antiga: ABC1234
  const regexAntiga = /^[A-Z]{3}[0-9]{4}$/;
  
  return regexMercosul.test(placaLimpa) || regexAntiga.test(placaLimpa);
}

/**
 * Valida valor numérico maior que zero
 * @param valor - Número ou string
 * @returns Boolean indicando se é maior que zero
 */
export function validarValorPositivo(valor: number | string): boolean {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return !isNaN(num) && num > 0;
}

/**
 * Valida valor numérico maior ou igual a zero
 * @param valor - Número ou string
 * @returns Boolean indicando se é >= 0
 */
export function validarValorNaoNegativo(valor: number | string): boolean {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor;
  return !isNaN(num) && num >= 0;
}

/**
 * Valida CNAE (Classificação Nacional de Atividades Econômicas)
 * @param cnae - String com CNAE
 * @returns Boolean indicando se formato é válido
 */
export function validarCNAE(cnae: string): boolean {
  const numeros = cnae.replace(/\D/g, '');
  return numeros.length === 7;
}

/**
 * Valida código de barras EAN-13
 * @param codigo - String com código
 * @returns Boolean indicando se é válido
 */
export function validarCodigoBarras(codigo: string): boolean {
  const numeros = codigo.replace(/\D/g, '');
  
  if (numeros.length !== 13) return false;
  
  // Algoritmo de validação EAN-13
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    const digito = parseInt(numeros.charAt(i));
    soma += i % 2 === 0 ? digito : digito * 3;
  }
  
  const digitoVerificador = (10 - (soma % 10)) % 10;
  return digitoVerificador === parseInt(numeros.charAt(12));
}

/**
 * Valida horário no formato HH:MM
 * @param horario - String com horário
 * @returns Boolean indicando se é válido
 */
export function validarHorario(horario: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(horario);
}

/**
 * Valida se string não está vazia (após trim)
 * @param texto - String a validar
 * @returns Boolean indicando se não está vazia
 */
export function validarTextoObrigatorio(texto: string | undefined | null): boolean {
  return !!texto && texto.trim().length > 0;
}

/**
 * Valida URL
 * @param url - String com URL
 * @returns Boolean indicando se é válida
 */
export function validarURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
