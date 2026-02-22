# Regra: ordem das etapas (1ª, 2ª, 3ª…)

**Objetivo:** Classificar cada card de tipo **Etapa** pela sua posição no fluxo em relação às origens, para leitura e auditoria.

## Definição

- **Origem:** não é etapa; considera-se “camada 0”.
- **1ª etapa:** toda etapa cujas entradas vêm **apenas** de origens.
- **2ª etapa:** toda etapa que tem **pelo menos uma** entrada vinda de uma 1ª etapa (as demais podem ser origem ou 1ª).
- **3ª etapa:** toda etapa que tem **pelo menos uma** entrada vinda de uma 2ª etapa.
- E assim por diante.

Em termos de grafo: para cada nó, a **ordem** é `0` para origem e `1 + max(ordem das entradas)` para etapa (e resultado). Essa ordem é a “N” em “Nª etapa”.

## Regra quando há duas entradas

Se uma etapa recebe de **duas origens**, é **1ª etapa** (1 + max(0, 0) = 1).  
Se recebe de **uma origem e uma 1ª etapa**, é **2ª etapa** (1 + max(0, 1) = 2).  
Ou seja: a etapa fica sempre **uma camada após** a entrada mais “avançada”.

## Onde aparece

- No **card da Etapa**: badge/texto **“1ª etapa”**, **“2ª etapa”**, **“3ª etapa”** etc., ao lado da área de Impacto (só quando a ordem é ≥ 1).
- Origens e cards de Resultado não exibem essa classificação no card (a lógica interna ainda pode usar a mesma ordem para futuras funções).

## Implementação

- **Store:** `getStageOrderMap(nodes, edges)` em `store.ts`. Usa a ordem topológica do grafo e, para cada nó, atribui ordem 0 a origem e `1 + max(ordem das entradas)` aos demais. Retorna `Record<nodeId, number>`.
- **Card:** Para `node.type === 'etapa'`, lê a ordem do mapa e exibe “Nª etapa” quando `N >= 1`.

## Exemplo (fluxo dívida 12 meses)

- Origens: Empréstimo, Parcelas, Juros %, Multa % → ordem 0.
- Taxa decimal juros, Juros por mês, Taxa decimal multa, Multa por parcela → entram só de origens → **1ª etapa**.
- Total juros 12 meses (vem de 1ª etapa + origem), Dívida total (vem de origem + 1ª etapa) → **2ª etapa**.

Documentado para testes no fluxo atual e evolução (ex.: relatórios por “camada” de cálculo).
