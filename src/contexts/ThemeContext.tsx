import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeColors {
  primary: string;
  secondary: string;
}

interface EmpresaTheme {
  id: string;
  nome: string;
  nomeCompleto: string;
  logo: string;
  colors: ThemeColors;
}

const EMPRESA_THEMES: Record<string, EmpresaTheme> = {
  '1': {
    id: '1',
    nome: '2S Locações',
    nomeCompleto: '2S Locações',
    logo: '/logos/2s-locacoes.png',
    colors: {
      primary: '#4459E2',
      secondary: '#55E6EA',
    },
  },
  '2': {
    id: '2',
    nome: '2S Marketing',
    nomeCompleto: '2S Marketing',
    logo: '/logos/2s-marketing.png',
    colors: {
      primary: '#F08133',
      secondary: '#55E6EA',
    },
  },
  '3': {
    id: '3',
    nome: '2S Produções',
    nomeCompleto: '2S Produções e Eventos',
    logo: '/logos/2s-producoes.png',
    colors: {
      primary: '#3D3AE5',
      secondary: '#8A31EF',
    },
  },
  'grupo': {
    id: 'grupo',
    nome: 'Grupo 2S',
    nomeCompleto: 'Grupo 2S',
    logo: '/logos/grupo-2s.png',
    colors: {
      primary: '#EB7900',
      secondary: '#EB9A00',
    },
  },
};

interface ThemeContextType {
  currentTheme: EmpresaTheme;
  setEmpresaId: (id: string) => void;
  empresaThemes: Record<string, EmpresaTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [empresaId, setEmpresaId] = useState<string>('grupo');
  const [currentTheme, setCurrentTheme] = useState<EmpresaTheme>(EMPRESA_THEMES['grupo']);

  useEffect(() => {
    const theme = EMPRESA_THEMES[empresaId] || EMPRESA_THEMES['grupo'];
    setCurrentTheme(theme);

    // Atualizar CSS Custom Properties
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    
    // Calcular variações de cor
    const primaryRGB = hexToRGB(theme.colors.primary);
    const secondaryRGB = hexToRGB(theme.colors.secondary);
    
    root.style.setProperty('--color-primary-rgb', primaryRGB);
    root.style.setProperty('--color-secondary-rgb', secondaryRGB);
    root.style.setProperty('--color-primary-dark', adjustBrightness(theme.colors.primary, -20));
    root.style.setProperty('--color-primary-light', adjustBrightness(theme.colors.primary, 20));
  }, [empresaId]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setEmpresaId, empresaThemes: EMPRESA_THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}

// Funções auxiliares
function hexToRGB(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

function adjustBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, (num >> 8 & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
