# 008 — Stack com hospedagem na Cloudflare Pages
Data: 2026-11-13 | Status: ativa (substitui 006)
**Contexto:** o plano grátis da Vercel (Hobby) não permite uso comercial, e o app é usado na operação de uma empresa.
**Decisão:** Vite + React + vite-plugin-pwa; Supabase (Postgres, Auth, RLS, pg_cron); hospedagem na Cloudflare Pages (grátis, uso comercial permitido), com deploy automático a cada push no GitHub. Sem backend próprio.
**Consequência:** endereço padrão `*.pages.dev`. Variáveis do Supabase (URL e chave anon) configuradas no painel da Cloudflare, não no repositório. Tipos do banco gerados pelo Supabase CLI.
