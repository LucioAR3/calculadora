# Padrão numérico — fluxo financeiro (BR)

Os valores do fluxo financeiro seguem o **padrão brasileiro**: unidades, dezenas, centenas, milhares, milhões etc., com:

- **Decimal:** vírgula (`,`)
- **Milhares/milhões:** ponto (`.`)

## Exemplos

| Valor   | Exibição      |
|--------|----------------|
| 0,5    | 0,50           |
| 1      | 1              |
| 1,00   | 1,00           |
| 1000   | 1.000          |
| 1000,5 | 1.000,50       |
| 1e6    | 1.000.000      |
| 1e6,25 | 1.000.000,25   |

## Onde está implementado

- **`src/utils/numbers.ts`**: `formatDecimalBR`, `parseDecimalBR`, `formatDisplayBR` (comentário no topo do arquivo).
- **Card**: input e exibição de valor (origem/etapa/resultado) em BR; aceita digitação com `,` ou `.` (parse aceita ambos).
- **Calculator**: display com vírgula decimal; tecla decimal mostra `,`; fórmula e valores em BR.
- **SimuladorJuros**: resumo e tabela de evolução em BR.

Internamente os valores continuam como **número** (float); arredondamento em 2 decimais via `to2Decimals` no store.
