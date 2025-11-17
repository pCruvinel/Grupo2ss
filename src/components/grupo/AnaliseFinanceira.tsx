import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { consolidarPorMes, calcularCrescimentoMoM, MOCK_HISTORICO_MENSAL, METAS_GRUPO, calcularPerformanceMeta } from '../../data/mockHistorico';
import { formatarValor, formatarPercentual } from '../../utils/consolidacao';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnaliseFinanceiraProps {
  empresas: any[];
}

export function AnaliseFinanceira({ empresas }: AnaliseFinanceiraProps) {
  const [periodo, setPeriodo] = useState('6meses');
  const [empresaSelecionada, setEmpresaSelecionada] = useState('todas');

  // Dados consolidados por mês
  const dadosConsolidados = consolidarPorMes();
  
  // Dados mais recentes (novembro)
  const dadosAtual = dadosConsolidados[dadosConsolidados.length - 1];
  const crescimentoMoM = calcularCrescimentoMoM();

  // Performance vs Metas
  const performanceReceita = calcularPerformanceMeta(dadosAtual.receita_total, METAS_GRUPO.receita_mensal);
  const performanceMargem = calcularPerformanceMeta(dadosAtual.margem_media, METAS_GRUPO.margem_lucro_minima);

  // Calcular totais do período
  const receitaTotal6Meses = dadosConsolidados.reduce((acc, d) => acc + d.receita_total, 0);
  const despesasTotal6Meses = dadosConsolidados.reduce((acc, d) => acc + d.despesas_totais, 0);
  const lucroTotal6Meses = dadosConsolidados.reduce((acc, d) => acc + d.lucro_total, 0);

  // Preparar dados para gráfico de evolução mensal
  const dadosGraficoEvolucao = dadosConsolidados.map(d => ({
    mes: d.mes,
    'Receita': d.receita_total,
    'Despesas': d.despesas_totais,
    'Lucro': d.lucro_total,
  }));

  // Preparar dados para gráfico de área empilhada (receita por empresa)
  const dadosGraficoEmpilhado = dadosConsolidados.map(d => ({
    mes: d.mes,
    '2S Locações': d.receita_locacoes,
    '2S Marketing': d.receita_marketing,
    '2S Produções': d.receita_producoes,
  }));

  // Preparar dados para gráfico de margem por empresa
  const dadosMargemPorEmpresa = ['1', '2', '3'].map(empId => {
    const empresa = empresas.find(e => e.id === empId);
    const dadosEmpresa = MOCK_HISTORICO_MENSAL.filter(d => d.empresa_id === empId);
    const margemMedia = dadosEmpresa.reduce((acc, d) => acc + d.margem, 0) / dadosEmpresa.length;
    const ultimaMargem = dadosEmpresa[dadosEmpresa.length - 1].margem;
    
    return {
      empresa: empresa?.nome.replace('2S ', '') || 'Desconhecida',
      margem_media: margemMedia,
      margem_atual: ultimaMargem,
    };
  });

  // DRE Consolidado (Novembro)
  const dreConsolidado = [
    { item: 'Receita Bruta', valor: dadosAtual.receita_total, tipo: 'receita' },
    { item: 'Despesas Operacionais', valor: -dadosAtual.despesas_totais, tipo: 'despesa' },
    { item: 'Lucro Operacional', valor: dadosAtual.lucro_total, tipo: 'lucro' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">💰 Análise Financeira</h1>
          <p className="text-gray-600">Evolução temporal e análises detalhadas</p>
        </div>
        <div className="flex gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3meses">Últimos 3 meses</SelectItem>
              <SelectItem value="6meses">Últimos 6 meses</SelectItem>
              <SelectItem value="12meses">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs de Performance */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Crescimento MoM</p>
            <Badge className={crescimentoMoM >= METAS_GRUPO.crescimento_mensal ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {crescimentoMoM >= METAS_GRUPO.crescimento_mensal ? '✓ Meta' : '⚠ Abaixo'}
            </Badge>
          </div>
          <p className="text-2xl text-gray-900 mb-1 flex items-center gap-2">
            {formatarPercentual(crescimentoMoM, 1)}
            {crescimentoMoM > 0 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <TrendingDown className="w-5 h-5 text-red-600" />}
          </p>
          <p className="text-xs text-gray-500">Meta: {formatarPercentual(METAS_GRUPO.crescimento_mensal)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Receita Mensal</p>
            <Badge className={performanceReceita >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {formatarPercentual(performanceReceita, 0)}
            </Badge>
          </div>
          <p className="text-2xl text-gray-900 mb-1">{formatarValor(dadosAtual.receita_total, true)}</p>
          <p className="text-xs text-gray-500">Meta: {formatarValor(METAS_GRUPO.receita_mensal, true)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Margem de Lucro</p>
            <Badge className={performanceMargem >= 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
              {formatarPercentual(performanceMargem, 0)}
            </Badge>
          </div>
          <p className="text-2xl text-gray-900 mb-1">{formatarPercentual(dadosAtual.margem_media, 1)}</p>
          <p className="text-xs text-gray-500">Meta: {formatarPercentual(METAS_GRUPO.margem_lucro_minima)}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Lucro Mensal</p>
          </div>
          <p className="text-2xl text-green-600 mb-1">{formatarValor(dadosAtual.lucro_total, true)}</p>
          <p className="text-xs text-gray-500">Nov 2025</p>
        </Card>
      </div>

      {/* Gráfico de Evolução Temporal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg text-gray-900">📈 Evolução Mensal (Jun - Nov 2025)</h3>
          <Badge className="bg-blue-100 text-blue-700">Receita vs Despesas vs Lucro</Badge>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dadosGraficoEvolucao}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value: any) => formatarValor(value, true)}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            />
            <Legend />
            <Line type="monotone" dataKey="Receita" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Lucro" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráficos lado a lado */}
      <div className="grid grid-cols-2 gap-6">
        {/* Gráfico de Área Empilhada */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">📊 Composição da Receita por Empresa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dadosGraficoEmpilhado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => formatarValor(value, true)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Area type="monotone" dataKey="2S Locações" stackId="1" stroke="#4459E2" fill="#4459E2" fillOpacity={0.8} />
              <Area type="monotone" dataKey="2S Marketing" stackId="1" stroke="#F08133" fill="#F08133" fillOpacity={0.8} />
              <Area type="monotone" dataKey="2S Produções" stackId="1" stroke="#3D3AE5" fill="#3D3AE5" fillOpacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Gráfico de Margem por Empresa */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">📊 Margem de Lucro por Empresa</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosMargemPorEmpresa} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="empresa" tick={{ fontSize: 12 }} width={100} />
              <Tooltip 
                formatter={(value: any) => formatarPercentual(value)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="margem_media" name="Média 6 meses" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="margem_atual" name="Atual (Nov)" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* DRE Consolidado e Totais do Período */}
      <div className="grid grid-cols-2 gap-6">
        {/* DRE */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">📋 DRE Consolidado - Novembro 2025</h3>
          <div className="space-y-3">
            {dreConsolidado.map((item, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  item.tipo === 'receita' ? 'bg-green-50' :
                  item.tipo === 'despesa' ? 'bg-red-50' :
                  'bg-blue-50'
                }`}
              >
                <span className={`text-sm ${
                  item.tipo === 'lucro' ? 'font-semibold' : ''
                } text-gray-900`}>
                  {item.item}
                </span>
                <span className={`text-sm font-semibold ${
                  item.tipo === 'receita' ? 'text-green-700' :
                  item.tipo === 'despesa' ? 'text-red-700' :
                  'text-blue-700'
                }`}>
                  {formatarValor(Math.abs(item.valor), true)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Margem de Lucro</span>
              <Badge className="bg-green-100 text-green-700 text-sm">
                {formatarPercentual(dadosAtual.margem_media)}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Totais do Período */}
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">📊 Acumulado do Período (6 meses)</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Receita Total</span>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl text-green-700 mb-1">{formatarValor(receitaTotal6Meses, true)}</p>
              <p className="text-xs text-gray-600">Junho a Novembro 2025</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Despesas Totais</span>
                <ArrowDownRight className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl text-red-700 mb-1">{formatarValor(despesasTotal6Meses, true)}</p>
              <p className="text-xs text-gray-600">Junho a Novembro 2025</p>
            </div>

            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">Lucro Acumulado</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl text-blue-700 mb-1">{formatarValor(lucroTotal6Meses, true)}</p>
              <p className="text-xs text-gray-600">Margem: {formatarPercentual((lucroTotal6Meses / receitaTotal6Meses) * 100)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Análise Mensal Detalhada */}
      <Card className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">📅 Análise Mensal Detalhada</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs text-gray-600 pb-3 uppercase tracking-wider">Mês</th>
                <th className="text-right text-xs text-gray-600 pb-3 uppercase tracking-wider">Receita</th>
                <th className="text-right text-xs text-gray-600 pb-3 uppercase tracking-wider">Despesas</th>
                <th className="text-right text-xs text-gray-600 pb-3 uppercase tracking-wider">Lucro</th>
                <th className="text-right text-xs text-gray-600 pb-3 uppercase tracking-wider">Margem</th>
                <th className="text-right text-xs text-gray-600 pb-3 uppercase tracking-wider">Var. MoM</th>
              </tr>
            </thead>
            <tbody>
              {dadosConsolidados.map((dados, index) => {
                const variacaoMoM = index > 0 
                  ? ((dados.receita_total - dadosConsolidados[index - 1].receita_total) / dadosConsolidados[index - 1].receita_total) * 100
                  : 0;

                return (
                  <tr key={dados.mes} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 text-sm text-gray-900">{dados.mes}/2025</td>
                    <td className="py-3 text-sm text-gray-900 text-right">{formatarValor(dados.receita_total, true)}</td>
                    <td className="py-3 text-sm text-red-600 text-right">{formatarValor(dados.despesas_totais, true)}</td>
                    <td className="py-3 text-sm text-green-600 text-right">{formatarValor(dados.lucro_total, true)}</td>
                    <td className="py-3 text-right">
                      <Badge className={dados.margem_media >= 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {formatarPercentual(dados.margem_media)}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      {index > 0 && (
                        <span className={`text-sm flex items-center justify-end gap-1 ${variacaoMoM >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variacaoMoM >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {formatarPercentual(Math.abs(variacaoMoM))}
                        </span>
                      )}
                      {index === 0 && <span className="text-xs text-gray-400">-</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
