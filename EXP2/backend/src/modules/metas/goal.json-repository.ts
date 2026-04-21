import { JsonFileStore } from '../../infrastructure/persistence/json-file-store';
import type { Goal } from '../../domain/models';
import type { GoalRepository } from './goal.repository';

export class JsonGoalRepository implements GoalRepository {
  constructor(private readonly store: JsonFileStore<Goal[]>) {}

  async list(): Promise<Goal[]> {
    return this.store.read([]);
  }

  async findById(id: string): Promise<Goal | undefined> {
    const goals = await this.list();
    return goals.find((goal) => goal.id === id);
  }
}
