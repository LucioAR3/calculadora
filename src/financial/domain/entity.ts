/**
 * Entidade: participante do processo (origem ou destino).
 * Apenas dados; não calcula nada.
 */

export type EntityRole = 'origin' | 'destination'

export interface Entity {
  id: string
  name: string
  role: EntityRole
}
