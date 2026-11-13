# 007 — Três adms e senha inicial
Data: 2026-11-12 | Status: ativa
**Contexto:** Camila, Josiane e Marília usam cada uma o próprio celular; a mensagem ao motorista deve sair com o nome de quem enviou.
**Decisão:** usuários `camila`, `josiane`, `marilia` no Supabase Auth (e na tabela `admins` com o nome de exibição). Senha inicial temporária, combinada fora do repositório (nunca escrever aqui); no 1º login aparece a tela "Crie sua senha" (digitar duas vezes) e a inicial deixa de valer. Sessão fica salva no celular.
**Consequência:** precisa de um campo/flag "senha_trocada" por adm. Supabase exige e-mail no Auth → usar e-mail interno (ex.: camila@docecamomila.local) e mapear o usuário digitado.
