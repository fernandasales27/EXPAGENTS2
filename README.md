# EXPAGENTS2

EXP2
Sistema de gestao academica com frontend em React e backend em Node.js/TypeScript.

Permite:

cadastrar e editar alunos
cadastrar e editar turmas
matricular alunos em turmas
registrar avaliacoes por meta
consolidar notificacoes por aluno em lotes diarios
enviar email diario com todas as alteracoes de avaliacao
Tecnologias
frontend: React + TypeScript + Vite
backend: Node.js + TypeScript
persistencia: arquivos JSON em backend/data
testes de aceitacao: Cucumber em tests
Estrutura do Monorepo
frontend: aplicacao web
backend: API e regras de negocio
tests: cenarios Cucumber
Requisitos
Node.js 20+
npm 10+
Instalacao
Na raiz do projeto, rode:

Como Rodar
Opcao 1 (comandos separados, recomendado)

Backend (terminal 1):

npm run dev -w backend

Frontend (terminal 2):

npm run dev -w frontend

Abra no navegador:

http://localhost:5173

Opcao 2 (quando ja estiver dentro da pasta)

Dentro da pasta backend:

npm run dev

Dentro da pasta frontend:

npm run dev

Build
Na raiz:

Ou por workspace:

Testes
Na raiz:

Email SMTP (envio real)
As variaveis de exemplo estao em backend/.env.example.

Crie o arquivo .env com:

EMAIL_SENDER_MODE=smtp
SMTP_HOST
SMTP_PORT
SMTP_SECURE
SMTP_USER
SMTP_PASS
SMTP_FROM
ENABLE_EMAIL_SCHEDULER
EMAIL_DISPATCH_TIME
Com EMAIL_SENDER_MODE=smtp, o backend falha ao iniciar se o SMTP estiver incompleto.

Regra de Consolidacao de Email
cada alteracao de avaliacao entra no lote diario do aluno
o aluno recebe apenas 1 email por dia
esse email inclui alteracoes de todas as turmas do dia
Disparo:

automatico pelo scheduler diario
manual por API em POST /emails/dispatch
Endpoints Principais
GET/POST/PUT/DELETE /students
GET/POST/PUT/DELETE /classes
GET/POST/DELETE /classes/:classGroupId/enrollments
GET/PUT /classes/:classGroupId/evaluations
GET /emails/notifications
POST /emails/dispatch
GET /health
