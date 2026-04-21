"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.emailDispatchService = void 0;
const node_http_1 = require("node:http");
const node_path_1 = require("node:path");
const student_controller_1 = require("./modules/alunos/student.controller");
const student_json_repository_1 = require("./modules/alunos/student.json-repository");
const student_service_1 = require("./modules/alunos/student.service");
const json_file_store_1 = require("./infrastructure/persistence/json-file-store");
const class_group_json_repository_1 = require("./modules/turmas/class-group.json-repository");
const class_group_service_1 = require("./modules/turmas/class-group.service");
const class_group_controller_1 = require("./modules/turmas/class-group.controller");
const goal_json_repository_1 = require("./modules/metas/goal.json-repository");
const goal_service_1 = require("./modules/metas/goal.service");
const goal_controller_1 = require("./modules/metas/goal.controller");
const enrollment_json_repository_1 = require("./modules/matriculas/enrollment.json-repository");
const enrollment_service_1 = require("./modules/matriculas/enrollment.service");
const enrollment_controller_1 = require("./modules/matriculas/enrollment.controller");
const evaluation_json_repository_1 = require("./modules/avaliacoes/evaluation.json-repository");
const evaluation_service_1 = require("./modules/avaliacoes/evaluation.service");
const evaluation_controller_1 = require("./modules/avaliacoes/evaluation.controller");
const email_notification_json_repository_1 = require("./modules/emails/email-notification.json-repository");
const email_notification_service_1 = require("./modules/emails/email-notification.service");
const email_dispatch_service_1 = require("./modules/emails/email-dispatch.service");
const email_dispatch_controller_1 = require("./modules/emails/email-dispatch.controller");
const mail_sender_factory_1 = require("./infrastructure/mail/mail-sender-factory");
const email_notification_controller_1 = require("./modules/emails/email-notification.controller");
const studentsFilePath = (0, node_path_1.resolve)(__dirname, '../data/students.json');
const classesFilePath = (0, node_path_1.resolve)(__dirname, '../data/classes.json');
const goalsFilePath = (0, node_path_1.resolve)(__dirname, '../data/goals.json');
const enrollmentsFilePath = (0, node_path_1.resolve)(__dirname, '../data/enrollments.json');
const evaluationsFilePath = (0, node_path_1.resolve)(__dirname, '../data/evaluations.json');
const emailNotificationsFilePath = (0, node_path_1.resolve)(__dirname, '../data/email-notifications.json');
const studentRepository = new student_json_repository_1.JsonStudentRepository(new json_file_store_1.JsonFileStore(studentsFilePath));
const classGroupRepository = new class_group_json_repository_1.JsonClassGroupRepository(new json_file_store_1.JsonFileStore(classesFilePath));
const goalRepository = new goal_json_repository_1.JsonGoalRepository(new json_file_store_1.JsonFileStore(goalsFilePath));
const enrollmentRepository = new enrollment_json_repository_1.JsonEnrollmentRepository(new json_file_store_1.JsonFileStore(enrollmentsFilePath));
const evaluationRepository = new evaluation_json_repository_1.JsonEvaluationRepository(new json_file_store_1.JsonFileStore(evaluationsFilePath));
const emailNotificationRepository = new email_notification_json_repository_1.JsonEmailNotificationRepository(new json_file_store_1.JsonFileStore(emailNotificationsFilePath));
const studentService = new student_service_1.StudentService(studentRepository);
const classGroupService = new class_group_service_1.ClassGroupService(classGroupRepository);
const goalService = new goal_service_1.GoalService(goalRepository);
const enrollmentService = new enrollment_service_1.EnrollmentService(enrollmentRepository, studentRepository, classGroupRepository);
const emailNotificationService = new email_notification_service_1.EmailNotificationService(emailNotificationRepository);
exports.emailDispatchService = new email_dispatch_service_1.EmailDispatchService(emailNotificationRepository, classGroupRepository, goalRepository, (0, mail_sender_factory_1.createMailSenderFromEnv)(process.env));
const evaluationService = new evaluation_service_1.EvaluationService(evaluationRepository, enrollmentRepository, studentRepository, classGroupRepository, goalRepository, emailNotificationService);
const studentController = (0, student_controller_1.createStudentController)(studentService);
const classGroupController = (0, class_group_controller_1.createClassGroupController)(classGroupService);
const goalController = (0, goal_controller_1.createGoalController)(goalService);
const enrollmentController = (0, enrollment_controller_1.createEnrollmentController)(enrollmentService);
const evaluationController = (0, evaluation_controller_1.createEvaluationController)(evaluationService);
const emailDispatchController = (0, email_dispatch_controller_1.createEmailDispatchController)(exports.emailDispatchService);
const emailNotificationController = (0, email_notification_controller_1.createEmailNotificationController)(emailNotificationRepository);
function runController(handler, response) {
    void handler.catch((error) => {
        if (response.writableEnded) {
            return;
        }
        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify({
            message: error instanceof Error ? error.message : 'Erro inesperado.'
        }));
    });
}
exports.app = (0, node_http_1.createServer)((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/health') {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json; charset=utf-8');
        response.end(JSON.stringify({ status: 'ok' }));
        return;
    }
    if (url.pathname === '/goals') {
        runController(goalController(request, response), response);
        return;
    }
    if (url.pathname === '/emails/dispatch') {
        runController(emailDispatchController(request, response), response);
        return;
    }
    if (url.pathname === '/emails/notifications') {
        runController(emailNotificationController(request, response), response);
        return;
    }
    if (url.pathname.includes('/enrollments')) {
        runController(enrollmentController(request, response), response);
        return;
    }
    if (url.pathname.includes('/evaluations')) {
        runController(evaluationController(request, response), response);
        return;
    }
    if (url.pathname.startsWith('/classes')) {
        runController(classGroupController(request, response), response);
        return;
    }
    if (url.pathname.startsWith('/students')) {
        runController(studentController(request, response), response);
        return;
    }
    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ message: 'Not found' }));
});
