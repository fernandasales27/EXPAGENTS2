"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const node_crypto_1 = require("node:crypto");
const validation_1 = require("../../domain/validation");
class StudentService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list() {
        return this.repository.list();
    }
    async create(input) {
        const errors = (0, validation_1.validateStudentInput)(input);
        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
        if (await this.repository.findByCpf(input.cpf)) {
            throw new Error('CPF ja cadastrado.');
        }
        return this.repository.create({
            id: (0, node_crypto_1.randomUUID)(),
            ...input
        });
    }
    async update(id, input) {
        const errors = (0, validation_1.validateStudentInput)(input);
        if (errors.length > 0) {
            throw new Error(errors.join(' '));
        }
        const existingByCpf = await this.repository.findByCpf(input.cpf);
        if (existingByCpf && existingByCpf.id !== id) {
            throw new Error('CPF ja cadastrado.');
        }
        const updated = await this.repository.update(id, input);
        if (!updated) {
            throw new Error('Aluno nao encontrado.');
        }
        return updated;
    }
    async remove(id) {
        const removed = await this.repository.remove(id);
        if (!removed) {
            throw new Error('Aluno nao encontrado.');
        }
    }
}
exports.StudentService = StudentService;
