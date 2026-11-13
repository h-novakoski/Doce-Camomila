-- Limpeza automática (decisão 010): guarda hoje, ontem e anteontem; o resto é apagado.
-- Roda de hora em hora (minuto 5): na prática só apaga algo quando o dia vira às 3h de Brasília,
-- e se uma execução falhar a próxima resolve. As chaves somem junto (on delete cascade).
create extension if not exists pg_cron;

select cron.schedule(
  'limpar-registros-3-dias',
  '5 * * * *',
  $$ delete from public.registros where criado_em < public.inicio_do_dia(2) $$
);
