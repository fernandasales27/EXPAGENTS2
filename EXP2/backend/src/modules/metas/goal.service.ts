import type { Goal } from '../../domain/models';
import type { GoalRepository } from './goal.repository';

export class GoalService {
  constructor(private readonly repository: GoalRepository) {}

  async list(): Promise<Goal[]> {
    return this.repository.list();
  }
}
