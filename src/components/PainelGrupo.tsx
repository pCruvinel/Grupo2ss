import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DashboardExecutivo } from './grupo/DashboardExecutivo';
import { AnaliseFinanceira } from './grupo/AnaliseFinanceira';
import { PerformancePorEmpresa } from './grupo/PerformancePorEmpresa';
import { RelatoriosConsolidados } from './grupo/RelatoriosConsolidados';
import { consolidarDadosGrupo } from '../utils/consolidacao';
import { Building2, TrendingUp, BarChart3, FileText } from 'lucide-react';

interface PainelGrupoProps {
  empresas: any[];
  contratos: any[];
  despesas: any[];
  colaboradores: any[];
  ordensServico: any[];
  materiais: any[];
  veiculos: any[];
  pagamentos: any[];
}

export function PainelGrupo({
  empresas,
  contratos,
  despesas,
  colaboradores,
  ordensServico,
  materiais,
  veiculos,
  pagamentos,
}: PainelGrupoProps) {
  const [tabAtiva, setTabAtiva] = useState('dashboard');

  // Consolidar dados do grupo
  const dadosConsolidados = consolidarDadosGrupo(
    empresas,
    contratos,
    despesas,
    colaboradores,
    ordensServico,
    materiais,
    veiculos,
    pagamentos
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
        <TabsList className="mb-6 bg-white border border-gray-200 p-1">
          <TabsTrigger 
            value="dashboard" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
          >
            <Building2 className="w-4 h-4" />
            Dashboard Executivo
          </TabsTrigger>
          <TabsTrigger 
            value="financeiro" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
          >
            <TrendingUp className="w-4 h-4" />
            Análise Financeira
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
          >
            <BarChart3 className="w-4 h-4" />
            Performance por Empresa
          </TabsTrigger>
          <TabsTrigger 
            value="relatorios" 
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white"
          >
            <FileText className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardExecutivo dados={dadosConsolidados} empresas={empresas} />
        </TabsContent>

        <TabsContent value="financeiro">
          <AnaliseFinanceira dados={dadosConsolidados} empresas={empresas} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformancePorEmpresa dados={dadosConsolidados} empresas={empresas} />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosConsolidados dados={dadosConsolidados} empresas={empresas} />
        </TabsContent>
      </Tabs>
    </div>
  );
}