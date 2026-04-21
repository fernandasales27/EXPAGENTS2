"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonClassGroupRepository = void 0;
class JsonClassGroupRepository {
    store;
    constructor(store) {
        this.store = store;
    }
    async list() {
        return this.store.read([]);
    }
    async findById(id) {
        const classGroups = await this.list();
        return classGroups.find((classGroup) => classGroup.id === id);
    }
    async create(classGroup) {
        const classGroups = await this.list();
        classGroups.push(classGroup);
        await this.store.write(classGroups);
        return classGroup;
    }
    async update(id, classGroup) {
        const classGroups = await this.list();
        const index = classGroups.findIndex((current) => current.id === id);
        if (index === -1) {
            return undefined;
        }
        const updated = { id, ...classGroup };
        classGroups[index] = updated;
        await this.store.write(classGroups);
        return updated;
    }
    async remove(id) {
        const classGroups = await this.list();
        const index = classGroups.findIndex((classGroup) => classGroup.id === id);
        if (index === -1) {
            return false;
        }
        classGroups.splice(index, 1);
        await this.store.write(classGroups);
        return true;
    }
}
exports.JsonClassGroupRepository = JsonClassGroupRepository;
