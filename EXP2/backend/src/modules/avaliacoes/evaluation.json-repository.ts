import { JsonFileStore } from '../../infrastructure/persistence/json-file-store';
import type { Evaluation } from '../../domain/models';
import type { EvaluationRepository } from './evaluation.repository';

export class JsonEvaluationRepository implements EvaluationRepository {
  constructor(private readonly store: JsonFileStore<Evaluation[]>) {}

  async listByClassGroupId(classGroupId: string): Promise<Evaluation[]> {
    const evaluations = await this.store.read([]);
    return evaluations.filter((evaluation) => evaluation.classGroupId === classGroupId);
  }

  async findByKeys(classGroupId: string, studentId: string, goalId: string): Promise<Evaluation | undefined> {
    const evaluations = await this.store.read([]);
    return evaluations.find(
      (evaluation) =>
        evaluation.classGroupId === classGroupId &&
        evaluation.studentId === studentId &&
        evaluation.goalId === goalId
    );
  }

  async upsert(evaluation: Evaluation): Promise<Evaluation> {
    const evaluations = await this.store.read([]);
    const index = evaluations.findIndex(
      (current) =>
        current.classGroupId === evaluation.classGroupId &&
        current.studentId === evaluation.studentId &&
        current.goalId === evaluation.goalId
    );

    if (index === -1) {
      evaluations.push(evaluation);
    } else {
      evaluations[index] = evaluation;
    }

    await this.store.write(evaluations);
    return evaluation;
  }
}
