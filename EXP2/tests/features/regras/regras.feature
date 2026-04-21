Feature: Regras de negocio e validacoes

  Scenario: Impedir cadastro de aluno com CPF duplicado
    Given que ja existe um aluno com CPF cadastrado
    When o usuario tenta cadastrar outro aluno com o mesmo CPF
    Then o sistema deve retornar erro de CPF duplicado

  Scenario: Impedir conceito de avaliacao invalido
    Given que existe contexto valido para lancar avaliacao
    When o usuario informa um conceito de avaliacao invalido
    Then o sistema deve retornar erro de conceito invalido

  Scenario: Impedir matricula duplicada na mesma turma
    Given que um aluno ja esta matriculado em uma turma
    When o usuario tenta matricular novamente o mesmo aluno na turma
    Then o sistema deve retornar erro de matricula duplicada
