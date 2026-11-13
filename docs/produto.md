# Produto — escopo fechado

## Como funciona hoje (papel)
Motorista pega a saca → anota na folha "Tadeu · saca 365 · NX676 · 41999…". Se uma adm acha um pacote do Tadeu em outra saca, procura o número na folha e manda WhatsApp avisando que o pacote está na agência. Falta de pacote o motorista avisa no grupo do WhatsApp da agência.

## Motorista (link do QR, sem login)
1. **1ª vez:** campos `Nome` e `Seu WhatsApp (com DDD)`. O +55 é fixo (todos são do Brasil); o DDD o motorista digita, "(41) 99999-9999" é só exemplo no campo (há motoristas de outros estados). Antes de salvar: "Esse é seu WhatsApp? (41) 99999-9999 [Corrigir] [Sim]". Nome e telefone ficam salvos no navegador (localStorage).
2. **Registrar:** "Oi, {nome}! Qual a saca de agora?". Dois campos lado a lado, sem rótulo em cima, com o nome dentro: `Saca 000` e `NX 000`. **Os dois obrigatórios. Só números.** Botão "Registrar saca".
3. **Registrado (tudo centralizado):** flor com check, "Registrado, {nome}!", saca e NX grandes para conferir, botão "Registrar outra saca", dica de atalho (só após o 1º registro) e "Outro assunto? Fale com a agência no grupo." com o botão verde "Abrir grupo no WhatsApp".
- **Pacote faltando (decisão 011):** em "Registrado", botão "Faltou pacote?" logo abaixo da saca e "Outras sacas de hoje" embaixo; na tela de registrar, "Suas sacas de hoje" com "Faltou pacote" em cada uma (serve no meio da rota). Quantidade no teclado numérico → Avisar; botão "Atualizar" muda a quantidade até a agência resolver. Depois: botão "Mandar também no grupo" com "Aqui é o {nome}. Faltam N pacotes na saca X / NX Y." pronto.
- Privacidade no cadastro: "Seu número é só para a agência te avisar de pacote. Tudo some depois de 3 dias."

## Agência (link separado, com login)
- Login usuário + senha. Usuários: camila, josiane, marilia. Fica conectada no celular.
- Lista de 3 dias no total (decisão 010): um dia por vez abaixo da busca: hoje num cartão maior separado, ontem e anteontem juntos ao lado, só dia da semana + data ("Qui 12/11"). Sempre abre em hoje. Mais recentes primeiro, formato da folha: **Motorista | Saca | NX | ícone WhatsApp**, com o horário do carregamento pequeno embaixo do nome. Sem telefone escrito. WhatsApp em todos os dias.
- Busca única no topo (saca, NX ou nome) olhando os 3 dias; cada botão de dia mostra quantos achados tem, com destaque amarelo no trecho achado.
- Busca vazia: mensagem + botão "Perguntar no grupo".
- Ícone WhatsApp abre a conversa com: "Oi, {motorista}! É a {adm}, da Doce Camomila. Achamos um pacote da saca {saca} / NX {nx}. Está aqui, pode passar para buscar."
- Nos dias anteriores (rota já fechada) a mensagem é neutra: "Oi, {motorista}! É a {adm}, da Doce Camomila. É sobre a saca {saca} / NX {nx} do dia {dd/mm}."
- Pacote faltando (decisão 011): selo vermelho "Faltam N" embaixo do nome; tocar abre "Quantos estão aqui?" (3 de 5) → "Avisar {motorista}" no WhatsApp. Achou todos = resolvido; parte = "3 de 5 aqui". Aviso no topo "⚠ Falta pacote em N sacas" filtra as pendentes; bolinha vermelha no dia que tem.
- No celular, preferir `whatsapp://send?phone=55…&text=…` com fallback `https://wa.me/55…?text=…`.

## Fora do escopo (decidido pelo dono do projeto — não adicionar)
- Rota AM/PM, status de pacote além de "faltando N / resolvido" (decisão 011), notificação push, histórico além de 3 dias, calendário ou escolha de data livre, edição/correção de registro, "Não é você?", botão Ligar, várias sacas por registro, sufixos com traço.

## Pendências do dono do projeto
- Contas no nome da agência: Supabase ok (projeto `doce-camomila` criado e ligado, 2026-11-13); Cloudflare: confirmar aceite do convite.
- Dona da agência preencher no e-mail: telefone e e-mail de recuperação dela + verificação em duas etapas.
- Endereço do site (docecamomila.pages.dev grátis ou domínio próprio).
- Cartaz A4 com QR para a bancada (oferecido).
- Antes de ir ao ar: trocar a senha ou apagar a conta de teste `higor` (senha fraca, vê dados reais).
