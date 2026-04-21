import type { Student } from '../../domain/models';

export interface StudentRepository {
  list(): Promise<Student[]>;
  findById(id: string): Promise<Student | undefined>;
  findByCpf(cpf: string): Promise<Student | undefined>;
  create(student: Student): Promise<Student>;
  update(id: string, student: Omit<Student, 'id'>): Promise<Student | undefined>;
  remove(id: string): Promise<boolean>;
}
