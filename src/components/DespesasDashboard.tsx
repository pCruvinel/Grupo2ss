import { useState } from 'react';
import { Plus, Eye, Edit, Trash2, TrendingUp, Building2, DollarSign, List, Grid } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { NovaDespesaModal } from './NovaDespesaModal';
import { Pagination } from './shared/Pagination';
import { ExportButton } from './shared/ExportButton';

interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  valor_total: number;
  data: string;
  empresa_id: string | null;
  tipo_rateio: 'individual' | 'automatico';
  rateio?: Record<string, number>;
  valores_rateados?: Record<string, number>;
  status: 'pago' | 'pendente';
  tipo_despesa?: 'fixa' | 'variavel'; // NOVO
  recorrencia?: 'mensal' | 'trimestral' | 'semestral' | 'anual' | null; // NOVO
}

interface DespesasDashboardProps {
  despesas: Despesa[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
}

export function DespesasDashboard({ despesas, empresas, empresaAtual, onUpdate }: DespesasDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showRateioModal, setShowRateioModal] = useState(false);
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterTipoDespesa, setFilterTipoDespesa] = useState('todos'); // NOVO
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState<Partial<Despesa>>({
    tipo_rateio: 'individual',
    status: 'pendente',
    tipo_despesa: 'variavel', // NOVO
    recorrencia: null, // NOVO
  });
  
  const [rateioPercentuais, setRateioPercentuais] = useState<Record<string, number>>({});

  // Filtros
  const despesasFiltradas = despesas.filter(d => {
    const matchStatus = filterStatus === 'todos' || d.status === filterStatus;
    const matchTipo = filterTipo === 'todos' || d.tipo_rateio === filterTipo;
    const matchTipoDespesa = filterTipoDespesa === 'todos' || d.tipo_despesa === filterTipoDespesa; // NOVO
    
    // Se não for admin, mostra despesas individuais da empresa OU despesas rateadas que afetam a empresa
    if (empresaAtual) {
      const pertenceEmpresa = d.empresa_id === empresaAtual || (d.rateio && empresaAtual in d.rateio);
      return matchStatus && matchTipo && matchTipoDespesa && pertenceEmpresa;
    }
    
    return matchStatus && matchTipo && matchTipoDespesa;
  });

  // Paginação
  const totalPages = Math.ceil(despesasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const despesasExibidas = despesasFiltradas.slice(startIndex, endIndex);

  // Totais
  const totalDespesas = despesasFiltradas.reduce((acc, d) => {
    if (d.empresa_id === empresaAtual) {
      return acc + d.valor_total;
    } else if (d.valores_rateados && empresaAtual in d.valores_rateados) {
      return acc + d.valores_rateados[empresaAtual];
    }
    return acc;
  }, 0);

  const handleOpenModal = (despesa?: Despesa) => {
    if (despesa) {
      setIsEditing(true);
      setSelectedDespesa(despesa);
      setFormData(despesa);
      if (despesa.rateio) {
        setRateioPercentuais(despesa.rateio);
      }
    } else {
      setIsEditing(false);
      setSelectedDespesa(null);
      setFormData({
        tipo_rateio: 'individual',
        status: 'pendente',
        empresa_id: empresaAtual,
        tipo_despesa: 'variavel', // NOVO
        recorrencia: null, // NOVO
      });
      setRateioPercentuais({ '1': 33.33, '2': 33.33, '3': 33.34 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDespesa(null);
    setIsEditing(false);
    setFormData({
      tipo_rateio: 'individual',
      status: 'pendente',
      empresa_id: empresaAtual,
      tipo_despesa: 'variavel', // NOVO
      recorrencia: null, // NOVO
    });
    setRateioPercentuais({});
  };

  const handleSave = () => {
    if (!formData.descricao || !formData.categoria || !formData.valor_total || !formData.data) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.tipo_rateio === 'automatico') {
      const totalPerc = Object.values(rateioPercentuais).reduce((acc, v) => acc + v, 0);
      if (Math.abs(totalPerc - 100) > 0.1) {
        toast.error(`Percentuais devem somar 100% (atual: ${totalPerc.toFixed(2)}%)`);
        return;
      }
    }

    if (isEditing) {
      toast.success('Despesa atualizada com sucesso!');
    } else {
      toast.success('Despesa criada com sucesso!');
    }

    handleCloseModal();
    onUpdate?.();
  };

  const handleVerRateio = (despesa: Despesa) => {
    setSelectedDespesa(despesa);
    setShowRateioModal(true);
  };

  const handleUpdateRateioPercentual = (empresaId: string, valor: number) => {
    setRateioPercentuais({ ...rateioPercentuais, [empresaId]: valor });
  };

  const totalRateioPercentual = Object.values(rateioPercentuais).reduce((acc, v) => acc + v, 0);

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Despesas</h1>
            <p className="text-gray-600">Gestão de despesas operacionais</p>
            <Badge className="mt-2 bg-purple-100 text-purple-700">RN-002: Rateio Automático de Despesas</Badge>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
            <ExportButton
              data={despesasFiltradas}
              filename="despesas"
              type="despesas"
              formats={['excel', 'csv']}
            />
            <Button onClick={() => handleOpenModal()} className="bg-[#1F4788] hover:bg-blue-800">
              <Plus className="w-4 h-4 mr-2" />
              Nova Despesa
            </Button>
          </div>
        </div>

        {/* Cards de Totais */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total da Empresa</p>
            <p className="text-2xl text-gray-900">R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Despesas Fixas</p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl text-blue-600">{despesasFiltradas.filter(d => d.tipo_despesa === 'fixa').length}</p>
              <p className="text-sm text-gray-500">
                R$ {despesasFiltradas
                  .filter(d => d.tipo_despesa === 'fixa')
                  .reduce((acc, d) => {
                    if (d.empresa_id === empresaAtual) return acc + d.valor_total;
                    if (d.valores_rateados && empresaAtual in d.valores_rateados) return acc + d.valores_rateados[empresaAtual];
                    return acc;
                  }, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Despesas Variáveis</p>
            <div className="flex items-baseline gap-3">
              <p className="text-2xl text-green-600">{despesasFiltradas.filter(d => d.tipo_despesa === 'variavel').length}</p>
              <p className="text-sm text-gray-500">
                R$ {despesasFiltradas
                  .filter(d => d.tipo_despesa === 'variavel')
                  .reduce((acc, d) => {
                    if (d.empresa_id === empresaAtual) return acc + d.valor_total;
                    if (d.valores_rateados && empresaAtual in d.valores_rateados) return acc + d.valores_rateados[empresaAtual];
                    return acc;
                  }, 0)
                  .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </Card>
          
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1">
                <p className="text-lg text-green-600">{despesasFiltradas.filter(d => d.status === 'pago').length}</p>
                <span className="text-xs text-gray-500">Pago</span>
              </div>
              <span className="text-gray-300">/</span>
              <div className="flex items-baseline gap-1">
                <p className="text-lg text-orange-600">{despesasFiltradas.filter(d => d.status === 'pendente').length}</p>
                <span className="text-xs text-gray-500">Pendente</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-xs mb-1">Status</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Tipo de Rateio</Label>
            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="automatico">Rateio Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs mb-1">Tipo de Despesa</Label>
            <Select value={filterTipoDespesa} onValueChange={setFilterTipoDespesa}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="fixa">📅 Fixa</SelectItem>
                <SelectItem value="variavel">💸 Variável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Visualização em Tabela */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Tipo Rateio (RN-002)</TableHead>
                <TableHead>Valor p/ Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {despesasExibidas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhuma despesa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                despesasExibidas.map((despesa) => {
                  const valorEmpresa = despesa.empresa_id === empresaAtual 
                    ? despesa.valor_total 
                    : despesa.valores_rateados?.[empresaAtual] || 0;

                  return (
                    <TableRow key={despesa.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-gray-900">{despesa.descricao}</span>
                          {despesa.tipo_despesa === 'fixa' && despesa.recorrencia && (
                            <Badge variant="outline" className="text-xs w-fit bg-blue-50 text-blue-700 border-blue-200">
                              📅 {despesa.recorrencia.charAt(0).toUpperCase() + despesa.recorrencia.slice(1)}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{despesa.categoria}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(despesa.data).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        R$ {despesa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {despesa.tipo_rateio === 'automatico' ? (
                            <>
                              <Badge className="bg-purple-100 text-purple-700 text-xs w-fit">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Rateio Automático
                              </Badge>
                              {despesa.rateio && empresaAtual in despesa.rateio && (
                                <Badge variant="outline" className="text-xs w-fit">
                                  {despesa.rateio[empresaAtual].toFixed(1)}%
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs w-fit">
                              Individual
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">
                        R$ {valorEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={despesa.status === 'pago' ? 'success' : 'warning' as any}>
                            {despesa.status}
                          </Badge>
                          {despesa.tipo_despesa === 'fixa' && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs w-fit">
                              Fixa
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {despesa.tipo_rateio === 'automatico' && (
                            <Button onClick={() => handleVerRateio(despesa)} variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button onClick={() => handleOpenModal(despesa)} variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </Card>
      ) : (
        /* Visualização em Cards */
        <div className="space-y-4">
          {despesasExibidas.length === 0 ? (
            <Card className="p-12 text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma despesa encontrada</p>
            </Card>
          ) : (
            despesasExibidas.map((despesa) => {
              const valorEmpresa = despesa.empresa_id === empresaAtual 
                ? despesa.valor_total 
                : despesa.valores_rateados?.[empresaAtual] || 0;

              return (
                <Card key={despesa.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg text-gray-900">{despesa.descricao}</h3>
                        {despesa.tipo_despesa === 'fixa' && (
                          <Badge className="bg-blue-100 text-blue-700">
                            📅 Fixa
                          </Badge>
                        )}
                        {despesa.tipo_despesa === 'fixa' && despesa.recorrencia && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {despesa.recorrencia.charAt(0).toUpperCase() + despesa.recorrencia.slice(1)}
                          </Badge>
                        )}
                        {despesa.tipo_rateio === 'automatico' && (
                          <Badge className="bg-purple-100 text-purple-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Rateio (RN-002)
                          </Badge>
                        )}
                        <Badge variant={despesa.status === 'pago' ? 'success' : 'warning' as any}>
                          {despesa.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Categoria</p>
                          <p className="text-sm text-gray-900">{despesa.categoria}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Data</p>
                          <p className="text-sm text-gray-900">{new Date(despesa.data).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Valor Total</p>
                          <p className="text-sm text-gray-900">R$ {despesa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {despesa.tipo_rateio === 'automatico' && despesa.rateio && (
                        <div className="mt-3 flex gap-2">
                          {Object.entries(despesa.rateio).map(([empId, perc]) => {
                            const emp = empresas.find(e => e.id === empId);
                            const valor = despesa.valores_rateados?.[empId] || 0;
                            return (
                              <Badge key={empId} variant="outline" className="text-xs">
                                {emp?.nome}: {perc.toFixed(1)}% (R$ {valor.toFixed(2)})
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-sm text-gray-500 mb-1">Valor para Empresa</p>
                      <p className="text-2xl text-gray-900 mb-3">R$ {valorEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      
                      <div className="flex gap-2">
                        {despesa.tipo_rateio === 'automatico' && (
                          <Button onClick={() => handleVerRateio(despesa)} variant="outline" size="sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Rateio
                          </Button>
                        )}
                        <Button onClick={() => handleOpenModal(despesa)} variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações da despesa' : 'Preencha os dados da nova despesa'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="descricao" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="descricao">📝 Descrição</TabsTrigger>
              <TabsTrigger value="rateio">🔄 Rateio</TabsTrigger>
            </TabsList>

            {/* Tab: Descrição */}
            <TabsContent value="descricao" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Descrição *</Label>
                  <Input
                    value={formData.descricao || ''}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Ex: Aluguel, Material, etc"
                  />
                </div>
                <div>
                  <Label>Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infraestrutura">Infraestrutura</SelectItem>
                      <SelectItem value="Manutenção">Manutenção</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Utilidades">Utilidades</SelectItem>
                      <SelectItem value="Suprimentos">Suprimentos</SelectItem>
                      <SelectItem value="Pessoal">Pessoal</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Despesa *</Label>
                  <Select value={formData.tipo_despesa || 'variavel'} onValueChange={(value: any) => {
                    setFormData({ 
                      ...formData, 
                      tipo_despesa: value,
                      recorrencia: value === 'fixa' ? 'mensal' : null
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="variavel">💸 Variável</SelectItem>
                      <SelectItem value="fixa">📅 Fixa (Recorrente)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.tipo_despesa === 'fixa' 
                      ? 'Despesa com recorrência' 
                      : 'Despesa pontual ou eventual'}
                  </p>
                </div>
                <div>
                  <Label>Valor Total *</Label>
                  <Input
                    value={formData.valor_total || ''}
                    onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Data *</Label>
                  <Input
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    type="date"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Recorrência para despesas fixas */}
              {formData.tipo_despesa === 'fixa' && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label>Recorrência *</Label>
                  <Select value={formData.recorrencia || 'mensal'} onValueChange={(value: any) => setFormData({ ...formData, recorrencia: value })}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mensal">🗓️ Mensal</SelectItem>
                      <SelectItem value="trimestral">📆 Trimestral</SelectItem>
                      <SelectItem value="semestral">📅 Semestral</SelectItem>
                      <SelectItem value="anual">🗓️ Anual</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-blue-600 mt-2">
                    ℹ️ Esta despesa será gerada automaticamente de acordo com a recorrência selecionada.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Tab: Rateio */}
            <TabsContent value="rateio" className="space-y-4 mt-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Configuração de Rateio</h3>
                </div>
                <p className="text-sm text-purple-700">
                  RN-002: Configure como a despesa será distribuída entre as empresas do grupo.
                </p>
              </div>

              <div>
                <Label>Tipo de Rateio *</Label>
                <Select value={formData.tipo_rateio} onValueChange={(value: any) => {
                  setFormData({ 
                    ...formData, 
                    tipo_rateio: value,
                    empresa_id: value === 'individual' ? empresaAtual : null
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">🏢 Despesa Individual (uma empresa)</SelectItem>
                    <SelectItem value="automatico">🔄 Rateio Automático (múltiplas empresas)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipo_rateio === 'individual' 
                    ? 'Despesa será atribuída apenas à empresa selecionada' 
                    : 'Despesa será distribuída proporcionalmente entre as empresas (RN-002)'}
                </p>
              </div>

              {formData.tipo_rateio === 'individual' ? (
                <div>
                  <Label>Empresa Responsável *</Label>
                  <Select value={formData.empresa_id || ''} onValueChange={(value) => setFormData({ ...formData, empresa_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-3">
                  <Label>Percentuais de Rateio *</Label>
                  <p className="text-xs text-gray-500">
                    Defina a proporção de divisão da despesa entre as empresas. O total deve somar 100%.
                  </p>
                  {empresas.map((emp) => (
                    <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="w-5 h-5 text-gray-500" />
                      <span className="flex-1 text-sm text-gray-900">{emp.nome}</span>
                      <Input
                        value={rateioPercentuais[emp.id] || 0}
                        onChange={(e) => handleUpdateRateioPercentual(emp.id, parseFloat(e.target.value) || 0)}
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">%</span>
                      {formData.valor_total && (
                        <span className="text-sm text-gray-500 w-32 text-right">
                          R$ {((formData.valor_total * (rateioPercentuais[emp.id] || 0)) / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className={`p-3 rounded-lg flex justify-between items-center ${
                    Math.abs(totalRateioPercentual - 100) < 0.1 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <span className="text-sm text-gray-700">Total dos Percentuais:</span>
                    <span className={`font-medium ${Math.abs(totalRateioPercentual - 100) < 0.1 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalRateioPercentual.toFixed(2)}%
                    </span>
                  </div>
                  {Math.abs(totalRateioPercentual - 100) > 0.1 && (
                    <p className="text-xs text-red-600">⚠️ Os percentuais devem somar exatamente 100%</p>
                  )}
                  {Math.abs(totalRateioPercentual - 100) < 0.1 && (
                    <p className="text-xs text-green-600">✓ Percentuais válidos! A despesa será rateada corretamente.</p>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={handleCloseModal} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-[#1F4788] hover:bg-blue-800">
              {isEditing ? 'Atualizar Despesa' : 'Criar Despesa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Rateio */}
      <Dialog open={showRateioModal} onOpenChange={setShowRateioModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Rateio</DialogTitle>
            <DialogDescription>
              {selectedDespesa?.descricao}
            </DialogDescription>
          </DialogHeader>

          {selectedDespesa && selectedDespesa.rateio && (
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Valor Total</p>
                <p className="text-2xl text-gray-900">R$ {selectedDespesa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>

              <div className="space-y-2">
                {Object.entries(selectedDespesa.rateio).map(([empId, perc]) => {
                  const emp = empresas.find(e => e.id === empId);
                  const valor = selectedDespesa.valores_rateados?.[empId] || 0;
                  return (
                    <div key={empId} className="p-3 bg-purple-50 rounded-lg flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-900">{emp?.nome}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-purple-600">{perc.toFixed(1)}%</p>
                        <p className="text-sm text-gray-900">R$ {valor.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowRateioModal(false)} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}