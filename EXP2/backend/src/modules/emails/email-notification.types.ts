import type { EvaluationConcept } from '../../domain/models';

export interface EmailNotificationItem {
  classGroupId: string;
  studentId: string;
  goalId: string;
  concept: EvaluationConcept;
  updatedAt: string;
}

export interface EmailNotificationBatch {
  studentId: string;
  studentEmail: string;
  date: string;
  items: EmailNotificationItem[];
  sentAt?: string;
}
