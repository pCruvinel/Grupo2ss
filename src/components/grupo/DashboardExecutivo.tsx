import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { KPICard } from './KPICard';
import { DollarSign, TrendingUp, Wallet, Percent, FileText, Users, Package, Truck, Clock, AlertCircle, Trophy } from 'lucide-react';
import { ConsolidadoGrupo, formatarValor, formatarPercentual, rankearEmpresas } from '../../utils/consolidacao';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardExecutivoProps {
  dados: ConsolidadoGrupo;
  empresas: any[];
}

export function DashboardExecutivo({ dados, empresas }: DashboardExecutivoProps) {
  const { financeiro, operacional, rh, por_empresa } = dados;

  // Preparar dados para gráfico de barras
  const dadosGraficoBarras = por_empresa.map(emp => ({
    nome: emp.empresa_nome.replace('2S ', ''),
    receita: emp.receita,
    despesas: emp.despesas,
    lucro: emp.lucro,
  }));

  // Preparar dados para gráfico de pizza
  const dadosGraficoPizza = por_empresa.map(emp => ({
    name: emp.empresa_nome,
    value: emp.receita,
    color: emp.cor_primaria,
  }));

  // Ranking de empresas
  const ranking = rankearEmpresas(por_empresa, 'receita');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">🏢 Painel do Grupo 2S</h1>
          <p className="text-gray-600">Visão consolidada de todas as empresas</p>
        </div>
        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          Novembro 2025
        </Badge>
      </div>

      {/* KPIs Financeiros */}
      <div>
        <h3 className="text-sm text-gray-600 mb-3 uppercase tracking-wider">💰 Indicadores Financeiros</h3>
        <div className="grid grid-cols-4 gap-6">
          <KPICard
            titulo="Receita Total"
            valor={formatarValor(financeiro.receita_total, true)}
            subtitulo="Todas as empresas"
            variacao={12.5}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-50"
          />
          <KPICard
            titulo="Despesas Totais"
            valor={formatarValor(financeiro.despesas_totais, true)}
            subtitulo="Consolidado do grupo"
            variacao={8.2}
            icon={Wallet}
            iconColor="text-red-600"
            iconBgColor="bg-red-50"
          />
          <KPICard
            titulo="Lucro Líquido"
            valor={formatarValor(financeiro.lucro_liquido, true)}
            subtitulo="Receitas - Despesas"
            variacao={15.3}
            icon={TrendingUp}
            iconColor="text-green-600"
            iconBgColor="bg-green-50"
          />
          <KPICard
            titulo="Margem de Lucro"
            valor={formatarPercentual(financeiro.margem_lucro)}
            subtitulo="Média do grupo"
            variacao={3.1}
            icon={Percent}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
        </div>
      </div>

      {/* KPIs Operacionais */}
      <div>
        <h3 className="text-sm text-gray-600 mb-3 uppercase tracking-wider">📊 Indicadores Operacionais</h3>
        <div className="grid grid-cols-4 gap-6">
          <KPICard
            titulo="Contratos Ativos"
            valor={operacional.total_contratos_ativos}
            subtitulo="Em todas empresas"
            icon={FileText}
            iconColor="text-blue-600"
            iconBgColor="bg-blue-50"
          />
          <KPICard
            titulo="Ordens de Serviço"
            valor={operacional.total_ordens_servico}
            subtitulo="Em andamento"
            icon={FileText}
            iconColor="text-orange-600"
            iconBgColor="bg-orange-50"
          />
          <KPICard
            titulo="Materiais"
            valor={operacional.total_materiais}
            subtitulo={`${operacional.materiais_bloqueados} bloqueados`}
            icon={Package}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-50"
          />
          <KPICard
            titulo="Veículos"
            valor={`${operacional.veiculos_operacao}/${operacional.total_veiculos}`}
            subtitulo="Em operação"
            icon={Truck}
            iconColor="text-cyan-600"
            iconBgColor="bg-cyan-50"
          />
        </div>
      </div>

      {/* KPIs de RH */}
      <div>
        <h3 className="text-sm text-gray-600 mb-3 uppercase tracking-wider">👥 Indicadores de RH</h3>
        <div className="grid grid-cols-3 gap-6">
          <KPICard
            titulo="Colaboradores"
            valor={rh.total_colaboradores}
            subtitulo={`${rh.colaboradores_com_rateio} com rateio (RN-002)`}
            icon={Users}
            iconColor="text-indigo-600"
            iconBgColor="bg-indigo-50"
          />
          <KPICard
            titulo="Folha de Pagamento"
            valor={formatarValor(rh.folha_pagamento_total, true)}
            subtitulo="Total mensal"
            icon={Wallet}
            iconColor="text-pink-600"
            iconBgColor="bg-pink-50"
          />
          <KPICard
            titulo="Ticket Médio"
            valor={formatarValor(financeiro.ticket_medio, true)}
            subtitulo="Por contrato"
            icon={DollarSign}
            iconColor="text-teal-600"
            iconBgColor="bg-teal-50"
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gráfico de Barras - Receita por Empresa */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            📊 Receita vs Despesas por Empresa
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGraficoBarras}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="nome" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => formatarValor(value, true)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesas" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Pizza - Participação no Faturamento */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            🥧 Participação no Faturamento Total
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dadosGraficoPizza}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name.replace('2S ', '')}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGraficoPizza.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatarValor(value, true)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Ranking e Alertas */}
      <div className="grid grid-cols-2 gap-6">
        {/* Ranking de Empresas */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            🏆 Ranking por Receita
          </h3>
          <div className="space-y-3">
            {ranking.map((emp, index) => (
              <div key={emp.empresa_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: emp.cor_primaria }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{emp.empresa_nome}</p>
                    <p className="text-xs text-gray-500">{emp.contratos} contratos ativos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-900">{formatarValor(emp.receita, true)}</p>
                  <p className="text-xs text-gray-500">Margem: {formatarPercentual(emp.margem)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas e Notificações */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            ⚠️ Alertas e Notificações
          </h3>
          <div className="space-y-3">
            {/* Alerta 1 - Meta Atingida */}
            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">✅ Meta mensal atingida!</p>
                <p className="text-xs text-gray-600 mt-1">
                  Receita ultrapassou R$ 2M - Parabéns! 🎉
                </p>
              </div>
            </div>

            {/* Alerta 2 - Atenção */}
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-600 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">⚠️ Despesas elevadas - 2S Marketing</p>
                <p className="text-xs text-gray-600 mt-1">
                  Despesas cresceram 15% vs. mês anterior
                </p>
              </div>
            </div>

            {/* Alerta 3 - Informação */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">ℹ️ Materiais bloqueados</p>
                <p className="text-xs text-gray-600 mt-1">
                  {operacional.materiais_bloqueados} materiais aguardando conclusão de OS
                </p>
              </div>
            </div>

            {/* Alerta 4 - RN-002 */}
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-gray-900">🔄 Rateio automático ativo (RN-002)</p>
                <p className="text-xs text-gray-600 mt-1">
                  {rh.colaboradores_com_rateio} colaboradores com custos rateados
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Detalhamento por Empresa */}
      <div>
        <h3 className="text-sm text-gray-600 mb-3 uppercase tracking-wider">🏢 Detalhamento por Empresa</h3>
        <div className="grid grid-cols-3 gap-6">
          {por_empresa.map(emp => (
            <Card key={emp.empresa_id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${emp.cor_primaria}20` }}
                >
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: emp.cor_primaria }}
                  />
                </div>
                <div>
                  <h4 className="text-gray-900">{emp.empresa_nome}</h4>
                  <p className="text-xs text-gray-500">
                    {formatarPercentual(emp.participacao)} do faturamento
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Receita</span>
                  <span className="text-sm text-gray-900">{formatarValor(emp.receita, true)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Despesas</span>
                  <span className="text-sm text-red-600">{formatarValor(emp.despesas, true)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Lucro</span>
                  <span className="text-sm text-green-600">{formatarValor(emp.lucro, true)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Margem</span>
                  <Badge 
                    className={`${emp.margem >= 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                  >
                    {formatarPercentual(emp.margem)}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Contratos</p>
                  <p className="text-lg text-gray-900">{emp.contratos}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Colaboradores</p>
                  <p className="text-lg text-gray-900">{emp.colaboradores}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
