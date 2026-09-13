# MOB · Método de Ovulação Billings

Aplicação web para anotações diárias do Método Billings: selo do dia, gráfico do ciclo, exportação em PDF e envio do relatório ao e-mail cadastrado.

## Como rodar (local)

O app usa PostgreSQL. Suba o banco e depois o Next.js:

```bash
docker compose up -d
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Cadastro: nome, e-mail e senha, sem confirmação de e-mail. Só entram e-mails listados em `ALLOWED_EMAILS`. Marque **Lembrar de mim** para manter a sessão por 30 dias.

## Quem pode entrar

O app é fechado. Defina os e-mails liberados, separados por vírgula:

```
ALLOWED_EMAILS=voce@exemplo.com,outra@exemplo.com
```

Sem essa variável (ou com ela vazia), ninguém cria conta e ninguém entra. Para liberar alguém: edite a lista, salve e faça **Redeploy**. A pessoa cadastra em `/cadastrar` — o link não aparece na tela de login. Remover um e-mail tira o acesso no clique seguinte, mesmo com sessão ativa.

## Deploy na Vercel

SQLite não funciona na Vercel (disco somente leitura). É preciso um Postgres e um segredo de sessão:

1. No projeto da Vercel, abra **Storage** → **Create Database** → **Postgres** e conecte ao projeto.
2. Em **Settings → Environment Variables**, confira se existe `DATABASE_URL` (ou `POSTGRES_URL`) começando com `postgres`. Aplique em Production, Preview e Development.
3. Adicione `AUTH_SECRET` com uma chave longa (`openssl rand -base64 48`).
4. Adicione `ALLOWED_EMAILS` com o seu e-mail (e os demais) **antes** do deploy, senão nem você entra.
5. **Redeploy** o último deployment. Sem o banco, o site sobe, mas o cadastro não grava usuário.

## E-mail (recuperar senha e relatório em PDF)

Preencha no `.env` (e nas variáveis da Vercel, se for enviar de produção):

```
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
APP_URL=http://localhost:3000
```

Sem SMTP, a recuperação de senha mostra o link na tela e o envio do PDF pede a configuração do correio.

## Anotações

O gráfico usa as cores e os símbolos clássicos do MOB:

- vermelho + bolinha fechada: menstruação / sangramento
- vermelho + pontinhos: manchas / borra
- verde + traço: seca
- branco + círculo aberto: fértil
- amarelo + igual: fluxo infértil (PBI) e fase pós-ovulatória

O material de apoio no app e no PDF cobre nomenclaturas, regras e o modo de anotar (à noite; primeiro o que se sente, depois o que se vê). Não substitui o acompanhamento com instrutora credenciada.
