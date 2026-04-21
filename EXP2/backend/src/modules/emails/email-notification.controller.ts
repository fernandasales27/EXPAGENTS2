import type { IncomingMessage, ServerResponse } from 'node:http';
import type { EmailNotificationFilters } from './email-notification.repository';
import type { EmailNotificationRepository } from './email-notification.repository';

function sendJson(response: ServerResponse, statusCode: number, payload: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

export function createEmailNotificationController(repository: EmailNotificationRepository) {
  return async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/emails/notifications') {
      const statusParam = url.searchParams.get('status');
      const filters: EmailNotificationFilters = {
        studentId: url.searchParams.get('studentId') ?? undefined,
        date: url.searchParams.get('date') ?? undefined,
        status:
          statusParam === 'pending' || statusParam === 'sent'
            ? statusParam
            : undefined
      };

      const data = await repository.list(filters);
      sendJson(response, 200, data);
      return;
    }

    sendJson(response, 404, { message: 'Not found' });
  };
}
