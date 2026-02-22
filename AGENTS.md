# Regras do agente (Cursor)

As regras do projeto estão em **`.cursor/rules/`** e espelham as configurações do usuário. O agente deve segui-las em todas as interações.

## Regras sempre aplicadas

| Arquivo | Descrição |
|--------|-----------|
| `01-role.mdc` | Papel (Senior SWE + Product Designer), arquitetura first, custo-benefício |
| `02-credit-optimization.mdc` | Menor escopo, reuso, patch pequeno, sem abstração prematura |
| `03-memory.mdc` | Manter `docs/agent-memory.md` em mudanças estruturais |
| `07-pre-implementation.mdc` | Checklist antes de implementar (reuso, acoplamento, crédito) |
| `08-save-memory.mdc` | Comando **save**: ao pedir, salvar raciocínio/memória em `docs/agent-memory.md` |
| `09-search-memory-first.mdc` | **Pesquisar na memória primeiro**: consultar mapa em `docs/agent-memory.md` antes de buscar no código; mapear novas descobertas no mapa |
| `10-tests.mdc` | **Testes**: após rodar com sucesso, remover arquivos de teste; testes não fazem parte da estrutura do projeto |

## Regras por contexto

| Arquivo | Quando aplica |
|--------|----------------|
| `04-design-system.mdc` | UI/CSS (`.tsx`, `.css`, `.scss`) — Shadcn, pixel-perfect |
| `05-accessibility.mdc` | Componentes (`.tsx`, `.jsx`, `.html`) — WCAG 2.1 AA |
| `06-code-standards.mdc` | Código (`.ts`, `.tsx`) — TypeScript, separação UI/lógica |

## Idioma

- **Sempre responder em português.**
