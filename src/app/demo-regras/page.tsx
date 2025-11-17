'use client';

import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Building2,
  TrendingUp,
  Calendar,
  Clock,
  Trash2,
  Lock,
  DollarSign,
  CheckCircle,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const regrasNegocio = [
  {
    codigo: 'RN-001',
    nome: 'Segregação por Empresa',
    descricao: 'Usuários só visualizam dados de sua empresa (2S Locações, 2S Marketing, Produções)',
    icon: Building2,
    color: 'blue',
    implementacao: [
      'Filtro automático por empresa_id em todas as queries',
      'Seletor de empresa no sidebar para Admin',
      'Dashboard mostra apenas dados da empresa ativa',
      'Contratos, materiais e despesas são segregados',
    ],
    demo: '/dashboard',
  },
  {
    codigo: 'RN-002',
    nome: 'Rateio Automático',
    descricao: 'Colaboradores em múltiplas empresas têm custos rateados automaticamente',
    icon: TrendingUp,
    color: 'orange',
    implementacao: [
      'Campo "rateio" no cadastro de colaboradores',
      'Percentual de distribuição entre empresas',
      'Cálculo automático no fechamento da folha',
      'Exemplo: Rafael Souza - 60% 2S Locações, 40% Produções',
    ],
    demo: '/rh/colaboradores',
  },
  {
    codigo: 'RN-003',
    nome: 'Parcelamento Flexível',
    descricao: 'Contratos com 2 opções: Mensal (automático) ou Personalizado (manual)',
    icon: Calendar,
    color: 'purple',
    implementacao: [
      'Tipo de parcelamento selecionável',
      'Mensal: parcelas geradas automaticamente',
      'Personalizado: editor manual de parcelas',
      'Interface permite adicionar/editar parcelas individualmente',
    ],
    demo: '/financeiro/contratos',
  },
  {
    codigo: 'RN-004',
    nome: 'Controle de Ponto Centralizado',
    descricao: 'Apenas gestor RH pode criar/editar registros de ponto',
    icon: Clock,
    color: 'green',
    implementacao: [
      'Permissões validadas no frontend e backend',
      'Perfis Admin e RH têm acesso total',
      'Outros perfis apenas visualizam seu próprio ponto',
      'Histórico de edições com campo "editado_por"',
    ],
    demo: '/rh/ponto',
  },
  {
    codigo: 'RN-005',
    nome: 'Exclusão Lógica',
    descricao: 'Nenhum dado é deletado do banco de dados, apenas inativado',
    icon: Trash2,
    color: 'gray',
    implementacao: [
      'Campo "status" (ativo/inativo) em todas as tabelas',
      'Botão "Desativar" ao invés de "Deletar"',
      'Filtro padrão mostra apenas registros ativos',
      'Possibilidade de reativar registros inativados',
    ],
    demo: '/admin/usuarios',
  },
  {
    codigo: 'RN-006',
    nome: 'Bloqueio de Estoque',
    descricao: 'Quando item é de aluguel e está vinculado a OS, fica bloqueado até conclusão',
    icon: Lock,
    color: 'red',
    implementacao: [
      'Campo "tipo" diferencia aluguel de venda',
      'Quantidade_bloqueada separada de quantidade_disponível',
      'Vínculo com ordem_servico_id quando em uso',
      'Liberação automática ao concluir OS',
    ],
    demo: '/estoque/materiais',
  },
  {
    codigo: 'RN-007',
    nome: 'Separação Bônus/Descontos',
    descricao: 'Pagamentos separam claramente adicionais (VT, VR) de descontos (plano, INSS)',
    icon: DollarSign,
    color: 'emerald',
    implementacao: [
      'Arrays separados para bônus e descontos',
      'Total calculado automaticamente',
      'Interface visual com cards distintos',
      'Relatório de folha detalhado por categoria',
    ],
    demo: '/rh/pagamentos',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  green: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

export default function DemoRegrasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1F4788] rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-gray-900 mb-2">Regras de Negócio Implementadas</h1>
          <p className="text-gray-600 text-lg">
            Sistema Grupo 2S - Todas as 7 regras funcionais
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-700">
              Modo Demo - Dados Mockados - Sem necessidade de backend
            </span>
          </div>
        </div>

        {/* Info Box */}
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-gray-900 mb-2">Como usar este demo</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Faça login com qualquer um dos 5 perfis disponíveis</li>
                <li>• Navegue pelas páginas para ver as regras em ação</li>
                <li>• Todos os dados são mockados - nenhuma configuração necessária</li>
                <li>• Clique em "Ver Demo" para ir direto à página da regra</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Regras Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {regrasNegocio.map((regra) => {
            const Icon = regra.icon;
            const colors = colorMap[regra.color];

            return (
              <Card
                key={regra.codigo}
                className={`p-6 border-2 ${colors.border} hover:shadow-lg transition-shadow`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                      <Badge className={`${colors.bg} ${colors.text} border-0 mb-1`}>
                        {regra.codigo}
                      </Badge>
                      <h3 className="text-gray-900">{regra.nome}</h3>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-gray-600 mb-4">{regra.descricao}</p>

                {/* Implementação */}
                <div className={`p-4 ${colors.bg} rounded-lg mb-4`}>
                  <p className="font-medium text-sm text-gray-900 mb-2">
                    Implementação:
                  </p>
                  <ul className="space-y-1">
                    {regra.implementacao.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link href={regra.demo}>
                  <Button className="w-full" variant="outline">
                    Ver Demo da Regra →
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Resumo Técnico */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-[#1F4788] to-blue-900 text-white">
          <h3 className="mb-4">📊 Resumo Técnico</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-200 text-sm mb-1">Total de Regras</p>
              <p className="text-3xl">7</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Status</p>
              <p className="text-3xl">100%</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm mb-1">Implementadas</p>
              <p className="text-3xl">✅ Todas</p>
            </div>
          </div>
        </Card>

        {/* Voltar */}
        <div className="mt-8 text-center">
          <Link href="/login">
            <Button size="lg" className="bg-[#1F4788] hover:bg-blue-800">
              Fazer Login e Explorar Sistema
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}