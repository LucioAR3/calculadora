# Fluxo: Dívida 12 meses (juros e multa)

## Por que “Parcelas” é etapa e não origem?

No exemplo, **Parcelas (meses)** vem do cálculo **Prazo (anos) × Meses no ano** = 1 × 12 = 12.

- Se o número de parcelas for só um **dado** (ex.: “12 parcelas combinadas”), faz sentido ser **origem**.
- Se vier de uma **conta** (prazo em anos × 12, ou outro critério), deve ser **etapa**.  
Aqui usamos etapa para deixar claro: “12” não é número mágico, é resultado de **1 ano × 12 meses/ano**.

## Multa: valor fixo, não juro sobre juro

- **Multa** = valor **fixo** por parcela atrasada: 1% **sobre o principal** (empréstimo), não sobre saldo devedor.
- Ex.: 1000 × 1% = **R$ 10** por parcela atrasada. Se atrasar 3 parcelas, soma 10 + 10 + 10 (não aplica juro sobre esse valor).
- Ou seja: **não é juro sobre juro**; é um valor que se **acrescenta** por parcela atrasada.

No fluxo isso aparece como: **Multa fixa por parcela atrasada (R$)** = Empréstimo × taxa multa (decimal).

## Ordem do fluxo (para não ficar confuso)

Lendo da **esquerda para a direita**:

1. **Dados (origens)**  
   Empréstimo, Prazo (anos), Meses no ano, Juros % mensal, Multa % sobre principal.

2. **Parcelas**  
   Uma etapa: Prazo × Meses no ano → 12 parcelas.

3. **Taxa decimal (uma etapa, modo Múltiplo)**  
   Converte os % em decimal: 1,5% → 0,015 e 1% → 0,01 (dois resultados).

4. **Valores por unidade**  
   - Juros por mês = Empréstimo × taxa juros (0,015) = 15.  
   - Multa fixa por parcela atrasada = Empréstimo × taxa multa (0,01) = 10.

5. **Totais**  
   - Total juros = Juros por mês × Parcelas = 15 × 12 = 180.  
   - Dívida total = Empréstimo + Total juros = 1000 + 180 = 1180.

Arquivo do fluxo: **`exemplo-divida-12meses-multiplo.json`**.
