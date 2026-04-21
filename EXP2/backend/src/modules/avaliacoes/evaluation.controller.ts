import type { IncomingMessage, ServerResponse } from 'node:http';
import { EvaluationService } from './evaluation.service';

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

export function createEvaluationController(service: EvaluationService) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const match = url.pathname.match(/^\/classes\/([^/]+)\/evaluations(?:\/([^/]+)\/goals\/([^/]+))?$/);

    if (!match) {
      sendJson(response, 404, { message: 'Not found' });
      return;
    }

    const classGroupId = match[1];
    const studentId = match[2];
    const goalId = match[3];

    if (request.method === 'GET' && !studentId && !goalId) {
      sendJson(response, 200, await service.list(classGroupId));
      return;
    }

    if (request.method === 'PUT' && !studentId && !goalId) {
      const body = JSON.parse(await readBody(request)) as { studentId: string; goalId: string; concept: string };
      const updated = await service.set(classGroupId, body.studentId, body.goalId, body.concept);
      sendJson(response, 200, updated);
      return;
    }

    if (request.method === 'PUT' && studentId && goalId) {
      const body = JSON.parse(await readBody(request)) as { concept: string };
      const updated = await service.set(classGroupId, studentId, goalId, body.concept);
      sendJson(response, 200, updated);
      return;
    }

    sendJson(response, 405, { message: 'Method not allowed' });
  };
}
