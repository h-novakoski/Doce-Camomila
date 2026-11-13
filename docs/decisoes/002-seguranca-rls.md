# 002 — Segurança: anônimo só insere, adm lê
Data: 2026-11-11 | Status: ativa
**Contexto:** a tabela tem nome e telefone de pessoas (LGPD). A chave anon do Supabase fica pública no front.
**Decisão:** RLS ligado. Role `anon` sem SELECT/UPDATE/DELETE; insere só via RPC `registrar(...)` (security definer) que valida campos e limita envios por telefone. SELECT apenas para usuário autenticado que esteja na tabela `admins`.
**Consequência:** o front do motorista nunca recebe dados de outros. Toda tabela nova precisa de policy explícita antes de ir ao ar.
