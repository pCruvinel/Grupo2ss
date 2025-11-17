import { Building2 } from 'lucide-react';

interface EmpresaLogoProps {
  empresaId: string;
  className?: string;
  showFallback?: boolean;
}

const EMPRESA_LOGOS: Record<string, { name: string; color: string }> = {
  '1': { name: '2S Locações', color: '#4459E2' },
  '2': { name: '2S Marketing', color: '#F08133' },
  '3': { name: '2S Produções', color: '#3D3AE5' },
  'grupo': { name: 'Grupo 2S', color: '#EB7900' },
};

export function EmpresaLogo({ empresaId, className = '', showFallback = true }: EmpresaLogoProps) {
  const empresa = EMPRESA_LOGOS[empresaId] || EMPRESA_LOGOS['grupo'];
  
  // Por enquanto, usar fallback com ícone colorido até as logos serem adicionadas
  if (showFallback) {
    return (
      <div 
        className={`rounded-lg p-2 flex items-center justify-center ${className}`}
        style={{ backgroundColor: empresa.color }}
      >
        <Building2 className="w-6 h-6 text-white" />
      </div>
    );
  }

  // Quando as logos estiverem disponíveis, será usado:
  // <img src={`/logos/${empresaId}.png`} alt={empresa.name} className={className} />
  
  return null;
}
