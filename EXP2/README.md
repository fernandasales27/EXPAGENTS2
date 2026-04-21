# EXP2

Sistema de gestao academica com frontend em React e backend em Node.js/TypeScript.

Permite:

- cadastrar e editar alunos
- cadastrar e editar turmas
- matricular alunos em turmas
- registrar avaliacoes por meta
- consolidar notificacoes por aluno em lotes diarios
- enviar email diario com todas as alteracoes de avaliacao

## Tecnologias

- frontend: React + TypeScript + Vite
- backend: Node.js + TypeScript
- persistencia: arquivos JSON em [backend/data](backend/data)
- testes de aceitacao: Cucumber em [tests](tests)

## Estrutura do Monorepo

- [frontend](frontend): aplicacao web
- [backend](backend): API e regras de negocio
- [tests](tests): cenarios Cucumber

## Requisitos

- Node.js 20+
- npm 10+

## Instalacao

Na raiz do projeto, rode:

```bash
npm install
```

## Como Rodar

Opcao 1 (comandos separados, recomendado)

1. backend (terminal 1):

```bash
npm run dev -w backend
```

2. frontend (terminal 2):

```bash
npm run dev -w frontend
```

3. abra no navegador:

```text
http://localhost:5173
```

Opcao 2 (quando ja estiver dentro da pasta)

- dentro de [backend](backend):

```bash
npm run dev
```

- dentro de [frontend](frontend):

```bash
npm run dev
```

## Build

Na raiz:

```bash
npm run build
```

Ou por workspace:

```bash
npm run build -w backend
npm run build -w frontend
```

## Testes

Na raiz:

```bash
npm run test
```

## Email SMTP (envio real)

As variaveis de exemplo estao em [backend/.env.example](backend/.env.example).

Crie [backend/.env](backend/.env) com:

- EMAIL_SENDER_MODE=smtp
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE
- SMTP_USER
- SMTP_PASS
- SMTP_FROM
- ENABLE_EMAIL_SCHEDULER
- EMAIL_DISPATCH_TIME

Com EMAIL_SENDER_MODE=smtp, o backend falha ao iniciar se o SMTP estiver incompleto.

## Regra de Consolidacao de Email

- cada alteracao de avaliacao entra no lote diario do aluno
- o aluno recebe apenas 1 email por dia
- esse email inclui alteracoes de todas as turmas do dia

Disparo:

- automatico pelo scheduler diario
- manual por API em POST /emails/dispatch

## Endpoints Principais

- GET/POST/PUT/DELETE /students
- GET/POST/PUT/DELETE /classes
- GET/POST/DELETE /classes/:classGroupId/enrollments
- GET/PUT /classes/:classGroupId/evaluations
- GET /emails/notifications
- POST /emails/dispatch
- GET /health
