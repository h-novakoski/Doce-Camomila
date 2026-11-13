# Doce Camomila — Sacas do dia

Substitui a folha de papel da bancada da agência Doce Camomila: o motorista registra nome, WhatsApp, saca e NX pelo celular; as adms buscam quem pegou cada saca e chamam no WhatsApp com 1 toque. Dados ficam 3 dias (decisão 010).

## Stack (ver docs/decisoes/008)
- Front: Vite + React + TypeScript + vite-plugin-pwa (site comum; instalar é opcional)
- Banco/auth: Supabase, projeto `doce-camomila` (ref `mopkiuvyeswfxqouythe`, São Paulo) na organização da agência
- Deploy: Cloudflare Pages (projeto `docecamomila`, https://docecamomila.pages.dev), automático a cada push no `main`. Build `npm run build`, saída `dist`, preset None; as duas variáveis VITE_ ficam em Settings → Variables (sem elas o site abre em branco)

## Configuração
- `.env.local` (fora do git) com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`; modelo em `.env.example`. Na Cloudflare, as mesmas variáveis no painel.
- Banco: migrações em `supabase/migrations/` (aplicadas pelo MCP do Supabase). Contas das adms NÃO ficam em migração (têm senha): são criadas direto no Auth + tabela `admins`.
- Nada de dado de pessoa, senha ou lista de adms no código: quem é adm vem da tabela `admins`.

## Comandos
- `npm install`: instala as dependências
- `npm run dev`: servidor local (http://localhost:5173)
- `npm run build`: checa os tipos (`tsc -b`) e gera `dist/` com o service worker
- `npm run preview`: serve o `dist/` para testar o build (o PWA só funciona aqui, não no dev)
- `npm run typecheck`: só a checagem de tipos
- Tipos do Supabase: ainda escritos à mão em `src/lib/registro.ts`; dá para gerar com o MCP (`generate_typescript_types`) se crescer

## Onde está o quê no código
- `src/App.tsx`: escolhe a tela pelo caminho: `/agencia` → agência; qualquer outro → motorista
- `src/motorista/`: rota `/`, com `Cadastro` → `Registrar` → `Registrado`. `MinhasSacas` (embaixo do Registrar) = aviso de pacote faltando (decisão 011)
- `src/agencia/`: rota `/agencia`, com `Login` → (1º acesso: `CriarSenha`) → `Lista` (seletor de dias, busca nos 3 dias com contagem por dia, destaque, WhatsApp, faltas). O dia vira às 3h: use `inicioDoDia()` de `src/lib/registro.ts`, nunca `new Date()` puro
- `src/lib/supabase.ts`: o cliente e `mensagemDeErro` (sem internet / mensagens P0001 escritas nas funções do banco)
- `src/lib/registro.ts`: dados. Motorista só chama as funções `registrar`, `minhas_sacas`, `avisar_falta` (sem login); adm lê a tabela `registros` e chama `registrar_achados`, `marcar_resolvido`; `aoMudar` = tempo real (só funciona para adm). O motorista recarrega as sacas dele a cada 1 min e ao voltar para o app.
- `src/lib/sessao.ts`: login das adms (usuário → `<usuario>@docecamomila.local` no Auth), `criarSenha` + função `marcar_senha_trocada`
- `src/lib/whatsapp.ts`: no celular tenta `whatsapp://` e cai no `wa.me` se o app não abrir. `tel` null = sem destinatário (a pessoa escolhe a conversa, ex.: o grupo)
- `src/lib/local.ts`: o que o motorista guarda no navegador (nome, telefone, dica do atalho, **chaves secretas** das sacas dele, por 3 dias)
- `src/lib/config.ts`: link do grupo do WhatsApp da agência
- `src/styles.css`: CSS copiado do protótipo. Mudou o visual? Mude nos dois.
- **O protótipo ainda não tem o aviso de pacote faltando (decisão 011).** Para essa parte, a referência é o app.

## Testar
- `npm run dev` usa o banco de verdade (não há mais dados de exemplo). Registros de teste aparecem para as adms até a limpeza (3 dias): use um nome claro como "Teste" e apague depois.
- Não testar o login com as contas das adms reais: o 1º acesso troca a senha delas. Usar a conta de teste `higor` (senha_trocada = true).
- Criar conta ou apagar dados pelo MCP do Supabase não funciona nesta janela do VS Code (o conector pede confirmação e ela é negada sozinha). Só leitura e migrações passam; o resto vai pelo SQL Editor do painel.
- No Bash deste ambiente, `\\` vira `\` (até em heredoc com 'EOF'). Ao gerar código com barra invertida por script, use `String.fromCharCode(92)` ou edite com a ferramenta Edit.

## Como se orientar
- Comece por `docs/INDEX.md` e abra só o que a tarefa pede.
- O visual aprovado está em `prototipo/index.html` (abre direto no navegador). Ele é a referência de layout, cores, fontes e textos.
- `docs/produto.md` tem o escopo fechado: o que entra e, principalmente, o que NÃO entra.

## Regras que não se negociam
- **Simplicidade acima de tudo.** O carregamento é dinâmico e o motorista não pode perder tempo: não adicionar campo, tela ou passo sem o dono do projeto pedir. A lista do que ficou de fora está em `docs/produto.md`.
- As demais regras (login, RLS, retenção, links, visual) moram nas decisões de `docs/decisoes/`; o INDEX diz qual ler.
- Mobile primeiro: conferir toda tela em 360px de largura antes de dar por pronta.

## Manutenção dos docs
- Antes de uma tarefa, leia docs/INDEX.md e abra só o que ela pede.
- Ao terminar, se aprendeu algo não documentado que faria falta, registre no CLAUDE.md do módulo.
- Doc passou de ~150 linhas? Divida por subtema e atualize o INDEX.
- Decisão de arquitetura nova → arquivo novo em docs/decisoes/.
- Se o código contradiz o doc, o código vale: corrija o doc e avise.
