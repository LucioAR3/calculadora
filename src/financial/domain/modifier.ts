/**
 * Modificador: ajuste aplicado após o contrato (ex.: taxa, IOF, desconto).
 * Apenas dados; aplicação em sequência fica no Orchestrator.
 */

export interface PercentDeductionModifier {
  kind: 'percent_deduction'
  /** Percentual (ex.: 0.38 = 0,38%) */
  percent: number
}

export type Modifier = PercentDeductionModifier
