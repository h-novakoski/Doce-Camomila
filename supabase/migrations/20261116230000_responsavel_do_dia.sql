-- Decisão 013: o motorista manda o aviso de falta para a adm responsável do dia
-- = a última adm (com WhatsApp cadastrado) que abriu a lista da agência hoje.
-- Os números NÃO ficam em migração: são preenchidos direto na tabela (SQL Editor).

alter table public.admins
  add column tel      text check (tel ~ '^[0-9]{2}9[0-9]{8}$'),   -- DDD + 9 dígitos, sem 55. null = nunca é responsável
  add column visto_em timestamptz;                                 -- última vez que abriu a lista

-- A adm abriu (ou voltou para) a lista: marca a presença dela. Só a própria linha.
create function public.marcar_presenca()
returns void
language sql security definer set search_path = ''
as $$
  update public.admins set visto_em = now() where user_id = (select auth.uid())
$$;

-- WhatsApp da responsável de hoje, ou null se nenhuma adm com número abriu a lista hoje.
-- Devolve só o número: o motorista (anon) continua sem acesso à tabela.
create function public.responsavel_do_dia()
returns text
language sql stable security definer set search_path = ''
as $$
  select a.tel
  from public.admins a
  where a.tel is not null
    and a.visto_em >= public.inicio_do_dia(0)
  order by a.visto_em desc
  limit 1
$$;

revoke execute on function public.marcar_presenca()    from public, anon;
revoke execute on function public.responsavel_do_dia() from public;
grant execute on function public.marcar_presenca()     to authenticated;
grant execute on function public.responsavel_do_dia()  to anon, authenticated;
