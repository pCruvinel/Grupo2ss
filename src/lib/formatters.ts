/**
 * Utilitários de Formatação - Sistema ERP Grupo 2S
 * 
 * Funções centralizadas para formatação de CPF, CNPJ, telefone, moeda, data, etc.
 * Evita duplicação de código e garante consistência em todo o sistema.
 */

/**
 * Formata uma string para o padrão CPF (XXX.XXX.XXX-XX)
 * @param valor - String com números do CPF
 * @returns String formatada no padrão CPF
 */
export function formatarCPF(valor: string): string {
  const numeros = valor.replace(/\D/g, '').substring(0, 11);
  return numeros
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');
}

/**
 * Formata uma string para o padrão CNPJ (XX.XXX.XXX/XXXX-XX)
 * @param valor - String com números do CNPJ
 * @returns String formatada no padrão CNPJ
 */
export function formatarCNPJ(valor: string): string {
  const numeros = valor.replace(/\D/g, '').substring(0, 14);
  return numeros
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})/, '$1-$2');
}

/**
 * Formata automaticamente CPF ou CNPJ baseado no tamanho
 * @param valor - String com números do documento
 * @returns String formatada como CPF (≤11 dígitos) ou CNPJ (>11 dígitos)
 */
export function formatarCPFouCNPJ(valor: string): string {
  const numeros = valor.replace(/\D/g, '');
  if (numeros.length <= 11) return formatarCPF(valor);
  return formatarCNPJ(valor);
}

/**
 * Formata uma string para o padrão telefone brasileiro
 * Suporta fixo (XX) XXXX-XXXX e celular (XX) XXXXX-XXXX
 * @param valor - String com números do telefone
 * @returns String formatada no padrão de telefone
 */
export function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '').substring(0, 11);
  if (numeros.length <= 10) {
    // Telefone fixo: (XX) XXXX-XXXX
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  // Celular: (XX) XXXXX-XXXX
  return numeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
}

/**
 * Formata um número para moeda brasileira (R$ X.XXX,XX)
 * @param valor - Número a ser formatado
 * @returns String formatada em Real brasileiro
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA)
 * @param data - String ou objeto Date
 * @returns String formatada no padrão brasileiro
 */
export function formatarData(data: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
}

/**
 * Formata uma data e hora para o padrão brasileiro (DD/MM/AAAA HH:MM)
 * @param data - String ou objeto Date
 * @returns String formatada com data e hora
 */
export function formatarDataHora(data: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(data));
}

/**
 * Formata CEP no padrão brasileiro (XXXXX-XXX)
 * @param valor - String com números do CEP
 * @returns String formatada no padrão CEP
 */
export function formatarCEP(valor: string): string {
  const numeros = valor.replace(/\D/g, '').substring(0, 8);
  return numeros.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata placa de veículo (padrão Mercosul e antigo)
 * @param valor - String com caracteres da placa
 * @returns String formatada (ABC-1D23 ou ABC-1234)
 */
export function formatarPlaca(valor: string): string {
  const limpo = valor.replace(/[^A-Za-z0-9]/g, '').toUpperCase().substring(0, 7);
  return limpo.replace(/(\w{3})(\w{4})/, '$1-$2');
}

/**
 * Formata porcentagem com 2 casas decimais
 * @param valor - Número a ser formatado
 * @returns String formatada como porcentagem
 */
export function formatarPorcentagem(valor: number): string {
  return `${valor.toFixed(2)}%`;
}

/**
 * Remove toda formatação de uma string, deixando apenas números
 * @param valor - String formatada
 * @returns String com apenas números
 */
export function removerFormatacao(valor: string): string {
  return valor.replace(/\D/g, '');
}

/**
 * Valida se CPF é válido (algoritmo de validação)
 * @param cpf - String com CPF (com ou sem formatação)
 * @returns Boolean indicando se CPF é válido
 */
export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '');
  
  if (numeros.length !== 11) return false;
  
  // Elimina CPFs inválidos conhecidos
  if (/^(\d)\1{10}$/.test(numeros)) return false;
  
  // Valida 1º dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(numeros.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto >= 10 ? 0 : resto;
  
  if (digito1 !== parseInt(numeros.charAt(9))) return false;
  
  // Valida 2º dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(numeros.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digito2 = resto >= 10 ? 0 : resto;
  
  return digito2 === parseInt(numeros.charAt(10));
}

/**
 * Valida se CNPJ é válido (algoritmo de validação)
 * @param cnpj - String com CNPJ (com ou sem formatação)
 * @returns Boolean indicando se CNPJ é válido
 */
export function validarCNPJ(cnpj: string): boolean {
  const numeros = cnpj.replace(/\D/g, '');
  
  if (numeros.length !== 14) return false;
  
  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1{13}$/.test(numeros)) return false;
  
  // Valida 1º dígito
  let tamanho = numeros.length - 2;
  let digitos = numeros.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;
  
  // Valida 2º dígito
  tamanho = tamanho + 1;
  digitos = numeros.substring(tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(0));
}

/**
 * Valida e-mail
 * @param email - String com e-mail
 * @returns Boolean indicando se e-mail é válido
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Capitaliza primeira letra de cada palavra
 * @param texto - String a ser capitalizada
 * @returns String com primeira letra de cada palavra maiúscula
 */
export function capitalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .split(' ')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ');
}

/**
 * Trunca texto com reticências
 * @param texto - String a ser truncada
 * @param limite - Número máximo de caracteres
 * @returns String truncada com ...
 */
export function truncarTexto(texto: string, limite: number): string {
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite).trim() + '...';
}

/**
 * Formata número de documento fiscal (NF-e, CT-e, etc)
 * @param numero - Número do documento
 * @param serie - Série do documento
 * @returns String formatada (SÉRIE/NÚMERO)
 */
export function formatarNumeroDocumento(numero: string | number, serie: string | number = '1'): string {
  return `${String(serie).padStart(3, '0')}/${String(numero).padStart(6, '0')}`;
}

/**
 * Formata quilometragem
 * @param km - Número de quilômetros
 * @returns String formatada (X.XXX km)
 */
export function formatarQuilometragem(km: number): string {
  return `${new Intl.NumberFormat('pt-BR').format(km)} km`;
}
