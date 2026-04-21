import type { MailSender } from './mail-sender';
import { ConsoleMailSender } from './console-mail-sender';
import { SmtpMailSender } from './smtp-mail-sender';

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

type EmailSenderMode = 'auto' | 'smtp' | 'console';

function parseMode(value: string | undefined): EmailSenderMode {
  const normalized = value?.toLowerCase();
  if (normalized === 'smtp' || normalized === 'console') {
    return normalized;
  }

  return 'auto';
}

export function createMailSenderFromEnv(env: NodeJS.ProcessEnv): MailSender {
  const mode = parseMode(env.EMAIL_SENDER_MODE);
  const host = env.SMTP_HOST;
  const portRaw = env.SMTP_PORT;
  const user = env.SMTP_USER;
  const pass = env.SMTP_PASS;
  const from = env.SMTP_FROM;

  if (mode === 'console') {
    return new ConsoleMailSender();
  }

  const missingConfig = !host || !portRaw || !user || !pass || !from;
  if (missingConfig) {
    if (mode === 'smtp') {
      throw new Error(
        'EMAIL_SENDER_MODE=smtp exige configuracao completa de SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SMTP_FROM.'
      );
    }

    return new ConsoleMailSender();
  }

  const port = Number(portRaw);
  if (Number.isNaN(port)) {
    if (mode === 'smtp') {
      throw new Error('SMTP_PORT deve ser numerico quando EMAIL_SENDER_MODE=smtp.');
    }

    return new ConsoleMailSender();
  }

  return new SmtpMailSender({
    host,
    port,
    secure: parseBoolean(env.SMTP_SECURE, false),
    user,
    pass,
    from
  });
}
