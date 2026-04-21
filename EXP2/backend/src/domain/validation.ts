import type { ClassGroup, EvaluationConcept, Student } from './models';

export function isValidEvaluationConcept(value: string): value is EvaluationConcept {
  return value === 'MANA' || value === 'MPA' || value === 'MA';
}

export function validateStudentInput(input: Partial<Student>): string[] {
  const errors: string[] = [];

  if (!input.name?.trim()) {
    errors.push('Nome e obrigatorio.');
  }

  if (!input.cpf?.trim()) {
    errors.push('CPF e obrigatorio.');
  }

  if (!input.email?.trim()) {
    errors.push('Email e obrigatorio.');
  }

  return errors;
}

export function validateClassGroupInput(input: Partial<ClassGroup>): string[] {
  const errors: string[] = [];

  if (!input.topicDescription?.trim()) {
    errors.push('Descricao do topico e obrigatoria.');
  }

  if (typeof input.year !== 'number' || Number.isNaN(input.year)) {
    errors.push('Ano e obrigatorio.');
  }

  if (typeof input.semester !== 'number' || Number.isNaN(input.semester)) {
    errors.push('Semestre e obrigatorio.');
  }

  return errors;
}
