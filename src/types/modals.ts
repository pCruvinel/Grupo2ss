/**
 * Tipos TypeScript para Modais - Sistema ERP Grupo 2S
 * 
 * Define todas as interfaces e tipos para os 23+ modais do sistema.
 * Elimina uso de 'any' e garante type safety completo.
 */

// ==================== TIPOS COMPARTILHADOS ====================

export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  tipo?: 'eventos' | 'locacao' | 'transportes';
  cor_primaria?: string;
  cor_secundaria?: string;
  logo_url?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'master' | 'admin' | 'gerente' | 'colaborador' | 'cliente';
  empresa_id?: string;
  avatar_url?: string;
}

export interface BaseModalProps {
  open: boolean;
  onClose: () => void;
}

export interface AuditInfo {
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface HistoricoItem {
  data: string;
  usuario: string;
  acao: string;
  detalhes: string;
}

// ==================== COLABORADORES ====================

export type TipoContrato = 'CLT' | 'PJ' | 'Temporario';
export type StatusColaborador = 'ativo' | 'inativo' | 'ferias' | 'afastado';

export interface Colaborador extends AuditInfo {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  tipo_contrato: TipoContrato;
  salario: number;
  data_admissao: string;
  data_demissao?: string;
  status: StatusColaborador;
  empresas_vinculadas: string[];
  rateio_salario?: Record<string, number>;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  foto_url?: string;
}

export interface NovoColaboradorModalProps extends BaseModalProps {
  onSave: (colaborador: Omit<Colaborador, 'id' | keyof AuditInfo>) => Promise<void>;
  empresas: Empresa[];
}

export interface EditarColaboradorModalProps extends BaseModalProps {
  colaborador: Colaborador;
  onSave: (data: Partial<Colaborador>) => Promise<void>;
  empresas: Empresa[];
}

// ==================== MATERIAIS ====================

export type StatusMaterial = 'disponivel' | 'bloqueado' | 'manutencao' | 'critico' | 'indisponivel';
export type UnidadeMedida = 'UN' | 'KG' | 'M' | 'M2' | 'L' | 'CX' | 'PC' | 'KIT';

export interface Material extends AuditInfo {
  id: string;
  nome: string;
  codigo: string;
  categoria: string;
  unidade: UnidadeMedida;
  quantidade_total: number;
  quantidade_disponivel: number;
  quantidade_bloqueada: number;
  quantidade_minima: number;
  valor_unitario: number;
  valor_total: number;
  localizacao?: string;
  fornecedor?: string;
  empresa_id: string;
  observacoes?: string;
  status: StatusMaterial;
  data_cadastro: string;
  ultima_movimentacao: string;
  foto_url?: string;
}

export interface MovimentacaoMaterial {
  id: string;
  material_id: string;
  tipo: 'entrada' | 'saida' | 'bloqueio' | 'desbloqueio' | 'ajuste';
  quantidade: number;
  motivo: string;
  ordem_servico_id?: string;
  usuario_id: string;
  data: string;
}

export interface NovoMaterialModalProps extends BaseModalProps {
  onSave: (material: Omit<Material, 'id' | keyof AuditInfo>) => Promise<void>;
  empresas: Empresa[];
}

export interface EditarMaterialModalProps extends BaseModalProps {
  material: Material;
  onSave: (data: Partial<Material>) => Promise<void>;
  empresas: Empresa[];
}

export interface BloquearMaterialModalProps extends BaseModalProps {
  material: Material;
  onSave: (bloqueio: { quantidade: number; motivo: string; ordem_servico_id?: string }) => Promise<void>;
}

export interface HistoricoMaterialModalProps extends BaseModalProps {
  material: Material;
  movimentacoes: MovimentacaoMaterial[];
}

// ==================== ORDENS DE SERVIÇO ====================

export type StatusOrdemServico = 'rascunho' | 'aprovada' | 'em_andamento' | 'finalizada' | 'cancelada';
export type PrioridadeOrdemServico = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ItemOrdemServico {
  material_id: string;
  material_nome?: string;
  quantidade: number;
  valor_unitario?: number;
  valor_total?: number;
}

export interface OrdemServico extends AuditInfo {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  cliente_telefone: string;
  cliente_email?: string;
  descricao: string;
  data_evento: string;
  data_montagem?: string;
  data_desmontagem?: string;
  local_evento: string;
  endereco_completo?: string;
  status: StatusOrdemServico;
  prioridade: PrioridadeOrdemServico;
  valor_total: number;
  valor_desconto?: number;
  valor_final: number;
  forma_pagamento?: string;
  observacoes?: string;
  empresa_id: string;
  responsavel_id?: string;
  itens: ItemOrdemServico[];
  materiais_bloqueados: boolean;
}

export interface NovaOrdemServicoModalProps extends BaseModalProps {
  onSave: (ordem: Omit<OrdemServico, 'id' | keyof AuditInfo>) => Promise<void>;
  empresas: Empresa[];
  materiais: Material[];
}

export interface EditarOrdemServicoModalProps extends BaseModalProps {
  ordem: OrdemServico;
  onSave: (data: Partial<OrdemServico>) => Promise<void>;
  empresas: Empresa[];
  materiais: Material[];
}

export interface FinalizarOrdemServicoModalProps extends BaseModalProps {
  ordem: OrdemServico;
  onSave: (data: { 
    data_finalizacao: string;
    observacoes_finalizacao?: string;
    fotos?: string[];
  }) => Promise<void>;
}

// ==================== DESPESAS ====================

export type StatusDespesa = 'pendente' | 'aprovada' | 'paga' | 'cancelada' | 'vencida';

export interface Despesa extends AuditInfo {
  id: string;
  descricao: string;
  categoria: string;
  valor_total: number;
  data_vencimento: string;
  data_pagamento?: string;
  fornecedor: string;
  observacoes?: string;
  empresas: string[];
  rateio: Record<string, number>;
  status: StatusDespesa;
  data_criacao: string;
  forma_pagamento?: string;
  comprovante_url?: string;
  numero_documento?: string;
}

export interface NovaDespesaModalProps extends BaseModalProps {
  onSave: (despesa: Omit<Despesa, 'id' | keyof AuditInfo>) => Promise<void>;
  empresas: Empresa[];
}

export interface UploadComprovanteModalProps extends BaseModalProps {
  despesa: Despesa;
  onUpload: (file: File) => Promise<void>;
}

// ==================== CONTRATOS ====================

export type StatusContrato = 'ativo' | 'suspenso' | 'cancelado' | 'finalizado';
export type TipoContratoPJ = 'mensal' | 'anual' | 'por_projeto';

export interface Contrato extends AuditInfo {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj: string;
  cliente_email?: string;
  cliente_telefone?: string;
  tipo: TipoContratoPJ;
  valor_mensal?: number;
  valor_total: number;
  data_inicio: string;
  data_fim?: string;
  status: StatusContrato;
  descricao_servicos: string;
  observacoes?: string;
  empresa_id: string;
  arquivo_pdf_url?: string;
}

export interface Pagamento extends AuditInfo {
  id: string;
  contrato_id: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  forma_pagamento?: string;
  numero_documento?: string;
  comprovante_url?: string;
}

export interface NovoContratoModalProps extends BaseModalProps {
  onSave: (contrato: Omit<Contrato, 'id' | keyof AuditInfo>) => Promise<void>;
  empresas: Empresa[];
}

export interface ContratoModalProps extends BaseModalProps {
  contrato: Contrato;
  pagamentos: Pagamento[];
  onEdit?: (data: Partial<Contrato>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export interface NovoPagamentoModalProps extends BaseModalProps {
  contrato: Contrato;
  onSave: (pagamento: Omit<Pagamento, 'id' | keyof AuditInfo>) => Promise<void>;
}

// ==================== VEÍCULOS ====================

export type TipoVeiculo = 'carro' | 'moto' | 'van' | 'caminhao' | 'onibus';
export type TipoCombustivel = 'gasolina' | 'etanol' | 'flex' | 'diesel' | 'eletrico' | 'hibrido';
export type StatusVeiculo = 'ativo' | 'manutencao' | 'inativo';

export interface Veiculo extends AuditInfo {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: string;
  tipo: TipoVeiculo;
  empresa_id: string;
  status: StatusVeiculo;
  km_atual: string;
  combustivel: TipoCombustivel;
  cor?: string;
  renavam?: string;
  chassi?: string;
  foto_url?: string;
}

export interface NovoVeiculoModalProps extends BaseModalProps {
  onSave: (veiculo: Omit<Veiculo, 'id' | keyof AuditInfo>) => Promise<void>;
  empresas: Empresa[];
}

export interface EditarVeiculoModalProps extends BaseModalProps {
  veiculo: Veiculo;
  onSave: (data: Partial<Veiculo>) => Promise<void>;
  empresas: Empresa[];
}

// ==================== PONTO ELETRÔNICO ====================

export type TipoRegistroPonto = 'entrada' | 'saida_almoco' | 'volta_almoco' | 'saida';
export type StatusPonto = 'normal' | 'atraso' | 'falta' | 'justificada' | 'banco_horas';

export interface RegistroPonto extends AuditInfo {
  id: string;
  colaborador_id: string;
  colaborador_nome?: string;
  data: string;
  tipo: TipoRegistroPonto;
  horario: string;
  localizacao_latitude?: number;
  localizacao_longitude?: number;
  status: StatusPonto;
  observacao?: string;
  justificativa?: string;
  foto_url?: string;
  aprovado_por?: string;
  data_aprovacao?: string;
}

export interface RegistroPontoManualModalProps extends BaseModalProps {
  colaborador: Colaborador;
  onSave: (registro: Omit<RegistroPonto, 'id' | keyof AuditInfo>) => Promise<void>;
}

export interface JustificativaAusenciaModalProps extends BaseModalProps {
  registro: RegistroPonto;
  onSave: (data: { justificativa: string; anexos?: File[] }) => Promise<void>;
}

export interface PontoModalProps extends BaseModalProps {
  registros: RegistroPonto[];
  colaborador: Colaborador;
  data: string;
}

// ==================== USUÁRIOS E AUTENTICAÇÃO ====================

export type PerfilUsuario = 'master' | 'admin' | 'gerente' | 'colaborador' | 'cliente';

export interface NovoUsuarioModalProps extends BaseModalProps {
  onSave: (usuario: {
    nome: string;
    email: string;
    perfil: PerfilUsuario;
    empresa_id?: string;
    senha_temporaria: string;
  }) => Promise<void>;
  empresas: Empresa[];
}

export interface ResetSenhaModalProps extends BaseModalProps {
  usuario: Usuario;
  onReset: (novaSenha: string) => Promise<void>;
}

// ==================== TWO COLUMN MODAL ====================

export interface TwoColumnModalProps extends BaseModalProps {
  title: string;
  icon?: React.ReactNode;
  leftColumn: React.ReactNode;
  auditInfo?: AuditInfo;
  historico?: HistoricoItem[];
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

// ==================== FORM DATA TYPES ====================

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  data: T;
  errors: FormErrors;
  isDirty: boolean;
  isLoading: boolean;
  isValid: boolean;
}

// ==================== UTILITÁRIOS ====================

/**
 * Helper type para criar props de modal de edição
 */
export type EditModalProps<T extends { id: string }> = BaseModalProps & {
  item: T;
  onSave: (data: Partial<T>) => Promise<void>;
  onDelete?: () => Promise<void>;
};

/**
 * Helper type para criar props de modal de criação
 */
export type CreateModalProps<T> = BaseModalProps & {
  onSave: (data: Omit<T, 'id' | keyof AuditInfo>) => Promise<void>;
};
