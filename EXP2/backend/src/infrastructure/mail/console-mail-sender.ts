import type { MailSender } from './mail-sender';

export class ConsoleMailSender implements MailSender {
  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    console.log('EMAIL', {
      to: input.to,
      subject: input.subject,
      body: input.body
    });
  }
}
