/**
 * Contrato financeiro mínimo (Domain).
 * Apenas tipos; sem dependência do Core.
 */

export type ContractKind = 'simple_interest' | 'compound_interest'

export interface SimpleInterestContract {
  kind: 'simple_interest'
  /** Valor principal (monetário) */
  principal: number
  /** Taxa de juros por período (ex.: 0.01 = 1% ao mês) */
  ratePerPeriod: number
  /** Número de períodos */
  periods: number
}

export interface CompoundInterestContract {
  kind: 'compound_interest'
  /** Valor principal (monetário) */
  principal: number
  /** Taxa de juros por período (ex.: 0.01 = 1% ao mês) */
  ratePerPeriod: number
  /** Número de períodos */
  periods: number
}

export type FinancialContract = SimpleInterestContract | CompoundInterestContract
