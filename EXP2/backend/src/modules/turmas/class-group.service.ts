import { randomUUID } from 'node:crypto';
import type { ClassGroup } from '../../domain/models';
import { validateClassGroupInput } from '../../domain/validation';
import type { ClassGroupRepository } from './class-group.repository';

export class ClassGroupService {
  constructor(private readonly repository: ClassGroupRepository) {}

  async list(): Promise<ClassGroup[]> {
    return this.repository.list();
  }

  async create(input: Omit<ClassGroup, 'id'>): Promise<ClassGroup> {
    const errors = validateClassGroupInput(input);
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }

    return this.repository.create({
      id: randomUUID(),
      ...input
    });
  }

  async update(id: string, input: Omit<ClassGroup, 'id'>): Promise<ClassGroup> {
    const errors = validateClassGroupInput(input);
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }

    const updated = await this.repository.update(id, input);
    if (!updated) {
      throw new Error('Turma nao encontrada.');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id);
    if (!removed) {
      throw new Error('Turma nao encontrada.');
    }
  }
}
