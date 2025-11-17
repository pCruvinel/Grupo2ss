'use client';

import { useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMockAuth } from '../../hooks/useMockAuth';
import { MOCK_CONTRATOS, MOCK_DESPESAS, MOCK_EMPRESAS } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardFinanceiroPage() {
  const { user } = useMockAuth();

  // Filtrar dados por empresa
  const empresaAtual = MOCK_EMPRESAS.find(e => e.id === user?.empresa_id);
  const contratosEmpresa = MOCK_CONTRATOS.filter(c => c.empresa_id === user?.empresa_id);
  const despesasEmpresa = MOCK_DESPESAS.filter(d => 
    d.empresa_id === user?.empresa_id || 
    (d.valores_rateados && user?.empresa_id && user.empresa_id in d.valores_rateados)
  );

  // Calcular métricas
  const stats = useMemo(() => {
    const receitaTotal = contratosEmpresa.reduce((acc, c) => acc + c.valor_total, 0);
    const contratosAtivos = contratosEmpresa.filter(c => c.status === 'ativo').length;
    
    const despesaTotal = despesasEmpresa.reduce((acc, d) => {
      if (d.empresa_id === user?.empresa_id) {
        return acc + d.valor_total;
      } else if (d.valores_rateados && user?.empresa_id) {
        return acc + (d.valores_rateados[user.empresa_id] || 0);
      }
      return acc;
    }, 0);

    const lucro = receitaTotal - despesaTotal;
    const margemLucro = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;

    return {
      receitaTotal,
      despesaTotal,
      lucro,
      margemLucro,
      contratosAtivos,
      despesasComRateio: despesasEmpresa.filter(d => d.tipo_rateio === 'automatico').length
    };
  }, [contratosEmpresa, despesasEmpresa, user]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-[#28A745]" />
          Dashboard Financeiro
        </h1>
        <p className="text-gray-600">Visão geral das finanças - {empresaAtual?.nome}</p>
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
          <p className="text-2xl text-gray-900">{formatCurrency(stats.receitaTotal)}</p>
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
          <p className="text-2xl text-gray-900">{formatCurrency(stats.despesaTotal)}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.despesasComRateio} com rateio
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Lucro</p>
          <p className={`text-2xl ${stats.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.lucro)}
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
          <p className="text-sm text-gray-600 mb-1">Contratos</p>
          <p className="text-2xl text-gray-900">{contratosEmpresa.length}</p>
          <p className="text-xs text-green-600 mt-2">
            {stats.contratosAtivos} ativos
          </p>
        </Card>
      </div>

      {/* Lista de Contratos Recentes */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg text-gray-900 mb-4">Contratos Recentes</h3>
        <div className="space-y-3">
          {contratosEmpresa.slice(0, 5).map(contrato => (
            <div key={contrato.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{contrato.numero}</p>
                <p className="text-sm text-gray-600">{contrato.cliente_nome}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-gray-900">{formatCurrency(contrato.valor_total)}</p>
                <Badge variant={contrato.status === 'ativo' ? 'default' : 'secondary'}>
                  {contrato.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Lista de Despesas Recentes */}
      <Card className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">Despesas Recentes</h3>
        <div className="space-y-3">
          {despesasEmpresa.slice(0, 5).map(despesa => (
            <div key={despesa.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{despesa.descricao}</p>
                <p className="text-sm text-gray-600">{despesa.categoria}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-gray-900">
                  {despesa.empresa_id === user?.empresa_id 
                    ? formatCurrency(despesa.valor_total)
                    : formatCurrency(despesa.valores_rateados?.[user?.empresa_id || ''] || 0)
                  }
                </p>
                {despesa.tipo_rateio === 'automatico' && (
                  <Badge variant="outline" className="text-xs">
                    Rateado
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}