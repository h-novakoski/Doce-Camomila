# 006 — Stack
Data: 2026-11-11 | Status: substituída por 008
**Contexto:** um dev só, custo zero, mobile, offline parcial.
**Decisão:** Vite + React + vite-plugin-pwa; Supabase (Postgres, Auth, RLS, pg_cron); deploy na Vercel. Sem backend próprio.
**Consequência:** tipos do banco gerados pelo Supabase CLI (não escrever à mão). Service worker só via vite-plugin-pwa.
TODO: confirmar com o dono do projeto se prefere outro framework.
