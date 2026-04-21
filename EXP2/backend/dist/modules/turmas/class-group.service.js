"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassGroupService = void 0;
const node_crypto_1 = require("node:crypto");
const validation_1 = require("../../domain/validation");
class ClassGroupService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list() {
        return this.repository.list();
    }
    async create(input) {
        const errors = (0, validation_1.validateClassGroupInput)(input);
        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
        return this.repository.create({
            id: (0, node_crypto_1.randomUUID)(),
            ...input
        });
    }
    async update(id, input) {
        const errors = (0, validation_1.validateClassGroupInput)(input);
        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
        const updated = await this.repository.update(id, input);
        if (!updated) {
            throw new Error('Turma nao encontrada.');
        }
        return updated;
    }
    async remove(id) {
        const removed = await this.repository.remove(id);
        if (!removed) {
            throw new Error('Turma nao encontrada.');
        }
    }
}
exports.ClassGroupService = ClassGroupService;
