'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  DASHBOARD RH - VISÃO EXECUTIVA                               ║
 * ║  Métricas e indicadores de Recursos Humanos                   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Briefcase,
} from 'lucide-react';
import {
  createClient,
  useEmpresa,
  LoadingSpinner,
  formatCurrency,
  formatDate,
} from '../../../lib/figma-make-helpers';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
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
  totalColaboradores: number;
  colaboradoresAtivos: number;
  novasContratacoes: number;
  colaboradoresInativos: number;
  folhaPagamento: number;
  folhaMesAnterior: number;
  horasTrabalhadas: number;
  horasPrevistas: number;
  taxaPresenca: number;
  comRateio: number;
  registrosCompletos: number;
  registrosIncompletos: number;
  faltas: number;
}

interface AtividadeRecente {
  id: string;
  texto: string;
  timestamp: string;
  tipo: 'success' | 'warning' | 'error' | 'info';
}

export default function DashboardRHPage() {
  const { empresa } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalColaboradores: 0,
    colaboradoresAtivos: 0,
    novasContratacoes: 0,
    colaboradoresInativos: 0,
    folhaPagamento: 0,
    folhaMesAnterior: 0,
    horasTrabalhadas: 0,
    horasPrevistas: 0,
    taxaPresenca: 0,
    comRateio: 0,
    registrosCompletos: 0,
    registrosIncompletos: 0,
    faltas: 0,
  });
  const [atividades, setAtividades] = useState<AtividadeRecente[]>([]);
  const [empresas, setEmpresas] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, [empresa]);

  const fetchDashboardData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // Buscar empresas
      const { data: empresasData } = await supabase
        .from('empresas')
        .select('*')
        .eq('status', 'ativo');

      // Buscar colaboradores
      const { data: colaboradores } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('empresa_id', empresa.id);

      // Buscar folha de pagamento do mês atual
      const mesAtual = new Date().toISOString().slice(0, 7);
      const { data: folhaAtual } = await supabase
        .from('folha_pagamento')
        .select('*')
        .eq('empresa_id', empresa.id)
        .eq('mes_referencia', mesAtual);

      // Buscar folha mês anterior
      const mesAnterior = new Date(new Date().setMonth(new Date().getMonth() - 1))
        .toISOString()
        .slice(0, 7);
      const { data: folhaAnterior } = await supabase
        .from('folha_pagamento')
        .select('*')
        .eq('empresa_id', empresa.id)
        .eq('mes_referencia', mesAnterior);

      // Buscar registros de ponto de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { data: pontosHoje } = await supabase
        .from('registros_ponto')
        .select('*')
        .eq('data', hoje);

      // Calcular estatísticas
      const colaboradoresAtivos = colaboradores?.filter((c) => c.status === 'ativo') || [];
      const colaboradoresInativos = colaboradores?.filter((c) => c.status === 'inativo') || [];

      // Colaboradores criados nos últimos 30 dias
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);
      const novasContratacoes =
        colaboradoresAtivos.filter((c) => new Date(c.created_at) >= dataLimite).length || 0;

      // Folha de pagamento
      const totalFolhaAtual =
        folhaAtual?.reduce((sum, f) => sum + (f.salario_liquido || 0), 0) || 0;
      const totalFolhaAnterior =
        folhaAnterior?.reduce((sum, f) => sum + (f.salario_liquido || 0), 0) || 0;

      // Com rateio
      const comRateio =
        folhaAtual?.filter((f) => f.rateio && Object.keys(f.rateio).length > 1).length || 0;

      // Registros de ponto
      const registrosCompletos =
        pontosHoje?.filter(
          (p) => p.entrada && p.saida_almoco && p.volta_almoco && p.saida
        ).length || 0;
      const registrosIncompletos =
        pontosHoje?.filter((p) => p.entrada && !p.saida).length || 0;
      const faltas = pontosHoje?.filter((p) => !p.entrada && !p.saida).length || 0;

      // Horas trabalhadas (mock - calcular depois)
      const horasTrabalhadas = registrosCompletos * 8 * 60; // mock em minutos
      const horasPrevistas = (colaboradoresAtivos.length || 0) * 8 * 60;
      const taxaPresenca = horasPrevistas > 0
        ? ((registrosCompletos / (colaboradoresAtivos.length || 1)) * 100)
        : 0;

      setStats({
        totalColaboradores: colaboradores?.length || 0,
        colaboradoresAtivos: colaboradoresAtivos.length,
        novasContratacoes,
        colaboradoresInativos: colaboradoresInativos.length,
        folhaPagamento: totalFolhaAtual,
        folhaMesAnterior: totalFolhaAnterior,
        horasTrabalhadas,
        horasPrevistas,
        taxaPresenca,
        comRateio,
        registrosCompletos,
        registrosIncompletos,
        faltas,
      });

      if (empresasData) setEmpresas(empresasData);

      // Atividades recentes (mock - pode ser expandido)
      setAtividades([
        {
          id: '1',
          texto: `${registrosCompletos} colaboradores registraram ponto hoje`,
          timestamp: new Date().toISOString(),
          tipo: 'success',
        },
        {
          id: '2',
          texto: `${comRateio} colaboradores com rateio entre empresas`,
          timestamp: new Date().toISOString(),
          tipo: 'info',
        },
        {
          id: '3',
          texto: `${novasContratacoes} novas contratações nos últimos 30 dias`,
          timestamp: new Date().toISOString(),
          tipo: 'success',
        },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarHoras = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    return `${horas.toLocaleString('pt-BR')}h`;
  };

  const calcularVariacao = (atual: number, anterior: number): { valor: string; positivo: boolean } => {
    if (anterior === 0) return { valor: '+100%', positivo: true };
    const variacao = ((atual - anterior) / anterior) * 100;
    return {
      valor: `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}%`,
      positivo: variacao >= 0,
    };
  };

  const getAtividadeIcon = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const variacaoFolha = calcularVariacao(stats.folhaPagamento, stats.folhaMesAnterior);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-[#28A745]" />
          Dashboard de RH
        </h1>
        <p className="text-gray-600">
          {empresa?.nome} • Visão geral de Recursos Humanos
        </p>
      </div>

      {/* Stats Cards - Linha 1: Colaboradores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <Badge className="bg-green-100 text-green-700">
              +{stats.novasContratacoes} mês
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total de Colaboradores</p>
          <p className="text-3xl text-gray-900 mb-1">{stats.totalColaboradores}</p>
          <p className="text-xs text-gray-500">
            {stats.colaboradoresAtivos} ativos • {stats.colaboradoresInativos} inativos
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <Badge
              className={
                variacaoFolha.positivo
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }
            >
              {variacaoFolha.valor}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-1">Folha de Pagamento</p>
          <p className="text-3xl text-gray-900 mb-1">{formatCurrency(stats.folhaPagamento)}</p>
          <p className="text-xs text-gray-500">vs mês anterior</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Horas Trabalhadas (Hoje)</p>
          <p className="text-3xl text-gray-900 mb-1">{formatarHoras(stats.horasTrabalhadas)}</p>
          <p className="text-xs text-gray-500">
            de {formatarHoras(stats.horasPrevistas)} previstas
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Taxa de Presença (Hoje)</p>
          <p className="text-3xl text-gray-900 mb-1">{stats.taxaPresenca.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">
            {stats.registrosCompletos}/{stats.colaboradoresAtivos} presentes
          </p>
        </Card>
      </div>

      {/* Stats Cards - Linha 2: Ponto */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.registrosCompletos}</p>
              <p className="text-sm text-gray-600">Completos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.registrosIncompletos}</p>
              <p className="text-sm text-gray-600">Incompletos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.faltas}</p>
              <p className="text-sm text-gray-600">Faltas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <PieChart className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl text-gray-900">{stats.comRateio}</p>
              <p className="text-sm text-gray-600">Com Rateio (RN-002)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alertas RN-002 e RN-004 */}
        <div className="lg:col-span-2 space-y-4">
          {/* RN-002 */}
          <Card className="p-6 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-900 mb-1">
                  RN-002: Rateio Automático de Salários
                </p>
                <p className="text-sm text-orange-700">
                  <strong>{stats.comRateio} colaboradores</strong> têm seus salários rateados entre
                  múltiplas empresas do grupo. Os valores exibidos refletem automaticamente a
                  distribuição por empresa.
                </p>
              </div>
            </div>
          </Card>

          {/* RN-004 */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900 mb-1">
                  RN-004: Controle de Ponto Centralizado
                </p>
                <p className="text-sm text-blue-700">
                  O controle de ponto é <strong>centralizado</strong> para todas as{' '}
                  <strong>{empresas.length} empresas</strong> do grupo. Os registros são
                  visualizados de forma unificada no módulo de Ponto.
                </p>
              </div>
            </div>
          </Card>

          {/* Resumo Financeiro */}
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Resumo Financeiro - Folha de Pagamento
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Mês Atual</span>
                <span className="font-mono text-lg text-gray-900">
                  {formatCurrency(stats.folhaPagamento)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Mês Anterior</span>
                <span className="font-mono text-gray-600">
                  {formatCurrency(stats.folhaMesAnterior)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-gray-900">Variação</span>
                <Badge
                  className={
                    variacaoFolha.positivo
                      ? 'bg-green-100 text-green-700 text-base'
                      : 'bg-red-100 text-red-700 text-base'
                  }
                >
                  {variacaoFolha.valor}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Distribuição por Status */}
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[#1F4788]" />
              Distribuição de Colaboradores
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Ativos</span>
                </div>
                <span className="font-medium text-gray-900">{stats.colaboradoresAtivos}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-sm text-gray-600">Inativos</span>
                </div>
                <span className="font-medium text-gray-900">{stats.colaboradoresInativos}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-medium text-gray-900">{stats.totalColaboradores}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Atividades Recentes */}
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#1F4788]" />
              Atividades Recentes
            </h3>
            <div className="space-y-3">
              {atividades.map((atividade) => (
                <div
                  key={atividade.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getAtividadeIcon(atividade.tipo)}
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{atividade.texto}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(atividade.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Empresas do Grupo */}
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1F4788]" />
              Empresas do Grupo
            </h3>
            <div className="space-y-2">
              {empresas.map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-900">{emp.nome}</span>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">Ativa</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Atalhos Rápidos */}
          <Card className="p-6">
            <h3 className="font-medium text-gray-900 mb-4">Atalhos Rápidos</h3>
            <div className="space-y-2">
              <a
                href="/rh/colaboradores"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                <Users className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">Ver Colaboradores</span>
              </a>
              <a
                href="/rh/ponto"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">Controle de Ponto</span>
              </a>
              <a
                href="/rh/folha-pagamento"
                className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
              >
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">Folha de Pagamento</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}