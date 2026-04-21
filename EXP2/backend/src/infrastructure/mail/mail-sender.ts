export interface MailSender {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
}
