import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

// Mock do Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: '1',
            email: 'test@example.com',
          },
        },
        error: null,
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{
            id: '1',
            email: 'test@example.com',
            nome: 'Test User',
            perfil: 'admin',
          }],
          error: null,
        }),
      }),
    }),
  }),
}))

describe('useAuth Hook', () => {
  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })

  it('should have login function', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.login).toBe('function')
  })

  it('should have logout function', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.logout).toBe('function')
  })

  it('should have loading state', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.loading).toBe('boolean')
  })

  // Testes de integração podem ser adicionados aqui
  // para testar login, logout, etc.
})
