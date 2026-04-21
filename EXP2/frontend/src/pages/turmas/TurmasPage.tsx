import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import type { ClassGroup, Enrollment, Evaluation, EvaluationConcept, Goal, Student } from '../../types';

const emptyForm = {
  topicDescription: '',
  year: new Date().getFullYear(),
  semester: 1
};

export default function TurmasPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [studentToEnroll, setStudentToEnroll] = useState<string>('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  async function loadData(): Promise<void> {
    try {
      setError('');
      const [classData, studentData, goalsData] = await Promise.all([
        api.classes.list(),
        api.students.list(),
        api.goals.list()
      ]);
      setClassGroups(classData);
      setStudents(studentData);
      setGoals(goalsData.slice().sort((a, b) => a.order - b.order));

      if (!selectedClassId && classData[0]) {
        setSelectedClassId(classData[0].id);
      }
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    async function loadEnrollments(): Promise<void> {
      if (!selectedClassId) {
        setEnrollments([]);
        setEvaluations([]);
        return;
      }

      try {
        const [enrollmentsData, evaluationsData] = await Promise.all([
          api.enrollments.listByClass(selectedClassId),
          api.evaluations.listByClass(selectedClassId)
        ]);
        setEnrollments(enrollmentsData);
        setEvaluations(evaluationsData);
      } catch (currentError) {
        setError((currentError as Error).message);
      }
    }

    void loadEnrollments();
  }, [selectedClassId]);

  const enrolledStudentIds = useMemo(() => new Set(enrollments.map((enrollment) => enrollment.studentId)), [enrollments]);

  function getConcept(studentId: string, goalId: string): EvaluationConcept | '' {
    return (
      evaluations.find((evaluation) => evaluation.studentId === studentId && evaluation.goalId === goalId)
        ?.concept ?? ''
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setError('');
      if (editingId) {
        await api.classes.update(editingId, form);
      } else {
        await api.classes.create(form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadData();
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      setError('');
      await api.classes.remove(id);
      if (selectedClassId === id) {
        setSelectedClassId('');
      }
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadData();
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  async function handleEnroll(): Promise<void> {
    if (!selectedClassId || !studentToEnroll) {
      return;
    }

    try {
      setError('');
      await api.enrollments.create(selectedClassId, studentToEnroll);
      setStudentToEnroll('');
      setEnrollments(await api.enrollments.listByClass(selectedClassId));
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  async function handleUnenroll(studentId: string): Promise<void> {
    if (!selectedClassId) {
      return;
    }

    try {
      setError('');
      await api.enrollments.remove(selectedClassId, studentId);
      setEnrollments(await api.enrollments.listByClass(selectedClassId));
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  return (
    <section>
      <h2>Turmas</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <input
          placeholder="Topico"
          value={form.topicDescription}
          onChange={(event) => setForm((current) => ({ ...current, topicDescription: event.target.value }))}
        />
        <input
          type="number"
          placeholder="Ano"
          value={form.year}
          onChange={(event) => setForm((current) => ({ ...current, year: Number(event.target.value) }))}
        />
        <input
          type="number"
          min={1}
          max={2}
          placeholder="Semestre"
          value={form.semester}
          onChange={(event) => setForm((current) => ({ ...current, semester: Number(event.target.value) }))}
        />
        <button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
      </form>

      {error && <p>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Topico</th>
            <th>Ano</th>
            <th>Semestre</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {classGroups.map((classGroup) => (
            <tr key={classGroup.id}>
              <td>{classGroup.topicDescription}</td>
              <td>{classGroup.year}</td>
              <td>{classGroup.semester}</td>
              <td>
                <button type="button" onClick={() => setSelectedClassId(classGroup.id)}>
                  Selecionar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(classGroup.id);
                    setForm({
                      topicDescription: classGroup.topicDescription,
                      year: classGroup.year,
                      semester: classGroup.semester
                    });
                  }}
                >
                  Editar
                </button>
                <button type="button" onClick={() => void handleDelete(classGroup.id)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Matriculas</h3>
      <p>Turma selecionada: {selectedClassId || 'nenhuma'}</p>

      <div>
        <select value={studentToEnroll} onChange={(event) => setStudentToEnroll(event.target.value)}>
          <option value="">Selecionar aluno</option>
          {students
            .filter((student) => !enrolledStudentIds.has(student.id))
            .map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
        </select>
        <button type="button" onClick={() => void handleEnroll()}>
          Matricular
        </button>
      </div>

      <ul>
        {enrollments.map((enrollment) => {
          const student = students.find((current) => current.id === enrollment.studentId);
          return (
            <li key={enrollment.id}>
              {student?.name ?? enrollment.studentId}
              <button type="button" onClick={() => void handleUnenroll(enrollment.studentId)}>
                Desmatricular
              </button>
            </li>
          );
        })}
      </ul>

      <h3>Avaliacoes da turma</h3>
      <p>Os conceitos salvos na tela de avaliacoes ficam visiveis aqui por turma.</p>
      <table>
        <thead>
          <tr>
            <th>Aluno</th>
            {goals.map((goal) => (
              <th key={goal.id}>{goal.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {enrollments.map((enrollment) => {
            const student = students.find((current) => current.id === enrollment.studentId);
            return (
              <tr key={`eval-${enrollment.id}`}>
                <td>{student?.name ?? enrollment.studentId}</td>
                {goals.map((goal) => (
                  <td key={`${enrollment.id}-${goal.id}`}>{getConcept(enrollment.studentId, goal.id) || '-'}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
