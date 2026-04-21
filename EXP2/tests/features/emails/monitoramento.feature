Feature: Monitoramento de notificacoes de email

  Scenario: Consultar notificacoes pendentes e enviadas
    Given que existe notificacao de email pendente para um aluno
    When o usuario consulta notificacoes com status pendente
    Then o endpoint deve retornar a notificacao pendente do aluno
    When o processamento diario de emails for executado
    And o usuario consulta notificacoes com status enviado
    Then o endpoint deve retornar a notificacao enviada do aluno
