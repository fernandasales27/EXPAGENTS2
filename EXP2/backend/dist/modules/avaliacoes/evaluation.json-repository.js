"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonEvaluationRepository = void 0;
class JsonEvaluationRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async listByClassGroupId(classGroupId) {
        const evaluations = await this.store.read([]);
        return evaluations.filter((evaluation) => evaluation.classGroupId === classGroupId);
    }
    async findByKeys(classGroupId, studentId, goalId) {
        const evaluations = await this.store.read([]);
        return evaluations.find((evaluation) => evaluation.classGroupId === classGroupId &&
            evaluation.studentId === studentId &&
            evaluation.goalId === goalId);
    }
    async upsert(evaluation) {
        const evaluations = await this.store.read([]);
        const index = evaluations.findIndex((current) => current.classGroupId === evaluation.classGroupId &&
            current.studentId === evaluation.studentId &&
            current.goalId === evaluation.goalId);
        if (index === -1) {
            evaluations.push(evaluation);
        }
        else {
            evaluations[index] = evaluation;
        }
        await this.store.write(evaluations);
        return evaluation;
    }
}
exports.JsonEvaluationRepository = JsonEvaluationRepository;
