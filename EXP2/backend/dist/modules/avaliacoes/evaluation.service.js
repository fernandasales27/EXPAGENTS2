"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluationService = void 0;
const node_crypto_1 = require("node:crypto");
const validation_1 = require("../../domain/validation");
class EvaluationService {
    repository;
    enrollmentRepository;
    studentRepository;
    classGroupRepository;
    goalRepository;
    emailNotificationService;
    constructor(repository, enrollmentRepository, studentRepository, classGroupRepository, goalRepository, emailNotificationService) {
        this.repository = repository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.classGroupRepository = classGroupRepository;
        this.goalRepository = goalRepository;
        this.emailNotificationService = emailNotificationService;
    }
    async list(classGroupId) {
        return this.repository.listByClassGroupId(classGroupId);
    }
    async set(classGroupId, studentId, goalId, concept) {
        if (!(0, validation_1.isValidEvaluationConcept)(concept)) {
            throw new Error('Conceito invalido.');
        }
        const classGroup = await this.classGroupRepository.findById(classGroupId);
        if (!classGroup) {
            throw new Error('Turma nao encontrada.');
        }
        const student = await this.studentRepository.findById(studentId);
        if (!student) {
            throw new Error('Aluno nao encontrado.');
        }
        const goal = await this.goalRepository.findById(goalId);
        if (!goal) {
            throw new Error('Meta nao encontrada.');
        }
        const enrollment = await this.enrollmentRepository.findByClassGroupAndStudent(classGroupId, studentId);
        if (!enrollment) {
            throw new Error('Aluno nao matriculado nesta turma.');
        }
        const evaluation = await this.repository.upsert({
            id: (0, node_crypto_1.randomUUID)(),
            classGroupId,
            studentId,
            goalId,
            concept: concept,
            updatedAt: new Date().toISOString()
        });
        await this.emailNotificationService.recordEvaluationChange({
            studentId,
            studentEmail: student.email,
            classGroupId,
            goalId,
            concept: evaluation.concept,
            updatedAt: evaluation.updatedAt
        });
        return evaluation;
    }
}
exports.EvaluationService = EvaluationService;
