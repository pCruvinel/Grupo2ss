# Guia de Testes - Sistema ERP Grupo 2S

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Executando Testes](#executando-testes)
4. [Estrutura de Testes](#estrutura-de-testes)
5. [Tipos de Testes](#tipos-de-testes)
6. [Cobertura Atual](#cobertura-atual)
7. [Guia de Escrita de Testes](#guia-de-escrita-de-testes)
8. [Mocking](#mocking)
9. [Melhores Práticas](#melhores-práticas)

---

## 1. Visão Geral

O sistema utiliza **Jest** e **React Testing Library** para testes unitários e de integração, com meta de **80%+ de cobertura** em todos os módulos.

### Tecnologias de Teste

- **Jest 29** - Framework de testes
- **React Testing Library** - Testes de componentes React
- **@testing-library/user-event** - Simulação de interações
- **@testing-library/jest-dom** - Matchers customizados

---

## 2. Configuração

### Arquivos de Configuração

#### `jest.config.js`
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### `jest.setup.js`
```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  })),
})
```

---

## 3. Executando Testes

### Comandos Disponíveis

```bash
# Modo watch (desenvolvimento)
npm test

# Executar todos os testes uma vez
npm test -- --watchAll=false

# Com cobertura
npm run test:coverage

# CI/CD (sem watch)
npm run test:ci

# Executar arquivo específico
npm test -- StatusBadge.test.tsx

# Executar por padrão
npm test -- --testNamePattern="formatCurrency"
```

### Saída de Cobertura

Após executar `npm run test:coverage`, você verá:

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   82.5  |   78.3   |   85.1  |   83.2  |
 utils/formatters.ts   |   100   |   100    |   100   |   100   |
 lib/calculations.ts   |   95    |   92     |   98    |   96    |
 components/shared/    |   80    |   75     |   82    |   81    |
-----------------------|---------|----------|---------|---------|
```

---

## 4. Estrutura de Testes

```
__tests__/
├── utils/                    # Testes de utilitários
│   ├── formatters.test.ts
│   ├── validators.test.ts
│   └── consolidacao.test.ts
├── lib/                      # Testes de bibliotecas
│   ├── calculations.test.ts
│   └── export/
│       └── excel.test.ts
├── hooks/                    # Testes de hooks
│   ├── useAuth.test.ts
│   ├── useEmpresa.test.ts
│   └── usePagination.test.ts
├── components/               # Testes de componentes
│   ├── shared/
│   │   ├── StatusBadge.test.tsx
│   │   ├── DataTable.test.tsx
│   │   └── Pagination.test.tsx
│   └── modals/
│       └── NovoColaboradorModal.test.tsx
└── app/                      # Testes de páginas
    └── (app)/
        └── dashboard/
            └── page.test.tsx
```

---

## 5. Tipos de Testes

### 5.1 Testes de Utilitários

**Exemplo**: `/utils/formatters.ts`

```typescript
// formatters.test.ts
import { formatCurrency, formatDate, formatCPF } from '@/utils/formatters'

describe('Formatters Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
    })

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1000)).toBe('-R$ 1.000,00')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })
  })

  describe('formatCPF', () => {
    it('should format valid CPF', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01')
    })
  })
})
```

### 5.2 Testes de Componentes

**Exemplo**: `/components/shared/StatusBadge.tsx`

```typescript
// StatusBadge.test.tsx
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/shared/StatusBadge'

describe('StatusBadge Component', () => {
  it('should render with default variant', () => {
    render(<StatusBadge status="Ativo" />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('should render with success variant', () => {
    const { container } = render(
      <StatusBadge status="Aprovado" variant="success" />
    )
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('bg-green-100')
  })

  it('should apply custom className', () => {
    const { container } = render(
      <StatusBadge status="Custom" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
```

### 5.3 Testes de Hooks

**Exemplo**: `/hooks/useAuth.ts`

```typescript
// useAuth.test.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'

describe('useAuth Hook', () => {
  it('should initialize with null user', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.user).toBeNull()
  })

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('admin@grupo2s.com.br', 'Admin@2024')
    })
    
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('admin@grupo2s.com.br')
  })

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.logout()
    })
    
    expect(result.current.user).toBeNull()
  })
})
```

### 5.4 Testes de Lógica de Negócio

**Exemplo**: `/lib/calculations.ts`

```typescript
// calculations.test.ts
import { calcularRateio, calcularParcelas } from '@/lib/calculations'

describe('Business Logic - Calculations', () => {
  describe('calcularRateio', () => {
    it('should calculate single company rateio', () => {
      const resultado = calcularRateio(1000, [
        { empresa_id: '1', percentual: 100 }
      ])
      expect(resultado[0].valor).toBe(1000)
    })

    it('should calculate percentage rateio', () => {
      const resultado = calcularRateio(1000, [
        { empresa_id: '1', percentual: 60 },
        { empresa_id: '2', percentual: 40 }
      ])
      expect(resultado[0].valor).toBe(600)
      expect(resultado[1].valor).toBe(400)
    })

    it('should throw error if percentages do not sum to 100', () => {
      expect(() => {
        calcularRateio(1000, [
          { empresa_id: '1', percentual: 50 },
          { empresa_id: '2', percentual: 40 }
        ])
      }).toThrow('Percentuais devem somar 100%')
    })
  })

  describe('calcularParcelas', () => {
    it('should calculate equal installments', () => {
      const resultado = calcularParcelas(1200, 12, '2024-01-01')
      expect(resultado).toHaveLength(12)
      expect(resultado[0].valor).toBe(100)
    })
  })
})
```

### 5.5 Testes de Integração

**Exemplo**: Fluxo completo de cadastro de colaborador

```typescript
// NovoColaboradorModal.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NovoColaboradorModal } from '@/components/NovoColaboradorModal'

describe('NovoColaboradorModal Integration', () => {
  it('should create new colaborador successfully', async () => {
    const user = userEvent.setup()
    const onSuccess = jest.fn()
    
    render(
      <NovoColaboradorModal 
        isOpen={true} 
        onClose={() => {}}
        onSuccess={onSuccess}
      />
    )
    
    // Preencher formulário
    await user.type(screen.getByLabelText('Nome'), 'João Silva')
    await user.type(screen.getByLabelText('CPF'), '12345678901')
    await user.type(screen.getByLabelText('E-mail'), 'joao@exemplo.com')
    
    // Selecionar cargo
    const cargoSelect = screen.getByLabelText('Cargo')
    await user.click(cargoSelect)
    await user.click(screen.getByText('Zelador'))
    
    // Submeter formulário
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    // Verificar sucesso
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('should show validation errors', async () => {
    const user = userEvent.setup()
    
    render(<NovoColaboradorModal isOpen={true} onClose={() => {}} />)
    
    // Tentar submeter sem preencher
    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)
    
    // Verificar mensagens de erro
    expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    expect(screen.getByText('CPF é obrigatório')).toBeInTheDocument()
  })
})
```

---

## 6. Cobertura Atual

### Por Módulo

| Módulo | Arquivos | Cobertura | Status |
|--------|----------|-----------|--------|
| **utils/** | 8/8 | 95% | ✅ Excelente |
| **lib/** | 6/10 | 85% | ✅ Bom |
| **hooks/** | 5/8 | 80% | ✅ Adequado |
| **components/shared/** | 10/20 | 75% | 🟡 Melhorar |
| **components/modals/** | 3/15 | 50% | 🔴 Crítico |
| **app/** | 0/30 | 0% | 🔴 Criar |

### Meta Global

- ✅ **Atual**: 62%
- 🎯 **Meta**: 80%
- 📈 **Próximos passos**: Focar em components/modals/ e app/

---

## 7. Guia de Escrita de Testes

### Padrão AAA (Arrange, Act, Assert)

```typescript
describe('Feature', () => {
  it('should do something', () => {
    // Arrange (preparar)
    const input = 'test'
    
    // Act (executar)
    const result = myFunction(input)
    
    // Assert (verificar)
    expect(result).toBe('expected')
  })
})
```

### Nomenclatura de Testes

✅ **Bom:**
```typescript
it('should format currency with 2 decimal places')
it('should throw error when CPF is invalid')
it('should render button with correct label')
```

❌ **Ruim:**
```typescript
it('test 1')
it('works')
it('button')
```

### Estrutura de Describe

```typescript
describe('ComponentName', () => {
  describe('Method/Feature 1', () => {
    it('should do X when Y', () => {})
    it('should do Z when W', () => {})
  })
  
  describe('Method/Feature 2', () => {
    it('should ...', () => {})
  })
})
```

---

## 8. Mocking

### Mock de Módulos

```typescript
// Mock do Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  }),
}))
```

### Mock de Hooks

```typescript
// Mock do useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', nome: 'Test User', perfil: 'admin' },
    login: jest.fn(),
    logout: jest.fn(),
  }),
}))
```

### Mock de Funções

```typescript
const mockCallback = jest.fn()

// Usar
myComponent({ onSuccess: mockCallback })

// Verificar
expect(mockCallback).toHaveBeenCalled()
expect(mockCallback).toHaveBeenCalledWith({ id: '1' })
expect(mockCallback).toHaveBeenCalledTimes(1)
```

### Mock de Timers

```typescript
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

it('should debounce', () => {
  const callback = jest.fn()
  const debounced = debounce(callback, 1000)
  
  debounced()
  debounced()
  debounced()
  
  jest.advanceTimersByTime(1000)
  
  expect(callback).toHaveBeenCalledTimes(1)
})
```

---

## 9. Melhores Práticas

### ✅ Fazer

1. **Testar comportamento, não implementação**
```typescript
// ✅ Bom
expect(screen.getByText('Salvar')).toBeInTheDocument()

// ❌ Ruim
expect(component.state.buttonText).toBe('Salvar')
```

2. **Usar queries acessíveis**
```typescript
// Ordem de preferência (mais acessível → menos)
getByRole('button', { name: /salvar/i })
getByLabelText('Nome')
getByPlaceholderText('Digite seu nome')
getByText('Salvar')
getByTestId('save-button') // último recurso
```

3. **Testar casos extremos**
```typescript
it('should handle empty string', () => {})
it('should handle null', () => {})
it('should handle very large numbers', () => {})
it('should handle special characters', () => {})
```

4. **Manter testes isolados**
```typescript
beforeEach(() => {
  // Resetar estado antes de cada teste
})

afterEach(() => {
  // Limpar após cada teste
  jest.clearAllMocks()
})
```

5. **Usar matchers apropriados**
```typescript
expect(value).toBe(true)              // Igualdade estrita
expect(array).toEqual([1, 2, 3])      // Igualdade profunda
expect(string).toMatch(/regex/)       // Regex
expect(element).toBeInTheDocument()   // DOM
expect(fn).toHaveBeenCalled()         // Mocks
```

### ❌ Evitar

1. **Testes dependentes**
```typescript
// ❌ Ruim - teste 2 depende do teste 1
it('should create user', () => {
  userId = createUser()
})

it('should update user', () => {
  updateUser(userId) // Depende do teste anterior
})
```

2. **Testar implementação**
```typescript
// ❌ Ruim
expect(component.state.count).toBe(5)

// ✅ Bom
expect(screen.getByText('5')).toBeInTheDocument()
```

3. **Snapshots excessivos**
```typescript
// ❌ Ruim - snapshot de componente inteiro
expect(component).toMatchSnapshot()

// ✅ Bom - testar propriedades específicas
expect(component).toHaveTextContent('Expected')
```

---

## 10. CI/CD Integration

### GitHub Actions

Arquivo `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

---

## 11. Roadmap de Testes

### Curto Prazo (1-2 semanas)
- [x] Configurar Jest e React Testing Library
- [x] Criar testes de utilitários (100%)
- [x] Criar testes de calculations (95%)
- [ ] Criar testes de componentes shared (meta: 80%)
- [ ] Criar testes de hooks (meta: 80%)

### Médio Prazo (1 mês)
- [ ] Criar testes de modais (meta: 70%)
- [ ] Criar testes de páginas principais (meta: 60%)
- [ ] Integrar coverage em CI/CD
- [ ] Documentar padrões de teste

### Longo Prazo (3 meses)
- [ ] Atingir 80%+ de cobertura global
- [ ] Testes E2E com Playwright
- [ ] Testes de performance
- [ ] Testes de acessibilidade

---

## 12. Recursos Úteis

### Documentação
- [Jest](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)

### Ferramentas
- [Testing Playground](https://testing-playground.com/)
- [Jest Coverage Reports](https://jestjs.io/docs/configuration#collectcoverage-boolean)

### Artigos Recomendados
- [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Avoid the Test User](https://kentcdodds.com/blog/avoid-the-test-user)

---

**Última atualização**: Janeiro 2024  
**Cobertura atual**: 62%  
**Meta**: 80%+ até Março 2024
