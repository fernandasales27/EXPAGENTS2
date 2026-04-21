Feature: Cadastro de alunos

  Scenario: Criar um aluno valido
    Given que o usuario acessa a pagina de alunos
    When ele cria um aluno com nome, cpf e email validos
    Then o aluno deve aparecer na lista
