import type { IncomingMessage, ServerResponse } from 'node:http';
import { EnrollmentService } from './enrollment.service';

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

export function createEnrollmentController(service: EnrollmentService) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const match = url.pathname.match(/^\/classes\/([^/]+)\/enrollments(?:\/([^/]+))?$/);

    if (!match) {
      sendJson(response, 404, { message: 'Not found' });
      return;
    }

    const classGroupId = match[1];
    const studentId = match[2];

    if (request.method === 'GET' && !studentId) {
      sendJson(response, 200, await service.list(classGroupId));
      return;
    }

    if (request.method === 'POST' && !studentId) {
      const body = JSON.parse(await readBody(request)) as { studentId: string };
      const created = await service.create(classGroupId, body.studentId);
      sendJson(response, 201, created);
      return;
    }

    if (request.method === 'DELETE' && studentId) {
      await service.remove(classGroupId, studentId);
      sendJson(response, 204, null);
      return;
    }

    sendJson(response, 405, { message: 'Method not allowed' });
  };
}
