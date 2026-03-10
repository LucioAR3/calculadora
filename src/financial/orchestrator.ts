/**
 * Orchestrator: executa o fluxo linear.
 * Recebe ProcessDefinition; aplica contrato; aplica modificadores em ordem; retorna valor final e histórico.
 * Determinístico: mesma entrada = mesma saída.
 */

import type { ProcessDefinition } from './domain'
import { simulateSimpleInterest } from './calculators/simpleSimulator'
import { simulateCompoundInterest } from './calculators/compoundSimulator'
import { applyPercentDeduction } from './core'

export interface HistoryStep {
  step: 'initial' | 'after_contract' | 'after_modifier'
  value: number
  description: string
}

export interface OrchestratorResult {
  finalValue: number
  history: HistoryStep[]
}

/**
 * Executa o processo linear: capital inicial → contrato → modificadores (em ordem) → valor final.
 */
export function runProcess(definition: ProcessDefinition): OrchestratorResult {
  const history: HistoryStep[] = []
  const { contract, modifiers } = definition

  const principal = contract.principal
  history.push({ step: 'initial', value: principal, description: 'Capital inicial' })

  let current =
    contract.kind === 'simple_interest'
      ? simulateSimpleInterest(contract).amount
      : simulateCompoundInterest(contract).amount
  history.push({
    step: 'after_contract',
    value: current,
    description: contract.kind === 'simple_interest' ? 'Após juros simples' : 'Após juros compostos',
  })

  for (let i = 0; i < modifiers.length; i++) {
    const mod = modifiers[i]
    if (mod.kind === 'percent_deduction') {
      current = applyPercentDeduction(current, mod.percent)
    }
    history.push({
      step: 'after_modifier',
      value: current,
      description: `Após modificador ${i + 1} (${mod.kind}, ${mod.percent}%)`,
    })
  }

  return { finalValue: current, history }
}
