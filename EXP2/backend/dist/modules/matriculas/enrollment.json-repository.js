"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonEnrollmentRepository = void 0;
class JsonEnrollmentRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async listByClassGroupId(classGroupId) {
        const enrollments = await this.store.read([]);
        return enrollments.filter((enrollment) => enrollment.classGroupId === classGroupId);
    }
    async findByClassGroupAndStudent(classGroupId, studentId) {
        const enrollments = await this.store.read([]);
        return enrollments.find((enrollment) => enrollment.classGroupId === classGroupId && enrollment.studentId === studentId);
    }
    async create(enrollment) {
        const enrollments = await this.store.read([]);
        enrollments.push(enrollment);
        await this.store.write(enrollments);
        return enrollment;
    }
    async remove(classGroupId, studentId) {
        const enrollments = await this.store.read([]);
        const index = enrollments.findIndex((enrollment) => enrollment.classGroupId === classGroupId && enrollment.studentId === studentId);
        if (index === -1) {
            return false;
        }
        enrollments.splice(index, 1);
        await this.store.write(enrollments);
        return true;
    }
}
exports.JsonEnrollmentRepository = JsonEnrollmentRepository;
