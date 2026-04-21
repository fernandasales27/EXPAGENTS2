import type { Evaluation } from '../../domain/models';

export interface EvaluationRepository {
  listByClassGroupId(classGroupId: string): Promise<Evaluation[]>;
  findByKeys(classGroupId: string, studentId: string, goalId: string): Promise<Evaluation | undefined>;
  upsert(evaluation: Evaluation): Promise<Evaluation>;
}
