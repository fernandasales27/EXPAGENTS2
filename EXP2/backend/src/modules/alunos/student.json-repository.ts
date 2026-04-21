import { JsonFileStore } from '../../infrastructure/persistence/json-file-store';
import type { Student } from '../../domain/models';
import type { StudentRepository } from './student.repository';

export class JsonStudentRepository implements StudentRepository {
  constructor(private readonly store: JsonFileStore<Student[]>) {}

  async list(): Promise<Student[]> {
    return this.store.read([]);
  }

  async findById(id: string): Promise<Student | undefined> {
    const students = await this.list();
    return students.find((student) => student.id === id);
  }

  async findByCpf(cpf: string): Promise<Student | undefined> {
    const students = await this.list();
    return students.find((student) => student.cpf === cpf);
  }

  async create(student: Student): Promise<Student> {
    const students = await this.list();
    students.push(student);
    await this.store.write(students);
    return student;
  }

  async update(id: string, student: Omit<Student, 'id'>): Promise<Student | undefined> {
    const students = await this.list();
    const index = students.findIndex((current) => current.id === id);
    if (index === -1) {
      return undefined;
    }

    const updated = { id, ...student };
    students[index] = updated;
    await this.store.write(students);
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const students = await this.list();
    const index = students.findIndex((student) => student.id === id);
    if (index === -1) {
      return false;
    }

    students.splice(index, 1);
    await this.store.write(students);
    return true;
  }
}
