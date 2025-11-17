'use client';

import { useMemo } from 'react';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMockAuth } from '../../hooks/useMockAuth';
import { MOCK_COLABORADORES, MOCK_EMPRESAS } from '../../data/mockData';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardRHPage() {
  const { user } = useMockAuth();

  const empresaAtual = MOCK_EMPRESAS.find(e => e.id === user?.empresa_id);
  
  // Filtrar colaboradores da empresa
  const colaboradoresEmpresa = MOCK_COLABORADORES.filter(c => 
    c.empresas.includes(user?.empresa_id || '')
  );

  // Calcular métricas
  const stats = useMemo(() => {
    const totalAtivos = colaboradoresEmpresa.filter(c => c.status === 'ativo').length;
    const totalInativos = colaboradoresEmpresa.filter(c => c.status === 'inativo').length;
    const folhaMensal = colaboradoresEmpresa
      .filter(c => c.status === 'ativo')
      .reduce((acc, c) => {
        if (c.empresas.length === 1) {
          return acc + c.salario_base;
        } else if (c.rateio && user?.empresa_id) {
          return acc + (c.salario_base * (c.rateio[user.empresa_id] || 0) / 100);
        }
        return acc;
      }, 0);

    const comRateio = colaboradoresEmpresa.filter(c => c.empresas.length > 1).length;
    const mediaSalarial = totalAtivos > 0 ? folhaMensal / totalAtivos : 0;

    return {
      totalAtivos,
      totalInativos,
      folhaMensal,
      comRateio,
      mediaSalarial
    };
  }, [colaboradoresEmpresa, user]);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-[#1F4788]" />
          Dashboard RH
        </h1>
        <p className="text-gray-600">Gestão de pessoas - {empresaAtual?.nome}</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Colaboradores Ativos</p>
          <p className="text-2xl text-gray-900">{stats.totalAtivos}</p>
          <p className="text-xs text-gray-600 mt-2">
            {stats.totalInativos} inativos
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Folha Mensal</p>
          <p className="text-2xl text-gray-900">{formatCurrency(stats.folhaMensal)}</p>
          <p className="text-xs text-gray-600 mt-2">
            Média: {formatCurrency(stats.mediaSalarial)}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-50">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Com Rateio</p>
          <p className="text-2xl text-gray-900">{stats.comRateio}</p>
          <p className="text-xs text-gray-600 mt-2">
            {((stats.comRateio / stats.totalAtivos) * 100).toFixed(0)}% do total
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-orange-50">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Colaboradores</p>
          <p className="text-2xl text-gray-900">{colaboradoresEmpresa.length}</p>
          <p className="text-xs text-gray-600 mt-2">
            Todos os status
          </p>
        </Card>
      </div>

      {/* Lista de Colaboradores */}
      <Card className="p-6">
        <h2 className="text-xl text-gray-900 mb-4">Colaboradores</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">CPF</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cargo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Salário Base</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rateio</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {colaboradoresEmpresa.map((colab) => {
                const rateioPercentual = colab.rateio && user?.empresa_id 
                  ? colab.rateio[user.empresa_id] 
                  : 100;
                const salarioRateado = (colab.salario_base * (rateioPercentual || 100)) / 100;

                return (
                  <tr key={colab.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">{colab.nome}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{colab.cpf}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{colab.cargo}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">{formatCurrency(colab.salario_base)}</td>
                    <td className="py-3 px-4 text-sm">
                      {colab.empresas.length > 1 ? (
                        <Badge variant="outline" className="text-xs">
                          {rateioPercentual}% ({formatCurrency(salarioRateado)})
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={colab.status === 'ativo' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {colab.status}
                      </Badge>
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