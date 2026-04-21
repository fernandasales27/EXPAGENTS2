Feature: Envio de emails consolidados

  Scenario: Consolidar alteracoes do mesmo aluno no mesmo dia
    Given que um aluno teve mais de uma avaliacao alterada no mesmo dia
    When o processamento diario de emails for executado
    Then o aluno deve receber um unico email com todas as alteracoes
