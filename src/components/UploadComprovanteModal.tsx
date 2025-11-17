import { useState } from 'react';
import { Upload, File, X, Check, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from './ui/sonner';

interface Comprovante {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  data_upload: string;
}

interface Despesa {
  id: string;
  descricao: string;
  valor_total: number;
  data: string;
}

interface UploadComprovanteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesa: Despesa;
  comprovantes: Comprovante[];
  onUpload: (files: File[]) => void;
  onRemove: (comprovanteId: string) => void;
}

export function UploadComprovanteModal({
  open,
  onOpenChange,
  despesa,
  comprovantes,
  onUpload,
  onRemove,
}: UploadComprovanteModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    validarEAdicionarArquivos(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    validarEAdicionarArquivos(files);
  };

  const validarEAdicionarArquivos = (files: File[]) => {
    // Validar tipos de arquivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const arquivosValidos = files.filter((file) => {
      if (!tiposPermitidos.includes(file.type)) {
        toast.error(`Arquivo ${file.name} não é permitido`, {
          description: 'Apenas JPG, PNG e PDF são aceitos',
        });
        return false;
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} é muito grande`, {
          description: 'Tamanho máximo: 5MB',
        });
        return false;
      }

      return true;
    });

    setArquivosSelecionados([...arquivosSelecionados, ...arquivosValidos]);
  };

  const handleRemoverArquivoSelecionado = (index: number) => {
    setArquivosSelecionados(arquivosSelecionados.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (arquivosSelecionados.length === 0) {
      toast.error('Nenhum arquivo selecionado');
      return;
    }

    // Simular upload
    onUpload(arquivosSelecionados);
    
    toast.success('Comprovantes enviados com sucesso!', {
      description: `${arquivosSelecionados.length} arquivo(s) adicionado(s)`,
    });

    setArquivosSelecionados([]);
  };

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Comprovantes de Pagamento
          </DialogTitle>
          <DialogDescription>
            {despesa.descricao} - R$ {despesa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Área de Upload */}
          <div className="space-y-3">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
              }`}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileSelect}
              />
              
              <Upload className={`w-12 h-12 mx-auto mb-4 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`} />
              
              <p className="text-sm text-gray-700 mb-2">
                {isDragging ? 'Solte os arquivos aqui' : 'Arraste arquivos ou clique para selecionar'}
              </p>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Selecionar Arquivos
              </Button>

              <p className="text-xs text-gray-500 mt-3">
                Formatos aceitos: JPG, PNG, PDF (máximo 5MB cada)
              </p>
            </div>

            {/* Arquivos Selecionados para Upload */}
            {arquivosSelecionados.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm text-gray-700">Arquivos Selecionados</h4>
                  <Badge className="bg-blue-100 text-blue-700">
                    {arquivosSelecionados.length} arquivo(s)
                  </Badge>
                </div>
                {arquivosSelecionados.map((arquivo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-900">{arquivo.name}</p>
                        <p className="text-xs text-gray-500">{formatarTamanho(arquivo.size)}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoverArquivoSelecionado(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={handleUpload} className="w-full bg-[#28A745] hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar {arquivosSelecionados.length} Arquivo(s)
                </Button>
              </div>
            )}
          </div>

          {/* Comprovantes já Enviados */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm text-gray-900">Comprovantes Enviados</h4>
              <Badge className="bg-green-100 text-green-700">
                {comprovantes.length} arquivo(s)
              </Badge>
            </div>

            {comprovantes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                <File className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm">Nenhum comprovante enviado ainda</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {comprovantes.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{comp.nome}</p>
                        <p className="text-xs text-gray-500">
                          {formatarTamanho(comp.tamanho)} • {new Date(comp.data_upload).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => window.open(comp.url, '_blank')}
                        variant="ghost"
                        size="sm"
                      >
                        Visualizar
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm('Deseja remover este comprovante?')) {
                            onRemove(comp.id);
                            toast.success('Comprovante removido');
                          }
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aviso */}
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Nota:</strong> Esta é uma funcionalidade simulada para demonstração. Em produção, os arquivos seriam enviados para o Supabase Storage.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
