import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, FileSpreadsheet, Image, Calendar, Building2 } from 'lucide-react';
import { consolidarPorMes, MOCK_HISTORICO_MENSAL } from '../../data/mockHistorico';
import { formatarValor, formatarPercentual } from '../../utils/consolidacao';
import { toast } from 'sonner';

interface RelatoriosConsolidadosProps {
  dados: any;
  empresas: any[];
}

export function RelatoriosConsolidados({ dados, empresas }: RelatoriosConsolidadosProps) {
  const dadosConsolidados = consolidarPorMes();

  // Função para simular exportação de PDF
  const exportarPDF = (tipo: string) => {
    toast.success(`📄 Relatório ${tipo} exportado em PDF!`, {
      description: 'O download começará em breve...'
    });
  };

  // Função para simular exportação de Excel
  const exportarExcel = (tipo: string) => {
    toast.success(`📊 Relatório ${tipo} exportado em Excel!`, {
      description: 'O download começará em breve...'
    });
  };

  // Função para simular exportação de gráficos
  const exportarGrafico = (tipo: string) => {
    toast.success(`📈 Gráfico ${tipo} exportado em PNG!`, {
      description: 'O download começará em breve...'
    });
  };

  const tiposRelatorios = [
    {
      id: 'executivo',
      titulo: 'Relatório Executivo',
      descricao: 'Visão geral consolidada com todos os KPIs e gráficos principais',
      icone: Building2,
      cor: 'orange',
      itens: [
        'Dashboard executivo completo',
        'KPIs financeiros, operacionais e RH',
        'Ranking de empresas',
        'Alertas e notificações',
        'Detalhamento por empresa'
      ]
    },
    {
      id: 'financeiro',
      titulo: 'Análise Financeira Completa',
      descricao: 'Evolução temporal e análises detalhadas de receitas e despesas',
      icone: FileText,
      cor: 'blue',
      itens: [
        'Evolução mensal (6 meses)',
        'DRE consolidado',
        'Comparativo receitas vs despesas',
        'Análise de margem por empresa',
        'Acumulado do período'
      ]
    },
    {
      id: 'performance',
      titulo: 'Performance e Metas',
      descricao: 'Análise de performance por empresa e cumprimento de metas',
      icone: FileText,
      cor: 'green',
      itens: [
        'Heatmap de KPIs',
        'Ranking de performance',
        'Metas vs realizado',
        'Índice de eficiência',
        'Insights e recomendações'
      ]
    },
    {
      id: 'operacional',
      titulo: 'Relatório Operacional',
      descricao: 'Contratos, ordens de serviço, materiais e veículos',
      icone: FileText,
      cor: 'purple',
      itens: [
        'Contratos ativos por empresa',
        'Ordens de serviço em andamento',
        'Ocupação de materiais',
        'Utilização de veículos',
        'Indicadores de bloqueio (RN-006)'
      ]
    },
    {
      id: 'rh',
      titulo: 'Relatório de RH',
      descricao: 'Colaboradores, folha de pagamento e ponto',
      icone: FileText,
      cor: 'pink',
      itens: [
        'Total de colaboradores por empresa',
        'Colaboradores com rateio (RN-002)',
        'Folha de pagamento consolidada',
        'Bônus e descontos (RN-007)',
        'Registros de ponto (RN-004)'
      ]
    },
    {
      id: 'consolidado_mensal',
      titulo: 'Consolidado Mensal',
      descricao: 'Relatório mensal detalhado com todos os dados',
      icone: Calendar,
      cor: 'cyan',
      itens: [
        'Dados financeiros mensais',
        'Comparativo mês a mês',
        'Variações percentuais',
        'Detalhamento por empresa',
        'Análise de tendências'
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">📄 Relatórios Consolidados</h1>
        <p className="text-gray-600">Exportação de relatórios em PDF, Excel e imagens</p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Período Analisado</p>
          <p className="text-2xl text-gray-900 mb-1">6 meses</p>
          <p className="text-xs text-gray-500">Jun - Nov 2025</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Empresas</p>
          <p className="text-2xl text-gray-900 mb-1">{empresas.length}</p>
          <p className="text-xs text-gray-500">2S Locações, Marketing, Produções</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Dados Consolidados</p>
          <p className="text-2xl text-gray-900 mb-1">{MOCK_HISTORICO_MENSAL.length}</p>
          <p className="text-xs text-gray-500">registros mensais</p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Relatórios Disponíveis</p>
          <p className="text-2xl text-gray-900 mb-1">{tiposRelatorios.length}</p>
          <p className="text-xs text-gray-500">tipos diferentes</p>
        </Card>
      </div>

      {/* Lista de Relatórios */}
      <div className="grid grid-cols-2 gap-6">
        {tiposRelatorios.map(relatorio => {
          const Icon = relatorio.icone;
          const corClass = {
            orange: 'from-orange-50 to-amber-50 border-orange-200',
            blue: 'from-blue-50 to-cyan-50 border-blue-200',
            green: 'from-green-50 to-emerald-50 border-green-200',
            purple: 'from-purple-50 to-pink-50 border-purple-200',
            pink: 'from-pink-50 to-rose-50 border-pink-200',
            cyan: 'from-cyan-50 to-blue-50 border-cyan-200',
          }[relatorio.cor];

          const corIcone = {
            orange: 'text-orange-600',
            blue: 'text-blue-600',
            green: 'text-green-600',
            purple: 'text-purple-600',
            pink: 'text-pink-600',
            cyan: 'text-cyan-600',
          }[relatorio.cor];

          return (
            <Card key={relatorio.id} className={`p-6 bg-gradient-to-r border-2 ${corClass}`}>
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 bg-white rounded-lg shadow-sm`}>
                  <Icon className={`w-6 h-6 ${corIcone}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">{relatorio.titulo}</h3>
                  <p className="text-sm text-gray-600">{relatorio.descricao}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2 uppercase tracking-wider">Conteúdo:</p>
                <ul className="space-y-1">
                  {relatorio.itens.map((item, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className={`${corIcone} mt-0.5`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => exportarPDF(relatorio.titulo)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  onClick={() => exportarExcel(relatorio.titulo)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Exportação de Gráficos */}
      <Card className="p-6">
        <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Image className="w-5 h-5 text-purple-600" />
          📊 Exportar Gráficos Individualmente
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { nome: 'Receita vs Despesas', tipo: 'barras' },
            { nome: 'Participação no Faturamento', tipo: 'pizza' },
            { nome: 'Evolução Temporal', tipo: 'linhas' },
            { nome: 'Composição da Receita', tipo: 'area' },
            { nome: 'Margem por Empresa', tipo: 'barras_horizontal' },
            { nome: 'Heatmap de Performance', tipo: 'heatmap' },
            { nome: 'Ranking de Empresas', tipo: 'ranking' },
            { nome: 'Metas vs Realizado', tipo: 'progresso' },
          ].map((grafico) => (
            <Button
              key={grafico.tipo}
              onClick={() => exportarGrafico(grafico.nome)}
              variant="outline"
              className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-purple-50"
            >
              <Image className="w-5 h-5 text-purple-600" />
              <span className="text-xs text-center">{grafico.nome}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Ações Rápidas */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200">
        <h3 className="text-lg text-gray-900 mb-4">⚡ Ações Rápidas</h3>
        <div className="grid grid-cols-3 gap-4">
          <Button 
            onClick={() => {
              exportarPDF('Relatório Completo');
              toast.info('📦 Gerando pacote completo...', {
                description: 'Todos os relatórios serão incluídos'
              });
            }}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="w-6 h-6" />
            <div className="text-center">
              <p className="text-sm">Exportar Tudo</p>
              <p className="text-xs opacity-80">PDF completo</p>
            </div>
          </Button>

          <Button 
            onClick={() => {
              exportarExcel('Dados Consolidados');
              toast.info('📊 Gerando planilhas...', {
                description: 'Todas as abas serão incluídas'
              });
            }}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <FileSpreadsheet className="w-6 h-6" />
            <div className="text-center">
              <p className="text-sm">Excel Completo</p>
              <p className="text-xs opacity-80">Com todas abas</p>
            </div>
          </Button>

          <Button 
            onClick={() => {
              exportarGrafico('Todos os Gráficos');
              toast.info('🖼️ Gerando imagens...', {
                description: 'Pacote ZIP com todos os gráficos'
              });
            }}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <Image className="w-6 h-6" />
            <div className="text-center">
              <p className="text-sm">Todos Gráficos</p>
              <p className="text-xs opacity-80">Pacote ZIP</p>
            </div>
          </Button>
        </div>
      </Card>

      {/* Informações */}
      <Card className="p-6 bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600">ℹ️</span>
          </div>
          <div>
            <p className="text-sm text-gray-900 mb-2">
              <strong>Nota:</strong> Esta é uma implementação de demonstração. Em produção, os relatórios seriam gerados no servidor.
            </p>
            <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
              <li>PDFs seriam gerados com bibliotecas como jsPDF ou react-pdf</li>
              <li>Excel seria exportado com bibliotecas como xlsx ou exceljs</li>
              <li>Gráficos seriam convertidos para imagens com html-to-image</li>
              <li>Implementação completa requer backend (Supabase Functions)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
