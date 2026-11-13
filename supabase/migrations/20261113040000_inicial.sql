-- Doce Camomila — estrutura inicial (decisões 002, 007, 010, 011)
-- Regra geral: RLS ligado em tudo; anon NUNCA acessa tabela direto, só pelas funções abaixo.

-- ─── Tabelas ────────────────────────────────────────────────────────────────

create table public.registros (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null check (char_length(btrim(nome)) between 1 and 60),
  tel        text not null check (tel ~ '^[0-9]{2}9[0-9]{8}$'),          -- DDD + 9 dígitos (decisão 001)
  saca       text not null check (saca ~ '^[0-9]{1,6}$'),
  nx         text not null check (nx ~ '^[0-9]{1,6}$'),
  criado_em  timestamptz not null default now(),
  faltando   smallint not null default 0 check (faltando between 0 and 999),   -- decisão 011
  achados    smallint not null default 0 check (achados >= 0 and achados <= faltando),
  resolvido  boolean not null default false
);
create index registros_criado_em_idx on public.registros (criado_em desc);
create index registros_tel_criado_em_idx on public.registros (tel, criado_em);

-- Chave secreta de cada registro: só o celular do motorista que registrou tem.
-- Fica em tabela separada para nunca sair no SELECT/realtime das adms.
create table public.chaves (
  registro_id uuid primary key references public.registros (id) on delete cascade,
  chave       uuid not null unique default gen_random_uuid()
);

-- Quem é adm (decisão 007). Usuário digitado → e-mail interno <usuario>@docecamomila.local no Auth.
create table public.admins (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  usuario        text not null unique,
  nome           text not null,
  senha_trocada  boolean not null default false
);

alter table public.registros enable row level security;
alter table public.chaves    enable row level security;
alter table public.admins    enable row level security;

revoke all on public.registros, public.chaves, public.admins from anon, authenticated;
grant select on public.registros to authenticated;
grant select on public.admins    to authenticated;

-- ─── Funções de apoio ───────────────────────────────────────────────────────

create function public.eh_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()))
$$;

-- Início do "dia" da operação: vira às 3h de Brasília (decisão 010). atras = dias antes de hoje.
create function public.inicio_do_dia(atras int default 0)
returns timestamptz
language sql stable set search_path = ''
as $$
  select ((date_trunc('day', (now() at time zone 'America/Sao_Paulo') - interval '3 hours')
          - make_interval(days => atras)) + interval '3 hours') at time zone 'America/Sao_Paulo'
$$;

-- ─── Policies ───────────────────────────────────────────────────────────────

create policy "adms leem os registros" on public.registros
  for select to authenticated using ((select public.eh_admin()));

create policy "adm lê a própria linha" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));
-- chaves: nenhuma policy = ninguém acessa direto.

-- ─── Motorista (anon) ───────────────────────────────────────────────────────

-- Registra uma saca. Cada envio é um registro novo. Limite: 10 por telefone a cada 10 min.
create function public.registrar(p_nome text, p_tel text, p_saca text, p_nx text)
returns table (id uuid, chave uuid, criado_em timestamptz)
language plpgsql security definer set search_path = ''
as $$
#variable_conflict use_column
declare
  v_id uuid;
  v_em timestamptz;
  v_chave uuid;
begin
  if (select count(*) from public.registros r
      where r.tel = p_tel and r.criado_em > now() - interval '10 minutes') >= 10 then
    raise exception 'Muitos registros seguidos. Tente de novo em alguns minutos.' using errcode = 'P0001';
  end if;

  insert into public.registros (nome, tel, saca, nx)
  values (btrim(p_nome), p_tel, p_saca, p_nx)
  returning registros.id, registros.criado_em into v_id, v_em;

  insert into public.chaves (registro_id) values (v_id)
  returning chaves.chave into v_chave;

  return query select v_id, v_chave, v_em;
end
$$;

-- Sacas de hoje do próprio motorista, pelas chaves guardadas no celular dele.
create function public.minhas_sacas(p_chaves uuid[])
returns table (id uuid, chave uuid, saca text, nx text, criado_em timestamptz,
               faltando smallint, achados smallint, resolvido boolean)
language sql stable security definer set search_path = ''
as $$
  select r.id, c.chave, r.saca, r.nx, r.criado_em, r.faltando, r.achados, r.resolvido
  from public.chaves c
  join public.registros r on r.id = c.registro_id
  where c.chave = any (p_chaves)
    and cardinality(p_chaves) <= 100
    and r.criado_em >= public.inicio_do_dia(0)
  order by r.criado_em desc
$$;

-- Motorista avisa (ou atualiza) quantos pacotes faltam. 0 tira o aviso. Não mexe se já resolvido.
create function public.avisar_falta(p_chave uuid, p_quantidade int)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if p_quantidade is null or p_quantidade < 0 or p_quantidade > 999 then
    raise exception 'Quantidade inválida.' using errcode = 'P0001';
  end if;

  update public.registros r
     set faltando = p_quantidade,
         achados  = least(r.achados, p_quantidade)
    from public.chaves c
   where c.registro_id = r.id
     and c.chave = p_chave
     and not r.resolvido
     and r.criado_em >= public.inicio_do_dia(2);

  if not found then
    raise exception 'Saca não encontrada ou já resolvida.' using errcode = 'P0002';
  end if;
end
$$;

-- ─── Adms (authenticated + admins) ──────────────────────────────────────────

-- Quantos dos pacotes faltando estão na agência. Achou todos = resolvido.
create function public.registrar_achados(p_id uuid, p_achados int)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Sem permissão.' using errcode = '42501';
  end if;

  update public.registros
     set achados   = least(greatest(coalesce(p_achados, 0), 0), faltando),
         resolvido = least(greatest(coalesce(p_achados, 0), 0), faltando) >= faltando
   where id = p_id and faltando > 0;

  if not found then
    raise exception 'Registro sem falta.' using errcode = 'P0002';
  end if;
end
$$;

-- Marca (ou desmarca) a falta como resolvida, sem avisar.
create function public.marcar_resolvido(p_id uuid, p_resolvido boolean)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.eh_admin() then
    raise exception 'Sem permissão.' using errcode = '42501';
  end if;

  update public.registros set resolvido = coalesce(p_resolvido, false)
   where id = p_id and faltando > 0;

  if not found then
    raise exception 'Registro sem falta.' using errcode = 'P0002';
  end if;
end
$$;

-- ─── Permissões das funções ─────────────────────────────────────────────────

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.registrar(text, text, text, text)  to anon, authenticated;
grant execute on function public.minhas_sacas(uuid[])                to anon, authenticated;
grant execute on function public.avisar_falta(uuid, int)             to anon, authenticated;
grant execute on function public.registrar_achados(uuid, int)        to authenticated;
grant execute on function public.marcar_resolvido(uuid, boolean)     to authenticated;
grant execute on function public.eh_admin()                          to authenticated;
grant execute on function public.inicio_do_dia(int)                  to authenticated;

-- ─── Tempo real: a lista das adms atualiza sozinha (RLS vale aqui também) ──
alter publication supabase_realtime add table public.registros;
