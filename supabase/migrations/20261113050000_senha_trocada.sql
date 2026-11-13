-- Decisão 007: depois que a adm cria a própria senha, marca senha_trocada (só a própria linha).
create function public.marcar_senha_trocada()
returns void
language sql security definer set search_path = ''
as $$
  update public.admins set senha_trocada = true where user_id = (select auth.uid())
$$;

revoke execute on function public.marcar_senha_trocada() from public, anon;
grant execute on function public.marcar_senha_trocada() to authenticated;
