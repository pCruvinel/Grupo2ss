import { useState } from 'react';
import { Menu, X, ChevronDown, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  subItems?: {
    id: string;
    label: string;
    onClick: () => void;
  }[];
}

interface MobileMenuProps {
  menuItems: MenuItem[];
  userInfo?: {
    nome: string;
    email: string;
    perfil: string;
    empresa?: string;
  };
  onLogout?: () => void;
  corPrimaria?: string;
}

export function MobileMenu({ menuItems, userInfo, onLogout, corPrimaria = '#1F4788' }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems && item.subItems.length > 0) {
      toggleExpanded(item.id);
    } else {
      item.onClick();
      setOpen(false);
    }
  };

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 pb-4" style={{ backgroundColor: corPrimaria }}>
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white text-xl">Menu</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="text-white hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* User Info */}
              {userInfo && (
                <div className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-medium text-lg">
                        {userInfo.nome.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-white">{userInfo.nome}</p>
                      <p className="text-xs text-white/80">{userInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge className="bg-white/20 text-white border-0">
                      {userInfo.perfil}
                    </Badge>
                    {userInfo.empresa && (
                      <Badge className="bg-white/20 text-white border-0">
                        {userInfo.empresa}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </SheetHeader>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <div key={item.id}>
                    <button
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-gray-600">{item.icon}</div>
                        <span className="text-gray-900 font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge className="bg-red-500 text-white">{item.badge}</Badge>
                        )}
                        {item.subItems && item.subItems.length > 0 && (
                          <ChevronDown
                            className={`h-4 w-4 text-gray-400 transition-transform ${
                              expandedItems.includes(item.id) ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </div>
                    </button>

                    {/* Sub Items */}
                    {item.subItems && expandedItems.includes(item.id) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              subItem.onClick();
                              setOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="text-gray-700 text-sm">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer */}
            {onLogout && (
              <>
                <Separator />
                <div className="p-4">
                  <Button
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                    }}
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair do Sistema
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Header Mobile com Menu Hamburger
export function MobileHeader({
  title,
  menuItems,
  userInfo,
  onLogout,
  corPrimaria,
  actions,
}: {
  title: string;
  menuItems: MenuItem[];
  userInfo?: any;
  onLogout?: () => void;
  corPrimaria?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MobileMenu
            menuItems={menuItems}
            userInfo={userInfo}
            onLogout={onLogout}
            corPrimaria={corPrimaria}
          />
          <h1 className="font-bold text-gray-900">{title}</h1>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
