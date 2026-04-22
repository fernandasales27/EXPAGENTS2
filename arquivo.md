# Revisao do Sistema do Colega

## Identificacao
- Repositorio revisado: (https://github.com/igusouz/exp-school-app.git)
- Data da revisao:22/04/26
- Revisor: Maria Fernanda Sales# Revisao do Sistema do Colega


## Resumo da avaliacao
O projeto atende bem aos requisitos propostos para o sistema acadêmico. A aplicação apresenta boa usabilidade, fluxo coerente entre telas e regras de negócio funcionando de forma consistente. Os testes automatizados ajudam a dar confiança no comportamento esperado.

## Pontos fortes
1. Interface clara e facil de navegar.
2. Funcionalidades principais implementadas e integradas.
3. Fluidez

## Problemas encontrados
1.Problema: regra de antispam diario pode confundir durante testes manuais no mesmo dia.
   Impacto: usuario pode achar que o envio de e-mail falhou quando, na verdade, foi ignorado por ja ter havido envio naquele dia.
   Evidencia (arquivo/cenario): ao disparar notificacoes novamente no mesmo dia, retorno com sent 0 e skipped maior que 0.
   Sugestao: exibir mensagem mais explicita na interface informando o motivo do skipped e para qual aluno ocorreu.



## Cobertura dos requisitos
CRUD de alunos: [x] Sim [ ] Parcial [ ] Nao
CRUD de turmas: [x] Sim [ ] Parcial [ ] Nao
Matricula de alunos em turmas: [x] Sim [ ] Parcial [ ] Nao
Registro de avaliacoes por meta: [x] Sim [ ] Parcial [ ] Nao
Consolidacao diaria de notificacoes por aluno: [x] Sim [ ] Parcial [ ] Nao
Envio de email diario consolidado: [x] Sim [ ] Parcial [ ] Nao
Testes de aceitacao com Cucumber: [x] Sim [ ] Parcial [ ] Nao


## Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?
A qualidade geral ficou semelhante. Ambos entregam os requisitos principais, mas este sistema se destaca pela fluidez de navegacao e pela organizacao da experiencia do usuario em alguns fluxos.


## Revisão do histórico do desenvolvimento
O desenvolvimento do meu sistema seguiu um progressao organizado: definição de estrutura, implementaçãao dos módulos principais, testes de aceitação e refinamentos de interface/fluxos. Houve bom aproveitamento da assistência por agente para acelerar implementação e ajustes, especialmente na camada de frontend e na integração de funcionalidades de email.


