"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalService = void 0;
class GoalService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list() {
        return this.repository.list();
    }
}
exports.GoalService = GoalService;
