/**
 * Utilitários de Validação - ERP Grupo 2S
 * Funções para validar dados de entrada
 */

/**
 * Valida CPF
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // Todos dígitos iguais
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;
  
  return true;
}

/**
 * Valida CNPJ
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false; // Todos dígitos iguais
  
  // Validação dos dígitos verificadores
  let size = cleaned.length - 2;
  let numbers = cleaned.substring(0, size);
  const digits = cleaned.substring(size);
  let sum = 0;
  let pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;
  
  size = size + 1;
  numbers = cleaned.substring(0, size);
  sum = 0;
  pos = size - 7;
  
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida telefone brasileiro
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Valida CEP
 */
export function isValidCEP(cep: string): boolean {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.length === 8;
}

/**
 * Valida placa de veículo (antiga e Mercosul)
 */
export function isValidPlaca(placa: string): boolean {
  const cleaned = placa.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Placa antiga: AAA0000
  if (/^[A-Z]{3}[0-9]{4}$/.test(cleaned)) return true;
  
  // Placa Mercosul: AAA0A00
  if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(cleaned)) return true;
  
  return false;
}

/**
 * Valida senha forte
 * Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Pelo menos uma maiúscula
  if (!/[a-z]/.test(password)) return false; // Pelo menos uma minúscula
  if (!/[0-9]/.test(password)) return false; // Pelo menos um número
  return true;
}

/**
 * Valida URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida data (não pode ser futura)
 */
export function isValidPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return dateObj <= now;
}

/**
 * Valida data (não pode ser passada)
 */
export function isValidFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  return dateObj >= now;
}

/**
 * Valida range de datas
 */
export function isValidDateRange(startDate: string | Date, endDate: string | Date): boolean {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return start <= end;
}

/**
 * Valida valor numérico positivo
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Valida valor numérico não negativo
 */
export function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
}

/**
 * Valida RENAVAM (11 dígitos)
 */
export function isValidRENAVAM(renavam: string): boolean {
  const cleaned = renavam.replace(/\D/g, '');
  return cleaned.length === 11;
}

/**
 * Valida Chassi (17 caracteres alfanuméricos)
 */
export function isValidChassi(chassi: string): boolean {
  const cleaned = chassi.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  return cleaned.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned);
}

/**
 * Valida horário (HH:MM)
 */
export function isValidTime(time: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return regex.test(time);
}

/**
 * Valida percentual (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 100 && !isNaN(value);
}

/**
 * Valida arquivo por extensão
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const ext = filename.split('.').pop()?.toLowerCase();
  return ext ? allowedTypes.includes(ext) : false;
}

/**
 * Valida tamanho de arquivo (em bytes)
 */
export function isValidFileSize(size: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return size <= maxSizeInBytes;
}

/**
 * Validador genérico de campo obrigatório
 */
export function isRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Valida comprimento mínimo
 */
export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

/**
 * Valida comprimento máximo
 */
export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

/**
 * Valida se valor está dentro de um range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Mensagens de erro padronizadas
 */
export const validationMessages = {
  required: 'Este campo é obrigatório',
  invalidEmail: 'Email inválido',
  invalidCPF: 'CPF inválido',
  invalidCNPJ: 'CNPJ inválido',
  invalidPhone: 'Telefone inválido',
  invalidCEP: 'CEP inválido',
  invalidPlaca: 'Placa inválida',
  invalidPassword: 'Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número',
  invalidURL: 'URL inválida',
  invalidDate: 'Data inválida',
  invalidTime: 'Horário inválido (use HH:MM)',
  invalidPercentage: 'Percentual deve estar entre 0 e 100',
  minLength: (min: number) => `Deve ter no mínimo ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
  minValue: (min: number) => `Valor mínimo: ${min}`,
  maxValue: (max: number) => `Valor máximo: ${max}`,
};
