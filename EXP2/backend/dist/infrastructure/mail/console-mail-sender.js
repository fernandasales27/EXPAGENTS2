"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleMailSender = void 0;
class ConsoleMailSender {
    async send(input) {
        console.log('EMAIL', {
            to: input.to,
            subject: input.subject,
            body: input.body
        });
    }
}
exports.ConsoleMailSender = ConsoleMailSender;
