import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createStudentController } from './modules/alunos/student.controller';
import { JsonStudentRepository } from './modules/alunos/student.json-repository';
import { StudentService } from './modules/alunos/student.service';
import { JsonFileStore } from './infrastructure/persistence/json-file-store';
import { JsonClassGroupRepository } from './modules/turmas/class-group.json-repository';
import { ClassGroupService } from './modules/turmas/class-group.service';
import { createClassGroupController } from './modules/turmas/class-group.controller';
import { JsonGoalRepository } from './modules/metas/goal.json-repository';
import { GoalService } from './modules/metas/goal.service';
import { createGoalController } from './modules/metas/goal.controller';
import { JsonEnrollmentRepository } from './modules/matriculas/enrollment.json-repository';
import { EnrollmentService } from './modules/matriculas/enrollment.service';
import { createEnrollmentController } from './modules/matriculas/enrollment.controller';
import { JsonEvaluationRepository } from './modules/avaliacoes/evaluation.json-repository';
import { EvaluationService } from './modules/avaliacoes/evaluation.service';
import { createEvaluationController } from './modules/avaliacoes/evaluation.controller';
import { JsonEmailNotificationRepository } from './modules/emails/email-notification.json-repository';
import { EmailNotificationService } from './modules/emails/email-notification.service';
import { EmailDispatchService } from './modules/emails/email-dispatch.service';
import { createEmailDispatchController } from './modules/emails/email-dispatch.controller';
import { createMailSenderFromEnv } from './infrastructure/mail/mail-sender-factory';
import { createEmailNotificationController } from './modules/emails/email-notification.controller';

const studentsFilePath = resolve(__dirname, '../data/students.json');
const classesFilePath = resolve(__dirname, '../data/classes.json');
const goalsFilePath = resolve(__dirname, '../data/goals.json');
const enrollmentsFilePath = resolve(__dirname, '../data/enrollments.json');
const evaluationsFilePath = resolve(__dirname, '../data/evaluations.json');
const emailNotificationsFilePath = resolve(__dirname, '../data/email-notifications.json');
const studentRepository = new JsonStudentRepository(new JsonFileStore(studentsFilePath));
const classGroupRepository = new JsonClassGroupRepository(new JsonFileStore(classesFilePath));
const goalRepository = new JsonGoalRepository(new JsonFileStore(goalsFilePath));
const enrollmentRepository = new JsonEnrollmentRepository(new JsonFileStore(enrollmentsFilePath));
const evaluationRepository = new JsonEvaluationRepository(new JsonFileStore(evaluationsFilePath));
const emailNotificationRepository = new JsonEmailNotificationRepository(new JsonFileStore(emailNotificationsFilePath));
const studentService = new StudentService(studentRepository);
const classGroupService = new ClassGroupService(classGroupRepository);
const goalService = new GoalService(goalRepository);
const enrollmentService = new EnrollmentService(enrollmentRepository, studentRepository, classGroupRepository);
const emailNotificationService = new EmailNotificationService(emailNotificationRepository);
export const emailDispatchService = new EmailDispatchService(
  emailNotificationRepository,
  classGroupRepository,
  goalRepository,
  createMailSenderFromEnv(process.env)
);
const evaluationService = new EvaluationService(
  evaluationRepository,
  enrollmentRepository,
  studentRepository,
  classGroupRepository,
  goalRepository,
  emailNotificationService
);
const studentController = createStudentController(studentService);
const classGroupController = createClassGroupController(classGroupService);
const goalController = createGoalController(goalService);
const enrollmentController = createEnrollmentController(enrollmentService);
const evaluationController = createEvaluationController(evaluationService);
const emailDispatchController = createEmailDispatchController(emailDispatchService);
const emailNotificationController = createEmailNotificationController(emailNotificationRepository);

function runController(handler: Promise<void>, response: import('node:http').ServerResponse): void {
  void handler.catch((error: unknown) => {
    if (response.writableEnded) {
      return;
    }

    response.statusCode = 400;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(
      JSON.stringify({
        message: error instanceof Error ? error.message : 'Erro inesperado.'
      })
    );
  });
}

export const app = createServer((request, response) => {
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
