import type { Student } from '../../domain/models';
import type { StudentRepository } from './student.repository';

export class InMemoryStudentRepository implements StudentRepository {
  private readonly students: Student[] = [];

  async list(): Promise<Student[]> {
    return [...this.students];
  }

  async findById(id: string): Promise<Student | undefined> {
    return this.students.find((student) => student.id === id);
  }

  async findByCpf(cpf: string): Promise<Student | undefined> {
    return this.students.find((student) => student.cpf === cpf);
  }

  async create(student: Student): Promise<Student> {
    this.students.push(student);
    return student;
  }

  async update(id: string, student: Omit<Student, 'id'>): Promise<Student | undefined> {
    const index = this.students.findIndex((current) => current.id === id);
    if (index === -1) {
      return undefined;
    }

    const updated = { id, ...student };
    this.students[index] = updated;
    return updated;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.students.findIndex((student) => student.id === id);
    if (index === -1) {
      return false;
    }

    this.students.splice(index, 1);
    return true;
  }
}
