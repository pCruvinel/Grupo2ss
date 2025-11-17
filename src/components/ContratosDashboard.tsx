import { useState } from 'react';
import { Plus, Eye, Edit, Check, X, FileText, List, Grid } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from './ui/sonner';
import { NovoContratoModal } from './NovoContratoModal';
import { Pagination } from './shared/Pagination';
import { ExportButton } from './shared/ExportButton';

interface Contrato {
  id: string;
  numero: string;
  cliente_nome: string;
  cliente_cpf_cnpj?: string;
  cliente_email?: string;
  empresa_id: string;
  tipo: string;
  descricao?: string;
  valor_total: number;
  status: 'ativo' | 'concluido' | 'cancelado';
  tipo_parcelamento: 'mensal' | 'personalizado';
  data_inicio: string;
  data_fim: string;
  num_parcelas?: number;
  parcelas?: Parcela[];
}

interface Parcela {
  id: string;
  numero: number;
  valor: number;
  vencimento: string;
  status: 'pendente' | 'pago' | 'atrasado';
  data_pagamento?: string;
}

interface ContratosDashboardProps {
  contratos: Contrato[];
  empresas: { id: string; nome: string }[];
  empresaAtual: string;
  onUpdate?: () => void;
}

export function ContratosDashboard({ contratos, empresas, empresaAtual, onUpdate }: ContratosDashboardProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showModal, setShowModal] = useState(false);
  const [showParcelasModal, setShowParcelasModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    empresa_id: empresaAtual,
    tipo_parcelamento: 'mensal',
    status: 'ativo',
  });
  const [parcelasPersonalizadas, setParcelasPersonalizadas] = useState<Partial<Parcela>[]>([]);

  // Proteção contra props undefined
  const safeContratos = contratos || [];
  const safeEmpresas = empresas || [];

  // Filtros
  const contratosFiltrados = safeContratos.filter(c => {
    const matchSearch = c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Paginação
  const totalPages = Math.ceil(contratosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const contratosExibidos = contratosFiltrados.slice(startIndex, endIndex);

  // Gerar parcelas mensais automáticas (RN-003)
  const gerarParcelasMensais = (valorTotal: number, numParcelas: number, dataInicio: string): Parcela[] => {
    const valorParcela = valorTotal / numParcelas;
    const parcelas: Parcela[] = [];
    const inicio = new Date(dataInicio);

    for (let i = 0; i < numParcelas; i++) {
      const vencimento = new Date(inicio);
      vencimento.setMonth(vencimento.getMonth() + i);
      
      parcelas.push({
        id: `parcela-${i + 1}`,
        numero: i + 1,
        valor: valorParcela,
        vencimento: vencimento.toISOString().split('T')[0],
        status: 'pendente',
      });
    }

    return parcelas;
  };

  const handleOpenModal = (contrato?: Contrato) => {
    if (contrato) {
      setIsEditing(true);
      setSelectedContrato(contrato);
      setFormData(contrato);
      if (contrato.parcelas) {
        setParcelasPersonalizadas(contrato.parcelas);
      }
    } else {
      setIsEditing(false);
      setSelectedContrato(null);
      setFormData({
        empresa_id: empresaAtual,
        tipo_parcelamento: 'mensal',
        status: 'ativo',
      });
      setParcelasPersonalizadas([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContrato(null);
    setIsEditing(false);
    setFormData({
      empresa_id: empresaAtual,
      tipo_parcelamento: 'mensal',
      status: 'ativo',
    });
    setParcelasPersonalizadas([]);
  };

  const handleAddParcelaPersonalizada = () => {
    setParcelasPersonalizadas([
      ...parcelasPersonalizadas,
      {
        id: `parcela-${parcelasPersonalizadas.length + 1}`,
        numero: parcelasPersonalizadas.length + 1,
        valor: 0,
        vencimento: '',
        status: 'pendente',
      },
    ]);
  };

  const handleRemoveParcelaPersonalizada = (index: number) => {
    setParcelasPersonalizadas(parcelasPersonalizadas.filter((_, i) => i !== index));
  };

  const handleUpdateParcelaPersonalizada = (index: number, field: string, value: any) => {
    const updated = [...parcelasPersonalizadas];
    updated[index] = { ...updated[index], [field]: value };
    setParcelasPersonalizadas(updated);
  };

  const handleSave = () => {
    // Validações
    if (!formData.cliente_nome || !formData.tipo || !formData.valor_total || !formData.data_inicio || !formData.data_fim) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.tipo_parcelamento === 'mensal' && !formData.num_parcelas) {
      toast.error('Informe o número de parcelas');
      return;
    }

    if (formData.tipo_parcelamento === 'personalizado') {
      if (parcelasPersonalizadas.length === 0) {
        toast.error('Adicione pelo menos uma parcela personalizada');
        return;
      }

      const totalParcelas = parcelasPersonalizadas.reduce((acc, p) => acc + (p.valor || 0), 0);
      if (Math.abs(totalParcelas - (formData.valor_total || 0)) > 0.01) {
        toast.error(`Soma das parcelas (R$ ${totalParcelas.toFixed(2)}) diferente do valor total (R$ ${formData.valor_total?.toFixed(2)})`);
        return;
      }
    }

    // Simular salvamento
    if (isEditing) {
      toast.success('Contrato atualizado com sucesso!');
    } else {
      toast.success('Contrato criado com sucesso!');
    }

    handleCloseModal();
    onUpdate?.();
  };

  const handleVerParcelas = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setShowParcelasModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'concluido': return 'success';
      case 'cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  const getParcelaStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'success';
      case 'pendente': return 'warning';
      case 'atrasado': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-gray-900 mb-2">Contratos</h1>
            <p className="text-gray-600">Gestão completa de contratos</p>
            <Badge className="mt-2 bg-orange-100 text-orange-700">RN-003: Parcelamento Flexível</Badge>
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-2">
            {/* Toggle de Visualização */}
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                onClick={() => setViewMode('table')}
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                title="Visualização em Tabela"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setViewMode('cards')}
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                title="Visualização em Cards"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>

            {/* Botão de Exportação */}
            <ExportButton
              data={contratosFiltrados}
              filename="contratos"
              columns={[
                { key: 'numero', label: 'Número' },
                { key: 'cliente_nome', label: 'Cliente' },
                { key: 'cliente_cpf_cnpj', label: 'CPF/CNPJ' },
                { key: 'tipo', label: 'Tipo' },
                { key: 'valor_total', label: 'Valor Total' },
                { key: 'status', label: 'Status' },
                { key: 'tipo_parcelamento', label: 'Tipo Parcelamento' },
                { key: 'num_parcelas', label: 'Nº Parcelas' },
                { key: 'data_inicio', label: 'Data Início' },
                { key: 'data_fim', label: 'Data Fim' },
              ]}
            />

            {/* Botão Novo Contrato */}
            <Button 
              onClick={() => {
                setIsEditing(false);
                setSelectedContrato(null);
                setFormData({
                  empresa_id: empresaAtual,
                  tipo_parcelamento: 'mensal',
                  status: 'ativo',
                });
                setParcelasPersonalizadas([]);
                setShowModal(true);
              }}
              className="bg-[#1F4788] hover:bg-blue-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Visualização em Tabela */}
      {viewMode === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Parcelamento (RN-003)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosExibidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              ) : (
                contratosExibidos.map((contrato) => (
                  <TableRow key={contrato.id}>
                    <TableCell className="text-gray-900">{contrato.numero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{contrato.cliente_nome}</p>
                        {contrato.cliente_cpf_cnpj && (
                          <p className="text-xs text-gray-500">{contrato.cliente_cpf_cnpj}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{contrato.tipo}</TableCell>
                    <TableCell className="text-sm text-gray-900">
                      R$ {contrato.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')} - {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs">
                          {contrato.tipo_parcelamento === 'mensal' ? '📅 Mensal' : '✏️ Personalizado'}
                        </Badge>
                        {contrato.parcelas && (
                          <Badge variant="secondary" className="text-xs">
                            {contrato.parcelas.length}x
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(contrato.status) as any}>
                        {contrato.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button onClick={() => handleVerParcelas(contrato)} variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleOpenModal(contrato)} variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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
          {contratosExibidos.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum contrato encontrado</p>
            </Card>
          ) : (
            contratosExibidos.map((contrato) => (
              <Card key={contrato.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-lg text-gray-900">{contrato.numero}</h3>
                      <Badge variant={contrato.tipo_parcelamento === 'mensal' ? 'default' : 'secondary'}>
                        {contrato.tipo_parcelamento === 'mensal' ? '📅 Mensal (Automático)' : '✏️ Personalizado (Manual)'}
                      </Badge>
                      <Badge variant={getStatusColor(contrato.status) as any}>
                        {contrato.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">Cliente</p>
                        <p className="text-sm text-gray-900">{contrato.cliente_nome}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="text-sm text-gray-900">{contrato.tipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Período</p>
                        <p className="text-sm text-gray-900">{contrato.data_inicio} a {contrato.data_fim}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Parcelas</p>
                        <p className="text-sm text-gray-900">
                          {contrato.tipo_parcelamento === 'mensal' 
                            ? `${contrato.num_parcelas}x de R$ ${(contrato.valor_total / (contrato.num_parcelas || 1)).toFixed(2)}`
                            : `${contrato.parcelas?.length || 0} personalizadas`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-6">
                    <p className="text-sm text-gray-500 mb-1">Valor Total</p>
                    <p className="text-2xl text-gray-900 mb-3">R$ {contrato.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    
                    <div className="flex gap-2">
                      <Button onClick={() => handleVerParcelas(contrato)} variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Parcelas
                      </Button>
                      <Button onClick={() => handleOpenModal(contrato)} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal de Criação/Edição */}
      <Dialog open={showModal} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Contrato' : 'Novo Contrato'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Atualize as informações do contrato' : 'Preencha os dados do novo contrato'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geral">Dados Gerais</TabsTrigger>
              <TabsTrigger value="parcelas">Parcelas (RN-003)</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cliente *</Label>
                  <Input
                    value={formData.cliente_nome || ''}
                    onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={formData.cliente_cpf_cnpj || ''}
                    onChange={(e) => setFormData({ ...formData, cliente_cpf_cnpj: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.cliente_email || ''}
                    onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                    placeholder="cliente@email.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Tipo de Contrato *</Label>
                  <Input
                    value={formData.tipo || ''}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    placeholder="Ex: Locação, Serviço, etc"
                  />
                </div>
                <div>
                  <Label>Data Início *</Label>
                  <Input
                    value={formData.data_inicio || ''}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    type="date"
                  />
                </div>
                <div>
                  <Label>Data Fim *</Label>
                  <Input
                    value={formData.data_fim || ''}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    type="date"
                  />
                </div>
                <div>
                  <Label>Valor Total *</Label>
                  <Input
                    value={formData.valor_total || ''}
                    onChange={(e) => setFormData({ ...formData, valor_total: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="concluido">Concluído</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descrição</Label>
                <Input
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Detalhes do contrato"
                />
              </div>
            </TabsContent>

            <TabsContent value="parcelas" className="space-y-4 mt-4">
              <div>
                <Label>Tipo de Parcelamento (RN-003) *</Label>
                <Select value={formData.tipo_parcelamento} onValueChange={(value: any) => setFormData({ ...formData, tipo_parcelamento: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">📅 Mensal (Geração Automática)</SelectItem>
                    <SelectItem value="personalizado">✏️ Personalizado (Definição Manual)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.tipo_parcelamento === 'mensal' 
                    ? 'Sistema gera parcelas iguais automaticamente por mês' 
                    : 'Você define valor e data de cada parcela manualmente'}
                </p>
              </div>

              {formData.tipo_parcelamento === 'mensal' ? (
                <div>
                  <Label>Número de Parcelas *</Label>
                  <Input
                    value={formData.num_parcelas || ''}
                    onChange={(e) => setFormData({ ...formData, num_parcelas: parseInt(e.target.value) || 0 })}
                    placeholder="12"
                    type="number"
                    min="1"
                  />
                  {formData.num_parcelas && formData.num_parcelas > 0 && formData.valor_total && (
                    <p className="text-sm text-gray-600 mt-2">
                      {formData.num_parcelas}x de R$ {(formData.valor_total / formData.num_parcelas).toFixed(2)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Parcelas Personalizadas</Label>
                    <Button onClick={handleAddParcelaPersonalizada} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar Parcela
                    </Button>
                  </div>

                  {parcelasPersonalizadas.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">Nenhuma parcela adicionada</p>
                  ) : (
                    <div className="space-y-2">
                      {parcelasPersonalizadas.map((parcela, index) => (
                        <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-xs">Parcela</Label>
                              <Input value={`${index + 1}ª`} disabled />
                            </div>
                            <div>
                              <Label className="text-xs">Valor *</Label>
                              <Input
                                value={parcela.valor || ''}
                                onChange={(e) => handleUpdateParcelaPersonalizada(index, 'valor', parseFloat(e.target.value) || 0)}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Vencimento *</Label>
                              <Input
                                value={parcela.vencimento || ''}
                                onChange={(e) => handleUpdateParcelaPersonalizada(index, 'vencimento', e.target.value)}
                                type="date"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => handleRemoveParcelaPersonalizada(index)}
                            variant="ghost"
                            size="sm"
                            className="mt-5"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      ))}

                      <div className="p-3 bg-blue-50 rounded-lg flex justify-between">
                        <span className="text-sm text-gray-700">Total das Parcelas:</span>
                        <span className="text-sm text-gray-900">
                          R$ {parcelasPersonalizadas.reduce((acc, p) => acc + (p.valor || 0), 0).toFixed(2)}
                        </span>
                      </div>

                      {formData.valor_total && Math.abs(parcelasPersonalizadas.reduce((acc, p) => acc + (p.valor || 0), 0) - formData.valor_total) > 0.01 && (
                        <p className="text-xs text-red-600">
                          ⚠️ Soma das parcelas diferente do valor total
                        </p>
                      )}
                    </div>
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
              <Check className="w-4 h-4 mr-2" />
              {isEditing ? 'Atualizar' : 'Criar Contrato'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Parcelas */}
      <Dialog open={showParcelasModal} onOpenChange={setShowParcelasModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Parcelas - {selectedContrato?.numero}</DialogTitle>
            <DialogDescription>
              {selectedContrato?.cliente_nome} • {selectedContrato?.tipo_parcelamento === 'mensal' ? 'Parcelamento Mensal (Automático)' : 'Parcelamento Personalizado (Manual)'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedContrato && selectedContrato.parcelas && selectedContrato.parcelas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcela</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedContrato.parcelas.map((parcela) => (
                    <TableRow key={parcela.id}>
                      <TableCell>{parcela.numero}ª parcela</TableCell>
                      <TableCell>{new Date(parcela.vencimento).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>R$ {parcela.valor.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={getParcelaStatusColor(parcela.status) as any}>
                          {parcela.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {parcela.data_pagamento ? new Date(parcela.data_pagamento).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhuma parcela cadastrada</p>
                <p className="text-sm mt-1">
                  {selectedContrato?.tipo_parcelamento === 'mensal' 
                    ? 'Parcelas serão geradas automaticamente'
                    : 'Adicione parcelas personalizadas na edição do contrato'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowParcelasModal(false)} variant="outline">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}