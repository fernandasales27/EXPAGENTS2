"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonGoalRepository = void 0;
class JsonGoalRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async list() {
        return this.store.read([]);
    }
    async findById(id) {
        const goals = await this.list();
        return goals.find((goal) => goal.id === id);
    }
}
exports.JsonGoalRepository = JsonGoalRepository;
