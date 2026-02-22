# Fluxos de exemplo

## exemplo-spray.json

**Problema:** Você tem R$ 1000. Gasta R$ 600 em 3 caixas de spray limpa-carros; cada caixa tem 10 sprays (30 sprays no total).

- **Restante** após o gasto: 1000 − 600 = R$ 400  
- **Custo por spray:** 600 ÷ 30 = R$ 20  
- **Preço de venda por spray:** altere o card "Preço de venda por spray" (ex.: 25)  
- **Receita** (vender todos): 30 × preço  
- **Lucro líquido:** receita − 600  
- **Capital final:** restante + lucro (R$ 400 + lucro)

**Como usar:** no app, use **Abrir Projeto** e selecione `exemplo-spray.json` (pasta `public/flows/` ou o caminho onde você salvou). Ajuste o valor do card "Preço de venda por spray" para simular outros preços.

---

## Dívida 12 meses (juros e multa)

**Arquivo recomendado:** `exemplo-divida-12meses-multiplo.json`  
**Leia antes:** `LEIA-ME-DIVIDA.md` (explica por que Parcelas é etapa, multa é valor fixo e a ordem do fluxo)

- **Parcelas:** vem de **etapa** Prazo (anos) × Meses no ano = 1 × 12 (não é origem “mágica”).
- **Multa:** valor **fixo** por parcela atrasada (1% sobre o principal); **não** é juro sobre juro.
- **Fluxo:** Dados → Parcelas; Taxa decimal (Múltiplo) → Juros/mês e Multa fixa → Total juros → Dívida total.

**Outro arquivo:** `exemplo-divida-12meses-juros-multa.json` — versão sem Múltiplo (duas etapas “Taxa decimal”).
