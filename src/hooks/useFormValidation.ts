import { useState, useCallback, useMemo } from 'react';
import type { FormState, FormErrors } from '../types';

interface ValidationRule<T> {
  field: keyof T;
  validate: (value: unknown, values: Partial<T>) => string | undefined;
}

interface UseFormValidationOptions<T> {
  initialValues: Partial<T>;
  validationRules?: ValidationRule<T>[];
  onSubmit: (values: Partial<T>) => void | Promise<void>;
}

/**
 * Hook reutilizável para validação de formulários
 * Elimina lógica duplicada em modais de cadastro/edição
 * 
 * @example
 * const form = useFormValidation({
 *   initialValues: { nome: '', cpf: '' },
 *   validationRules: [
 *     { field: 'nome', validate: v => !v ? 'Nome obrigatório' : undefined },
 *     { field: 'cpf', validate: v => !isValidCPF(v) ? 'CPF inválido' : undefined }
 *   ],
 *   onSubmit: async (values) => {
 *     await createColaborador(values);
 *   }
 * });
 * 
 * <Input
 *   value={form.values.nome}
 *   onChange={e => form.setValue('nome', e.target.value)}
 *   onBlur={() => form.touchField('nome')}
 *   error={form.touched.nome && form.errors.nome}
 * />
 * 
 * <Button onClick={form.handleSubmit} disabled={!form.isValid}>
 *   Salvar
 * </Button>
 */
export function useFormValidation<T extends Record<string, unknown>>(
  options: UseFormValidationOptions<T>
): FormState<T> & {
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  touchField: (field: keyof T) => void;
  touchAllFields: () => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
} {
  const { initialValues, validationRules = [], onSubmit } = options;

  const [values, setValuesState] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar um campo específico
  const validateField = useCallback(
    (field: keyof T, value: unknown): string | undefined => {
      const rule = validationRules.find(r => r.field === field);
      return rule ? rule.validate(value, values) : undefined;
    },
    [validationRules, values]
  );

  // Validar todos os campos
  const validateAllFields = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};
    validationRules.forEach(rule => {
      const error = rule.validate(values[rule.field], values);
      if (error) {
        newErrors[rule.field as string] = error;
      }
    });
    return newErrors;
  }, [validationRules, values]);

  // Definir valor de um campo
  const setValue = useCallback(
    (field: keyof T, value: unknown) => {
      setValuesState(prev => ({ ...prev, [field]: value }));
      
      // Validar em tempo real se o campo já foi tocado
      if (touched[field as string]) {
        const error = validateField(field, value);
        setErrors(prev => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [touched, validateField]
  );

  // Definir múltiplos valores
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  // Marcar campo como tocado
  const touchField = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar o campo
    const error = validateField(field, values[field]);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, [validateField, values]);

  // Marcar todos os campos como tocados
  const touchAllFields = useCallback(() => {
    const allTouched = validationRules.reduce((acc, rule) => {
      acc[rule.field as string] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setTouched(allTouched);
    setErrors(validateAllFields());
  }, [validationRules, validateAllFields]);

  // Verificar se o formulário é válido
  const isValid = useMemo(() => {
    const currentErrors = validateAllFields();
    return Object.keys(currentErrors).length === 0;
  }, [validateAllFields]);

  // Submeter formulário
  const handleSubmit = useCallback(async () => {
    // Marcar todos os campos como tocados
    touchAllFields();
    
    // Validar
    const currentErrors = validateAllFields();
    setErrors(currentErrors);
    
    if (Object.keys(currentErrors).length > 0) {
      return;
    }
    
    // Submeter
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [touchAllFields, validateAllFields, onSubmit, values]);

  // Resetar formulário
  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setValues,
    touchField,
    touchAllFields,
    handleSubmit,
    reset,
  };
}