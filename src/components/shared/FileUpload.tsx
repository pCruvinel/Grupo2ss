'use client';

import { useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import { createClient } from '../../lib/figma-make-helpers';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface FileUploadProps {
  bucket?: string;
  path?: string;
  accept?: string;
  maxSize?: number; // em MB
  onUploadComplete?: (url: string, filename: string) => void;
  onUploadError?: (error: string) => void;
}

export function FileUpload({
  bucket = 'arquivos',
  path = '',
  accept = '*/*',
  maxSize = 5, // 5MB padrão
  onUploadComplete,
  onUploadError,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const supabase = createClient();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tamanho
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      const error = `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
      toast.error(error);
      if (onUploadError) onUploadError(error);
      return;
    }

    setFile(selectedFile);
    setUploadComplete(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Fazer upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      setUploadProgress(100);
      setUploadComplete(true);
      toast.success('Arquivo enviado com sucesso!');

      if (onUploadComplete) {
        onUploadComplete(publicUrl, file.name);
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      const errorMessage = error.message || 'Erro ao enviar arquivo';
      toast.error(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadComplete(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Input de arquivo (hidden) */}
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Área de upload */}
      {!file ? (
        <Card
          className="p-8 border-2 border-dashed border-gray-300 hover:border-[#1F4788] transition-colors cursor-pointer"
          onClick={() => document.querySelector('input[type="file"]')?.click()}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <div className="text-gray-900 mb-2">
              Clique para selecionar um arquivo
            </div>
            <div className="text-sm text-gray-500">
              Tamanho máximo: {maxSize}MB
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <File className="w-10 h-10 text-[#1F4788] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-gray-900 truncate mb-1">{file.name}</div>
              <div className="text-sm text-gray-500 mb-2">
                {formatFileSize(file.size)}
              </div>

              {/* Barra de progresso */}
              {uploading && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-[#1F4788] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex items-center gap-2">
                {!uploadComplete && !uploading && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleUpload}
                      className="bg-[#1F4788] hover:bg-blue-800"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemove}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </>
                )}

                {uploading && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enviando... {uploadProgress}%
                  </div>
                )}

                {uploadComplete && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Check className="w-4 h-4" />
                      Arquivo enviado com sucesso!
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRemove}
                    >
                      Enviar Outro
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}