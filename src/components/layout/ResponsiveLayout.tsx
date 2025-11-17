import { useState, ReactNode } from 'react';
import { Menu, X, ChevronDown, LogOut, User, Settings, Bell, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent } from '../ui/sheet';
import { Separator } from '../ui/separator';
import { EmpresaSelector } from '../EmpresaSelector';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  badge?: string;
  active?: boolean;
  subItems?: {
    id: string;
    label: string;
    onClick: () => void;
  }[];
}

interface UserInfo {
  nome: string;
  email: string;
  perfil: string;
  empresa: string;
  avatar?: string;
  empresas?: string[]; // IDs das empresas que o usuário tem acesso
}

interface Empresa {
  id: string;
  nome: string;
  nomeCompleto?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
}

interface ResponsiveLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  userInfo: UserInfo;
  onLogout: () => void;
  corPrimaria?: string;
  logo?: ReactNode;
  notifications?: number;
  onSearch?: (query: string) => void;
  empresas?: Empresa[]; // Lista de empresas disponíveis
  empresaAtual?: string; // ID da empresa atual
  onSelectEmpresa?: (empresaId: string) => void; // Callback para mudar de empresa
}

export function ResponsiveLayout({
  children,
  menuItems,
  userInfo,
  onLogout,
  corPrimaria = '#1F4788',
  logo,
  notifications = 0,
  onSearch,
  empresas,
  empresaAtual,
  onSelectEmpresa,
}: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleExpanded(item.id);
    } else {
      item.onClick();
      setSidebarOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200" style={{ backgroundColor: corPrimaria }}>
          {logo || (
            <div className="text-white text-2xl font-bold">
              Grupo 2S
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={item.active ? 'text-blue-600' : 'text-gray-500'}>
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge className="bg-red-500 text-white text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    {item.subItems && item.subItems.length > 0 && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedItems.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </button>

                {/* Sub Items */}
                {item.subItems && expandedItems.includes(item.id) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          subItem.onClick();
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* User Info */}
        {/* Removido - informações do usuário já estão no header */}
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 pb-4" style={{ backgroundColor: corPrimaria }}>
              <div className="flex items-center justify-between mb-4">
                {logo || (
                  <div className="text-white text-xl font-bold">
                    Grupo 2S
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* User Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-white/20 text-white">
                    {getInitials(userInfo.nome)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">{userInfo.nome}</p>
                  <p className="text-xs text-white/80">{userInfo.email}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {userInfo.perfil}
                </Badge>
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  {userInfo.empresa}
                </Badge>
              </div>
              
              {/* Seletor de Empresa - Mobile */}
              {empresas && empresaAtual && onSelectEmpresa && (
                <div className="mt-4">
                  <EmpresaSelector
                    empresas={empresas}
                    empresaAtual={empresaAtual}
                    onSelectEmpresa={onSelectEmpresa}
                    userEmpresas={userInfo.empresas}
                    showIcon={false}
                    variant="compact"
                  />
                </div>
              )}
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => handleMenuItemClick(item)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        item.active
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge className="bg-red-500 text-white">
                            {item.badge}
                          </Badge>
                        )}
                        {item.subItems && item.subItems.length > 0 && (
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${
                              expandedItems.includes(item.id) ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    {item.subItems && expandedItems.includes(item.id) && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              subItem.onClick();
                              setSidebarOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm"
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            {subItem.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </nav>

            {/* Footer */}
            <Separator />
            <div className="p-4">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sair do Sistema
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {/* Search Bar */}
            {onSearch && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      onSearch(e.target.value);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Seletor de Empresa */}
              {empresas && empresaAtual && onSelectEmpresa && (
                <div className="hidden md:block">
                  <EmpresaSelector
                    empresas={empresas}
                    empresaAtual={empresaAtual}
                    onSelectEmpresa={onSelectEmpresa}
                    userEmpresas={userInfo.empresas}
                    variant="compact"
                  />
                </div>
              )}

              {/* Busca Global - Ctrl+K */}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  // Dispatch evento customizado para abrir busca
                  window.dispatchEvent(new KeyboardEvent('keydown', { 
                    key: 'k', 
                    ctrlKey: true 
                  }));
                }}
                className="hidden md:flex"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </Button>

              {/* Desktop User Menu */}
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-xs">
                          {getInitials(userInfo.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{userInfo.nome}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{userInfo.nome}</p>
                        <p className="text-xs text-gray-500">{userInfo.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        // Navegar para a página de perfil
                        const perfilItem = menuItems.find(i => i.id === 'dashboard');
                        if (perfilItem) {
                          // Dispatch evento para mudar página
                          window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'perfil' }));
                        }
                      }}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}