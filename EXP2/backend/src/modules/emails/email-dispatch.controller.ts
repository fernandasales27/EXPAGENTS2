import type { IncomingMessage, ServerResponse } from 'node:http';
import { EmailDispatchService } from './email-dispatch.service';

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    request.on('error', reject);
  });
}

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export function createEmailDispatchController(service: EmailDispatchService) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'POST' && url.pathname === '/emails/dispatch') {
      const raw = await readBody(request);
      const parsed = raw ? (JSON.parse(raw) as { date?: string }) : {};
      const date = parsed.date ?? new Date().toISOString().slice(0, 10);

      const result = await service.dispatchDaily(date);
      sendJson(response, 200, result);
      return;
    }

    sendJson(response, 404, { message: 'Not found' });
  };
}
