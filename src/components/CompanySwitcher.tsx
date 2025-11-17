/**
 * ╔════════════════════════════════════════════════════════════════╗
 * ║  COMPANY SWITCHER - SELETOR DE EMPRESA                         ║
 * ║  Permite trocar entre empresas com identidade visual dinâmica  ║
 * ╚════════════════════════════════════════════════════════════════╝
 */

import { useState } from 'react';
import { Building, ChevronDown, Check } from 'lucide-react';
import { useEmpresaContext } from '../contexts/EmpresaContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { motion } from 'motion/react';

export function CompanySwitcher() {
  const [open, setOpen] = useState(false);

  // Tentar usar o Context com tratamento de erro
  let empresaAtiva, empresasDisponiveis, setEmpresaAtiva, isMasterAccess, loading;
  
  try {
    const context = useEmpresaContext();
    empresaAtiva = context.empresaAtiva;
    empresasDisponiveis = context.empresasDisponiveis;
    setEmpresaAtiva = context.setEmpresaAtiva;
    isMasterAccess = context.isMasterAccess;
    loading = context.loading;
  } catch (error) {
    console.error('❌ CompanySwitcher: Erro ao acessar EmpresaContext', error);
    // Fallback: mostrar UI básica
    return (
      <div className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-200">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
          🏢
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900">Erro de Contexto</p>
          <p className="text-xs text-red-600">Context não disponível</p>
        </div>
      </div>
    );
  }

  const getEmpresaIcon = (tipo: string) => {
    return tipo === 'holding' ? '🏢' : '🏪';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  // Debug logs
  console.log('🔍 CompanySwitcher Debug:', {
    empresaAtiva,
    empresasDisponiveis,
    isMasterAccess,
    loading,
    empresasCount: empresasDisponiveis?.length || 0
  });

  // Se não tem empresas disponíveis, mostrar fallback
  if (!empresasDisponiveis || empresasDisponiveis.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
          🏢
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Grupo 2S</p>
          <p className="text-xs text-gray-500">Sistema de Gestão</p>
        </div>
      </div>
    );
  }

  // Se tem apenas 1 empresa, mostrar versão estática (sem dropdown)
  if (empresasDisponiveis.length === 1) {
    return (
      <div className="flex items-center gap-3">
        <Avatar 
          className="w-8 h-8"
          style={{ 
            backgroundColor: empresaAtiva?.primary || '#1F4788',
          }}
        >
          <AvatarFallback 
            className="text-white"
            style={{ 
              backgroundColor: empresaAtiva?.primary || '#1F4788',
            }}
          >
            {getEmpresaIcon(empresaAtiva?.tipo || 'filial')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {empresaAtiva?.nome || 'Grupo 2S'}
          </p>
          <p className="text-xs text-gray-500">
            Sistema de Gestão
          </p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-3 py-2 h-auto hover:bg-gray-100 transition-all duration-200"
        >
          <div className="flex items-center gap-3 flex-1">
            <Avatar 
              className="w-8 h-8 transition-colors duration-300"
              style={{ 
                backgroundColor: empresaAtiva?.primary || '#1F4788',
              }}
            >
              <AvatarFallback 
                className="text-white"
                style={{ 
                  backgroundColor: empresaAtiva?.primary || '#1F4788',
                }}
              >
                {getEmpresaIcon(empresaAtiva?.tipo || 'filial')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                {empresaAtiva?.nome || 'Selecione uma empresa'}
              </p>
              <p className="text-xs text-gray-500">
                {isMasterAccess ? '👑 Acesso Master' : 'Empresa Ativa'}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building className="w-4 h-4" />
          Trocar de Empresa
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Empresas Disponíveis */}
        <div className="max-h-64 overflow-y-auto">
          {empresasDisponiveis.map((empresa) => {
            const isActive = empresaAtiva?.id === empresa.id;

            return (
              <DropdownMenuItem
                key={empresa.id}
                onClick={() => {
                  setEmpresaAtiva(empresa.id);
                  setOpen(false);
                }}
                className={`cursor-pointer ${
                  isActive ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar 
                    className="w-8 h-8 transition-all duration-300"
                    style={{ 
                      backgroundColor: empresa.primary,
                    }}
                  >
                    <AvatarFallback 
                      className="text-white"
                      style={{ 
                        backgroundColor: empresa.primary,
                      }}
                    >
                      {getEmpresaIcon(empresa.tipo)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {empresa.nome}
                    </p>
                    <p className="text-xs text-gray-500">
                      {empresa.tipo === 'holding' ? 'Holding' : 'Filial'}
                    </p>
                  </div>

                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </motion.div>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        {isMasterAccess && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <div className="flex items-center gap-2 px-2 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                <span className="text-xs text-amber-700">
                  👑 Você tem acesso a todas as empresas
                </span>
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}