'use client';

import { useEffect, useState } from 'react';
import { useMockAuth } from './useMockAuth';

// Fallback para useMockAuth quando Supabase não está disponível
export function useAuth() {
  // Usar mock auth por padrão no Figma Make
  return useMockAuth();
}