'use client';

/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  MÓDULO DE PONTO ELETRÔNICO - RN-004                          ║
 * ║  Controle de Ponto Centralizado para todas as empresas        ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Clock,
  MapPin,
  List,
  Grid,
  Download,
  Eye,
  Edit,
  Check,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  CheckCircle,
  XCircle,
  User,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { 
  createClient, 
  useEmpresa, 
  LoadingSpinner, 
  EmptyState,
  formatDate 
} from '../../../lib/figma-make-helpers';
import { DataTable, Column } from '../../../components/shared/DataTable';
import { Card } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { toast } from 'sonner';

interface RegistroPonto {
  id: string;
  colaborador_id: string;
  colaborador?: {
    nome: string;
    cpf: string;
    cargo: string;
    empresa_id: string;
  };
  data: string;
  entrada?: string;
  saida_almoco?: string;
  volta_almoco?: string;
  saida?: string;
  localizacao_entrada?: string;
  localizacao_saida?: string;
  observacoes?: string;
  status: 'completo' | 'incompleto' | 'falta';
  horas_trabalhadas?: number; // em minutos
}

export default function PontoPage() {
  const { empresa } = useEmpresa();
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<RegistroPonto | null>(null);

  // Filtros
  const [filterData, setFilterData] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('todos');

  // Form
  const [formData, setFormData] = useState({
    colaborador_id: '',
    data: new Date().toISOString().split('T')[0],
    entrada: '',
    saida_almoco: '',
    volta_almoco: '',
    saida: '',
    localizacao_entrada: '',
    localizacao_saida: '',
    observacoes: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [empresa, filterData]);

  const fetchData = async () => {
    if (!empresa) return;

    try {
      setLoading(true);

      // RN-004: Buscar colaboradores de TODAS as empresas (centralizado)
      const { data: colaboradoresData } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('status', 'ativo')
        .order('nome');

      // Buscar registros de ponto filtrados por data
      const { data: registrosData, error } = await supabase
        .from('registros_ponto')
        .select(`
          *,
          colaborador:colaboradores(nome, cpf, cargo, empresa_id)
        `)
        .eq('data', filterData)
        .order('entrada', { ascending: false });

      if (error) throw error;

      // Calcular horas trabalhadas e status
      const registrosProcessados = registrosData?.map((r) => {
        let horasTrabalhadas = 0;
        let status: 'completo' | 'incompleto' | 'falta' = 'falta';

        if (r.entrada && r.saida) {
          // Calcular horas (simplificado)
          const entrada = new Date(`${r.data}T${r.entrada}`);
          const saida = new Date(`${r.data}T${r.saida}`);
          const almoco = r.saida_almoco && r.volta_almoco
            ? (new Date(`${r.data}T${r.volta_almoco}`).getTime() - 
               new Date(`${r.data}T${r.saida_almoco}`).getTime()) / 60000
            : 60; // Padrão 1h se não tiver registro
          
          horasTrabalhadas = Math.floor((saida.getTime() - entrada.getTime()) / 60000 - almoco);
          status = 'completo';
        } else if (r.entrada) {
          status = 'incompleto';
        }

        return {
          ...r,
          horas_trabalhadas: horasTrabalhadas,
          status,
        };
      }) || [];

      if (colaboradoresData) setColaboradores(colaboradoresData);
      if (registrosProcessados) setRegistros(registrosProcessados);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      toast.error('Erro ao carregar registros de ponto');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar registros
  const registrosFiltrados = useMemo(() => {
    let resultado = registros;

    if (filterStatus !== 'todos') {
      resultado = resultado.filter((r) => r.status === filterStatus);
    }

    return resultado;
  }, [registros, filterStatus]);

  // Estatísticas
  const stats = {
    total: registros.length,
    completos: registros.filter((r) => r.status === 'completo').length,
    incompletos: registros.filter((r) => r.status === 'incompleto').length,
    faltas: registros.filter((r) => r.status === 'falta').length,
    horasTotais: registros.reduce((sum, r) => sum + (r.horas_trabalhadas || 0), 0),
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      completo: { color: 'bg-green-100 text-green-700', label: '✅ Completo', icon: CheckCircle },
      incompleto: { color: 'bg-yellow-100 text-yellow-700', label: '⏳ Incompleto', icon: AlertCircle },
      falta: { color: 'bg-red-100 text-red-700', label: '❌ Falta', icon: XCircle },
    };
    const config = configs[status as keyof typeof configs] || configs.falta;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatarHora = (hora?: string) => {
    if (!hora) return '-';
    return hora.substring(0, 5); // HH:MM
  };

  const formatarHoras = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h${mins.toString().padStart(2, '0')}`;
  };

  const handleOpenDialog = (registro?: RegistroPonto) => {
    if (registro) {
      setEditingRegistro(registro);
      setFormData({
        colaborador_id: registro.colaborador_id,
        data: registro.data,
        entrada: registro.entrada || '',
        saida_almoco: registro.saida_almoco || '',
        volta_almoco: registro.volta_almoco || '',
        saida: registro.saida || '',
        localizacao_entrada: registro.localizacao_entrada || '',
        localizacao_saida: registro.localizacao_saida || '',
        observacoes: registro.observacoes || '',
      });
    } else {
      setEditingRegistro(null);
      setFormData({
        colaborador_id: '',
        data: filterData,
        entrada: '',
        saida_almoco: '',
        volta_almoco: '',
        saida: '',
        localizacao_entrada: '',
        localizacao_saida: '',
        observacoes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.colaborador_id || !formData.data) {
      toast.error('Selecione o colaborador e a data');
      return;
    }

    try {
      const registroData = {
        colaborador_id: formData.colaborador_id,
        data: formData.data,
        entrada: formData.entrada || null,
        saida_almoco: formData.saida_almoco || null,
        volta_almoco: formData.volta_almoco || null,
        saida: formData.saida || null,
        localizacao_entrada: formData.localizacao_entrada || null,
        localizacao_saida: formData.localizacao_saida || null,
        observacoes: formData.observacoes || null,
      };

      if (editingRegistro) {
        // Atualizar
        const { error } = await supabase
          .from('registros_ponto')
          .update(registroData)
          .eq('id', editingRegistro.id);

        if (error) throw error;
        toast.success('Registro atualizado com sucesso!');
      } else {
        // Criar
        const { error } = await supabase.from('registros_ponto').insert(registroData);

        if (error) throw error;
        toast.success('Registro criado com sucesso!');
      }

      setDialogOpen(false);
      setEditingRegistro(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar registro:', error);
      toast.error(error.message || 'Erro ao salvar registro');
    }
  };

  const handleRegistrarPontoRapido = async () => {
    if (!empresa) return;

    // Modal simples para registrar ponto do usuário logado
    toast.info('Funcionalidade em desenvolvimento');
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Colunas da tabela
  const columns: Column<RegistroPonto>[] = [
    {
      key: 'colaborador',
      label: 'Colaborador',
      render: (_, item) => (
        <div>
          <p className="text-gray-900">{item.colaborador?.nome || '-'}</p>
          <p className="text-xs text-gray-500 font-mono">
            {item.colaborador?.cpf ? formatCPF(item.colaborador.cpf) : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'cargo',
      label: 'Cargo',
      render: (_, item) => item.colaborador?.cargo || '-',
    },
    {
      key: 'entrada',
      label: 'Entrada',
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm">{formatarHora(item.entrada)}</span>
          {item.localizacao_entrada && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.localizacao_entrada}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'saida_almoco',
      label: 'Saída Almoço',
      render: (_, item) => (
        <span className="font-mono text-sm">{formatarHora(item.saida_almoco)}</span>
      ),
    },
    {
      key: 'volta_almoco',
      label: 'Volta Almoço',
      render: (_, item) => (
        <span className="font-mono text-sm">{formatarHora(item.volta_almoco)}</span>
      ),
    },
    {
      key: 'saida',
      label: 'Saída',
      render: (_, item) => (
        <div className="flex flex-col">
          <span className="font-mono text-sm">{formatarHora(item.saida)}</span>
          {item.localizacao_saida && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {item.localizacao_saida}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'horas_trabalhadas',
      label: 'Horas Trabalhadas',
      render: (_, item) => (
        <span className="font-mono text-blue-600">
          {item.horas_trabalhadas ? formatarHoras(item.horas_trabalhadas) : '-'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, item) => getStatusBadge(item.status),
    },
  ];

  // Ações customizadas
  const customActions = (item: RegistroPonto) => (
    <Button
      onClick={() => handleOpenDialog(item)}
      variant="ghost"
      size="sm"
      title="Editar Registro"
    >
      <Edit className="w-4 h-4" />
    </Button>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2 flex items-center gap-2">
              <Clock className="w-8 h-8 text-[#1F4788]" />
              Controle de Ponto Eletrônico
            </h1>
            <p className="text-gray-600">
              {empresa?.nome} • {formatDate(filterData)}
            </p>
            <Badge className="mt-2 bg-blue-100 text-blue-700">
              RN-004: Controle Centralizado
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => toast.info('Exportação em desenvolvimento')}
              variant="outline"
              className="border-[#1F4788] text-[#1F4788]"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-[#1F4788] hover:bg-blue-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <p className="text-2xl text-gray-900">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm text-gray-600">Completos</p>
            </div>
            <p className="text-2xl text-green-600">{stats.completos}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <p className="text-sm text-gray-600">Incompletos</p>
            </div>
            <p className="text-2xl text-yellow-600">{stats.incompletos}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-gray-600">Faltas</p>
            </div>
            <p className="text-2xl text-red-600">{stats.faltas}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">Horas Totais</p>
            </div>
            <p className="text-2xl text-blue-600">{formatarHoras(stats.horasTotais)}</p>
          </Card>
        </div>

        {/* Alerta RN-004 */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900 mb-1">
                RN-004: Controle de Ponto Centralizado
              </p>
              <p className="text-sm text-blue-700">
                O controle de ponto é <strong>centralizado</strong> para todas as empresas do grupo.
                Todos os registros são visualizados de forma unificada, independente da empresa
                do colaborador.
              </p>
            </div>
          </div>
        </Card>

        {/* Filtros */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs mb-1">Data</Label>
            <Input
              type="date"
              value={filterData}
              onChange={(e) => setFilterData(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-xs mb-1">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="completo">✅ Completo</SelectItem>
                <SelectItem value="incompleto">⏳ Incompleto</SelectItem>
                <SelectItem value="falta">❌ Falta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {registrosFiltrados.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            title="Nenhum registro encontrado"
            description="Ajuste os filtros ou registre novos pontos"
            actionLabel="Novo Registro"
            onAction={() => handleOpenDialog()}
            icon={<Clock className="w-8 h-8 text-gray-400" />}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <DataTable
            data={registrosFiltrados}
            columns={columns}
            searchPlaceholder="Buscar por colaborador..."
            customActions={customActions}
          />
        </Card>
      )}

      {/* Modal de Registro */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRegistro ? 'Editar Registro de Ponto' : 'Novo Registro de Ponto'}
            </DialogTitle>
            <DialogDescription>
              Preencha os horários de entrada e saída do colaborador
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="colaborador_id">Colaborador *</Label>
                <Select
                  value={formData.colaborador_id}
                  onValueChange={(value) => setFormData({ ...formData, colaborador_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores.map((colab) => (
                      <SelectItem key={colab.id} value={colab.id}>
                        {colab.nome} - {colab.cargo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="entrada">Entrada</Label>
                <Input
                  id="entrada"
                  type="time"
                  value={formData.entrada}
                  onChange={(e) => setFormData({ ...formData, entrada: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="saida_almoco">Saída Almoço</Label>
                <Input
                  id="saida_almoco"
                  type="time"
                  value={formData.saida_almoco}
                  onChange={(e) => setFormData({ ...formData, saida_almoco: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="volta_almoco">Volta Almoço</Label>
                <Input
                  id="volta_almoco"
                  type="time"
                  value={formData.volta_almoco}
                  onChange={(e) => setFormData({ ...formData, volta_almoco: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="saida">Saída</Label>
                <Input
                  id="saida"
                  type="time"
                  value={formData.saida}
                  onChange={(e) => setFormData({ ...formData, saida: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="localizacao_entrada">Localização Entrada (opcional)</Label>
                <Input
                  id="localizacao_entrada"
                  value={formData.localizacao_entrada}
                  onChange={(e) =>
                    setFormData({ ...formData, localizacao_entrada: e.target.value })
                  }
                  placeholder="Ex: Escritório Central"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="localizacao_saida">Localização Saída (opcional)</Label>
                <Input
                  id="localizacao_saida"
                  value={formData.localizacao_saida}
                  onChange={(e) => setFormData({ ...formData, localizacao_saida: e.target.value })}
                  placeholder="Ex: Escritório Central"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Observações sobre o registro..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setEditingRegistro(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#1F4788] hover:bg-blue-800"
            >
              {editingRegistro ? 'Atualizar' : 'Salvar'} Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}