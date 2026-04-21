"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoalController = createGoalController;
function sendJson(response, statusCode, payload) {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify(payload));
}
function createGoalController(service) {
    return async (request, response) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (request.method === 'GET' && url.pathname === '/goals') {
            sendJson(response, 200, await service.list());
            return;
        }
        sendJson(response, 404, { message: 'Not found' });
    };
}
