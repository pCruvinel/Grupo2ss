import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  Truck,
  UserCircle,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  FileText,
  Calendar,
  CreditCard,
  BarChart3,
  Receipt,
  Briefcase,
} from 'lucide-react';
import { useMockAuth } from '../../hooks/useMockAuth';
import { MOCK_EMPRESAS, hasPermission } from '../../lib/figma-make-helpers';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useState } from 'react';
import { CompanySwitcher } from '../CompanySwitcher';
import { useEmpresaContext } from '../../contexts/EmpresaContext';

interface SidebarProps {
  user: any;
  currentPath: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: any;
  perfis: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  perfis: string[];
}

const menuSections: MenuSection[] = [
  {
    title: 'Principal',
    perfis: ['admin', 'financeiro', 'rh', 'operacional'],
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        perfis: ['admin', 'financeiro', 'rh', 'operacional'],
      },
    ],
  },
  {
    title: 'Financeiro',
    perfis: ['admin', 'financeiro'],
    items: [
      {
        label: 'Dashboard Financeiro',
        href: '/financeiro/dashboard',
        icon: DollarSign,
        perfis: ['admin', 'financeiro'],
      },
      {
        label: 'Contratos',
        href: '/financeiro/contratos',
        icon: FileText,
        perfis: ['admin', 'financeiro'],
      },
      {
        label: 'Despesas',
        href: '/financeiro/despesas',
        icon: CreditCard,
        perfis: ['admin', 'financeiro'],
      },
    ],
  },
  {
    title: 'Recursos Humanos',
    perfis: ['admin', 'rh'],
    items: [
      {
        label: 'Colaboradores',
        href: '/rh/colaboradores',
        icon: Users,
        perfis: ['admin', 'rh'],
      },
      {
        label: 'Cargos',
        href: '/rh/cargos',
        icon: UserCircle,
        perfis: ['admin', 'rh'],
      },
      {
        label: 'Ponto Eletrônico',
        href: '/rh/ponto',
        icon: Calendar,
        perfis: ['admin', 'rh'],
      },
      {
        label: 'Pagamentos',
        href: '/rh/pagamentos',
        icon: CreditCard,
        perfis: ['admin', 'rh'],
      },
    ],
  },
  {
    title: 'Operacional',
    perfis: ['admin', 'operacional'],
    items: [
      {
        label: 'Ordens de Serviço',
        href: '/operacional/ordens',
        icon: FileText,
        perfis: ['admin', 'operacional'],
      },
      {
        label: 'Veículos',
        href: '/operacional/veiculos',
        icon: Truck,
        perfis: ['admin', 'operacional'],
      },
    ],
  },
  {
    title: 'Estoque',
    perfis: ['admin', 'operacional'],
    items: [
      {
        label: 'Materiais',
        href: '/estoque/materiais',
        icon: Package,
        perfis: ['admin', 'operacional'],
      },
    ],
  },
  {
    title: 'Administração',
    perfis: ['admin'],
    items: [
      {
        label: 'Usuários',
        href: '/admin/usuarios',
        icon: Users,
        perfis: ['admin'],
      },
      {
        label: 'Empresas',
        href: '/admin/empresas',
        icon: Building2,
        perfis: ['admin'],
      },
    ],
  },
  {
    title: 'Portal do Cliente',
    perfis: ['cliente'],
    items: [
      {
        label: 'Meus Contratos',
        href: '/cliente/meus-contratos',
        icon: FileText,
        perfis: ['cliente'],
      },
      {
        label: 'Notas Fiscais',
        href: '/cliente/notas-fiscais',
        icon: Receipt,
        perfis: ['cliente'],
      },
    ],
  },
];

export function Sidebar({ user, currentPath, onNavigate, onLogout }: SidebarProps) {
  const router = typeof window !== 'undefined' && onNavigate === undefined ? usePathname() : null;
  const { logout } = useMockAuth();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Principal']);
  const [selectedEmpresa, setSelectedEmpresa] = useState(user?.empresa_id || '1');

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
      router?.push('/login');
    }
  };

  const handleNavigate = (href: string, e?: React.MouseEvent) => {
    if (onNavigate) {
      e?.preventDefault();
      onNavigate(href);
    }
  };

  const canAccessSection = (section: MenuSection) => {
    return section.perfis.includes(user?.perfil);
  };

  const canAccessItem = (item: MenuItem) => {
    return item.perfis.includes(user?.perfil);
  };

  const empresa = MOCK_EMPRESAS.find(e => e.id === user?.empresa_id);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-900">Grupo 2S</h2>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* Company Switcher - Seletor Multi-Empresa */}
      <div className="p-4 border-b border-gray-200">
        <CompanySwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {menuSections.map((section) => {
            if (!canAccessSection(section)) return null;

            const isExpanded = expandedSections.includes(section.title);

            return (
              <div key={section.title} className="mb-4">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="uppercase tracking-wider">{section.title}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => {
                      if (!canAccessItem(item)) return null;

                      const isActive = currentPath === item.href;
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-[#1F4788] text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={(e) => handleNavigate(item.href, e)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm text-gray-900">{user?.nome}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          {user?.perfil !== 'cliente' && empresa && (
            <p className="text-xs text-blue-600 mt-1">{empresa.nome}</p>
          )}
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
              {user?.perfil === 'admin' && '👑 Admin'}
              {user?.perfil === 'financeiro' && '💼 Financeiro'}
              {user?.perfil === 'rh' && '👥 RH'}
              {user?.perfil === 'operacional' && '🚚 Operacional'}
              {user?.perfil === 'cliente' && '👤 Cliente'}
            </span>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2"
          size="sm"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}