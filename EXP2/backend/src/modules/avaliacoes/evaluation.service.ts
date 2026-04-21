import { randomUUID } from 'node:crypto';
import type { Evaluation, EvaluationConcept } from '../../domain/models';
import { isValidEvaluationConcept } from '../../domain/validation';
import type { EvaluationRepository } from './evaluation.repository';
import type { EnrollmentRepository } from '../matriculas/enrollment.repository';
import type { StudentRepository } from '../alunos/student.repository';
import type { ClassGroupRepository } from '../turmas/class-group.repository';
import type { GoalRepository } from '../metas/goal.repository';
import type { EmailNotificationService } from '../emails/email-notification.service';

export class EvaluationService {
  constructor(
    private readonly repository: EvaluationRepository,
    private readonly enrollmentRepository: EnrollmentRepository,
    private readonly studentRepository: StudentRepository,
    private readonly classGroupRepository: ClassGroupRepository,
    private readonly goalRepository: GoalRepository,
    private readonly emailNotificationService: EmailNotificationService
  ) {}

  async list(classGroupId: string): Promise<Evaluation[]> {
    return this.repository.listByClassGroupId(classGroupId);
  }

  async set(
    classGroupId: string,
    studentId: string,
    goalId: string,
    concept: string
  ): Promise<Evaluation> {
    if (!isValidEvaluationConcept(concept)) {
      throw new Error('Conceito invalido.');
    }

    const classGroup = await this.classGroupRepository.findById(classGroupId);
    if (!classGroup) {
      throw new Error('Turma nao encontrada.');
    }

    const student = await this.studentRepository.findById(studentId);
    if (!student) {
      throw new Error('Aluno nao encontrado.');
    }

    const goal = await this.goalRepository.findById(goalId);
    if (!goal) {
      throw new Error('Meta nao encontrada.');
    }

    const enrollment = await this.enrollmentRepository.findByClassGroupAndStudent(classGroupId, studentId);
    if (!enrollment) {
      throw new Error('Aluno nao matriculado nesta turma.');
    }

    const evaluation = await this.repository.upsert({
      id: randomUUID(),
      classGroupId,
      studentId,
      goalId,
      concept: concept as EvaluationConcept,
      updatedAt: new Date().toISOString()
    });

    await this.emailNotificationService.recordEvaluationChange({
      studentId,
      studentEmail: student.email,
      classGroupId,
      goalId,
      concept: evaluation.concept,
      updatedAt: evaluation.updatedAt
    });

    return evaluation;
  }
}
