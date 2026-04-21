"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStudentRepository = void 0;
class InMemoryStudentRepository {
    students = [];
    async list() {
        return [...this.students];
    }
    async findById(id) {
        return this.students.find((student) => student.id === id);
    }
    async findByCpf(cpf) {
        return this.students.find((student) => student.cpf === cpf);
    }
    async create(student) {
        this.students.push(student);
        return student;
    }
    async update(id, student) {
        const index = this.students.findIndex((current) => current.id === id);
        if (index === -1) {
            return undefined;
        }
        const updated = { id, ...student };
        this.students[index] = updated;
        return updated;
    }
    async remove(id) {
        const index = this.students.findIndex((student) => student.id === id);
        if (index === -1) {
            return false;
        }
        this.students.splice(index, 1);
        return true;
    }
}
exports.InMemoryStudentRepository = InMemoryStudentRepository;
