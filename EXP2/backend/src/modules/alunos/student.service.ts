import { randomUUID } from 'node:crypto';
import type { Student } from '../../domain/models';
import { validateStudentInput } from '../../domain/validation';
import type { StudentRepository } from './student.repository';

export class StudentService {
  constructor(private readonly repository: StudentRepository) {}

  async list(): Promise<Student[]> {
    return this.repository.list();
  }

  async create(input: Omit<Student, 'id'>): Promise<Student> {
    const errors = validateStudentInput(input);
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }

    if (await this.repository.findByCpf(input.cpf)) {
      throw new Error('CPF ja cadastrado.');
    }

    return this.repository.create({
      id: randomUUID(),
      ...input
    });
  }

  async update(id: string, input: Omit<Student, 'id'>): Promise<Student> {
    const errors = validateStudentInput(input);
    if (errors.length > 0) {
      throw new Error(errors.join(' '));
    }

    const existingByCpf = await this.repository.findByCpf(input.cpf);
    if (existingByCpf && existingByCpf.id !== id) {
      throw new Error('CPF ja cadastrado.');
    }

    const updated = await this.repository.update(id, input);
    if (!updated) {
      throw new Error('Aluno nao encontrado.');
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.remove(id);
    if (!removed) {
      throw new Error('Aluno nao encontrado.');
    }
  }
}
