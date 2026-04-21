import { JsonFileStore } from '../../infrastructure/persistence/json-file-store';
import type { ClassGroup } from '../../domain/models';
import type { ClassGroupRepository } from './class-group.repository';

export class JsonClassGroupRepository implements ClassGroupRepository {
  constructor(private readonly store: JsonFileStore<ClassGroup[]>) {}

  async list(): Promise<ClassGroup[]> {
    return this.store.read([]);
  }

  async findById(id: string): Promise<ClassGroup | undefined> {
    const classGroups = await this.list();
    return classGroups.find((classGroup) => classGroup.id === id);
  }

  async create(classGroup: ClassGroup): Promise<ClassGroup> {
    const classGroups = await this.list();
    classGroups.push(classGroup);
    await this.store.write(classGroups);
    return classGroup;
  }

  async update(id: string, classGroup: Omit<ClassGroup, 'id'>): Promise<ClassGroup | undefined> {
    const classGroups = await this.list();
    const index = classGroups.findIndex((current) => current.id === id);
    if (index === -1) {
      return undefined;
    }

    const updated = { id, ...classGroup };
    classGroups[index] = updated;
    await this.store.write(classGroups);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const classGroups = await this.list();
    const index = classGroups.findIndex((classGroup) => classGroup.id === id);
    if (index === -1) {
      return false;
    }

    classGroups.splice(index, 1);
    await this.store.write(classGroups);
    return true;
  }
}
