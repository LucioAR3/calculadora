# Financial Engine — Alinhamento estrutural (pré-implementação)

**Objetivo:** Confirmar entendimento, mapear o existente, propor estrutura e escopo da primeira iteração. Nenhum código do modo básico será alterado.

---

## 1. Entendimento do que estamos construindo

- **Motor financeiro** = camada adicional, isolada, que estende (não substitui) o modo básico.
- **Modo básico:** operações matemáticas livres, fluxo em grafo (origem → etapa → resultado), sem entidade jurídica, sem contrato.
- **Modo financeiro (futuro):** entidades, eventos, fluxo de caixa estruturado, contrato mínimo, possibilidade futura de regras regulatórias e rastreamento.
- **Primeira meta:** núcleo mínimo que permita **simular um contrato simples com juros**. Nada de SAC, Price, IOF, CET, auditoria persistente, BD, regras Bacen/CVM, múltiplos produtos.

---

## 2. Mapeamento do que já existe (modo básico)

| Onde | O quê | Reuso no Financial Engine? |
|------|--------|-----------------------------|
| `src/types.ts` | `GraphNode`, `GraphEdge`, `NodeType`, `Operation` | **Não** — são tipos de grafo/fluxo. O engine financeiro terá seus próprios tipos (contrato, entidades). Evita conflito e acoplamento. |
| `src/store.ts` | `evalWithPrecedence` (matemática com precedência), `calcGraph`, `topoSort`, `applyOp` (+ − × ÷) | **Não importar** no engine. O engine terá seu próprio **Core** de matemática pura (ex.: juros simples). Reutilizar *conceito* (funções puras, determinísticas), não o módulo. |
| `src/store.ts` | `nodes`, `edges`, `values`, `addResultado`, `calc`, etc. | **Não tocar.** UI e fluxo básico continuam 100% como estão. |
| `src/components/Calculator.tsx` | Calculadora básica; chama `addResultado(..., { evalPrecedence: true })` | **Não alterar.** Lógica financeira não entra aqui. Quando houver integração, será via **adaptador** que a UI chama (engine não depende da UI). |
| `src/components/Card.tsx`, `Whiteboard.tsx`, etc. | Fluxo visual, cards, arestas | **Não alterar.** O engine é consumido pela UI; nunca depende de componentes. |
| `docs/analise-logica-evolucao-financeira.md` | Direção entrada/saída, fluxo de caixa, digitalização | Referência de domínio; não gera código compartilhado com o básico. |

**Conclusão:** Nenhuma lógica financeira na UI. Nenhuma alteração nos contratos de dados já usados pelo modo básico. Se a UI precisar enviar/receber dados do engine, usar **adaptadores** na borda (UI ↔ Engine), sem mudar `types.ts` nem `store.ts` para fins financeiros.

---

## 3. Princípio arquitetural e dependências

Camadas obrigatórias (apenas as três primeiras nesta fase):

- **Core** — matemática pura (ex.: juros simples). Sem conhecimento de contrato, entidade ou UI.
- **Domain** — contratos e entidades (tipos, estruturas de dados). **Não depende do Core** (regra inviolável).
- **Calculators** — aplicação de regras financeiras; **usa** Core + Domain. Funções determinísticas: mesma entrada → mesma saída.

Garantias:

- Nenhuma dependência circular: Domain → (nada); Core → (nada); Calculators → Domain, Core.
- Determinístico, sem efeitos colaterais, sem dependências externas nesta fase.
- Regras regulatórias (Bacen, CVM, etc.) **não** entram no Core nem nesta primeira iteração.

---

## 4. Estrutura de pastas proposta

```
src/
  financial/
    core/
      index.ts         # export da API pública do core
      interest.ts      # ex.: juros simples (principal, taxa, períodos) → número
    domain/
      index.ts         # export dos tipos/contratos
      contract.ts      # contrato mínimo (ex.: principal, taxa, períodos, tipo)
    calculators/
      index.ts         # export dos simuladores
      simpleSimulator.ts  # simula contrato simples com juros (usa domain + core)
    index.ts           # facade: expõe só o que a UI/adaptador precisar
  types.ts             # existente — não alterar
  store.ts             # existente — não alterar
  components/          # existente — não alterar nesta fase
  ...
```

- **financial/** não importa de `store`, `types` (grafo), nem de `components`. Pode importar apenas de dentro de `financial/` ou de libs externas (ex.: nada por agora).
- A UI, quando integrar, importa de `financial/index.ts` (ou de um adaptador em `src/adapters/` se quisermos isolar ainda mais). O engine **nunca** importa a UI.

---

## 5. Escopo confirmado da primeira iteração

**Incluir:**

- Módulo `src/financial/` com Core + Domain + Calculator mínimo.
- Contrato financeiro mínimo (ex.: principal, taxa, número de períodos; tipo = juros simples).
- Simulador de juros simples (função pura que, dado contrato, retorna montante e/ou parcela de juros).
- Código testável (funções puras, fáceis de testar com mesmo input → mesmo output).
- **Zero** impacto na UI existente e zero impacto no modo básico (store, types, Calculator, Card, Whiteboard inalterados).

**Não incluir (explícito):**

- SAC, Price, IOF, CET.
- Auditoria persistente, banco de dados.
- Regras Bacen/CVM.
- Produtos múltiplos.
- Integração na UI (botão “Modo financeiro” continua desativado; podemos expor a facade para uso futuro sem ligar à toolbar ainda).

---

## 6. Riscos estruturais identificados

| Risco | Mitigação |
|-------|------------|
| Misturar tipos de grafo (`GraphNode`) com tipos financeiros | Domain define seus próprios tipos em `financial/domain/`. Nenhum `import` de `src/types.ts` dentro de `financial/`. |
| Engine depender da UI ou do store | Engine só exporta funções/objetos. Quem chama é sempre a UI ou um adaptador. Nenhum `import` de `components` ou `store` dentro de `financial/`. |
| Domain depender do Core | Domain contém apenas tipos/interfaces (e talvez constantes). Nenhum `import` de `financial/core` em `financial/domain`. |
| Lógica financeira vazar para o store ou Calculator | Toda lógica financeira fica em `financial/`. Store e Calculator permanecem apenas com lógica de grafo e calculadora básica. |
| Overengineering (SAC, Price, etc.) | Escopo escrito acima; primeira iteração só juros simples e contrato mínimo. |

---

## 7. Próximo passo

Após sua confirmação de que este alinhamento está correto:

1. Implementar **incrementalmente**: primeiro `domain` (tipos do contrato mínimo), depois `core` (função de juros simples), depois `calculators` (simulador que usa ambos), por fim `financial/index.ts` (facade).
2. Adicionar testes unitários para Core e Calculator (determinístico).
3. Deixar a UI e o modo básico intocados; não ativar o botão “Modo financeiro” nem integrar ao fluxo de cards nesta fase.

Se quiser ajustar escopo, nomes de camadas ou estrutura de pastas, indique antes de iniciar a implementação.
