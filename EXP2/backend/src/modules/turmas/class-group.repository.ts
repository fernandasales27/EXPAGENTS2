import type { ClassGroup } from '../../domain/models';

export interface ClassGroupRepository {
  list(): Promise<ClassGroup[]>;
  findById(id: string): Promise<ClassGroup | undefined>;
  create(classGroup: ClassGroup): Promise<ClassGroup>;
  update(id: string, classGroup: Omit<ClassGroup, 'id'>): Promise<ClassGroup | undefined>;
  remove(id: string): Promise<boolean>;
}
