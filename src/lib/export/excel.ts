import ExcelJS from 'exceljs';

/**
 * Exporta dados para Excel
 */
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: { key: keyof T; header: string; width?: number }[],
  fileName: string = 'export.xlsx',
  sheetName: string = 'Dados'
) {
  // Criar workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Definir colunas
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key as string,
    width: col.width || 15,
  }));

  // Estilizar cabeçalho
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4788' },
  };
  worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;

  // Adicionar dados
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Aplicar bordas
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Alternar cores das linhas
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' },
      };
    }
  });

  // Gerar buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Download
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Exporta contratos para Excel
 */
export async function exportContratos(contratos: any[]) {
  const data = contratos.map((contrato) => ({
    numero: contrato.numero_contrato,
    tipo: contrato.tipo === 'cliente' ? 'Cliente' : 'Fornecedor',
    nome:
      contrato.tipo === 'cliente'
        ? contrato.cliente?.nome_razao_social
        : contrato.fornecedor?.nome_razao_social,
    valor: contrato.valor_total,
    data_inicio: new Date(contrato.data_inicio).toLocaleDateString('pt-BR'),
    data_fim: contrato.data_fim
      ? new Date(contrato.data_fim).toLocaleDateString('pt-BR')
      : 'Indeterminado',
    status: contrato.status,
  }));

  await exportToExcel(
    data,
    [
      { key: 'numero', header: 'Número', width: 15 },
      { key: 'tipo', header: 'Tipo', width: 12 },
      { key: 'nome', header: 'Cliente/Fornecedor', width: 30 },
      { key: 'valor', header: 'Valor Total', width: 15 },
      { key: 'data_inicio', header: 'Data Início', width: 15 },
      { key: 'data_fim', header: 'Data Fim', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
    ],
    `contratos_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Contratos'
  );
}

/**
 * Exporta colaboradores para Excel
 */
export async function exportColaboradores(colaboradores: any[]) {
  const data = colaboradores.map((colab) => ({
    nome: colab.nome,
    cpf: colab.cpf,
    cargo: colab.cargo?.nome || '-',
    tipo_contrato: colab.tipo_contrato === 'clt' ? 'CLT' : 'PJ',
    salario: colab.salario_base,
    data_admissao: new Date(colab.data_admissao).toLocaleDateString('pt-BR'),
    status: colab.status,
    email: colab.email || '-',
    telefone: colab.telefone || '-',
  }));

  await exportToExcel(
    data,
    [
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'cpf', header: 'CPF', width: 15 },
      { key: 'cargo', header: 'Cargo', width: 20 },
      { key: 'tipo_contrato', header: 'Tipo', width: 10 },
      { key: 'salario', header: 'Salário', width: 15 },
      { key: 'data_admissao', header: 'Admissão', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
      { key: 'email', header: 'Email', width: 25 },
      { key: 'telefone', header: 'Telefone', width: 15 },
    ],
    `colaboradores_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Colaboradores'
  );
}

/**
 * Exporta materiais para Excel
 */
export async function exportMateriais(materiais: any[]) {
  const data = materiais.map((mat) => ({
    codigo: mat.codigo || '-',
    nome: mat.nome,
    categoria: mat.categoria?.nome || '-',
    estoque_atual: mat.estoque_atual,
    estoque_minimo: mat.estoque_minimo || 0,
    estoque_maximo: mat.estoque_maximo || 0,
    unidade: mat.unidade_medida || '-',
    valor_unitario: mat.valor_unitario || 0,
    localizacao: mat.localizacao || '-',
    status: mat.status,
  }));

  await exportToExcel(
    data,
    [
      { key: 'codigo', header: 'Código', width: 15 },
      { key: 'nome', header: 'Nome', width: 30 },
      { key: 'categoria', header: 'Categoria', width: 20 },
      { key: 'estoque_atual', header: 'Estoque Atual', width: 15 },
      { key: 'estoque_minimo', header: 'Est. Mínimo', width: 15 },
      { key: 'estoque_maximo', header: 'Est. Máximo', width: 15 },
      { key: 'unidade', header: 'Unidade', width: 10 },
      { key: 'valor_unitario', header: 'Valor Un.', width: 15 },
      { key: 'localizacao', header: 'Localização', width: 20 },
      { key: 'status', header: 'Status', width: 12 },
    ],
    `materiais_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Materiais'
  );
}

/**
 * Exporta despesas para Excel
 */
export async function exportDespesas(despesas: any[]) {
  const data = despesas.map((desp) => ({
    descricao: desp.descricao,
    categoria: desp.categoria,
    fornecedor: desp.fornecedor?.nome_razao_social || '-',
    valor: desp.valor,
    data_vencimento: new Date(desp.data_vencimento).toLocaleDateString('pt-BR'),
    data_pagamento: desp.data_pagamento
      ? new Date(desp.data_pagamento).toLocaleDateString('pt-BR')
      : '-',
    forma_pagamento: desp.forma_pagamento || '-',
    status: desp.status,
  }));

  await exportToExcel(
    data,
    [
      { key: 'descricao', header: 'Descrição', width: 30 },
      { key: 'categoria', header: 'Categoria', width: 15 },
      { key: 'fornecedor', header: 'Fornecedor', width: 25 },
      { key: 'valor', header: 'Valor', width: 15 },
      { key: 'data_vencimento', header: 'Vencimento', width: 15 },
      { key: 'data_pagamento', header: 'Pagamento', width: 15 },
      { key: 'forma_pagamento', header: 'Forma Pgto', width: 15 },
      { key: 'status', header: 'Status', width: 12 },
    ],
    `despesas_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Despesas'
  );
}

/**
 * Exporta ordens de serviço para Excel
 */
export async function exportOrdensServico(ordens: any[]) {
  const data = ordens.map((os) => ({
    numero: os.numero,
    cliente: os.cliente_nome,
    tipo: os.tipo || '-',
    descricao: os.descricao || '-',
    data_inicio: new Date(os.data_inicio).toLocaleDateString('pt-BR'),
    data_fim: new Date(os.data_fim).toLocaleDateString('pt-BR'),
    status: os.status,
    responsavel: os.responsavel,
    valor_total: os.valor_total || os.valor || 0,
    materiais: os.materiais_vinculados?.length || 0,
  }));

  await exportToExcel(
    data,
    [
      { key: 'numero', header: 'Número OS', width: 15 },
      { key: 'cliente', header: 'Cliente', width: 30 },
      { key: 'tipo', header: 'Tipo', width: 20 },
      { key: 'descricao', header: 'Descrição', width: 35 },
      { key: 'data_inicio', header: 'Data Início', width: 15 },
      { key: 'data_fim', header: 'Data Fim', width: 15 },
      { key: 'status', header: 'Status', width: 15 },
      { key: 'responsavel', header: 'Responsável', width: 25 },
      { key: 'valor_total', header: 'Valor Total', width: 15 },
      { key: 'materiais', header: 'Qtd Materiais', width: 15 },
    ],
    `ordens_servico_${new Date().toISOString().split('T')[0]}.xlsx`,
    'Ordens de Serviço'
  );
}