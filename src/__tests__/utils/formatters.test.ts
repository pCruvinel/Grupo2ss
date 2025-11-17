import { formatCurrency, formatDate, formatCPF, formatCNPJ } from '@/utils/formatters'

describe('Formatters Utils', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56')
      expect(formatCurrency(0.99)).toBe('R$ 0,99')
    })

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1000)).toBe('-R$ 1.000,00')
      expect(formatCurrency(-1234.56)).toBe('-R$ 1.234,56')
    })

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('R$ 0,00')
    })

    it('should handle very large numbers', () => {
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00')
      expect(formatCurrency(1234567.89)).toBe('R$ 1.234.567,89')
    })
  })

  describe('formatDate', () => {
    it('should format ISO date string correctly', () => {
      expect(formatDate('2024-01-15')).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should format Date object correctly', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(date)).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should handle invalid dates gracefully', () => {
      expect(() => formatDate('invalid')).not.toThrow()
    })
  })

  describe('formatCPF', () => {
    it('should format valid CPF', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01')
    })

    it('should handle already formatted CPF', () => {
      expect(formatCPF('123.456.789-01')).toBe('123.456.789-01')
    })

    it('should handle partial CPF', () => {
      expect(formatCPF('123456')).toBe('123.456')
    })

    it('should handle empty string', () => {
      expect(formatCPF('')).toBe('')
    })
  })

  describe('formatCNPJ', () => {
    it('should format valid CNPJ', () => {
      expect(formatCNPJ('12345678000190')).toBe('12.345.678/0001-90')
    })

    it('should handle already formatted CNPJ', () => {
      expect(formatCNPJ('12.345.678/0001-90')).toBe('12.345.678/0001-90')
    })

    it('should handle partial CNPJ', () => {
      expect(formatCNPJ('12345678')).toBe('12.345.678')
    })

    it('should handle empty string', () => {
      expect(formatCNPJ('')).toBe('')
    })
  })
})
