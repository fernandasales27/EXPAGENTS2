import type { MailSender } from '../../infrastructure/mail/mail-sender';
import type { EmailNotificationRepository } from './email-notification.repository';
import type { ClassGroupRepository } from '../turmas/class-group.repository';
import type { GoalRepository } from '../metas/goal.repository';

export class EmailDispatchService {
  constructor(
    private readonly repository: EmailNotificationRepository,
    private readonly classGroupRepository: ClassGroupRepository,
    private readonly goalRepository: GoalRepository,
    private readonly mailSender: MailSender
  ) {}

  async dispatchDaily(date: string): Promise<{ processed: number }> {
    const batches = await this.repository.listPendingUntil(date);

    for (const batch of batches) {
      const subject = `Atualizacoes de avaliacao - ${batch.date}`;
      
      const classMap = new Map((await this.classGroupRepository.list()).map((c) => [c.id, c]));
      const goalMap = new Map((await this.goalRepository.list()).map((g) => [g.id, g]));

      const itemLines: string[] = [];
      for (const item of batch.items) {
        const classGroup = classMap.get(item.classGroupId);
        const goal = goalMap.get(item.goalId);
        const className = classGroup?.topicDescription ?? item.classGroupId;
        const goalName = goal?.name ?? item.goalId;
        itemLines.push(`  - ${className} | ${goalName}: ${item.concept}`);
      }

      const body = `Ola,\n\nVoce tem atualizacoes de avaliacao:\n\n${itemLines.join('\n')}\n\nAtenciosamente,\nSistema de Avaliacoes`;

      await this.mailSender.send({
        to: batch.studentEmail,
        subject,
        body
      });

      await this.repository.markSent(batch.studentId, batch.date, new Date().toISOString());
    }

    return { processed: batches.length };
  }
}
