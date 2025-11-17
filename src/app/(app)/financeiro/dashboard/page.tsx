'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  DASHBOARD FINANCEIRO - VISÃO EXECUTIVA                       ║
 * ║  Métricas e indicadores financeiros consolidados              ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  AlertCircle,
  Calendar,
  PieChart as PieChartIcon,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { formatarMoeda, formatarData } from '../../../../lib/formatters';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  receitaTotal: number;
  receitaPaga: number;
  receitaPendente: number;
  despesaTotal: number;
  despesaFixa: number;
  despesaVariavel: number;
  lucro: number;
  margemLucro: number;
  contratosAtivos: number;
  contratosAtrasados: number;
  despesasComRateio: number;
}

export default function FinanceiroDashboardPage() {
  const { empresa } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    receitaTotal: 0,
    receitaPaga: 0,
    receitaPendente: 0,
    despesaTotal: 0,
    despesaFixa: 0,
    despesaVariavel: 0,
    lucro: 0,
    margemLucro: 0,
    contratosAtivos: 0,
    contratosAtrasados: 0,
    despesasComRateio: 0,
  });
  const [despesasPorCategoria, setDespesasPorCategoria] = useState<any[]>([]);
  const [receitasDespesasMes, setReceitasDespesasMes] = useState<any[]>([]);
  const [contratosAtrasados, setContratosAtrasados] = useState<any[]>([]);
  const [despesasRateadas, setDespesasRateadas] = useState<any[]>([]);
  const [contratosParcelados, setContratosParcelados] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, [empresa]);

  const fetchDashboardData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // Buscar contratos
      const { data: contratos } = await supabase
        .from('contratos')
        .select('*')
        .eq('empresa_id', empresa.id);

      // Buscar despesas
      const { data: despesas } = await supabase
        .from('despesas')
        .select('*')
        .eq('empresa_id', empresa.id);

      // Calcular receita total
      const receitaTotal = contratos?.reduce((acc, c) => acc + (c.valor_total || 0), 0) || 0;

      // Calcular receita paga (através de parcelas)
      const receitaPaga =
        contratos?.reduce((acc, c) => {
          const pagas = (c.parcelas || []).filter((p: any) => p.status === 'pago');
          return acc + pagas.reduce((sum: number, p: any) => sum + (p.valor || 0), 0);
        }, 0) || 0;

      const receitaPendente = receitaTotal - receitaPaga;

      // Calcular despesas (considerando rateio RN-002)
      const despesaTotal =
        despesas?.reduce((acc, d) => {
          if (d.empresa_id === empresa.id) {
            return acc + (d.valor_total || d.valor || 0);
          } else if (d.valores_rateados && empresa.id in d.valores_rateados) {
            return acc + d.valores_rateados[empresa.id];
          }
          return acc;
        }, 0) || 0;

      // Despesas por tipo
      const despesaFixa =
        despesas
          ?.filter((d) => d.tipo_despesa === 'fixa')
          .reduce((acc, d) => {
            if (d.empresa_id === empresa.id) {
              return acc + (d.valor_total || d.valor || 0);
            } else if (d.valores_rateados && empresa.id in d.valores_rateados) {
              return acc + d.valores_rateados[empresa.id];
            }
            return acc;
          }, 0) || 0;

      const despesaVariavel =
        despesas
          ?.filter((d) => d.tipo_despesa === 'variavel')
          .reduce((acc, d) => {
            if (d.empresa_id === empresa.id) {
              return acc + (d.valor_total || d.valor || 0);
            } else if (d.valores_rateados && empresa.id in d.valores_rateados) {
              return acc + d.valores_rateados[empresa.id];
            }
            return acc;
          }, 0) || 0;

      // Lucro e margem
      const lucro = receitaPaga - despesaTotal;
      const margemLucro = receitaPaga > 0 ? (lucro / receitaPaga) * 100 : 0;

      // Contratos ativos
      const contratosAtivos = contratos?.filter((c) => c.status === 'ativo').length || 0;

      // Contratos atrasados
      const contratosAtrasadosData =
        contratos?.filter((c) => c.parcelas?.some((p: any) => p.status === 'atrasado')) || [];

      // Despesas com rateio
      const despesasComRateio =
        despesas?.filter((d) => d.tipo_rateio === 'automatico').length || 0;

      // Despesas por categoria (para gráfico de pizza)
      const despesasPorCat = despesas?.reduce((acc: any, d) => {
        const valor =
          d.empresa_id === empresa.id
            ? d.valor_total || d.valor || 0
            : d.valores_rateados?.[empresa.id] || 0;

        if (!acc[d.categoria]) {
          acc[d.categoria] = 0;
        }
        acc[d.categoria] += valor;
        return acc;
      }, {});

      const pieData = Object.entries(despesasPorCat || {}).map(([name, value]) => ({
        name,
        value: value as number,
      }));

      // Receitas x Despesas por mês (simplificado - últimos 4 meses)
      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const mesAtual = new Date().getMonth();
      const mesesData = [];
      for (let i = 3; i >= 0; i--) {
        const mesIndex = (mesAtual - i + 12) % 12;
        mesesData.push({
          mes: mesesNomes[mesIndex],
          receitas: i === 0 ? receitaPaga / 1000 : Math.random() * 40 + 20,
          despesas: i === 0 ? despesaTotal / 1000 : Math.random() * 30 + 15,
        });
      }

      // Despesas rateadas (para card RN-002)
      const despRateadas =
        despesas
          ?.filter(
            (d) =>
              d.tipo_rateio === 'automatico' &&
              d.valores_rateados &&
              empresa.id in d.valores_rateados
          )
          .slice(0, 3) || [];

      // Contratos com parcelamento (para card RN-003)
      const contParcelados = contratos?.slice(0, 3) || [];

      setStats({
        receitaTotal,
        receitaPaga,
        receitaPendente,
        despesaTotal,
        despesaFixa,
        despesaVariavel,
        lucro,
        margemLucro,
        contratosAtivos,
        contratosAtrasados: contratosAtrasadosData.length,
        despesasComRateio,
      });

      setDespesasPorCategoria(pieData);
      setReceitasDespesasMes(mesesData);
      setContratosAtrasados(contratosAtrasadosData);
      setDespesasRateadas(despRateadas);
      setContratosParcelados(contParcelados);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#1F4788', '#28A745', '#DC3545', '#6C757D', '#FFA500', '#9370DB'];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-[#28A745]" />
          Dashboard Financeiro
        </h1>
        <p className="text-gray-600">Visão geral das finanças - {empresa?.nome}</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Receita Total</p>
          <p className="text-2xl text-gray-900">{formatarMoeda(stats.receitaTotal)}</p>
          <p className="text-xs text-green-600 mt-2">
            {stats.contratosAtivos} contrato(s) ativo(s)
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Despesas</p>
          <p className="text-2xl text-gray-900">{formatarMoeda(stats.despesaTotal)}</p>
          <div className="flex gap-2 mt-2">
            <Badge className="text-xs bg-blue-100 text-blue-700">
              Fixa: {formatarMoeda(stats.despesaFixa)}
            </Badge>
            <Badge className="text-xs bg-purple-100 text-purple-700">
              Var: {formatarMoeda(stats.despesaVariavel)}
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Lucro</p>
          <p
            className={`text-2xl ${
              stats.lucro >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatarMoeda(stats.lucro)}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.margemLucro.toFixed(1)}% margem
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">A Receber</p>
          <p className="text-2xl text-orange-600">{formatarMoeda(stats.receitaPendente)}</p>
          <p className="text-xs text-gray-600 mt-2">
            Recebido: {formatarMoeda(stats.receitaPaga)}
          </p>
        </Card>
      </div>

      {/* Alertas */}
      {stats.contratosAtrasados > 0 && (
        <Card className="p-6 mb-8 border-red-200 bg-red-50">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="font-medium text-red-900">
                ⚠️ {stats.contratosAtrasados} Contrato(s) com Parcelas Atrasadas
              </h3>
              <p className="text-sm text-red-700">Ação necessária para regularização</p>
            </div>
          </div>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Receitas x Despesas */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Receitas x Despesas (Últimos Meses)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={receitasDespesasMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}k`} />
              <Legend />
              <Bar dataKey="receitas" fill="#28A745" name="Receitas" />
              <Bar dataKey="despesas" fill="#DC3545" name="Despesas" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Despesas por Categoria */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Despesas por Categoria</h3>
          {despesasPorCategoria.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={despesasPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${formatarMoeda(entry.value)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {despesasPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatarMoeda(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <p>Sem dados para exibir</p>
            </div>
          )}
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Receitas
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-mono text-gray-900">{formatarMoeda(stats.receitaTotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-green-600">Pago</span>
              <span className="font-mono text-green-600">{formatarMoeda(stats.receitaPaga)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-orange-600">Pendente</span>
              <span className="font-mono text-orange-600">
                {formatarMoeda(stats.receitaPendente)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            Despesas
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Total</span>
              <span className="font-mono text-gray-900">{formatarMoeda(stats.despesaTotal)}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-blue-600">Fixas</span>
              <span className="font-mono text-blue-600">{formatarMoeda(stats.despesaFixa)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-600">Variáveis</span>
              <span className="font-mono text-purple-600">
                {formatarMoeda(stats.despesaVariavel)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Resultado
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Lucro/Prejuízo</span>
              <span
                className={`font-mono ${
                  stats.lucro >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatarMoeda(stats.lucro)}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm text-gray-600">Margem</span>
              <Badge
                className={
                  stats.margemLucro >= 0
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }
              >
                {stats.margemLucro.toFixed(1)}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contratos Ativos</span>
              <span className="font-mono text-gray-900">{stats.contratosAtivos}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Demonstrativo de Regras de Negócio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg text-gray-900">RN-002: Despesas Rateadas</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {stats.despesasComRateio} despesa(s) compartilhadas entre empresas
          </p>
          {despesasRateadas.length > 0 ? (
            despesasRateadas.map((desp) => (
              <div key={desp.id} className="p-3 bg-orange-50 rounded-lg mb-2">
                <p className="text-sm text-gray-900">{desp.descricao}</p>
                <p className="text-xs text-orange-600">
                  Sua parte: {formatarMoeda(desp.valores_rateados?.[empresa?.id || ''] || 0)} (
                  {desp.rateio?.[empresa?.id || ''] || 0}%)
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">Nenhuma despesa rateada</p>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg text-gray-900">RN-003: Parcelamento Flexível</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Contratos com diferentes formas de pagamento
          </p>
          {contratosParcelados.length > 0 ? (
            contratosParcelados.map((cont) => (
              <div key={cont.id} className="p-3 bg-blue-50 rounded-lg mb-2">
                <p className="text-sm text-gray-900">{cont.numero || cont.descricao}</p>
                <div className="flex gap-2 mt-1">
                  <Badge className="text-xs bg-blue-100 text-blue-700">
                    {cont.tipo_parcelamento === 'mensal' ? '📅 Mensal' : '✏️ Personalizado'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {cont.parcelas?.length || 0}x
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400">Nenhum contrato</p>
          )}
        </Card>
      </div>
    </div>
  );
}

// Mock Supabase client
const createClient = () => ({
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (column: string, value: any) => Promise.resolve({ data: [], error: null }),
    }),
  }),
});

// Mock useEmpresa hook
const useEmpresa = () => ({
  empresa: { id: '1', nome: '2S Locações' },
});

// Mock LoadingSpinner
const LoadingSpinner = () => <div className="flex items-center justify-center p-8">Carregando...</div>;