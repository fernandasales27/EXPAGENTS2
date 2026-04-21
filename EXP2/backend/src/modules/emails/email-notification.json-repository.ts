import { JsonFileStore } from '../../infrastructure/persistence/json-file-store';
import type { EmailNotificationBatch } from './email-notification.types';
import type { EmailNotificationFilters, EmailNotificationRepository } from './email-notification.repository';

export class JsonEmailNotificationRepository implements EmailNotificationRepository {
  constructor(private readonly store: JsonFileStore<EmailNotificationBatch[]>) {}

  async list(filters: EmailNotificationFilters = {}): Promise<EmailNotificationBatch[]> {
    const batches = await this.store.read([]);

    return batches.filter((batch) => {
      if (filters.studentId && batch.studentId !== filters.studentId) {
        return false;
      }

      if (filters.date && batch.date !== filters.date) {
        return false;
      }

      if (filters.status === 'pending' && batch.sentAt) {
        return false;
      }

      if (filters.status === 'sent' && !batch.sentAt) {
        return false;
      }

      return true;
    });
  }

  async findByStudentAndDate(studentId: string, date: string): Promise<EmailNotificationBatch | undefined> {
    const batches = await this.list();
    return batches.find((batch) => batch.studentId === studentId && batch.date === date);
  }

  async upsert(batch: EmailNotificationBatch): Promise<EmailNotificationBatch> {
    const batches = await this.list();
    const index = batches.findIndex((current) => current.studentId === batch.studentId && current.date === batch.date);

    if (index === -1) {
      batches.push(batch);
    } else {
      batches[index] = batch;
    }

    await this.store.write(batches);
    return batch;
  }

  async listPendingUntil(date: string): Promise<EmailNotificationBatch[]> {
    const batches = await this.list({ status: 'pending' });
    return batches.filter((batch) => batch.date <= date);
  }

  async markSent(studentId: string, date: string, sentAt: string): Promise<void> {
    const batches = await this.list();
    const index = batches.findIndex((batch) => batch.studentId === studentId && batch.date === date);
    if (index === -1) {
      return;
    }

    batches[index] = {
      ...batches[index],
      sentAt
    };

    await this.store.write(batches);
  }
}
