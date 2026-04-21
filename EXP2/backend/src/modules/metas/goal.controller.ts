import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoalService } from './goal.service';

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export function createGoalController(service: GoalService) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/goals') {
      sendJson(response, 200, await service.list());
      return;
    }

    sendJson(response, 404, { message: 'Not found' });
  };
}
