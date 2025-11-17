import { z } from 'zod';

// Validações customizadas
export const cpfSchema = z.string().regex(/^\d{11}$/, 'CPF inválido');
export const cnpjSchema = z.string().regex(/^\d{14}$/, 'CNPJ inválido');
export const telefoneSchema = z.string().regex(/^\d{10,11}$/, 'Telefone inválido');
export const cepSchema = z.string().regex(/^\d{8}$/, 'CEP inválido');

export const enderecoSchema = z.object({
  cep: cepSchema,
  logradouro: z.string().min(3),
  numero: z.string().min(1),
  complemento: z.string().optional(),
  bairro: z.string().min(2),
  cidade: z.string().min(2),
  estado: z.string().length(2),
});

export const dadosBancariosSchema = z.object({
  banco: z.string().min(3),
  agencia: z.string().min(3),
  conta: z.string().min(4),
  tipo_conta: z.enum(['corrente', 'poupanca']),
  pix: z.string().optional(),
});

// Schema de Login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

// Schema de Cliente
export const clienteSchema = z.object({
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  nome_razao_social: z.string().min(3, 'Nome/Razão Social obrigatório'),
  nome_fantasia: z.string().optional(),
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ obrigatório'),
  rg_ie: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  endereco_completo: enderecoSchema.optional(),
  dados_bancarios: dadosBancariosSchema.optional(),
  observacoes: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'inadimplente']).default('ativo'),
});

// Schema de Fornecedor
export const fornecedorSchema = z.object({
  tipo: z.enum(['pessoa_fisica', 'pessoa_juridica']),
  nome_razao_social: z.string().min(3, 'Nome/Razão Social obrigatório'),
  cpf_cnpj: z.string().min(11, 'CPF/CNPJ obrigatório'),
  categoria_servico: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco_completo: enderecoSchema.optional(),
  dados_bancarios: dadosBancariosSchema.optional(),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
});

// Schema de Contrato
export const contratoSchema = z.object({
  tipo: z.enum(['cliente', 'fornecedor']),
  cliente_id: z.number().optional(),
  fornecedor_id: z.number().optional(),
  descricao: z.string().optional(),
  valor_total: z.number().positive('Valor deve ser positivo'),
  data_inicio: z.string(),
  data_fim: z.string().optional(),
  tipo_parcelamento: z.enum(['mensal', 'personalizado', 'vista']),
  numero_parcelas: z.number().int().positive().optional(),
  observacoes: z.string().optional(),
  arquivo_pdf_url: z.string().optional(),
});

// Schema de Colaborador
export const colaboradorSchema = z.object({
  nome: z.string().min(3, 'Nome obrigatório'),
  cpf: cpfSchema,
  rg: z.string().optional(),
  data_nascimento: z.string(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefone: z.string().optional(),
  endereco_completo: enderecoSchema.optional(),
  tipo_contrato: z.enum(['pj', 'clt']),
  cargo_id: z.number().optional(),
  salario_base: z.number().positive('Salário deve ser positivo'),
  data_admissao: z.string(),
  rateio_empresas: z.record(z.number()).optional(),
  observacoes: z.string().optional(),
});

// Schema de Ponto
export const pontoSchema = z.object({
  colaborador_id: z.number(),
  data: z.string(),
  entrada_manha: z.string().optional(),
  saida_almoco: z.string().optional(),
  entrada_tarde: z.string().optional(),
  saida_noite: z.string().optional(),
  horas_contratadas: z.number().default(8),
  observacoes: z.string().optional(),
});

// Schema de Pagamento
export const pagamentoSchema = z.object({
  colaborador_id: z.number(),
  mes_referencia: z.string(),
  salario_base: z.number().positive(),
  vale_transporte: z.number().default(0),
  vale_alimentacao: z.number().default(0),
  bonus: z.number().default(0),
  outros_adicionais: z.number().default(0),
  plano_saude: z.number().default(0),
  adiantamentos: z.number().default(0),
  outros_descontos: z.number().default(0),
  observacoes: z.string().optional(),
});

// Schema de Material
export const materialSchema = z.object({
  codigo: z.string().optional(),
  nome: z.string().min(3, 'Nome obrigatório'),
  categoria_id: z.number().optional(),
  descricao: z.string().optional(),
  unidade_medida: z.string().optional(),
  estoque_atual: z.number().default(0),
  estoque_minimo: z.number().optional(),
  estoque_maximo: z.number().optional(),
  valor_unitario: z.number().optional(),
  localizacao: z.string().optional(),
  status: z.enum(['ativo', 'inativo', 'manutencao']).default('ativo'),
});

// Schema de Ordem de Serviço
export const ordemServicoSchema = z.object({
  contrato_id: z.number().optional(),
  cliente_id: z.number(),
  descricao_evento: z.string().min(5, 'Descrição obrigatória'),
  local_evento: z.string().optional(),
  data_montagem: z.string().optional(),
  data_desmontagem: z.string().optional(),
  responsavel_evento: z.string().optional(),
  veiculo_id: z.number().optional(),
  motorista_id: z.number().optional(),
  observacoes: z.string().optional(),
});

// Schema de Veículo
export const veiculoSchema = z.object({
  placa: z.string().min(7, 'Placa obrigatória'),
  modelo: z.string().optional(),
  marca: z.string().optional(),
  ano: z.number().int().optional(),
  status: z.enum(['disponivel', 'em_uso', 'manutencao']).default('disponivel'),
});

// Schema de Despesa
export const despesaSchema = z.object({
  descricao: z.string().min(3, 'Descrição obrigatória'),
  categoria: z.enum(['fixa', 'variavel', 'folha_pagamento']),
  valor: z.number().positive('Valor deve ser positivo'),
  data_vencimento: z.string(),
  data_pagamento: z.string().optional(),
  forma_pagamento: z.string().optional(),
  fornecedor_id: z.number().optional(),
  rateio_empresas: z.record(z.number()).optional(),
  observacoes: z.string().optional(),
});
