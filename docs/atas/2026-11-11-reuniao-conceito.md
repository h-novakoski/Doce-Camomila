> Registro histórico. Partes desta ata foram substituídas por revisões posteriores; o escopo vigente está em `docs/produto.md` e `docs/decisoes/`.

# Reunião — Controle de Sacas: conceito e MVP
Data: 2026-11-11 · Formato: completo (crítico, otimista, especialista → gerente → líder)

## Decisão
**Conceito: "Bancada" — a folha da bancada, só que legível e com WhatsApp.**
Um site leve aberto por QR code colado onde hoje fica a folha. Motorista não faz login: registra nome, telefone (validado e confirmado) e as sacas/NX como chips. Depois da primeira vez, nome e telefone já vêm preenchidos e o registro leva ~10 s. O admin abre direto numa **busca** ("digite a saca ou NX") filtrada no dia de hoje, com dois botões por resultado: **WhatsApp** (mensagem pronta com saca/NX/data) e **Ligar**. É PWA instalável, mas nada depende de instalar.

**Primeira tela do motorista:** título "Retirada de hoje · 11/11", campos Nome e WhatsApp `(41) _____-____` (DDD 41 já preenchido), campo "Saca ou NX" que vira chip a cada Enter (`602` `618-01` `NX643-1`), botão grande "Registrar". Antes de enviar: "Seu WhatsApp é (41) 99729-1298? ✔ Sim / Corrigir". Depois: "Registrado ✓" ou "Salvo no celular, envia quando tiver sinal".

**Primeira tela do admin:** campo de busca gigante no topo com teclado numérico, lista de hoje embaixo (mais recentes primeiro), cada linha: nome · chips · telefone · [WhatsApp] [Ligar].

## Tabela de decisões
| Tema | Decisão | Quem o líder acompanhou | Confiança |
|---|---|---|---|
| Acesso do motorista | Sem login, QR na bancada, nome/tel no aparelho | Todos (consenso) | alta |
| Várias sacas | 1 registro por motorista/dia; itens como chips (saca ou NX, código bruto + código de busca); `qtd` opcional por item (default 1) | Especialista | média |
| Telefone | Normalização BR, DDD 41 padrão, 11 dígitos, salvo 55DDDN, tela "confere?"; 1 número só | Crítico + especialista | alta |
| Identidade | Telefone é a chave do dia; nome é rótulo | Crítico | alta |
| Edição pelo motorista | **Não** criar tela de edição: reenviar com o mesmo telefone no mesmo dia **substitui** o registro (upsert telefone+dia) | **Contra todos** (ninguém propôs; resolve "correção à mão" sem tela nova) | média |
| Botão Ligar | **Entra no MVP** (é um `tel:`, custo ~zero; motorista dirigindo atende ligação) | Crítico, **contra o gerente** que jogou p/ Fase 2 | alta |
| Modo balcão | **Entra no MVP**: admin logado usa o mesmo formulário, marca `criado_por_admin` | Crítico, **contra o gerente** (sem isso o papel não sai) | média |
| Admin | Abre em busca do dia, não em "todas as informações" | Crítico | alta |
| Login admin | E-mail + senha (Supabase Auth), tabela `admins` | Especialista | média |
| Dia/turno | Só `dia_operacional` com hora de corte configurável; sem turno | Especialista (parcial) | média |
| Retenção / LGPD | 90 dias + exclusão automática; aviso de finalidade no form ("usado só para contato sobre seus pacotes") | Especialista | baixa |
| Segurança | Anon sem SELECT; insere só via RPC `registrar()` validada, com limite por telefone; URL do QR com slug secreto trocável | Especialista + crítico | alta |
| Offline | Fila no aparelho com id gerado no celular (idempotente), reenvio ao abrir/ficar online; status visível | Todos | alta |
| Stack | Vite + React + vite-plugin-pwa, Cloudflare Pages/Vercel, Supabase | Especialista | média |
| Ousada (perfil, check-in, status, Realtime) | Fica para depois de uso real | Especialista + gerente | média |

Onde fui contra a maioria: edição via reenvio (nenhum papel propôs), botão Ligar e modo balcão no MVP (gerente adiava). O consenso de "sem login" se sustenta porque o critério de sucesso (<30 s na fila) não aguenta senha nem SMS.

## Escopo em fases
- **Fase 0 (1–2 dias):** conversar com o conferente (o que é NX, a saca pertence a um NX, o que significa "602 4 sacas"); testar sinal 4G dentro do galpão; fotografar mais folhas para casos reais.
- **Fase 1 — MVP (~35–45 h):** formulário QR, chips, telefone validado, fila offline, upsert telefone+dia, RPC + RLS, admin com login, busca do dia, WhatsApp + Ligar, modo balcão, aviso LGPD, exclusão 90 dias. Uma semana com papel em paralelo.
- **Fase 2 (após 1–2 semanas de uso):** "Mesmas sacas de ontem?", status "falta pacote"/"resolvido", filtro por data, export CSV.
- **Fase 3:** registro de quem foi acionado e quando, Realtime, OTP se aparecer spam ou celular compartilhado.

## Riscos e o que mudaria a decisão
- Se quem preenche é o conferente (não o motorista) → app vira balcão puro, sem QR.
- Se NX/saca têm formato rígido → máscara e validação no lugar de texto livre.
- Se motoristas são quase sempre os mesmos → antecipar perfil lembrado no servidor (Fase 2 vira Fase 1).
- Se aparecer spam ou envio falso → trocar slug do QR, depois OTP.
- Sinal ruim no galpão está sem medição: a fila offline é obrigatória até prova em contrário.

## Perguntas ao victor
1. O que é NX e qual a relação com a saca? E "602 4 sacas" é uma saca com 4 volumes ou 4 sacas diferentes?
2. Quem confere/aciona: um admin só ou vários (turnos, depósitos)?
3. Os motoristas são quase sempre os mesmos todo dia?

## Frases marcantes
- Crítico: "Quando falta pacote, ele está com uma saca ou um NX na mão — não precisa de 'todas as informações'."
- Otimista: "Transforma uma lista morta em ferramenta de resolução de problema."
- Especialista: "'(41) 99729-1298, confere?' é isso que acaba com o telefone ilegível."
- Gerente: "Ninguém mediu a internet do galpão."
- Líder: "A folha da bancada, só que legível e com WhatsApp."

---
## Revisão 1 (2026-11-11, feedback do victor)
Feedback: "quando as pessoas anotar novamente vai substituir o anterior? existe pessoas que carregam duas vezes por dia [...] tem rota am e rota pm [...] quando a carga atrasa ela sai depois do meio dia [...] teria que ter um filtro pois são mais de 40 a 50 motoristas".
Decisão do líder "reenvio substitui" foi **derrubada** (seguimos o victor).

Novo modelo:
- `motoristas` (cadastro uma vez; login anônimo Supabase, sem senha/SMS; telefone único).
- `cargas` (1 linha por carregamento, nunca substitui): dia_operacional (corte 4h), rota AM/PM escolhida pelo motorista, registrado_em, atrasada (AM após 12h, automático), status ok/falta_pacote/resolvido, cancelada_em.
- `itens_carga` (saca/NX, código bruto, código de busca, qtd).
- `alteracoes` (quem, quando, antes/depois) — o admin vê quem anotou e quem mudou.
- Motorista edita/cancela só a última carga por 15 min; depois só o admin.
- Admin: data (Hoje ‹ ›), abas Todas | AM | PM | Atrasadas com contador, busca única, chips de status, lista agrupada por rota; linha com hora, nome, chips, selos "2ª carga"/"atrasada", WhatsApp e Ligar; toque abre histórico.
- 2ª carga do motorista: AM/PM → saca → NX → Enviar (<20 s).
- Rotas definidas pelo admin: v2 (antes, se o depósito já tiver lista oficial de rotas/NX).
- Esforço revisado: 40–55 h.

---
## Revisão 2 (2026-11-11, feedback do victor) — versão enxuta
Feedback: "temos que deixar o mais simples possível para ser rápido e efetivo [...] só o nome e telefone ficando salvo no celular e a pessoa poder enviar um registro novo [...] página web sem baixar [...] o adm [...] no máximo 3 dias [...] botão com o whats do grupo".
Fluxo real: motorista pega a saca → anota "Tadeu · saca 365 · NX676 · 41999…" → Camila (admin) acha pacote de outra saca que é do Tadeu → manda msg "seu pacote está na agência". Falta de pacote é avisada pelo motorista no grupo do WhatsApp da agência.

Decisões (substituem a revisão 1):
- Página web comum por link/QR, sem instalar nada.
- 1ª vez: nome + WhatsApp (com "confere?"). Fica salvo no navegador.
- Toda vez: "Olá, Tadeu" → saca + NX (campos vazios) → Enviar. Sempre um registro novo; nunca substitui. Link "não é você?" para trocar.
- Sem AM/PM, sem status, sem edição, sem histórico longo: hora do registro aparece na lista.
- Admin (login): busca única por saca/NX/nome, lista de hoje mais recentes primeiro, filtro Hoje/Ontem/Anteontem, botões WhatsApp (msg "seu pacote está na agência") e Ligar.
- Registros apagados automaticamente após 3 dias (LGPD resolvida de brinde) — depois reduzido para só o dia.
- Botão "Grupo da agência" (link de convite) na tela do motorista, após o envio.
- Esforço: ~15–25 h.

### Ajustes finos (2026-11-11 23:50)
- Removido o "Não é você?".
- Mantido: "Registrado ✓" + botão "Entrar no grupo da agência".
- Lista da Camila igual à folha: colunas Nome | Saca / NX | ícone do WhatsApp. Telefone não aparece escrito; o ícone abre a conversa direto. Botão Ligar removido.
- (23:51) Só o dia: sem histórico. Registros apagados automaticamente de madrugada (ex.: 3h), já que as rotas encerram no fim do dia. Filtro Hoje/Ontem/Anteontem removido.

## Decisões para a versão real (2026-11-12 00:37)
- Lista zera às 3h (America/Sao_Paulo). Confirmado.
- Senha inicial das adms: temporária, combinada fora do repositório (não registrar aqui), com troca obrigatória no 1º login (tela "Crie sua senha"). Aprovado pelo victor.
- Pendente: link do grupo, endereço do site, contas Vercel/GitHub.
