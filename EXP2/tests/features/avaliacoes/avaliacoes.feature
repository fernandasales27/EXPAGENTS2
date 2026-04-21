Feature: Avaliacoes por turma

  Scenario: Visualizar avaliacoes de uma turma
    Given que existe uma turma com alunos matriculados
    When o usuario abre a tela de avaliacoes da turma
    Then deve ver os alunos nas linhas e as metas nas colunas
