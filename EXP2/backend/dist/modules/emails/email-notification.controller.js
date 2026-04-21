"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailNotificationController = createEmailNotificationController;
function sendJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
}
function createEmailNotificationController(repository) {
    return async (request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (request.method === 'GET' && url.pathname === '/emails/notifications') {
            const statusParam = url.searchParams.get('status');
            const filters = {
                studentId: url.searchParams.get('studentId') ?? undefined,
                date: url.searchParams.get('date') ?? undefined,
                status: statusParam === 'pending' || statusParam === 'sent'
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
