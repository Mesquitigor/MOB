# MOB · Método de Ovulação Billings

Aplicação web para anotações diárias do Método Billings: selo do dia, gráfico do ciclo, exportação em PDF e envio do relatório ao e-mail cadastrado.

## Como rodar

```bash
npm install
npx prisma db push
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Cadastro: nome, e-mail e senha, sem confirmação de e-mail e sem regra de formato. O login só funciona com a senha gravada naquele cadastro. Marque **Lembrar de mim** para manter a sessão por 30 dias.

## E-mail (recuperar senha e relatório em PDF)

Preencha no `.env`:

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
