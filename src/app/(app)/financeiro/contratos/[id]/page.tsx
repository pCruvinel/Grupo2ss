'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  createClient, 
  useEmpresa, 
  LoadingSpinner, 
  StatusBadge,
  formatCurrency,
  formatDate,
  formatCPFCNPJ,
  formatPhone
} from '../../../../lib/figma-make-helpers';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Edit,
  Download,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// Inline types
interface Parcela {
  id: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: string;
  data_pagamento?: string;
}

interface Cliente {
  nome: string;
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
}

interface Fornecedor {
  nome: string;
  cnpj?: string;
}

interface Contrato {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  cliente_email?: string;
  cliente_telefone?: string;
  empresa_id: string;
  tipo: string;
  descricao?: string;
  valor_total: number;
  status: string;
  tipo_parcelamento: string;
  data_inicio: string;
  data_fim: string;
  num_parcelas?: number;
  parcelas?: Parcela[];
  observacoes?: string;
}

export default function ContratoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { empresa } = useEmpresa();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (!empresa || !params.id) return;

    const fetchContrato = async () => {
      try {
        // Buscar contrato com cliente/fornecedor
        const { data: contratoData, error: contratoError } = await supabase
          .from('contratos')
          .select('*, cliente:clientes(*), fornecedor:fornecedores(*)')
          .eq('id', params.id)
          .eq('empresa_id', empresa.id)
          .single();

        if (contratoError) throw contratoError;

        // Buscar parcelas
        const { data: parcelasData, error: parcelasError } = await supabase
          .from('parcelas')
          .select('*')
          .eq('contrato_id', params.id)
          .order('numero_parcela');

        if (parcelasError) throw parcelasError;

        setContrato(contratoData);
        setParcelas(parcelasData || []);
      } catch (error) {
        console.error('Erro ao carregar contrato:', error);
        toast.error('Erro ao carregar contrato');
      } finally {
        setLoading(false);
      }
    };

    fetchContrato();
  }, [empresa, params.id, supabase]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!contrato) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center">
          <p className="text-gray-500">Contrato não encontrado</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/financeiro/contratos')}
          >
            Voltar para Contratos
          </Button>
        </Card>
      </div>
    );
  }

  const entidade = contrato.tipo === 'cliente' ? contrato.cliente : contrato.fornecedor;
  const totalPago = parcelas
    .filter((p) => p.status === 'pago')
    .reduce((acc, p) => acc + Number(p.valor), 0);
  const totalPendente = parcelas
    .filter((p) => p.status === 'pendente' || p.status === 'inadimplente')
    .reduce((acc, p) => acc + Number(p.valor), 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/financeiro/contratos')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Contratos
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-gray-900">Contrato #{contrato.numero_contrato}</h1>
              <StatusBadge status={contrato.status} />
            </div>
            {contrato.descricao && (
              <p className="text-gray-600">{contrato.descricao}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
            {contrato.arquivo_pdf_url && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-[#1F4788]" />
            <span className="text-sm text-gray-600">Valor Total</span>
          </div>
          <div className="text-gray-900">{formatCurrency(contrato.valor_total)}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Total Pago</span>
          </div>
          <div className="text-green-600">{formatCurrency(totalPago)}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600">Total Pendente</span>
          </div>
          <div className="text-orange-600">{formatCurrency(totalPendente)}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-[#1F4788]" />
            <span className="text-sm text-gray-600">Parcelas</span>
          </div>
          <div className="text-gray-900">{parcelas.length} parcelas</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList>
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="parcelas">Parcelas ({parcelas.length})</TabsTrigger>
          <TabsTrigger value="entidade">
            {contrato.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
          </TabsTrigger>
        </TabsList>

        {/* Tab Detalhes */}
        <TabsContent value="detalhes">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Informações do Contrato</h3>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Tipo</div>
                <div className="text-gray-900">
                  {contrato.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Parcelamento</div>
                <div className="text-gray-900">
                  {contrato.tipo_parcelamento === 'mensal'
                    ? `${contrato.numero_parcelas}x Mensal`
                    : contrato.tipo_parcelamento === 'vista'
                    ? 'À Vista'
                    : 'Personalizado'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Data de Início</div>
                <div className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(contrato.data_inicio)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Data de Término</div>
                <div className="text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {contrato.data_fim ? formatDate(contrato.data_fim) : 'Indeterminado'}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Data de Cadastro</div>
                <div className="text-gray-900">
                  {formatDate(contrato.data_cadastro)}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <StatusBadge status={contrato.status} />
              </div>
            </div>

            {contrato.observacoes && (
              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-500 mb-2">Observações</div>
                <div className="text-gray-700">{contrato.observacoes}</div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Tab Parcelas */}
        <TabsContent value="parcelas">
          <Card className="p-6">
            <h3 className="text-gray-900 mb-4">Parcelas do Contrato</h3>

            <div className="space-y-3">
              {parcelas.map((parcela) => (
                <div
                  key={parcela.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center w-16">
                      <div className="text-gray-900">#{parcela.numero_parcela}</div>
                      <div className="text-xs text-gray-500">Parcela</div>
                    </div>
                    <div>
                      <div className="text-gray-900 mb-1">
                        {formatCurrency(parcela.valor)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Vencimento: {formatDate(parcela.data_vencimento)}
                      </div>
                      {parcela.data_pagamento && (
                        <div className="text-sm text-green-600">
                          Pago em: {formatDate(parcela.data_pagamento)}
                        </div>
                      )}
                      {parcela.forma_pagamento && (
                        <div className="text-xs text-gray-500 mt-1">
                          {parcela.forma_pagamento}
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={parcela.status} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Tab Cliente/Fornecedor */}
        <TabsContent value="entidade">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-[#1F4788]" />
              <h3 className="text-gray-900">
                Dados do {contrato.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}
              </h3>
            </div>

            {entidade && (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    {entidade.tipo === 'pessoa_fisica'
                      ? 'Nome'
                      : 'Razão Social'}
                  </div>
                  <div className="text-gray-900">{entidade.nome_razao_social}</div>
                </div>

                {(entidade as Cliente).nome_fantasia && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Nome Fantasia</div>
                    <div className="text-gray-900">
                      {(entidade as Cliente).nome_fantasia}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    {entidade.tipo === 'pessoa_fisica' ? 'CPF' : 'CNPJ'}
                  </div>
                  <div className="text-gray-900">
                    {formatCPFCNPJ(entidade.cpf_cnpj)}
                  </div>
                </div>

                {entidade.email && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="text-gray-900">{entidade.email}</div>
                  </div>
                )}

                {entidade.telefone && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Telefone</div>
                    <div className="text-gray-900">
                      {formatPhone(entidade.telefone)}
                    </div>
                  </div>
                )}

                {(entidade as Cliente).whatsapp && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">WhatsApp</div>
                    <div className="text-gray-900">
                      {formatPhone((entidade as Cliente).whatsapp!)}
                    </div>
                  </div>
                )}

                {entidade.endereco_completo && (
                  <div className="col-span-2">
                    <div className="text-sm text-gray-500 mb-1">Endereço</div>
                    <div className="text-gray-900">
                      {entidade.endereco_completo.logradouro},{' '}
                      {entidade.endereco_completo.numero}
                      {entidade.endereco_completo.complemento &&
                        ` - ${entidade.endereco_completo.complemento}`}
                      <br />
                      {entidade.endereco_completo.bairro} -{' '}
                      {entidade.endereco_completo.cidade}/
                      {entidade.endereco_completo.estado}
                      <br />
                      CEP: {entidade.endereco_completo.cep}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}