import { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from 'sonner';

export type ExportFormat = 'excel' | 'csv' | 'pdf';

interface ExportDataProps {
  data: any[];
  filename?: string;
  columns?: { key: string; label: string }[];
  onExport?: (format: ExportFormat) => void | Promise<void>;
}

export function ExportData({
  data,
  filename = 'export',
  columns,
  onExport,
}: ExportDataProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      if (onExport) {
        await onExport(format);
      } else {
        // Exportação padrão
        switch (format) {
          case 'excel':
            await exportToExcel(data, columns, filename);
            break;
          case 'csv':
            await exportToCSV(data, columns, filename);
            break;
          case 'pdf':
            await exportToPDF(data, columns, filename);
            break;
        }
      }
      toast.success(`Arquivo ${format.toUpperCase()} exportado com sucesso!`);
    } catch (error) {
      toast.error('Erro ao exportar arquivo');
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting} className="gap-2">
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="w-4 h-4 mr-2 text-blue-600" />
          CSV (.csv)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF (.pdf)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Funções auxiliares de exportação
async function exportToExcel(
  data: any[],
  columns?: { key: string; label: string }[],
  filename: string = 'export'
) {
  // Em produção, usar biblioteca como xlsx ou exceljs
  const csvContent = generateCSV(data, columns);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  toast.info('💡 Em produção, use biblioteca xlsx para formato Excel real');
}

async function exportToCSV(
  data: any[],
  columns?: { key: string; label: string }[],
  filename: string = 'export'
) {
  const csvContent = generateCSV(data, columns);
  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
}

async function exportToPDF(
  data: any[],
  columns?: { key: string; label: string }[],
  filename: string = 'export'
) {
  // Em produção, usar biblioteca como jsPDF ou pdfmake
  toast.info('💡 Em produção, use biblioteca jsPDF para formato PDF real');
  
  // Simulação: exportar como texto
  const textContent = generateTextTable(data, columns);
  downloadFile(textContent, `${filename}.txt`, 'text/plain');
}

function generateCSV(data: any[], columns?: { key: string; label: string }[]): string {
  if (data.length === 0) return '';

  // Determinar colunas
  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));

  // Cabeçalho
  const header = cols.map((col) => escapeCSV(col.label)).join(',');

  // Linhas
  const rows = data.map((row) =>
    cols.map((col) => escapeCSV(String(row[col.key] || ''))).join(',')
  );

  return [header, ...rows].join('\n');
}

function generateTextTable(data: any[], columns?: { key: string; label: string }[]): string {
  if (data.length === 0) return 'Sem dados para exportar';

  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }));

  let text = 'RELATÓRIO\n';
  text += '='.repeat(80) + '\n\n';

  // Cabeçalho
  text += cols.map((col) => col.label.padEnd(20)).join(' ') + '\n';
  text += '-'.repeat(80) + '\n';

  // Linhas
  data.forEach((row) => {
    text += cols.map((col) => String(row[col.key] || '').padEnd(20)).join(' ') + '\n';
  });

  text += '\n' + '='.repeat(80) + '\n';
  text += `Total de registros: ${data.length}\n`;
  text += `Data: ${new Date().toLocaleString('pt-BR')}\n`;

  return text;
}

function escapeCSV(str: string): string {
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// Hook para exportação customizada
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (
    format: ExportFormat,
    data: any[],
    options?: {
      filename?: string;
      columns?: { key: string; label: string }[];
    }
  ) => {
    setIsExporting(true);
    try {
      const filename = options?.filename || 'export';
      const columns = options?.columns;

      switch (format) {
        case 'excel':
          await exportToExcel(data, columns, filename);
          break;
        case 'csv':
          await exportToCSV(data, columns, filename);
          break;
        case 'pdf':
          await exportToPDF(data, columns, filename);
          break;
      }

      return true;
    } catch (error) {
      console.error('Export error:', error);
      return false;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportData, isExporting };
}

// Exemplo de uso
export function ExportDataExample() {
  const data = [
    { id: 1, nome: 'João Silva', email: 'joao@example.com', valor: 1500 },
    { id: 2, nome: 'Maria Santos', email: 'maria@example.com', valor: 2300 },
  ];

  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'valor', label: 'Valor' },
  ];

  return (
    <ExportData
      data={data}
      filename="relatorio-vendas"
      columns={columns}
    />
  );
}