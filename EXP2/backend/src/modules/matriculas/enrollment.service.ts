import { randomUUID } from 'node:crypto';
import type { Enrollment, Student, ClassGroup } from '../../domain/models';
import type { EnrollmentRepository } from './enrollment.repository';
import type { StudentRepository } from '../alunos/student.repository';
import type { ClassGroupRepository } from '../turmas/class-group.repository';

export class EnrollmentService {
  constructor(
    private readonly repository: EnrollmentRepository,
    private readonly studentRepository: StudentRepository,
    private readonly classGroupRepository: ClassGroupRepository
  ) {}

  async list(classGroupId: string): Promise<Enrollment[]> {
    return this.repository.listByClassGroupId(classGroupId);
  }

  async create(classGroupId: string, studentId: string): Promise<Enrollment> {
    const classGroup = await this.classGroupRepository.findById(classGroupId);
    if (!classGroup) {
      throw new Error('Turma nao encontrada.');
    }

    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('Aluno nao encontrado.');
    }

    const existing = await this.repository.findByClassGroupAndStudent(classGroupId, studentId);
    if (existing) {
      throw new Error('Aluno ja matriculado nesta turma.');
    }

    return this.repository.create({
      id: randomUUID(),
      classGroupId,
      studentId
    });
  }

  async remove(classGroupId: string, studentId: string): Promise<void> {
    const removed = await this.repository.remove(classGroupId, studentId);
    if (!removed) {
      throw new Error('Matricula nao encontrada.');
    }
  }
}
