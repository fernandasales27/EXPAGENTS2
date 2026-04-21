"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonFileStore = void 0;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
class JsonFileStore {
    filePath;
    static writeQueues = new Map();
    constructor(filePath) {
        this.filePath = filePath;
    }
    async read(defaultValue) {
        try {
            const content = await (0, promises_1.readFile)(this.filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            if (this.isFileMissing(error)) {
                await this.write(defaultValue);
                return defaultValue;
            }
            throw error;
        }
    }
    async write(value) {
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(this.filePath), { recursive: true });
        // Serializa escritas por arquivo para evitar corrupção por concorrência.
        await this.enqueueWrite(() => this.writeWithRetry(this.filePath, JSON.stringify(value, null, 2)));
    }
    async enqueueWrite(task) {
        const previous = JsonFileStore.writeQueues.get(this.filePath) ?? Promise.resolve();
        const current = previous.catch(() => undefined).then(task);
        JsonFileStore.writeQueues.set(this.filePath, current);
        try {
            await current;
        }
        finally {
            if (JsonFileStore.writeQueues.get(this.filePath) === current) {
                JsonFileStore.writeQueues.delete(this.filePath);
            }
        }
    }
    async writeWithRetry(path, content, attempt = 1) {
        const maxAttempts = 10;
        const baseDelayMs = 200;
        try {
            await (0, promises_1.writeFile)(path, content, 'utf-8');
        }
        catch (error) {
            const isPermError = typeof error === 'object' &&
                error !== null &&
                'code' in error &&
                (error.code === 'EPERM' || error.code === 'EACCES');
            if (isPermError && attempt < maxAttempts) {
                const delayMs = baseDelayMs * Math.pow(1.5, attempt - 1);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                return this.writeWithRetry(path, content, attempt + 1);
            }
            throw error;
        }
    }
    isFileMissing(error) {
        return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
    }
}
exports.JsonFileStore = JsonFileStore;
