import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { MailSender } from './mail-sender';

export interface SmtpMailSenderOptions {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export class SmtpMailSender implements MailSender {
  private readonly transporter: Transporter;

  constructor(private readonly options: SmtpMailSenderOptions) {
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: {
        user: options.user,
        pass: options.pass
      }
    });
  }

  async send(input: { to: string; subject: string; body: string }): Promise<void> {
    await this.transporter.sendMail({
      from: this.options.from,
      to: input.to,
      subject: input.subject,
      text: input.body
    });
  }
}
