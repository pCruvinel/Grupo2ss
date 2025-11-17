import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChevronRight } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyState?: React.ReactNode;
  mobileCardRender?: (row: any, index: number) => React.ReactNode;
}

export function ResponsiveTable({
  columns,
  data,
  onRowClick,
  emptyState,
  mobileCardRender,
}: ResponsiveTableProps) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Desktop/Tablet - Table View */}
      <div className="hidden md:block">
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                  {onRowClick && <TableHead className="w-12" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, index) => (
                  <TableRow
                    key={index}
                    className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                    onClick={() => onRowClick?.(row)}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                    {onRowClick && (
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Mobile - Card View */}
      <div className="md:hidden space-y-3">
        {data.map((row, index) => (
          <Card
            key={index}
            className={`p-4 ${onRowClick ? 'cursor-pointer active:scale-98 transition-transform' : ''}`}
            onClick={() => onRowClick?.(row)}
          >
            {mobileCardRender ? (
              mobileCardRender(row, index)
            ) : (
              <div className="space-y-2">
                {columns.map((column) => (
                  <div key={column.key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{column.label}:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {onRowClick && (
              <div className="mt-3 pt-3 border-t flex justify-end">
                <Button variant="ghost" size="sm">
                  Ver detalhes
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}

// Exemplo de uso com renderização customizada para mobile
export function ExampleUsage() {
  const columns = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <Badge variant={value === 'ativo' ? 'success' : 'secondary' as any}>
          {value}
        </Badge>
      ),
    },
  ];

  const data = [
    { nome: 'João Silva', email: 'joao@example.com', status: 'ativo' },
    { nome: 'Maria Santos', email: 'maria@example.com', status: 'inativo' },
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={data}
      onRowClick={(row) => console.log('Clicked:', row)}
      mobileCardRender={(row) => (
        <div>
          <h3 className="font-medium text-gray-900 mb-2">{row.nome}</h3>
          <p className="text-sm text-gray-500 mb-2">{row.email}</p>
          <Badge variant={row.status === 'ativo' ? 'success' : 'secondary' as any}>
            {row.status}
          </Badge>
        </div>
      )}
    />
  );
}
