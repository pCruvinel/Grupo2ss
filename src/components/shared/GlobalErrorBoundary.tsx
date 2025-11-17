'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * ErrorBoundary global para capturar erros não tratados
 * Deve envolver a aplicação inteira no layout principal
 * 
 * @example
 * // app/layout.tsx
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro
    console.error('GlobalErrorBoundary caught an error:', error, errorInfo);

    // Atualizar estado com informações do erro
    this.setState({
      error,
      errorInfo,
    });

    // Callback customizado
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Em produção, enviar para serviço de monitoramento (ex: Sentry)
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-red-600">
                    Ops! Algo deu errado
                  </CardTitle>
                  <CardDescription>
                    Ocorreu um erro inesperado na aplicação
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mensagem do erro */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-mono text-sm text-red-800">
                  {this.state.error?.message || 'Erro desconhecido'}
                </p>
              </div>

              {/* Stack trace (apenas em desenvolvimento) */}
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
                  <summary className="cursor-pointer font-medium text-sm">
                    Detalhes técnicos (development only)
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto max-h-64">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Ações */}
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Ir para Home
                </Button>
              </div>

              {/* Informações adicionais */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Se o problema persistir, entre em contato com o suporte
                  ou recarregue a página.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundary mais leve para componentes específicos
 * 
 * @example
 * <ComponentErrorBoundary>
 *   <MyComponent />
 * </ComponentErrorBoundary>
 */
export function ComponentErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <GlobalErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">
              Erro ao carregar componente
            </p>
          </div>
        )
      }
    >
      {children}
    </GlobalErrorBoundary>
  );
}
