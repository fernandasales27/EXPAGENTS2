import type { EvaluationConcept } from '../../domain/models';
import type { EmailNotificationRepository } from './email-notification.repository';
import type { EmailNotificationBatch } from './email-notification.types';

export class EmailNotificationService {
  constructor(private readonly repository: EmailNotificationRepository) {}

  async recordEvaluationChange(input: {
    studentId: string;
    studentEmail: string;
    classGroupId: string;
    goalId: string;
    concept: EvaluationConcept;
    updatedAt: string;
  }): Promise<EmailNotificationBatch> {
    const date = input.updatedAt.slice(0, 10);
    const existing = await this.repository.findByStudentAndDate(input.studentId, date);

    const item = {
      classGroupId: input.classGroupId,
      studentId: input.studentId,
      goalId: input.goalId,
      concept: input.concept,
      updatedAt: input.updatedAt
    };

    const batch: EmailNotificationBatch = existing
      ? {
          ...existing,
          studentEmail: input.studentEmail,
          sentAt: undefined,
          items: [...existing.items.filter((current) => !(current.classGroupId === item.classGroupId && current.goalId === item.goalId)), item]
        }
      : {
          studentId: input.studentId,
          studentEmail: input.studentEmail,
          date,
          items: [item]
        };

    return this.repository.upsert(batch);
  }
}
