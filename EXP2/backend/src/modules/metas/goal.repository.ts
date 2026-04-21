import type { Goal } from '../../domain/models';

export interface GoalRepository {
  list(): Promise<Goal[]>;
  findById(id: string): Promise<Goal | undefined>;
}
