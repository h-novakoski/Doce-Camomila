# 003 — Dados só do dia
Data: 2026-11-12 | Status: substituída pela 010 (histórico de 3 dias)
**Contexto:** as rotas encerram no fim do dia; o app é suporte da operação do dia. Dono do projeto: "não precisa de histórico".
**Decisão:** todos os registros são apagados diariamente às 3h (America/Sao_Paulo) via pg_cron. A lista da agência mostra só o dia corrente. Cada envio é um registro novo (nunca upsert).
**Consequência:** sem relatórios nem disputas de dias anteriores. Reduz exposição de dados pessoais. Antes das 3h, cargas da noite anterior continuam visíveis.
