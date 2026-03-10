/**
 * Core: matemática pura de percentual.
 * Sem conhecimento de contrato ou UI.
 */

/**
 * Percentual de um valor: valor * percent / 100
 * Ex.: percentOf(1000, 0.38) = 3.80 (IOF 0,38%)
 */
export function percentOf(value: number, percent: number): number {
  if (value < 0) return 0
  return (value * percent) / 100
}

/**
 * Aplica dedução percentual: valor * (1 - percent / 100)
 * Ex.: applyPercentDeduction(1000, 0.38) = 996,20 (valor líquido após IOF 0,38%)
 */
export function applyPercentDeduction(value: number, percent: number): number {
  if (value < 0) return value
  return value * (1 - percent / 100)
}
