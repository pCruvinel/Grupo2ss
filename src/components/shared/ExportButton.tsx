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

interface ExportButtonProps {
  data: any[];
  filename: string;
  type?: 'contratos' | 'despesas' | 'colaboradores' | 'materiais' | 'ordens' | 'custom';
  columns?: { key: string; label: string }[];
  formats?: ('pdf' | 'excel' | 'csv')[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onExport?: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;
}

export function ExportButton({ 
  data, 
  filename, 
  type,
  columns,
  formats = ['excel', 'csv'],
  variant = 'outline',
  size = 'default',
  onExport
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    if (data.length === 0) {
      toast.error('Não há dados para exportar');
      return;
    }

    setIsExporting(true);

    try {
      // Se há callback customizado, usar ele
      if (onExport) {
        await onExport(format);
        toast.success(`Arquivo exportado com sucesso!`, {
          description: `${filename} - ${data.length} registros`,
        });
      } else {
        // Usar exportação padrão baseada no tipo
        if (format === 'excel') {
          await handleExcelExport();
        } else if (format === 'csv') {
          await handleCSVExport();
        } else if (format === 'pdf') {
          await handlePDFExport();
        }
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar arquivo', {
        description: 'Tente novamente em alguns instantes',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExcelExport = async () => {
    // Importar dinamicamente a função correta
    const { 
      exportContratos, 
      exportDespesas, 
      exportColaboradores, 
      exportMateriais,
      exportOrdensServico 
    } = await import('../../lib/export/excel');

    switch (type) {
      case 'contratos':
        await exportContratos(data);
        break;
      case 'despesas':
        await exportDespesas(data);
        break;
      case 'colaboradores':
        await exportColaboradores(data);
        break;
      case 'materiais':
        await exportMateriais(data);
        break;
      case 'ordens':
        await exportOrdensServico(data);
        break;
      default:
        throw new Error('Tipo de exportaão não suportado');
    }

    toast.success('Excel exportado com sucesso!', {
      description: `${filename}.xlsx - ${data.length} registros`,
    });
  };

  const handleCSVExport = async () => {
    // Converter dados para CSV
    let headers: string[];
    let keys: string[];
    
    if (columns && columns.length > 0) {
      headers = columns.map(col => col.label);
      keys = columns.map(col => col.key);
    } else {
      keys = Object.keys(data[0] || {});
      headers = keys;
    }
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        keys.map(key => {
          const value = row[key];
          // Escapar vírgulas e quebras de linha
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    // Criar blob e fazer download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('CSV exportado com sucesso!', {
      description: `${filename}.csv - ${data.length} registros`,
    });
  };

  const handlePDFExport = async () => {
    // Simulação de PDF por enquanto
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('PDF exportado com sucesso!', {
      description: `${filename}.pdf - ${data.length} registros`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting || data.length === 0}>
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exportando...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.includes('excel') && (
          <DropdownMenuItem onClick={() => handleExport('excel')}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
            Exportar como Excel
          </DropdownMenuItem>
        )}
        {formats.includes('csv') && (
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="w-4 h-4 mr-2 text-blue-600" />
            Exportar como CSV
          </DropdownMenuItem>
        )}
        {formats.includes('pdf') && (
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <FileText className="w-4 h-4 mr-2 text-red-600" />
            Exportar como PDF
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}