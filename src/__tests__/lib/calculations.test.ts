import { calcularRateio, calcularParcelas, calcularHorasTrabalhadas } from '@/lib/calculations'

describe('Calculations Library', () => {
  describe('calcularRateio', () => {
    it('should calculate single company rateio (100%)', () => {
      const resultado = calcularRateio(1000, [
        { empresa_id: '1', percentual: 100 }
      ])
      expect(resultado).toEqual([
        { empresa_id: '1', percentual: 100, valor: 1000 }
      ])
    })

    it('should calculate percentage rateio', () => {
      const resultado = calcularRateio(1000, [
        { empresa_id: '1', percentual: 60 },
        { empresa_id: '2', percentual: 40 }
      ])
      expect(resultado).toEqual([
        { empresa_id: '1', percentual: 60, valor: 600 },
        { empresa_id: '2', percentual: 40, valor: 400 }
      ])
    })

    it('should calculate equal rateio', () => {
      const resultado = calcularRateio(900, [
        { empresa_id: '1', percentual: 33.33 },
        { empresa_id: '2', percentual: 33.33 },
        { empresa_id: '3', percentual: 33.34 }
      ])
      expect(resultado[0].valor).toBeCloseTo(300, 0)
      expect(resultado[1].valor).toBeCloseTo(300, 0)
      expect(resultado[2].valor).toBeCloseTo(300, 0)
    })

    it('should throw error if percentages do not sum to 100', () => {
      expect(() => {
        calcularRateio(1000, [
          { empresa_id: '1', percentual: 50 },
          { empresa_id: '2', percentual: 40 }
        ])
      }).toThrow()
    })
  })

  describe('calcularParcelas', () => {
    it('should calculate equal installments', () => {
      const resultado = calcularParcelas(1200, 12, '2024-01-01')
      expect(resultado).toHaveLength(12)
      expect(resultado[0].valor).toBe(100)
      expect(resultado[0].numero_parcela).toBe(1)
      expect(resultado[11].numero_parcela).toBe(12)
    })

    it('should handle uneven division', () => {
      const resultado = calcularParcelas(1000, 3, '2024-01-01')
      expect(resultado).toHaveLength(3)
      // 1000 / 3 = 333.33 + 333.33 + 333.34
      expect(resultado[0].valor).toBeCloseTo(333.33, 2)
      expect(resultado[2].valor).toBeCloseTo(333.34, 2)
    })

    it('should calculate correct due dates', () => {
      const resultado = calcularParcelas(1200, 3, '2024-01-01')
      expect(resultado[0].data_vencimento).toBe('2024-01-01')
      expect(resultado[1].data_vencimento).toBe('2024-02-01')
      expect(resultado[2].data_vencimento).toBe('2024-03-01')
    })
  })

  describe('calcularHorasTrabalhadas', () => {
    it('should calculate full workday (8 hours)', () => {
      const horas = calcularHorasTrabalhadas(
        '08:00',
        '12:00',
        '13:00',
        '17:00'
      )
      expect(horas).toBe(8.0)
    })

    it('should calculate partial workday', () => {
      const horas = calcularHorasTrabalhadas(
        '08:00',
        '12:00',
        '13:00',
        '16:00'
      )
      expect(horas).toBe(7.0)
    })

    it('should handle missing lunch times', () => {
      const horas = calcularHorasTrabalhadas(
        '08:00',
        null,
        null,
        '17:00'
      )
      expect(horas).toBe(9.0)
    })

    it('should handle overtime', () => {
      const horas = calcularHorasTrabalhadas(
        '08:00',
        '12:00',
        '13:00',
        '19:00'
      )
      expect(horas).toBe(10.0)
    })

    it('should return 0 for missing entry', () => {
      const horas = calcularHorasTrabalhadas(
        null,
        null,
        null,
        null
      )
      expect(horas).toBe(0)
    })
  })
})
