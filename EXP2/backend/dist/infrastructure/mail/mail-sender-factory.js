"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMailSenderFromEnv = createMailSenderFromEnv;
const console_mail_sender_1 = require("./console-mail-sender");
const smtp_mail_sender_1 = require("./smtp-mail-sender");
function parseBoolean(value, defaultValue) {
    if (value === undefined) {
        return defaultValue;
    }
    return value.toLowerCase() === 'true';
}
function parseMode(value) {
    const normalized = value?.toLowerCase();
    if (normalized === 'smtp' || normalized === 'console') {
        return normalized;
    }
    return 'auto';
}
function createMailSenderFromEnv(env) {
    const mode = parseMode(env.EMAIL_SENDER_MODE);
    const host = env.SMTP_HOST;
    const portRaw = env.SMTP_PORT;
    const user = env.SMTP_USER;
    const pass = env.SMTP_PASS;
    const from = env.SMTP_FROM;
    if (mode === 'console') {
        return new console_mail_sender_1.ConsoleMailSender();
    }
    const missingConfig = !host || !portRaw || !user || !pass || !from;
    if (missingConfig) {
        if (mode === 'smtp') {
            throw new Error('EMAIL_SENDER_MODE=smtp exige configuracao completa de SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS e SMTP_FROM.');
        }
        return new console_mail_sender_1.ConsoleMailSender();
    }
    const port = Number(portRaw);
    if (Number.isNaN(port)) {
        if (mode === 'smtp') {
            throw new Error('SMTP_PORT deve ser numerico quando EMAIL_SENDER_MODE=smtp.');
        }
        return new console_mail_sender_1.ConsoleMailSender();
    }
    return new smtp_mail_sender_1.SmtpMailSender({
        host,
        port,
        secure: parseBoolean(env.SMTP_SECURE, false),
        user,
        pass,
        from
    });
}
