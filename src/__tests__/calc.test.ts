import { describe, it, expect } from 'vitest'
import { evalWithPrecedence, useStore } from '../store'

describe('evalWithPrecedence', () => {
  it('retorna o único número quando há um token', () => {
    expect(evalWithPrecedence([6])).toBe(6)
    expect(evalWithPrecedence([0])).toBe(0)
  })

  it('aplica precedência: × e ÷ antes de + e −', () => {
    // 6 − 5×2×2 = 6 − 20 = −14
    expect(evalWithPrecedence([6, '-', 5, '×', 2, '×', 2])).toBe(-14)
  })

  it('calcula só adição e subtração na ordem', () => {
    expect(evalWithPrecedence([10, '+', 5, '-', 3])).toBe(12)
    expect(evalWithPrecedence([1, '-', 2, '+', 3])).toBe(2)
  })

  it('calcula só multiplicação e divisão na ordem', () => {
    expect(evalWithPrecedence([10, '×', 2, '÷', 4])).toBe(5)
    expect(evalWithPrecedence([3, '×', 4, '×', 2])).toBe(24)
  })

  it('mistura operadores com precedência correta', () => {
    // 2 + 3×4 = 2 + 12 = 14
    expect(evalWithPrecedence([2, '+', 3, '×', 4])).toBe(14)
    // 20 ÷ 2 − 3 = 10 − 3 = 7
    expect(evalWithPrecedence([20, '÷', 2, '-', 3])).toBe(7)
    // 1 + 2×3 + 4 = 1 + 6 + 4 = 11
    expect(evalWithPrecedence([1, '+', 2, '×', 3, '+', 4])).toBe(11)
  })

  it('retorna null para array vazio', () => {
    expect(evalWithPrecedence([])).toBe(null)
  })

  it('retorna null para um único operador', () => {
    expect(evalWithPrecedence(['+'])).toBe(null)
  })

  it('divisão por zero retorna null', () => {
    expect(evalWithPrecedence([1, '÷', 0])).toBe(null)
  })
})

describe('calcGraph com etapa de 2 entradas', () => {
  it('calcula divisão (custo ÷ quantidade) e adição (restante + lucro) corretamente', () => {
    const loadFlow = useStore.getState().loadFlow

    const flow = {
      nodes: {
        n0: { id: 'n0', type: 'origem', value: 600, position: { x: 0, y: 0 } },
        n1: { id: 'n1', type: 'origem', value: 30, position: { x: 0, y: 80 } },
        n2: { id: 'n2', type: 'etapa', value: null, operation: '÷' as const, position: { x: 200, y: 40 } },
        n3: { id: 'n3', type: 'origem', value: 400, position: { x: 0, y: 200 } },
        n4: { id: 'n4', type: 'origem', value: 150, position: { x: 0, y: 280 } },
        n5: { id: 'n5', type: 'etapa', value: 0, operation: '+' as const, position: { x: 200, y: 240 } },
      },
      edges: [
        { id: 'e0', sourceId: 'n0', targetId: 'n2', operation: '÷' },
        { id: 'e1', sourceId: 'n1', targetId: 'n2', operation: '÷' },
        { id: 'e2', sourceId: 'n3', targetId: 'n5', operation: '+' },
        { id: 'e3', sourceId: 'n4', targetId: 'n5', operation: '+' },
      ],
    }
    loadFlow(flow)
    const values = useStore.getState().values

    expect(values.n2).toBe(20)
    expect(values.n5).toBe(550)
  })
})
