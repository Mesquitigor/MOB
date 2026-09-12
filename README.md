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

Cadastro: nome, e-mail e senha, sem confirmação de e-mail. O login só funciona com a senha gravada. Marque **Lembrar de mim** para manter a sessão por 30 dias.

## Deploy na Vercel

SQLite não funciona na Vercel (disco somente leitura). É preciso um Postgres e um segredo de sessão:

1. No projeto da Vercel, abra **Storage** → **Create Database** → **Postgres** e conecte ao projeto. Isso cria `DATABASE_URL`.
2. Em **Settings → Environment Variables**, adicione `AUTH_SECRET` com uma chave longa e aleatória.
3. Se o painel criou `POSTGRES_URL` e não `DATABASE_URL`, o app também aceita `POSTGRES_URL` / `POSTGRES_PRISMA_URL`. Ainda assim, o mais simples é copiar o valor para `DATABASE_URL`.
4. Faça um novo deploy. O build roda `prisma db push` e cria as tabelas.

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
