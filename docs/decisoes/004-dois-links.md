# 004 — Dois links: motorista e agência
Data: 2026-11-12 | Status: ativa
**Contexto:** motoristas e adms não devem ver a tela um do outro.
**Decisão:** um site, duas rotas: `/` (motorista, vai no QR da bancada) e `/agencia` (enviado às adms, exige login). O seletor "Motorista / Agência" do protótipo NÃO existe na versão final.
**Consequência:** a separação é de conveniência; a proteção real é o login + RLS (002).
