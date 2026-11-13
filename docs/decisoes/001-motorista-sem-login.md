# 001 — Motorista sem login
Data: 2026-11-11 | Status: ativa
**Contexto:** 40–50 motoristas por dia, na fila, com pressa; não querem instalar app nem fazer cadastro. Meta: registrar em < 30 s.
**Decisão:** sem senha nem SMS. Nome e WhatsApp digitados uma vez e salvos no localStorage do navegador. Telefone normalizado (só dígitos; tira 55/0; não completa DDD, porque há motoristas de fora do PR (mudado em 2026-11-13: antes 8–9 dígitos ganhavam DDD 41); exige 11 dígitos com 9 após o DDD) e confirmado na tela.
**Consequência:** se o motorista limpar o navegador ou trocar de celular, cadastra de novo (5 s). Possível spam no link aberto → mitigado por RPC com limite (ver 002).
