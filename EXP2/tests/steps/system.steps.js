const assert = require('node:assert/strict');
const { BeforeAll, AfterAll, Before, Given, When, Then } = require('@cucumber/cucumber');
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs/promises');

const repoRoot = path.resolve(__dirname, '..', '..');
const dataDir = path.resolve(repoRoot, 'backend', 'data');
const apiBase = 'http://localhost:3000';

const defaultGoals = [
  { id: 'goal-requisitos', name: 'Requisitos', order: 1 },
  { id: 'goal-testes', name: 'Testes', order: 2 },
  { id: 'goal-qualidade', name: 'Qualidade', order: 3 }
];

let backendProcess;
let scenarioState = {};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHealthcheck() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${apiBase}/health`);
      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Server still booting.
    }

    await sleep(500);
  }

  throw new Error('Backend nao respondeu ao healthcheck em tempo habil.');
}

async function request(pathname, options = {}) {
  const response = await fetch(`${apiBase}${pathname}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  return {
    status: response.status,
    body
  };
}

async function resetJsonData() {
  await fs.mkdir(dataDir, { recursive: true });

  await Promise.all([
    fs.writeFile(path.resolve(dataDir, 'students.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.resolve(dataDir, 'classes.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.resolve(dataDir, 'enrollments.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.resolve(dataDir, 'evaluations.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.resolve(dataDir, 'email-notifications.json'), '[]\n', 'utf-8'),
    fs.writeFile(path.resolve(dataDir, 'goals.json'), `${JSON.stringify(defaultGoals, null, 2)}\n`, 'utf-8')
  ]);
}

async function readNotifications() {
  const content = await fs.readFile(path.resolve(dataDir, 'email-notifications.json'), 'utf-8');
  return JSON.parse(content);
}

BeforeAll(async function () {
  const backendEnv = {
    ...process.env,
    ENABLE_EMAIL_SCHEDULER: 'false'
  };

  if (process.platform === 'win32') {
    backendProcess = spawn('cmd.exe', ['/d', '/s', '/c', 'npm run dev -w backend'], {
      cwd: repoRoot,
      stdio: 'ignore',
      env: backendEnv
    });
  } else {
    backendProcess = spawn('npm', ['run', 'dev', '-w', 'backend'], {
      cwd: repoRoot,
      stdio: 'ignore',
      env: backendEnv
    });
  }

  await waitForHealthcheck();
});

AfterAll(async function () {
  if (!backendProcess) {
    return;
  }

  backendProcess.kill('SIGTERM');
});

Before(async function () {
  scenarioState = {};
  await resetJsonData();
});

Given('que o usuario acessa a pagina de alunos', function () {
  // O teste valida o fluxo de API equivalente ao caso de uso da tela.
});

When('ele cria um aluno com nome, cpf e email validos', async function () {
  const response = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Ana Silva',
      cpf: '12345678900',
      email: 'ana.silva@example.com'
    })
  });

  assert.equal(response.status, 201);
  scenarioState.createdStudent = response.body;
});

Then('o aluno deve aparecer na lista', async function () {
  const response = await request('/students');
  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body), true);

  const found = response.body.find((student) => student.cpf === '12345678900');
  assert.ok(found);
});

Given('que o usuario acessa a pagina de turmas', function () {
  // O teste valida o fluxo de API equivalente ao caso de uso da tela.
});

When('ele cria uma turma com descricao, ano e semestre validos', async function () {
  const response = await request('/classes', {
    method: 'POST',
    body: JSON.stringify({
      topicDescription: 'Introducao a Programacao',
      year: 2026,
      semester: 1
    })
  });

  assert.equal(response.status, 201);
  scenarioState.createdClass = response.body;
});

Then('a turma deve aparecer na lista', async function () {
  const response = await request('/classes');
  assert.equal(response.status, 200);
  assert.equal(Array.isArray(response.body), true);

  const found = response.body.find((classGroup) => classGroup.topicDescription === 'Introducao a Programacao');
  assert.ok(found);
});

Given('que existe uma turma com alunos matriculados', async function () {
  const studentResponse = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Bruno Costa',
      cpf: '99988877766',
      email: 'bruno.costa@example.com'
    })
  });
  assert.equal(studentResponse.status, 201);

  const classResponse = await request('/classes', {
    method: 'POST',
    body: JSON.stringify({
      topicDescription: 'Estruturas de Dados',
      year: 2026,
      semester: 1
    })
  });
  assert.equal(classResponse.status, 201);

  const enrollmentResponse = await request(`/classes/${classResponse.body.id}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ studentId: studentResponse.body.id })
  });
  assert.equal(enrollmentResponse.status, 201);

  scenarioState.student = studentResponse.body;
  scenarioState.classGroup = classResponse.body;
});

When('o usuario abre a tela de avaliacoes da turma', async function () {
  const goalsResponse = await request('/goals');
  const enrollmentsResponse = await request(`/classes/${scenarioState.classGroup.id}/enrollments`);

  assert.equal(goalsResponse.status, 200);
  assert.equal(enrollmentsResponse.status, 200);

  scenarioState.goals = goalsResponse.body;
  scenarioState.enrollments = enrollmentsResponse.body;
});

Then('deve ver os alunos nas linhas e as metas nas colunas', function () {
  assert.ok(Array.isArray(scenarioState.goals));
  assert.ok(Array.isArray(scenarioState.enrollments));
  assert.ok(scenarioState.goals.length > 0);
  assert.ok(scenarioState.enrollments.some((enrollment) => enrollment.studentId === scenarioState.student.id));
});

Given('que um aluno teve mais de uma avaliacao alterada no mesmo dia', async function () {
  const studentResponse = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Carla Lima',
      cpf: '11122233344',
      email: 'carla.lima@example.com'
    })
  });
  assert.equal(studentResponse.status, 201);

  const classResponse = await request('/classes', {
    method: 'POST',
    body: JSON.stringify({
      topicDescription: 'Engenharia de Software',
      year: 2026,
      semester: 1
    })
  });
  assert.equal(classResponse.status, 201);

  const enrollmentResponse = await request(`/classes/${classResponse.body.id}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ studentId: studentResponse.body.id })
  });
  assert.equal(enrollmentResponse.status, 201);

  const goalsResponse = await request('/goals');
  assert.equal(goalsResponse.status, 200);
  assert.ok(goalsResponse.body.length >= 2);

  const firstGoal = goalsResponse.body[0];
  const secondGoal = goalsResponse.body[1];

  const evalOne = await request(
    `/classes/${classResponse.body.id}/evaluations/${studentResponse.body.id}/goals/${firstGoal.id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ concept: 'MPA' })
    }
  );
  assert.equal(evalOne.status, 200);

  const evalTwo = await request(
    `/classes/${classResponse.body.id}/evaluations/${studentResponse.body.id}/goals/${secondGoal.id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ concept: 'MA' })
    }
  );
  assert.equal(evalTwo.status, 200);

  scenarioState.student = studentResponse.body;
});

When('o processamento diario de emails for executado', async function () {
  const today = new Date().toISOString().slice(0, 10);
  const response = await request('/emails/dispatch', {
    method: 'POST',
    body: JSON.stringify({ date: today })
  });

  assert.equal(response.status, 200);
  scenarioState.dispatchResult = response.body;
});

Then('o aluno deve receber um unico email com todas as alteracoes', async function () {
  assert.equal(scenarioState.dispatchResult.processed, 1);

  const notifications = await readNotifications();
  const batch = notifications.find((current) => current.studentId === scenarioState.student.id);

  assert.ok(batch);
  assert.ok(batch.sentAt);
  assert.equal(batch.items.length, 2);
});

Given('que ja existe um aluno com CPF cadastrado', async function () {
  const response = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Aluno Base',
      cpf: '55544433322',
      email: 'aluno.base@example.com'
    })
  });

  assert.equal(response.status, 201);
});

When('o usuario tenta cadastrar outro aluno com o mesmo CPF', async function () {
  scenarioState.duplicateCpfResponse = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Aluno Duplicado',
      cpf: '55544433322',
      email: 'aluno.duplicado@example.com'
    })
  });
});

Then('o sistema deve retornar erro de CPF duplicado', function () {
  assert.equal(scenarioState.duplicateCpfResponse.status, 400);
  assert.match(scenarioState.duplicateCpfResponse.body.message, /CPF ja cadastrado/i);
});

Given('que existe contexto valido para lancar avaliacao', async function () {
  const studentResponse = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Daniela Rocha',
      cpf: '22233344455',
      email: 'daniela.rocha@example.com'
    })
  });
  assert.equal(studentResponse.status, 201);

  const classResponse = await request('/classes', {
    method: 'POST',
    body: JSON.stringify({
      topicDescription: 'Projeto Integrador',
      year: 2026,
      semester: 2
    })
  });
  assert.equal(classResponse.status, 201);

  const enrollmentResponse = await request(`/classes/${classResponse.body.id}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ studentId: studentResponse.body.id })
  });
  assert.equal(enrollmentResponse.status, 201);

  const goalsResponse = await request('/goals');
  assert.equal(goalsResponse.status, 200);
  assert.ok(goalsResponse.body.length > 0);

  scenarioState.validEvaluationContext = {
    studentId: studentResponse.body.id,
    classId: classResponse.body.id,
    goalId: goalsResponse.body[0].id
  };
});

When('o usuario informa um conceito de avaliacao invalido', async function () {
  const { classId, studentId, goalId } = scenarioState.validEvaluationContext;

  scenarioState.invalidConceptResponse = await request(
    `/classes/${classId}/evaluations/${studentId}/goals/${goalId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ concept: 'INVALIDO' })
    }
  );
});

Then('o sistema deve retornar erro de conceito invalido', function () {
  assert.equal(scenarioState.invalidConceptResponse.status, 400);
  assert.match(scenarioState.invalidConceptResponse.body.message, /Conceito invalido/i);
});

Given('que um aluno ja esta matriculado em uma turma', async function () {
  const studentResponse = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Eduardo Freitas',
      cpf: '77766655544',
      email: 'eduardo.freitas@example.com'
    })
  });
  assert.equal(studentResponse.status, 201);

  const classResponse = await request('/classes', {
    method: 'POST',
    body: JSON.stringify({
      topicDescription: 'Banco de Dados',
      year: 2026,
      semester: 1
    })
  });
  assert.equal(classResponse.status, 201);

  const firstEnrollment = await request(`/classes/${classResponse.body.id}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ studentId: studentResponse.body.id })
  });
  assert.equal(firstEnrollment.status, 201);

  scenarioState.duplicateEnrollmentContext = {
    studentId: studentResponse.body.id,
    classId: classResponse.body.id
  };
});

When('o usuario tenta matricular novamente o mesmo aluno na turma', async function () {
  const { classId, studentId } = scenarioState.duplicateEnrollmentContext;

  scenarioState.duplicateEnrollmentResponse = await request(`/classes/${classId}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ studentId })
  });
});

Then('o sistema deve retornar erro de matricula duplicada', function () {
  assert.equal(scenarioState.duplicateEnrollmentResponse.status, 400);
  assert.match(scenarioState.duplicateEnrollmentResponse.body.message, /ja matriculado/i);
});

Given('que existe notificacao de email pendente para um aluno', async function () {
  const studentResponse = await request('/students', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Fernanda Gomes',
      cpf: '10101010101',
      email: 'fernanda.gomes@example.com'
    })
  });
  assert.equal(studentResponse.status, 201);

  const classResponse = await request('/classes', {
    method: 'POST',
    body: JSON.stringify({
      topicDescription: 'Programacao Web',
      year: 2026,
      semester: 2
    })
  });
  assert.equal(classResponse.status, 201);

  const enrollmentResponse = await request(`/classes/${classResponse.body.id}/enrollments`, {
    method: 'POST',
    body: JSON.stringify({ studentId: studentResponse.body.id })
  });
  assert.equal(enrollmentResponse.status, 201);

  const goalsResponse = await request('/goals');
  assert.equal(goalsResponse.status, 200);
  assert.ok(goalsResponse.body.length > 0);

  const updateResponse = await request(
    `/classes/${classResponse.body.id}/evaluations/${studentResponse.body.id}/goals/${goalsResponse.body[0].id}`,
    {
      method: 'PUT',
      body: JSON.stringify({ concept: 'MPA' })
    }
  );
  assert.equal(updateResponse.status, 200);

  scenarioState.monitoringStudent = studentResponse.body;
});

When('o usuario consulta notificacoes com status pendente', async function () {
  scenarioState.pendingNotificationsResponse = await request('/emails/notifications?status=pending');
  assert.equal(scenarioState.pendingNotificationsResponse.status, 200);
});

Then('o endpoint deve retornar a notificacao pendente do aluno', function () {
  const found = scenarioState.pendingNotificationsResponse.body.find(
    (batch) => batch.studentId === scenarioState.monitoringStudent.id
  );
  assert.ok(found);
  assert.equal(Boolean(found.sentAt), false);
});

When('o usuario consulta notificacoes com status enviado', async function () {
  scenarioState.sentNotificationsResponse = await request('/emails/notifications?status=sent');
  assert.equal(scenarioState.sentNotificationsResponse.status, 200);
});

Then('o endpoint deve retornar a notificacao enviada do aluno', function () {
  const found = scenarioState.sentNotificationsResponse.body.find(
    (batch) => batch.studentId === scenarioState.monitoringStudent.id
  );
  assert.ok(found);
  assert.ok(found.sentAt);
});
