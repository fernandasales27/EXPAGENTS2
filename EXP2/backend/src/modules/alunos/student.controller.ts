import type { IncomingMessage, ServerResponse } from 'node:http';
import { StudentService } from './student.service';

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

export function createStudentController(service: StudentService) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/students') {
      sendJson(response, 200, await service.list());
      return;
    }

    if (request.method === 'POST' && url.pathname === '/students') {
      const body = JSON.parse(await readBody(request)) as { name: string; cpf: string; email: string };
      const created = await service.create(body);
      sendJson(response, 201, created);
      return;
    }

    const match = url.pathname.match(/^\/students\/([^/]+)$/);
    if (match && request.method === 'PUT') {
      const body = JSON.parse(await readBody(request)) as { name: string; cpf: string; email: string };
      const updated = await service.update(match[1], body);
      sendJson(response, 200, updated);
      return;
    }

    if (match && request.method === 'DELETE') {
      await service.remove(match[1]);
      sendJson(response, 204, null);
      return;
    }

    sendJson(response, 404, { message: 'Not found' });
  };
}
