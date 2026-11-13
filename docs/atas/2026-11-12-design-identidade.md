> Registro histórico. Partes desta ata foram substituídas por revisões posteriores; o escopo vigente está em `docs/produto.md` e `docs/decisoes/`.

# Equipe de design — Identidade "Doce Camomila"
Data: 2026-11-12 · Papéis: designer UI, pesquisador UX, writer/acessibilidade → diretor

## Conceito: "Miolo"
O amarelo do miolo da camomila é a cor de ação; as pétalas brancas são o papel. A flor aparece só em dois lugares: na marca (topo) e no sucesso ("Registrado"). O resto é a folha da bancada: tinta escura, linhas, números grandes. Verde é exclusivo do WhatsApp.

## Primeira tela (motorista, 1ª vez)
Topo com a flor (48px) + "Doce Camomila" em letra grande e "sacas do dia" embaixo. Título "Oi! Primeira vez por aqui?", subtítulo "Só desta vez. Da próxima, é só digitar a saca." Campos Nome e "Seu WhatsApp (com DDD)" com borda escura de 2px. Botão amarelo grande "Continuar" com texto escuro. Aviso: "Seu número é só para a Camila te avisar de pacote. Tudo some de madrugada."

## Sistema
- Claro: fundo #F5F4EE, folha #FFFFFF, tinta #1F1E16, secundário #4F4B3C, borda de campo #77735F, linhas da folha #E2DFD2, miolo/ação #F6C432 (texto #1F1E16), destaque suave #FCEFC2, WhatsApp #0F7A3D (ícone/texto branco).
- Escuro: fundo #141310, folha #1F1D17, tinta #F2EFE4, secundário #B8B29E, borda #7A7562, linhas #34312A, miolo #F6C432 (texto #141310), destaque #3A3214, WhatsApp #3DCB74 (ícone #0E1422).
- Fontes: Bricolage Grotesque 700/800 (nome e títulos), Atkinson Hyperlegible (corpo, feita para leitura difícil), IBM Plex Mono 600 (saca, NX, horas).
- Escala: 15/17/20/28/36. Espaços 4/8/12/16/24/32. Raio 12 campos, 16 botões.
- Componentes: campo 60px com borda 2px tinta-média e foco amarelo 3px; botão principal amarelo 60px, texto em caixa normal; linha da folha 60px com faixa amarela 4px à esquerda quando é registro novo; botão WhatsApp 48px; sucesso = flor com check escuro no miolo, pétalas abrem 180ms (desliga com menos movimento).

## Tabela de decisões
| Tema | Decisão | Quem o diretor acompanhou |
|---|---|---|
| Direção | Ousada "Miolo" (amarelo como ação) | **Contra o designer**, que recomendou a conservadora azul; UX e writer sustentam o amarelo como preenchimento, e o victor pediu "nessa pegada" |
| Amarelo | Só preenchimento com texto escuro, nunca texto | Writer + UX |
| Verde | Só WhatsApp; sucesso deixa de ser verde | Designer + UX |
| Fontes | Bricolage / Atkinson Hyperlegible / Plex Mono | Designer |
| Textos | Versão do writer, com "Registrar saca" e mensagem da Camila nova | Writer |
| Saca ou NX | Rótulo "Preencha um dos dois" antes do erro | UX + writer |
| Dica de instalar | Só depois do 1º registro, botão 48px | UX |
| Corrigir registro | **Não entra** (decisão do victor de simplicidade); a tela "Registrado" mostra a saca grande para conferir | Contra UX |
| Lista da Camila | Hora 15px sempre visível (desempate), WhatsApp 48px, vazio com "Perguntar no grupo" | UX |
| Login | "Entrada da agência", sessão fica salva no celular | UX + writer |
| Acessibilidade | lang pt-BR, aria-live, foco no título após registrar, alvos ≥48px | Writer |
| Sem sinal / Enviando | Fica para o código real (protótipo não tem servidor) | UX (adiado) |

## Fases
1. Protótipo v2 com a identidade (agora).
2. Teste no celular de 2 motoristas no sol + Camila.
3. Cartaz do QR com a mesma flor e nome (A4 para a bancada).

## Perguntas ao victor
1. A Doce Camomila já tem cores, fachada, sacola ou logo? Se tiver, usamos essas.
2. O nome da adm na mensagem do WhatsApp é sempre "Camila"?
3. Quer o cartaz do QR para imprimir?

## Frases
- Designer: "O motorista não reconhece que é 'o app da Doce Camomila'."
- UX: "Ele pode achar que precisa entrar no grupo para o registro valer."
- Writer: "Amarelo só como fundo, nunca texto amarelo sobre branco."
- Diretor: "O miolo é a ação; a pétala é o papel."

## Iteração 1 (2026-11-12, feedback do victor)
"precisa melhorar os tamanhos [...] está estourando a tela [...] acho válido ser as duas informações não uma ou outra e colocar o ícone do whats mesmo".
- Corrigido estouro dos campos Saca/NX (grid com minmax(0,1fr) e min-width:0); conferido em 360px.
- Saca E NX obrigatórios ("Preencha os dois: saca e NX"); erros separados.
- Ícone do WhatsApp redesenhado (balão com contorno + telefone).
- "Sim, é esse" → "Sim" (quebrava linha); nome da marca em uma linha; nomes longos quebram linha na lista.

## Iteração 2 (2026-11-12 00:18)
- Placeholder do nome: "Nome" (sem nome de pessoa pré-definido). Login sem valores pré-preenchidos.
- 3 adms: camila, josiane, marilia — cada uma no próprio celular; a mensagem do WhatsApp sai com o nome de quem está logada ("É a Josiane, da Doce Camomila..."). Nome da adm aparece ao lado do "Sair".
- Textos do motorista falam "a agência" em vez de "a Camila".

## Iteração 3 (2026-11-12 00:24)
- Saca e NX: só números (sem traço/sufixo); campo remove o que não for dígito.
- Seletor "Motorista / Agência" é só do protótipo. Versão final = dois links: um no QR para motoristas (ex.: docecamomila.vercel.app) e outro enviado às 3 adms (ex.: .../agencia), sempre com login. No protótipo: #motorista e #agencia já escondem o seletor.

## Iteração 4 (2026-11-12 00:27)
- Placeholders de Saca e NX: "000".
- Lista da agência: colunas Motorista | Saca | NX | WhatsApp (saca e NX lado a lado), sem horário embaixo do nome.
- (00:30) Campos do motorista sem rótulo em cima: "Saca 000" e "NX 000" dentro do próprio campo (rótulo continua para leitor de tela).
- (00:34) victor aprovou o visual. Próximo: versão real (equipe-codigo).
