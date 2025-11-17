import './globals.css';
import { Toaster } from '../components/ui/sonner';
import { EmpresaProvider } from '../contexts/EmpresaContext';

export const metadata = {
  title: 'ERP Grupo 2S',
  description: 'Sistema ERP completo para gestão empresarial',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <EmpresaProvider>
          {children}
          <Toaster position="top-right" />
        </EmpresaProvider>
      </body>
    </html>
  );
}