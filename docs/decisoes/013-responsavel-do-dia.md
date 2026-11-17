# 013 — Responsável do dia = última adm que abriu a lista
Data: 2026-11-16 | Status: ativa
**Contexto:** no grupo do WhatsApp da agência só as adms escrevem, então o motorista não consegue mandar o aviso de falta lá. Ele precisa mandar para quem está na agência naquele dia, e isso muda: quando uma adm não está, a outra recebe. Ninguém sabe de antemão quem é.
**Decisão:**
- Responsável do dia = a última adm, com WhatsApp cadastrado, que abriu (ou voltou para) a lista da agência desde as 3h. Sem passo novo para a adm: quem está trabalhando abre o app.
- Motorista: depois do "Avisado!", o botão "Mandar para responsável" abre direto a conversa com ela, com "Aqui é o {nome}. Faltam N pacotes na saca X / NX Y.". Se nenhuma adm abriu a lista hoje (ou sem internet), abre o WhatsApp sem destinatário e ele escolhe o contato.
- Banco (migração `20261116230000_responsavel_do_dia.sql`): colunas `admins.tel` e `admins.visto_em`; função `marcar_presenca()` (adm, só a própria linha) chamada pela `Lista`; função `responsavel_do_dia()` (anon) devolve só o número.
- Os números das adms não ficam em código nem em migração: são preenchidos direto na tabela `admins` pelo SQL Editor. **Adm com `tel` vazio nunca é responsável** (é assim que a conta de teste `higor` fica de fora).
**Segurança:** quem tem o link do motorista consegue descobrir o WhatsApp da responsável do dia (só o número, sem nome). Aceito pelo dono: os motoristas já recebem mensagem desses números.
**Consequência:** duas adms no mesmo dia → vale a que abriu por último. Se isso errar com frequência, a alternativa é um botão "Sou a responsável hoje" na agência.
