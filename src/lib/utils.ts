import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatCPFCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  return cleaned.length === 11 ? formatCPF(cleaned) : formatCNPJ(cleaned);
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

export function calculateDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    ativo: 'bg-green-100 text-green-700',
    inativo: 'bg-gray-100 text-gray-700',
    pendente: 'bg-yellow-100 text-yellow-700',
    pago: 'bg-green-100 text-green-700',
    inadimplente: 'bg-red-100 text-red-700',
    cancelado: 'bg-red-100 text-red-700',
    concluido: 'bg-blue-100 text-blue-700',
    em_andamento: 'bg-blue-100 text-blue-700',
    criada: 'bg-gray-100 text-gray-700',
    concluida: 'bg-green-100 text-green-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    ativo: 'Ativo',
    inativo: 'Inativo',
    pendente: 'Pendente',
    pago: 'Pago',
    inadimplente: 'Inadimplente',
    cancelado: 'Cancelado',
    concluido: 'Concluído',
    em_andamento: 'Em Andamento',
    criada: 'Criada',
    concluida: 'Concluída',
    ferias: 'Férias',
    licenca: 'Licença',
    disponivel: 'Disponível',
    em_uso: 'Em Uso',
    manutencao: 'Manutenção',
  };
  return labels[status] || status;
}
