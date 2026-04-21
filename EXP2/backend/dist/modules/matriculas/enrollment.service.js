"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const node_crypto_1 = require("node:crypto");
class EnrollmentService {
    repository;
    studentRepository;
    classGroupRepository;
    constructor(repository, studentRepository, classGroupRepository) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.classGroupRepository = classGroupRepository;
    }
    async list(classGroupId) {
        return this.repository.listByClassGroupId(classGroupId);
    }
    async create(classGroupId, studentId) {
        const classGroup = await this.classGroupRepository.findById(classGroupId);
        if (!classGroup) {
            throw new Error('Turma nao encontrada.');
        }
        const student = await this.studentRepository.findById(studentId);
        if (!student) {
            throw new Error('Aluno nao encontrado.');
        }
        const existing = await this.repository.findByClassGroupAndStudent(classGroupId, studentId);
        if (existing) {
            throw new Error('Aluno ja matriculado nesta turma.');
        }
        return this.repository.create({
            id: (0, node_crypto_1.randomUUID)(),
            classGroupId,
            studentId
        });
    }
    async remove(classGroupId, studentId) {
        const removed = await this.repository.remove(classGroupId, studentId);
        if (!removed) {
            throw new Error('Matricula nao encontrada.');
        }
    }
}
exports.EnrollmentService = EnrollmentService;
