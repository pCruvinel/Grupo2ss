export type PerfilUsuario = 'admin' | 'financeiro' | 'operacional' | 'rh' | 'cliente' | 'super_admin' | 'gestor' | 'operador';
export type StatusGenerico = 'ativo' | 'inativo';
export type TipoEmpresa = '2s_locacoes' | '2s_marketing' | 'producoes_eventos' | '2s_facilities' | '2s_portaria' | '2s_limpeza';
export type TipoPessoa = 'pessoa_fisica' | 'pessoa_juridica';
export type StatusContrato = 'ativo' | 'concluido' | 'cancelado' | 'suspenso' | 'finalizado';
export type TipoContrato = 'cliente' | 'fornecedor';
export type StatusParcela = 'pendente' | 'pago' | 'inadimplente' | 'cancelado' | 'atrasado';
export type TipoParcelamento = 'mensal' | 'personalizado' | 'vista';
export type CategoriaDespesa = 'fixa' | 'variavel' | 'folha_pagamento' | 'alimentacao' | 'transporte' | 'material' | 'equipamento' | 'servico' | 'outros';
export type TipoContratoColaborador = 'pj' | 'clt';
export type StatusColaborador = 'ativo' | 'inativo' | 'ferias' | 'licenca' | 'afastado' | 'demitido';
export type StatusPonto = 'normal' | 'falta' | 'atraso' | 'falta_justificada' | 'atestado' | 'ferias' | 'manual';
export type StatusPagamento = 'pendente' | 'pago' | 'cancelado' | 'aprovado' | 'rejeitado';
export type StatusMaterial = 'ativo' | 'inativo' | 'manutencao';
export type TipoVinculacao = 'locacao' | 'consumo' | 'patrimonio';
export type StatusOrdemServico = 'criada' | 'em_andamento' | 'concluida' | 'cancelada' | 'aberta' | 'pausada';
export type StatusVeiculo = 'disponivel' | 'em_uso' | 'manutencao';
export type StatusNotaFiscal = 'emitida' | 'cancelada' | 'inutilizada';
export type StatusCliente = 'ativo' | 'inativo' | 'inadimplente';
export type TipoRateio = 'unica' | 'percentual' | 'igual';
export type PrioridadeOS = 'baixa' | 'media' | 'alta' | 'urgente';
export type VarianteBadge = 'default' | 'success' | 'error' | 'warning' | 'info';

export interface User {
  id: string;
  email: string;
  nome: string;
  empresa_id: number | null;
  perfil: PerfilUsuario;
  status: StatusGenerico;
  data_criacao: string;
  ultimo_acesso: string | null;
}

export interface Empresa {
  id: number;
  nome: string;
  tipo: TipoEmpresa;
  status: StatusGenerico;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco_completo: EnderecoCompleto | null;
  dados_bancarios: DadosBancarios | null;
  timbrado_url: string | null;
  configuracoes: Record<string, any>;
  data_criacao: string;
}

export interface EnderecoCompleto {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface DadosBancarios {
  banco: string;
  agencia: string;
  conta: string;
  tipo_conta: 'corrente' | 'poupanca';
  pix?: string;
}

export interface Cliente {
  id: number;
  empresa_id: number;
  tipo: TipoPessoa;
  nome_razao_social: string;
  nome_fantasia: string | null;
  cpf_cnpj: string;
  rg_ie: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  endereco_completo: EnderecoCompleto | null;
  dados_bancarios: DadosBancarios | null;
  observacoes: string | null;
  status: StatusCliente;
  data_cadastro: string;
}

export interface Fornecedor {
  id: number;
  empresa_id: number;
  tipo: TipoPessoa;
  nome_razao_social: string;
  cpf_cnpj: string;
  categoria_servico: string | null;
  email: string | null;
  telefone: string | null;
  endereco_completo: EnderecoCompleto | null;
  dados_bancarios: DadosBancarios | null;
  status: StatusGenerico;
  data_cadastro: string;
}

export interface Contrato {
  id: number;
  empresa_id: number;
  numero_contrato: string;
  tipo: TipoContrato;
  cliente_id: number | null;
  fornecedor_id: number | null;
  descricao: string | null;
  valor_total: number;
  data_inicio: string;
  data_fim: string | null;
  status: StatusContrato;
  tipo_parcelamento: TipoParcelamento;
  numero_parcelas: number | null;
  observacoes: string | null;
  arquivo_pdf_url: string | null;
  usuario_cadastro_id: string | null;
  data_cadastro: string;
  cliente?: Cliente;
  fornecedor?: Fornecedor;
}

export interface Parcela {
  id: number;
  contrato_id: number;
  numero_parcela: number;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: StatusParcela;
  forma_pagamento: string | null;
  comprovante_url: string | null;
  observacoes: string | null;
}

export interface Despesa {
  id: number;
  empresa_id: number;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
  fornecedor_id: number | null;
  status: StatusPagamento;
  comprovante_url: string | null;
  rateio_empresas: Record<string, number> | null;
  observacoes: string | null;
  data_cadastro: string;
  fornecedor?: Fornecedor;
}

export interface Colaborador {
  id: number;
  empresa_id: number;
  nome: string;
  cpf: string;
  rg: string | null;
  data_nascimento: string;
  email: string | null;
  telefone: string | null;
  endereco_completo: EnderecoCompleto | null;
  tipo_contrato: TipoContratoColaborador;
  cargo_id: number | null;
  salario_base: number;
  data_admissao: string;
  data_demissao: string | null;
  status: StatusColaborador;
  rateio_empresas: Record<string, number> | null;
  observacoes: string | null;
  data_cadastro: string;
  cargo?: Cargo;
}

export interface Cargo {
  id: number;
  empresa_id: number;
  nome: string;
  descricao: string | null;
  status: StatusGenerico;
}

export interface RegistroPonto {
  id: number;
  empresa_id: number;
  colaborador_id: number;
  data: string;
  entrada_manha: string | null;
  saida_almoco: string | null;
  entrada_tarde: string | null;
  saida_noite: string | null;
  horas_trabalhadas: number | null;
  horas_extras: number;
  horas_contratadas: number;
  banco_horas: number | null;
  observacoes: string | null;
  status: StatusPonto;
  usuario_cadastro_id: string | null;
  data_criacao: string;
  colaborador?: Colaborador;
}

export interface Pagamento {
  id: number;
  empresa_id: number;
  colaborador_id: number;
  mes_referencia: string;
  salario_base: number;
  vale_transporte: number;
  vale_alimentacao: number;
  bonus: number;
  outros_adicionais: number;
  plano_saude: number;
  adiantamentos: number;
  inss: number;
  irpf: number;
  outros_descontos: number;
  total_adicionais: number;
  total_descontos: number;
  salario_liquido: number;
  data_pagamento: string | null;
  status: StatusPagamento;
  comprovante_url: string | null;
  observacoes: string | null;
  data_criacao: string;
  colaborador?: Colaborador;
}

export interface Material {
  id: number;
  empresa_id: number;
  codigo: string | null;
  nome: string;
  categoria_id: number | null;
  descricao: string | null;
  unidade_medida: string | null;
  estoque_atual: number;
  estoque_minimo: number | null;
  estoque_maximo: number | null;
  valor_unitario: number | null;
  localizacao: string | null;
  status: StatusMaterial;
  imagem_url: string | null;
  data_cadastro: string;
  categoria?: CategoriaMaterial;
}

export interface CategoriaMaterial {
  id: number;
  empresa_id: number;
  nome: string;
  descricao: string | null;
  tipo_vinculacao: TipoVinculacao;
}

export interface OrdemServico {
  id: number;
  empresa_id: number;
  numero_os: string;
  contrato_id: number | null;
  cliente_id: number;
  descricao_evento: string;
  local_evento: string | null;
  data_montagem: string | null;
  data_desmontagem: string | null;
  responsavel_evento: string | null;
  veiculo_id: number | null;
  motorista_id: number | null;
  status: StatusOrdemServico;
  observacoes: string | null;
  assinatura_entrega_url: string | null;
  assinatura_retirada_url: string | null;
  data_criacao: string;
  cliente?: Cliente;
  veiculo?: Veiculo;
  motorista?: Colaborador;
  contrato?: Contrato;
  itens?: ItemOrdemServico[];
}

export interface ItemOrdemServico {
  id: number;
  ordem_servico_id: number;
  material_id: number;
  quantidade_solicitada: number;
  quantidade_entregue: number;
  observacoes: string | null;
  material?: Material;
}

export interface Veiculo {
  id: number;
  empresa_id: number;
  placa: string;
  modelo: string | null;
  marca: string | null;
  ano: number | null;
  status: StatusVeiculo;
  data_cadastro: string;
}

export interface NotaFiscal {
  id: number;
  empresa_id: number;
  numero: string;
  serie: string | null;
  cliente_id: number;
  contrato_id: number | null;
  data_emissao: string;
  valor_servicos: number;
  base_calculo: number | null;
  aliquota_iss: number | null;
  valor_iss: number | null;
  valor_total: number | null;
  descricao_servicos: string | null;
  codigo_servico: string | null;
  status: StatusNotaFiscal;
  xml_url: string | null;
  pdf_url: string | null;
  observacoes: string | null;
  data_criacao: string;
  cliente?: Cliente;
}

export interface DashboardFinanceiro {
  total_receber: number;
  total_pagar: number;
  inadimplencia: number;
  receitas_mes: Array<{ mes: string; valor: number }>;
  despesas_mes: Array<{ mes: string; valor: number }>;
  clientes_inadimplentes: Array<{
    cliente: string;
    valor: number;
    dias_atraso: number;
  }>;
}

// ========================================
// TIPOS ADICIONAIS PARA COMPONENTES
// ========================================

export interface RateioEmpresa {
  empresa_id: string;
  percentual: number;
  valor?: number;
}

export interface CoresEmpresa {
  primaria: string;
  secundaria: string;
  acento: string;
}

export interface EmpresaCompleta extends Omit<Empresa, 'id'> {
  id: string;
  razao_social: string;
  cores: CoresEmpresa;
  logo_url?: string;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UsuarioCompleto {
  id: string;
  email: string;
  nome: string;
  perfil: PerfilUsuario;
  empresa_id: string | null;
  avatar_url?: string;
  telefone?: string;
  ativo: boolean;
  ultimo_acesso?: string;
  created_at?: string;
}

export interface ColaboradorCompleto extends Omit<Colaborador, 'id' | 'empresa_id'> {
  id: string;
  empresa_id: string;
  departamento?: string;
  foto_url?: string;
  deleted_at?: string | null;
}

export interface ContratoCompleto extends Omit<Contrato, 'id' | 'empresa_id'> {
  id: string;
  empresa_id: string;
  numero: string;
  cliente_nome: string;
  cliente_documento: string;
  tipo_servico: string;
  rateio_empresas?: RateioEmpresa[];
  parcelas?: ParcelaCompleta[];
}

export interface ParcelaCompleta extends Omit<Parcela, 'id' | 'contrato_id'> {
  id: string;
  contrato_id: string;
}

export interface DespesaCompleta extends Omit<Despesa, 'id' | 'empresa_id'> {
  id: string;
  empresa_id: string;
  data: string;
  tipo_rateio?: TipoRateio;
  rateio_empresas?: RateioEmpresa[];
  fornecedor?: string;
  aprovado_por?: string;
  data_aprovacao?: string;
}

export interface MaterialCompleto extends Omit<Material, 'id' | 'empresa_id'> {
  id: string;
  empresa_id: string;
  quantidade_estoque: number;
  quantidade_minima: number;
  preco_unitario: number;
  bloqueado?: boolean;
  motivo_bloqueio?: string;
  bloqueado_por?: string;
  data_bloqueio?: string;
  deleted_at?: string | null;
}

export interface OrdemServicoCompleta extends Omit<OrdemServico, 'id' | 'empresa_id'> {
  id: string;
  empresa_id: string;
  numero: string;
  tipo_servico: string;
  local: string;
  data_abertura: string;
  data_prevista?: string;
  data_conclusao?: string;
  prioridade: PrioridadeOS;
  responsavel_id?: string;
  responsavel_nome?: string;
}

export interface VeiculoCompleto extends Omit<Veiculo, 'id' | 'empresa_id'> {
  id: string;
  empresa_id: string;
  tipo: string;
  km_atual: number;
  gps_ativo?: boolean;
  ultima_localizacao?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    endereco?: string;
  };
  proximo_manutencao_km?: number;
}

export interface RegistroPontoCompleto extends Omit<RegistroPonto, 'id' | 'empresa_id' | 'colaborador_id'> {
  id: string;
  colaborador_id: string;
  colaborador_nome?: string;
  entrada?: string;
  saida_almoco?: string;
  retorno_almoco?: string;
  saida?: string;
  tipo: StatusPonto;
  justificativa?: string;
  aprovado_por?: string;
  latitude?: number;
  longitude?: number;
}

// ========================================
// TIPOS PARA PAGINAÇÃO E FILTROS
// ========================================

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | number | boolean | null | undefined;
}

export interface TableState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: PaginationParams;
  sort?: SortParams;
  filters?: FilterParams;
}

// ========================================
// TIPOS PARA FORMULÁRIOS
// ========================================

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  values: Partial<T>;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// ========================================
// TIPOS PARA MODAIS
// ========================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface EditModalProps<T> extends ModalProps {
  item: T;
  onUpdate: (item: T) => void | Promise<void>;
}

export interface CreateModalProps<T> extends ModalProps {
  onCreate: (item: Partial<T>) => void | Promise<void>;
}

// ========================================
// TIPOS PARA DASHBOARDS
// ========================================

export interface KPI {
  label: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface DashboardData {
  kpis: KPI[];
  charts: {
    [key: string]: ChartData;
  };
  alerts?: Alert[];
  recentActivity?: Activity[];
}

// ========================================
// TIPOS PARA NOTIFICAÇÕES
// ========================================

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  entity: string;
  timestamp: string;
  details?: string;
}

// ========================================
// TIPOS PARA EXPORTAÇÃO
// ========================================

export interface ExportOptions {
  format: 'xlsx' | 'pdf' | 'csv';
  filename?: string;
  includeHeaders?: boolean;
  columns?: string[];
}

export interface ExportData<T> {
  data: T[];
  options: ExportOptions;
}

// ========================================
// TIPOS PARA API RESPONSE
// ========================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
  message?: string;
  success: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========================================
// TIPOS PARA HOOKS CUSTOMIZADOS
// ========================================

export interface UseTableReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setFilters: (filters: FilterParams) => void;
  setSort: (sort: SortParams) => void;
  refresh: () => void;
}

export interface UsePaginationReturn {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
}

export interface UseFilterReturn {
  filters: FilterParams;
  setFilter: (key: string, value: string | number | boolean | null) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// ========================================
// TIPOS PARA CONTEXT
// ========================================

export interface AuthContextType {
  user: UsuarioCompleto | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<UsuarioCompleto>) => void;
}

export interface EmpresaContextType {
  empresaAtual: EmpresaCompleta | null;
  empresas: EmpresaCompleta[];
  setEmpresaAtual: (empresaId: string) => void;
  loading: boolean;
}

export interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  cores: CoresEmpresa;
}