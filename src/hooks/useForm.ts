import { useState, ChangeEvent } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  setValues: (values: T) => void;
}

/**
 * Hook para gerenciar formulários
 * @param options - Opções de configuração do formulário
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setValues((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Limpar erro quando o campo for editado
    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleBlur = (field: keyof T) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    // Validar campo ao perder foco
    if (validate) {
      const fieldErrors = validate(values);
      if (fieldErrors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: fieldErrors[field],
        }));
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Marcar todos os campos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);

    // Validar
    if (validate) {
      const formErrors = validate(values);
      setErrors(formErrors);

      // Se houver erros, não submeter
      if (Object.keys(formErrors).length > 0) {
        return;
      }
    }

    // Submeter
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
    setValues,
  };
}

/**
 * Exemplo de uso:
 * 
 * const form = useForm({
 *   initialValues: {
 *     nome: '',
 *     email: '',
 *     senha: '',
 *   },
 *   validate: (values) => {
 *     const errors: any = {};
 *     if (!values.nome) errors.nome = 'Nome é obrigatório';
 *     if (!values.email) errors.email = 'Email é obrigatório';
 *     return errors;
 *   },
 *   onSubmit: async (values) => {
 *     await api.post('/users', values);
 *   },
 * });
 * 
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     <Input
 *       name="nome"
 *       value={form.values.nome}
 *       onChange={form.handleChange}
 *       onBlur={() => form.handleBlur('nome')}
 *       error={form.touched.nome && form.errors.nome}
 *     />
 *     <Button type="submit" disabled={form.isSubmitting}>
 *       Enviar
 *     </Button>
 *   </form>
 * );
 */
