"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnrollmentController = createEnrollmentController;
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
function createEnrollmentController(service) {
    return async (request, response) => {
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
            const body = JSON.parse(await readBody(request));
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
