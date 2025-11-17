import { useMockAuth } from '../../hooks/useMockAuth';
import { 
  MOCK_CONTRATOS, 
  MOCK_COLABORADORES, 
  MOCK_MATERIAIS,
  MOCK_DESPESAS,
  MOCK_EMPRESAS,
  filterByEmpresa 
} from '../../data/mockData';
import { Card } from '../ui/card';
import {
  TrendingUp,
  Users,
  FileText,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { Badge } from '../ui/badge';

export default function Dashboard() {
  const { user } = useMockAuth();

  if (!user) return null;

  // RN-001: Filtrar dados por empresa
  const empresaAtual = MOCK_EMPRESAS.find(e => e.id === user.empresa_id);
  const contratosEmpresa = filterByEmpresa(MOCK_CONTRATOS, user.empresa_id || '1');
  const materiaisEmpresa = filterByEmpresa(MOCK_MATERIAIS, user.empresa_id || '1');
  const despesasEmpresa = filterByEmpresa(MOCK_DESPESAS, user.empresa_id || '1');
  
  // RN-002: Colaboradores com rateio
  const colaboradoresComRateio = MOCK_COLABORADORES.filter(c => 
    c.empresas.length > 1 && c.rateio
  );

  // RN-006: Materiais bloqueados
  const materiaisBloqueados = MOCK_MATERIAIS.filter(m => 
    m.quantidade_bloqueada > 0 && m.tipo === 'aluguel'
  );

  // Estatísticas
  const stats = [
    {
      label: 'Contratos Ativos',
      value: contratosEmpresa.filter(c => c.status === 'ativo').length,
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Colaboradores',
      value: MOCK_COLABORADORES.filter(c => 
        c.empresas.includes(user.empresa_id || '1') && c.status === 'ativo'
      ).length,
      icon: Users,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Materiais Disponíveis',
      value: materiaisEmpresa.reduce((acc, m) => acc + m.quantidade_disponivel, 0),
      icon: Package,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Receita Mensal',
      value: `R$ ${(contratosEmpresa
        .filter(c => c.status === 'ativo')
        .reduce((acc, c) => acc + c.valor_total, 0) / 12)
        .toFixed(2)
        .replace('.', ',')}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo, {user.nome}!</p>
        
        {/* RN-001: Indicador de Empresa */}
        {user.perfil !== 'cliente' && empresaAtual && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-900">
              Visualizando dados de: <strong>{empresaAtual.nome}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl text-gray-900">{stat.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Alertas e Regras de Negócio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* RN-002: Rateio Automático */}
        {colaboradoresComRateio.length > 0 && (user.perfil === 'admin' || user.perfil === 'admin_grupo' || user.perfil === 'rh') && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <h3 className="text-gray-900">RN-002: Colaboradores com Rateio</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Custos são rateados automaticamente entre empresas
            </p>
            <div className="space-y-3">
              {colaboradoresComRateio.map((col) => (
                <div key={col.id} className="p-3 bg-orange-50 rounded-lg">
                  <p className="font-medium text-sm text-gray-900">{col.nome}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {Object.entries(col.rateio || {}).map(([empresaId, percentual]) => {
                      const emp = MOCK_EMPRESAS.find(e => e.id === empresaId);
                      return (
                        <Badge key={empresaId} variant="outline" className="text-xs">
                          {emp?.nome}: {percentual}%
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* RN-006: Materiais Bloqueados */}
        {materiaisBloqueados.length > 0 && (user.perfil === 'admin' || user.perfil === 'admin_grupo' || user.perfil === 'operacional') && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-red-600" />
              <h3 className="text-gray-900">RN-006: Estoque Bloqueado</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Itens de aluguel bloqueados em ordens de serviço
            </p>
            <div className="space-y-3">
              {materiaisBloqueados.map((mat) => (
                <div key={mat.id} className="p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-gray-900">{mat.nome}</p>
                    <Badge variant="destructive" className="text-xs">
                      {mat.quantidade_bloqueada} bloqueados
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">
                    OS: {mat.ordem_servico_vinculada}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Contratos Recentes */}
      {(user.perfil === 'admin' || user.perfil === 'admin_grupo' || user.perfil === 'financeiro' || user.perfil === 'gestor') && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900">Contratos Recentes</h3>
            <Badge variant="outline">RN-001: Filtrado por empresa</Badge>
          </div>
          <div className="space-y-3">
            {contratosEmpresa.slice(0, 5).map((contrato) => (
              <div
                key={contrato.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900">
                    {contrato.numero}
                  </p>
                  <p className="text-sm text-gray-600">{contrato.cliente_nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {contrato.tipo_parcelamento === 'mensal' ? '📅 Mensal' : '✏️ Personalizado'}
                    </Badge>
                    {contrato.tipo_parcelamento === 'personalizado' && (
                      <span className="text-xs text-gray-500">RN-003</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {contrato.valor_total.toFixed(2).replace('.', ',')}
                  </p>
                  <Badge
                    variant={
                      contrato.status === 'ativo'
                        ? 'default'
                        : contrato.status === 'concluido'
                        ? 'secondary'
                        : 'outline'
                    }
                    className="text-xs"
                  >
                    {contrato.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Indicadores de Regras de Negócio Ativas */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <h3 className="text-gray-900 mb-4">✅ Regras de Negócio Implementadas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-001: Segregação por Empresa</p>
              <p className="text-xs text-gray-600">Dados filtrados automaticamente</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-002: Rateio Automático</p>
              <p className="text-xs text-gray-600">Custos divididos entre empresas</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-003: Parcelamento Flexível</p>
              <p className="text-xs text-gray-600">Mensal ou personalizado</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-004: Controle de Ponto</p>
              <p className="text-xs text-gray-600">Apenas RH pode editar</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-005: Exclusão Lógica</p>
              <p className="text-xs text-gray-600">Status ativo/inativo</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-006: Bloqueio de Estoque</p>
              <p className="text-xs text-gray-600">Vinculado a OS ativa</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-sm text-gray-900">RN-007: Bônus/Descontos</p>
              <p className="text-xs text-gray-600">Separados no pagamento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}