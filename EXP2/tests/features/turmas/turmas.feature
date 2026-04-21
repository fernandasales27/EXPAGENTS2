Feature: Cadastro de turmas

  Scenario: Criar uma turma
    Given que o usuario acessa a pagina de turmas
    When ele cria uma turma com descricao, ano e semestre validos
    Then a turma deve aparecer na lista
