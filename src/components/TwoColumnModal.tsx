import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Clock, MessageSquare, History } from 'lucide-react';

interface AuditInfo {
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

interface TwoColumnModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  leftColumn: React.ReactNode;
  auditInfo?: AuditInfo;
  historico?: Array<{
    data: string;
    usuario: string;
    acao: string;
    detalhes?: string;
  }>;
  comentarios?: Array<{
    data: string;
    usuario: string;
    texto: string;
  }>;
  showRightColumn?: boolean;
}

export function TwoColumnModal({
  open,
  onOpenChange,
  title,
  leftColumn,
  auditInfo,
  historico = [],
  comentarios = [],
  showRightColumn = true,
}: TwoColumnModalProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[74vw] max-h-[85vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Two Column Layout */}
        <div className="flex h-[calc(85vh-80px)]">
          {/* Left Column - Form Content */}
          <div className={`${showRightColumn ? 'w-[60%]' : 'w-full'} border-r`}>
            <ScrollArea className="h-full">
              <div className="p-6">{leftColumn}</div>
            </ScrollArea>
          </div>

          {/* Right Column - Activity/Comments/History */}
          {showRightColumn && (
            <div className="w-[40%] bg-muted/30">
              <Tabs defaultValue="atividade" className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="atividade"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Atividade
                  </TabsTrigger>
                  <TabsTrigger
                    value="comentarios"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comentários
                  </TabsTrigger>
                  <TabsTrigger
                    value="historico"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Histórico
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="atividade" className="flex-1 m-0 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      <h3 className="text-sm text-muted-foreground mb-2">
                        Informações de Auditoria
                      </h3>

                      {/* Created Info */}
                      {auditInfo?.created_at && (
                        <div className="space-y-1">
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                            <div className="flex-1 space-y-1">
                              <p className="text-sm">Registro criado</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(auditInfo.created_at)}
                              </p>
                              {auditInfo.created_by && (
                                <p className="text-xs text-muted-foreground">
                                  por {auditInfo.created_by}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Updated Info */}
                      {auditInfo?.updated_at &&
                        auditInfo.updated_at !== auditInfo.created_at && (
                          <div className="space-y-1">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                              <div className="flex-1 space-y-1">
                                <p className="text-sm">Última atualização</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(auditInfo.updated_at)}
                                </p>
                                {auditInfo.updated_by && (
                                  <p className="text-xs text-muted-foreground">
                                    por {auditInfo.updated_by}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                      {!auditInfo?.created_at && !auditInfo?.updated_at && (
                        <p className="text-sm text-muted-foreground">
                          Nenhuma informação de auditoria disponível
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="comentarios" className="flex-1 m-0 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {comentarios.length > 0 ? (
                        comentarios.map((comentario, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs">
                                  {comentario.usuario.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm">{comentario.usuario}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(comentario.data)}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {comentario.texto}
                                </p>
                              </div>
                            </div>
                            {index < comentarios.length - 1 && (
                              <div className="border-b" />
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum comentário ainda
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="historico" className="flex-1 m-0 p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {historico.length > 0 ? (
                        historico.map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm">{item.acao}</p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(item.data)} - {item.usuario}
                              </p>
                              {item.detalhes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.detalhes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Nenhum histórico disponível
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
