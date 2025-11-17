# Modais - Sistema ERP Grupo 2S

## 📋 Visão Geral

Este diretório contém todos os modais do sistema, seguindo padrões de qualidade, acessibilidade e performance.

## 🎯 Padrões de Implementação

### 1. Estrutura Base

Todos os modais devem seguir esta estrutura:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { formatarXXX } from '../../lib/formatters';
import { validarXXX } from '../../lib/validators';
import type { XXXModalProps, XXX, FormErrors } from '../../types/modals';

export function XXXModal({ open, onClose, onSave, ...props }: XXXModalProps) {
  // 1. Estado inicial
  const initialFormData = { ... };
  
  // 2. Estados
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // 3. Detectar mudanças
  useEffect(() => {
    const hasChanges = /* lógica */;
    setIsDirty(hasChanges);
  }, [formData]);
  
  // 4. Reset ao fechar
  useEffect(() => {
    if (!open) {
      setFormData(initialFormData);
      setErrors({});
      setIsDirty(false);
    }
  }, [open]);
  
  // 5. Validação
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    // Validações...
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);
  
  // 6. Confirmação de saída
  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm('Deseja sair sem salvar?')) {
      return;
    }
    onClose();
  }, [isDirty, onClose]);
  
  // 7. Salvamento
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Corrija os erros');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success('Salvo com sucesso!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* Conteúdo */}
    </Dialog>
  );
}
```

### 2. Validação de Campos

#### Usar Validadores Centralizados

```typescript
import { 
  validarCPF, 
  validarEmail, 
  validarPlaca,
  validarTextoObrigatorio 
} from '../../lib/validators';

// No validateForm()
if (!validarTextoObrigatorio(formData.nome)) {
  newErrors.nome = 'Nome é obrigatório';
}

if (!validarEmail(formData.email)) {
  newErrors.email = 'Email inválido';
}
```

#### Mensagens de Erro Descritivas

```typescript
// ❌ Ruim
newErrors.cpf = 'Inválido';

// ✅ Bom
newErrors.cpf = 'CPF inválido. Use formato 000.000.000-00';
```

### 3. Formatação de Campos

Use os formatadores ao atualizar campos:

```typescript
import { formatarCPF, formatarTelefone, formatarMoeda } from '../../lib/formatters';

<Input
  value={formData.cpf}
  onChange={(e) => updateField('cpf', formatarCPF(e.target.value))}
/>
```

### 4. Acessibilidade (ARIA)

Todos os campos obrigatórios devem ter atributos ARIA:

```typescript
<Label htmlFor="email">Email *</Label>
<Input
  id="email"
  type="email"
  value={formData.email}
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
  aria-required="true"
  disabled={isLoading}
  className={errors.email ? 'border-red-500' : ''}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-xs text-red-500 mt-1 flex items-center gap-1">
    <AlertCircle className="w-3 h-3" />
    {errors.email}
  </p>
)}
```

### 5. Loading States

Sempre implementar estado de loading:

```typescript
<Button 
  onClick={handleSave}
  disabled={isLoading}
>
  {isLoading ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Salvando...
    </>
  ) : (
    'Salvar'
  )}
</Button>
```

### 6. TypeScript Completo

**NUNCA** use `any`:

```typescript
// ❌ Ruim
interface Props {
  onSave: (data: any) => void;
}

// ✅ Bom
import type { Colaborador } from '../../types/modals';

interface Props {
  onSave: (data: Omit<Colaborador, 'id'>) => Promise<void>;
}
```

### 7. Responsividade

Usar classes Tailwind responsivas:

```typescript
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Campos */}
  </div>
</DialogContent>
```

## 📚 Lista de Modais

### Colaboradores
- `NovoColaboradorModal.tsx` - Cadastrar colaborador
- `EditarColaboradorModal.tsx` - Editar colaborador

### Materiais
- `NovoMaterialModal.tsx` - Cadastrar material
- `EditarMaterialModal.tsx` - Editar material
- `BloquearMaterialModal.tsx` - Bloquear quantidade
- `HistoricoMaterialModal.tsx` - Visualizar movimentações

### Ordens de Serviço
- `NovaOrdemServicoModal.tsx` - Criar ordem
- `EditarOrdemServicoModal.tsx` - Editar ordem
- `FinalizarOrdemServicoModal.tsx` - Finalizar com fotos

### Despesas
- `NovaDespesaModal.tsx` - Cadastrar despesa com rateio
- `UploadComprovanteModal.tsx` - Upload de comprovante

### Contratos
- `NovoContratoModal.tsx` - Criar contrato
- `ContratoModal.tsx` - Visualizar/Editar contrato
- `NovoPagamentoModal.tsx` - Registrar pagamento

### Veículos
- `NovoVeiculoModal.tsx` - Cadastrar veículo ✅ REFATORADO
- `EditarVeiculoModal.tsx` - Editar veículo

### Ponto Eletrônico
- `RegistroPontoManualModal.tsx` - Registro manual
- `JustificativaAusenciaModal.tsx` - Justificar falta
- `PontoModal.tsx` - Visualizar registros

### Usuários
- `NovoUsuarioModal.tsx` - Criar usuário
- `ResetSenhaModal.tsx` - Redefinir senha

### Base
- `TwoColumnModal.tsx` - Modal base com 2 colunas

## 🔍 Exemplo Completo

Ver `/components/modals/NovoVeiculoModal.tsx` como referência completa de implementação.

## ✅ Checklist de Qualidade

Antes de fazer PR, verificar:

- [ ] TypeScript 100% (sem `any`)
- [ ] Validações usando `/lib/validators.ts`
- [ ] Formatações usando `/lib/formatters.ts`
- [ ] Loading state implementado
- [ ] Confirmação ao sair com dados não salvos
- [ ] ARIA attributes em campos obrigatórios
- [ ] Mensagens de erro descritivas
- [ ] Tratamento de erros com try/catch
- [ ] Toast notifications (success/error)
- [ ] Responsividade mobile
- [ ] Código limpo e comentado

## 🎨 Identidade Visual

Seguir as cores do sistema:

```typescript
const CORES = {
  primary: '#1F4788',      // Azul principal
  success: '#28A745',      // Verde sucesso
  error: '#DC3545',        // Vermelho erro
  warning: '#FFC107',      // Amarelo aviso
  gray: '#6C757D',         // Cinza neutro
};
```

## 📖 Documentação Adicional

- [Validadores](/lib/validators.ts)
- [Formatadores](/lib/formatters.ts)
- [Tipos](/types/modals.ts)
- [Hook useDebounce](/hooks/useDebounce.ts)

## 🚀 Performance

### Otimizações Implementadas

1. **useCallback** para funções estáveis
2. **useEffect** com dependências corretas
3. **Validação lazy** (só ao salvar)
4. **Importações dinâmicas** quando possível

## 🐛 Troubleshooting

### Modal não abre
- Verificar prop `open={true}`
- Verificar se DialogContent está renderizado

### Validações não funcionam
- Importar validadores de `/lib/validators.ts`
- Verificar se `validateForm()` está sendo chamado

### Erro de TypeScript
- Verificar tipos em `/types/modals.ts`
- Nunca usar `any`

## 👥 Contribuindo

Ao adicionar novo modal:

1. Criar interface em `/types/modals.ts`
2. Implementar seguindo estrutura base
3. Adicionar na lista deste README
4. Testar acessibilidade
5. Documentar campos especiais

---

**Última atualização:** Novembro 2024  
**Responsável:** Equipe Dev Grupo 2S
