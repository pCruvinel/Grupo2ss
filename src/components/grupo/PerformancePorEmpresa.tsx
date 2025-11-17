import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Target, TrendingUp, Award, AlertCircle, CheckCircle } from 'lucide-react';
import { MOCK_HISTORICO_MENSAL, METAS_POR_EMPRESA, calcularPerformanceMeta, calcularIndiceEficiencia, calcularCrescimentoMoM } from '../../data/mockHistorico';
import { formatarValor, formatarPercentual } from '../../utils/consolidacao';

interface PerformancePorEmpresaProps {
  empresas: any[];
}

export function PerformancePorEmpresa({ empresas }: PerformancePorEmpresaProps) {
  // Cores das empresas
  const CORES_EMPRESAS: Record<string, string> = {
    '1': '#4459E2',
    '2': '#F08133',
    '3': '#3D3AE5',
  };

  // Calcular performance de cada empresa
  const performanceEmpresas = empresas.map(empresa => {
    const dadosEmpresa = MOCK_HISTORICO_MENSAL.filter(d => d.empresa_id === empresa.id);
    const dadosAtual = dadosEmpresa[dadosEmpresa.length - 1];
    const metas = METAS_POR_EMPRESA[empresa.id as keyof typeof METAS_POR_EMPRESA];
    
    // Calcular KPIs
    const performanceReceita = calcularPerformanceMeta(dadosAtual.receita, metas.receita_mensal);
    const performanceMargem = calcularPerformanceMeta(dadosAtual.margem, metas.margem_lucro);
    const performanceContratos = calcularPerformanceMeta(dadosAtual.contratos_novos, metas.contratos_novos);
    const performanceTicket = calcularPerformanceMeta(dadosAtual.ticket_medio, metas.ticket_medio);
    const indiceEficiencia = calcularIndiceEficiencia(dadosAtual.receita, dadosAtual.despesas);
    const crescimentoMoM = calcularCrescimentoMoM(empresa.id);
    
    // Score geral (média ponderada)
    const scoreGeral = (
      performanceReceita * 0.4 +
      performanceMargem * 0.3 +
      performanceContratos * 0.2 +
      performanceTicket * 0.1
    );

    return {
      empresa_id: empresa.id,
      empresa_nome: empresa.nome,
      cor: CORES_EMPRESAS[empresa.id] || '#1F4788',
      dados_atual: dadosAtual,
      metas,
      performance: {
        receita: performanceReceita,
        margem: performanceMargem,
        contratos: performanceContratos,
        ticket: performanceTicket,
        score_geral: scoreGeral,
      },
      kpis: {
        indice_eficiencia: indiceEficiencia,
        crescimento_mom: crescimentoMoM,
        receita_total_6m: dadosEmpresa.reduce((acc, d) => acc + d.receita, 0),
        lucro_total_6m: dadosEmpresa.reduce((acc, d) => acc + d.lucro, 0),
      },
    };
  });

  // Ordenar por score geral
  const rankingPerformance = [...performanceEmpresas].sort((a, b) => b.performance.score_geral - a.performance.score_geral);

  // Função para determinar cor do badge baseado na performance
  const getBadgeColor = (performance: number) => {
    if (performance >= 100) return 'bg-green-100 text-green-700 border-green-300';
    if (performance >= 80) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-red-100 text-red-700 border-red-300';
  };

  // Função para determinar ícone baseado na performance
  const getPerformanceIcon = (performance: number) => {
    if (performance >= 100) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (performance >= 80) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <AlertCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">📊 Performance por Empresa</h1>
        <p className="text-gray-600">Análise comparativa e cumprimento de metas</p>
      </div>

      {/* Ranking Geral */}
      <Card className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg text-gray-900">🏆 Ranking de Performance Geral</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {rankingPerformance.map((emp, index) => (
            <div 
              key={emp.empresa_id}
              className="p-4 bg-white rounded-lg border-2"
              style={{ borderColor: emp.cor }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: emp.cor }}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-900">{emp.empresa_nome.replace('2S ', '')}</span>
                </div>
                {index === 0 && <Award className="w-5 h-5 text-yellow-500" />}
              </div>
              <div className="text-center">
                <p className="text-3xl mb-1" style={{ color: emp.cor }}>
                  {emp.performance.score_geral.toFixed(0)}
                </p>
                <p className="text-xs text-gray-600">Score de Performance</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Heatmap de KPIs */}
      <Card className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">🔥 Heatmap de Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left text-sm text-gray-700 pb-3 pr-4">Empresa</th>
                <th className="text-center text-sm text-gray-700 pb-3 px-3">Receita</th>
                <th className="text-center text-sm text-gray-700 pb-3 px-3">Margem</th>
                <th className="text-center text-sm text-gray-700 pb-3 px-3">Contratos</th>
                <th className="text-center text-sm text-gray-700 pb-3 px-3">Ticket Médio</th>
                <th className="text-center text-sm text-gray-700 pb-3 px-3">Eficiência</th>
                <th className="text-center text-sm text-gray-700 pb-3 pl-3">Score Geral</th>
              </tr>
            </thead>
            <tbody>
              {performanceEmpresas.map(emp => (
                <tr key={emp.empresa_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: emp.cor }}
                      />
                      <span className="text-sm text-gray-900">{emp.empresa_nome}</span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <Badge className={`text-xs mb-1 border ${getBadgeColor(emp.performance.receita)}`}>
                        {formatarPercentual(emp.performance.receita, 0)}
                      </Badge>
                      {getPerformanceIcon(emp.performance.receita)}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <Badge className={`text-xs mb-1 border ${getBadgeColor(emp.performance.margem)}`}>
                        {formatarPercentual(emp.performance.margem, 0)}
                      </Badge>
                      {getPerformanceIcon(emp.performance.margem)}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <Badge className={`text-xs mb-1 border ${getBadgeColor(emp.performance.contratos)}`}>
                        {formatarPercentual(emp.performance.contratos, 0)}
                      </Badge>
                      {getPerformanceIcon(emp.performance.contratos)}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <Badge className={`text-xs mb-1 border ${getBadgeColor(emp.performance.ticket)}`}>
                        {formatarPercentual(emp.performance.ticket, 0)}
                      </Badge>
                      {getPerformanceIcon(emp.performance.ticket)}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-900">{emp.kpis.indice_eficiencia.toFixed(2)}x</span>
                    </div>
                  </td>
                  <td className="py-4 pl-3">
                    <div className="flex flex-col items-center">
                      <span className="text-lg" style={{ color: emp.cor }}>
                        {emp.performance.score_geral.toFixed(0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>≥ 100% da meta</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span>80-99% da meta</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>&lt; 80% da meta</span>
          </div>
        </div>
      </Card>

      {/* Detalhamento por Empresa */}
      <div className="grid grid-cols-3 gap-6">
        {performanceEmpresas.map(emp => (
          <Card key={emp.empresa_id} className="p-6 hover:shadow-lg transition-shadow">
            {/* Header da Empresa */}
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${emp.cor}20` }}
              >
                <div 
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: emp.cor }}
                />
              </div>
              <div>
                <h4 className="text-gray-900">{emp.empresa_nome}</h4>
                <Badge className="text-xs" style={{ backgroundColor: `${emp.cor}20`, color: emp.cor }}>
                  Score: {emp.performance.score_geral.toFixed(0)}
                </Badge>
              </div>
            </div>

            {/* Metas vs Realizado */}
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Receita Mensal</span>
                  <Badge className={`text-xs ${getBadgeColor(emp.performance.receita)}`}>
                    {formatarPercentual(emp.performance.receita, 0)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Meta:</span>
                    <span className="text-gray-700">{formatarValor(emp.metas.receita_mensal, true)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Real:</span>
                    <span style={{ color: emp.cor }}>{formatarValor(emp.dados_atual.receita, true)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(emp.performance.receita, 100)}%`,
                      backgroundColor: emp.cor 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Margem de Lucro</span>
                  <Badge className={`text-xs ${getBadgeColor(emp.performance.margem)}`}>
                    {formatarPercentual(emp.performance.margem, 0)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Meta:</span>
                    <span className="text-gray-700">{formatarPercentual(emp.metas.margem_lucro)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Real:</span>
                    <span style={{ color: emp.cor }}>{formatarPercentual(emp.dados_atual.margem)}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(emp.performance.margem, 100)}%`,
                      backgroundColor: emp.cor 
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Contratos Novos</span>
                  <Badge className={`text-xs ${getBadgeColor(emp.performance.contratos)}`}>
                    {formatarPercentual(emp.performance.contratos, 0)}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Meta:</span>
                    <span className="text-gray-700">{emp.metas.contratos_novos} contratos</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Real:</span>
                    <span style={{ color: emp.cor }}>{emp.dados_atual.contratos_novos} contratos</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="h-2 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(emp.performance.contratos, 100)}%`,
                      backgroundColor: emp.cor 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* KPIs Adicionais */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Crescimento MoM</span>
                <span className={`text-sm flex items-center gap-1 ${emp.kpis.crescimento_mom >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {emp.kpis.crescimento_mom >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
                  {formatarPercentual(Math.abs(emp.kpis.crescimento_mom))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Índice de Eficiência</span>
                <span className="text-sm text-gray-900">{emp.kpis.indice_eficiencia.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Receita 6 meses</span>
                <span className="text-sm text-gray-900">{formatarValor(emp.kpis.receita_total_6m, true)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Lucro 6 meses</span>
                <span className="text-sm text-green-600">{formatarValor(emp.kpis.lucro_total_6m, true)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Insights e Recomendações */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg text-gray-900">💡 Insights e Recomendações</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {performanceEmpresas.map(emp => {
            const insights = [];
            
            if (emp.performance.receita < 80) {
              insights.push('Receita abaixo da meta - Revisar estratégia comercial');
            }
            if (emp.performance.margem < 80) {
              insights.push('Margem baixa - Otimizar custos operacionais');
            }
            if (emp.performance.contratos < 80) {
              insights.push('Poucos contratos - Intensificar prospecção');
            }
            if (emp.kpis.crescimento_mom < 0) {
              insights.push('Crescimento negativo - Atenção necessária');
            }
            if (emp.performance.score_geral >= 100) {
              insights.push('✅ Excelente performance - Manter estratégia atual');
            }

            return (
              <div key={emp.empresa_id} className="p-4 bg-white rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: emp.cor }}
                  />
                  <span className="text-sm text-gray-900">{emp.empresa_nome.replace('2S ', '')}</span>
                </div>
                <ul className="space-y-2">
                  {insights.length > 0 ? (
                    insights.map((insight, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Performance saudável</span>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}