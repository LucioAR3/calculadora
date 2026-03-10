/**
 * ProcessDefinition: descrição do fluxo linear.
 * Origin → Contract → Modifiers (ordem) → Destination.
 */

import type { Entity } from './entity'
import type { FinancialContract } from './contract'
import type { Modifier } from './modifier'

export interface ProcessDefinition {
  origin: Entity
  contract: FinancialContract
  /** Modificadores aplicados em ordem após o contrato */
  modifiers: Modifier[]
  destination: Entity
}
