"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmailDispatchController = createEmailDispatchController;
function readBody(request) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        request.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        request.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        request.on('error', reject);
    });
}
function sendJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
}
function createEmailDispatchController(service) {
    return async (request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (request.method === 'POST' && url.pathname === '/emails/dispatch') {
            const raw = await readBody(request);
            const parsed = raw ? JSON.parse(raw) : {};
            const date = parsed.date ?? new Date().toISOString().slice(0, 10);
            const result = await service.dispatchDaily(date);
            sendJson(response, 200, result);
            return;
        }
        sendJson(response, 404, { message: 'Not found' });
    };
}
