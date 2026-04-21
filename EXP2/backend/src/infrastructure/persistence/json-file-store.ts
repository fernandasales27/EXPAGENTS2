import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export class JsonFileStore<T> {
  private static readonly writeQueues = new Map<string, Promise<void>>();

  constructor(private readonly filePath: string) {}

  async read(defaultValue: T): Promise<T> {
    try {
      const content = await readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if (this.isFileMissing(error)) {
        await this.write(defaultValue);
        return defaultValue;
      }

      throw error;
    }
  }

  async write(value: T): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    // Serializa escritas por arquivo para evitar corrupção por concorrência.
    await this.enqueueWrite(() => this.writeWithRetry(this.filePath, JSON.stringify(value, null, 2)));
  }

  private async enqueueWrite(task: () => Promise<void>): Promise<void> {
    const previous = JsonFileStore.writeQueues.get(this.filePath) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(task);
    JsonFileStore.writeQueues.set(this.filePath, current);

    try {
      await current;
    } finally {
      if (JsonFileStore.writeQueues.get(this.filePath) === current) {
        JsonFileStore.writeQueues.delete(this.filePath);
      }
    }
  }

  private async writeWithRetry(path: string, content: string, attempt: number = 1): Promise<void> {
    const maxAttempts = 10;
    const baseDelayMs = 200;

    try {
      await writeFile(path, content, 'utf-8');
    } catch (error) {
      const isPermError = 
        typeof error === 'object' && 
        error !== null && 
        'code' in error && 
        ((error as { code?: string }).code === 'EPERM' || (error as { code?: string }).code === 'EACCES');

      if (isPermError && attempt < maxAttempts) {
        const delayMs = baseDelayMs * Math.pow(1.5, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.writeWithRetry(path, content, attempt + 1);
      }

      throw error;
    }
  }

  private isFileMissing(error: unknown): boolean {
    return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'ENOENT';
  }
}
