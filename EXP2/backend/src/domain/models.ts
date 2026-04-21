export type Id = string;

export interface Student {
  id: Id;
  name: string;
  cpf: string;
  email: string;
}

export interface ClassGroup {
  id: Id;
  topicDescription: string;
  year: number;
  semester: number;
}

export interface Goal {
  id: Id;
  name: string;
  order: number;
}

export type EvaluationConcept = 'MANA' | 'MPA' | 'MA';

export interface Enrollment {
  id: Id;
  studentId: Id;
  classGroupId: Id;
}

export interface Evaluation {
  id: Id;
  studentId: Id;
  classGroupId: Id;
  goalId: Id;
  concept: EvaluationConcept;
  updatedAt: string;
}
