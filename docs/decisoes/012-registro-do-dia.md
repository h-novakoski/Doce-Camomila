# 012 — Registro do dia em planilha
Data: 2026-11-16 | Status: ativa
**Contexto:** depois do primeiro dia de uso, o dono do projeto pediu um registro do dia para guardar e compartilhar pelo WhatsApp, organizado em planilha, para um relatório futuro se precisar.
**Decisão:**
- Na agência, em cima da lista (logo abaixo dos dias e do aviso de falta; embaixo da lista obrigava a rolar tudo no celular), botão "Planilha do dia". Gera o arquivo `sacas-AAAA-MM-DD.xlsx` do dia escolhido, com todos os registros dele (ignora busca e filtro de faltas), do primeiro carregamento ao último.
- Colunas: Data, Hora, Motorista, Saca, NX, Faltando, Achados. **Sem telefone.** Faltando/Achados ficam vazios quando é 0; a falta sai em vermelho.
- No celular abre o compartilhar do aparelho (WhatsApp, Drive…); no computador baixa o arquivo.
- Formato .xlsx de verdade, com cabeçalho escuro fixo no topo, larguras de coluna e bordas. A 1ª versão era .csv e ficou ruim de ler no celular (texto cru, sem formatação), por isso a troca. Biblioteca `write-excel-file` (entrada `/universal`, sem Web Worker), carregada só quando a adm toca no botão: o motorista nunca baixa. O arquivo é montado no navegador (`src/lib/planilha.ts`), nada passa por servidor.
- Nome, saca e NX vão como texto (formato `@`): o que o motorista digitou não vira fórmula e saca/NX não perdem o zero à esquerda.
**Consequência:** o arquivo sai do app e não some em 3 dias (decisão 010 vale só para o banco). Quem guarda a planilha é a agência.
