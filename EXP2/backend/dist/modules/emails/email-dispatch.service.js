"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailDispatchService = void 0;
class EmailDispatchService {
    repository;
    classGroupRepository;
    goalRepository;
    mailSender;
    constructor(repository, classGroupRepository, goalRepository, mailSender) {
        this.repository = repository;
        this.classGroupRepository = classGroupRepository;
        this.goalRepository = goalRepository;
        this.mailSender = mailSender;
    }
    async dispatchDaily(date) {
        const batches = await this.repository.listPendingUntil(date);
        for (const batch of batches) {
            const subject = `Atualizacoes de avaliacao - ${batch.date}`;
            const classMap = new Map((await this.classGroupRepository.list()).map((c) => [c.id, c]));
            const goalMap = new Map((await this.goalRepository.list()).map((g) => [g.id, g]));
            const itemLines = [];
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
exports.EmailDispatchService = EmailDispatchService;
