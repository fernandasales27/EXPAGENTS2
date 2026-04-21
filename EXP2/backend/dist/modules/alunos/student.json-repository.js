"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonStudentRepository = void 0;
class JsonStudentRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async list() {
        return this.store.read([]);
    }
    async findById(id) {
        const students = await this.list();
        return students.find((student) => student.id === id);
    }
    async findByCpf(cpf) {
        const students = await this.list();
        return students.find((student) => student.cpf === cpf);
    }
    async create(student) {
        const students = await this.list();
        students.push(student);
        await this.store.write(students);
        return student;
    }
    async update(id, student) {
        const students = await this.list();
        const index = students.findIndex((current) => current.id === id);
        if (index === -1) {
            return undefined;
        }
        const updated = { id, ...student };
        students[index] = updated;
        await this.store.write(students);
        return updated;
    }
    async remove(id) {
        const students = await this.list();
        const index = students.findIndex((student) => student.id === id);
        if (index === -1) {
            return false;
        }
        students.splice(index, 1);
        await this.store.write(students);
        return true;
    }
}
exports.JsonStudentRepository = JsonStudentRepository;
