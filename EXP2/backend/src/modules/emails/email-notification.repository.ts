import type { EmailNotificationBatch } from './email-notification.types';

export interface EmailNotificationFilters {
  studentId?: string;
  date?: string;
  status?: 'pending' | 'sent';
}

export interface EmailNotificationRepository {
  findByStudentAndDate(studentId: string, date: string): Promise<EmailNotificationBatch | undefined>;
  list(filters?: EmailNotificationFilters): Promise<EmailNotificationBatch[]>;
  listPendingUntil(date: string): Promise<EmailNotificationBatch[]>;
  upsert(batch: EmailNotificationBatch): Promise<EmailNotificationBatch>;
  markSent(studentId: string, date: string, sentAt: string): Promise<void>;
}
