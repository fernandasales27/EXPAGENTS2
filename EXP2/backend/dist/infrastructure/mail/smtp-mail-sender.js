"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmtpMailSender = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class SmtpMailSender {
    options;
    transporter;
    constructor(options) {
        this.options = options;
        this.transporter = nodemailer_1.default.createTransport({
            host: options.host,
            port: options.port,
            secure: options.secure,
            auth: {
                user: options.user,
                pass: options.pass
            }
        });
    }
    async send(input) {
        await this.transporter.sendMail({
            from: this.options.from,
            to: input.to,
            subject: input.subject,
            text: input.body
        });
    }
}
exports.SmtpMailSender = SmtpMailSender;
