"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailNotificationService = void 0;
class EmailNotificationService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async recordEvaluationChange(input) {
        const date = input.updatedAt.slice(0, 10);
        const existing = await this.repository.findByStudentAndDate(input.studentId, date);
        const item = {
            classGroupId: input.classGroupId,
            studentId: input.studentId,
            goalId: input.goalId,
            concept: input.concept,
            updatedAt: input.updatedAt
        };
        const batch = existing
            ? {
                ...existing,
                studentEmail: input.studentEmail,
                sentAt: undefined,
                items: [...existing.items.filter((current) => !(current.classGroupId === item.classGroupId && current.goalId === item.goalId)), item]
            }
            : {
                studentId: input.studentId,
                studentEmail: input.studentEmail,
                date,
                items: [item]
            };
        return this.repository.upsert(batch);
    }
}
exports.EmailNotificationService = EmailNotificationService;
