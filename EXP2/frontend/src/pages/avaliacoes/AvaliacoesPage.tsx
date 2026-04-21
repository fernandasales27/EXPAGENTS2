import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import type { ClassGroup, Enrollment, Evaluation, EvaluationConcept, Goal, Student } from '../../types';

const concepts: EvaluationConcept[] = ['MANA', 'MPA', 'MA'];

function buildKey(studentId: string, goalId: string): string {
  return `${studentId}::${goalId}`;
}

export default function AvaliacoesPage() {
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [draft, setDraft] = useState<Record<string, EvaluationConcept | ''>>({});
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');

  useEffect(() => {
    async function loadBaseData(): Promise<void> {
      try {
        setError('');
        const [classData, studentData, goalData] = await Promise.all([
          api.classes.list(),
          api.students.list(),
          api.goals.list()
        ]);

        setClassGroups(classData);
        setStudents(studentData);
        setGoals(goalData.slice().sort((a, b) => a.order - b.order));

        if (classData[0]) {
          setSelectedClassId((current) => current || classData[0].id);
        }
      } catch (currentError) {
        setError((currentError as Error).message);
      }
    }

    void loadBaseData();
  }, []);

  useEffect(() => {
    async function loadClassData(): Promise<void> {
      if (!selectedClassId) {
        setEnrollments([]);
        setEvaluations([]);
        setDraft({});
        return;
      }

      try {
        setError('');
        setInfo('');
        const [enrollmentData, evaluationData] = await Promise.all([
          api.enrollments.listByClass(selectedClassId),
          api.evaluations.listByClass(selectedClassId)
        ]);
        setEnrollments(enrollmentData);
        setEvaluations(evaluationData);

        const enrolledStudentIds = new Set(enrollmentData.map((enrollment) => enrollment.studentId));
        const nextDraft: Record<string, EvaluationConcept | ''> = {};
        for (const evaluation of evaluationData) {
          if (enrolledStudentIds.has(evaluation.studentId)) {
            nextDraft[buildKey(evaluation.studentId, evaluation.goalId)] = evaluation.concept;
          }
        }
        setDraft(nextDraft);
      } catch (currentError) {
        setError((currentError as Error).message);
      }
    }

    void loadClassData();
  }, [selectedClassId]);

  const enrolledStudents = useMemo(() => {
    return enrollments
      .map((enrollment) => students.find((student) => student.id === enrollment.studentId))
      .filter((student): student is Student => Boolean(student));
  }, [enrollments, students]);

  const validEnrollmentStudentIds = useMemo(() => new Set(students.map((student) => student.id)), [students]);

  const validEnrollments = useMemo(
    () => enrollments.filter((enrollment) => validEnrollmentStudentIds.has(enrollment.studentId)),
    [enrollments, validEnrollmentStudentIds]
  );

  function getConcept(studentId: string, goalId: string): EvaluationConcept | '' {
    return draft[buildKey(studentId, goalId)] ?? '';
  }

  const savedConceptMap = useMemo(() => {
    const map = new Map<string, EvaluationConcept>();
    for (const evaluation of evaluations) {
      map.set(buildKey(evaluation.studentId, evaluation.goalId), evaluation.concept);
    }
    return map;
  }, [evaluations]);

  function setDraftConcept(studentId: string, goalId: string, concept: EvaluationConcept | ''): void {
    setInfo('');
    setDraft((current) => ({
      ...current,
      [buildKey(studentId, goalId)]: concept
    }));
  }

  const pendingChanges = useMemo(() => {
    let count = 0;

    for (const enrollment of validEnrollments) {
      for (const goal of goals) {
        const key = buildKey(enrollment.studentId, goal.id);
        const concept = draft[key] ?? '';
        const saved = savedConceptMap.get(key) ?? '';
        if (concept !== saved) {
          count += 1;
        }
      }
    }

    return count;
  }, [draft, validEnrollments, goals, savedConceptMap]);

  async function saveEvaluations(event?: FormEvent): Promise<void> {
    event?.preventDefault();

    if (!selectedClassId || pendingChanges === 0) {
      return;
    }

    try {
      setError('');
      setInfo('');
      setSaving(true);

      const updates: Array<Promise<Evaluation>> = [];

      for (const enrollment of validEnrollments) {
        for (const goal of goals) {
          const key = buildKey(enrollment.studentId, goal.id);
          const nextConcept = draft[key];
          const savedConcept = savedConceptMap.get(key);

          if (nextConcept && nextConcept !== savedConcept) {
            console.log(`Saving: ${enrollment.studentId} / ${goal.id} = ${nextConcept}`);
            updates.push(api.evaluations.set(selectedClassId, enrollment.studentId, goal.id, nextConcept));
          }
        }
      }

      if (updates.length === 0) {
        setInfo('Nenhuma alteracao para salvar.');
        setSaving(false);
        return;
      }

      const results = await Promise.all(updates);
      console.log(`Saved ${results.length} evaluations`);
      
      const refreshed = await api.evaluations.listByClass(selectedClassId);
      setEvaluations(refreshed);

      const refreshedDraft: Record<string, EvaluationConcept | ''> = {};
      for (const evaluation of refreshed) {
        refreshedDraft[buildKey(evaluation.studentId, evaluation.goalId)] = evaluation.concept;
      }
      setDraft(refreshedDraft);
      setInfo('Avaliacoes salvas com sucesso.');
    } catch (currentError) {
      const errorMsg = currentError instanceof Error ? currentError.message : String(currentError);
      console.error('Save error:', errorMsg);
      setError(`Erro ao salvar: ${errorMsg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2>Avaliacoes</h2>

      <form onSubmit={(event) => void saveEvaluations(event)}>
        <label htmlFor="classSelect">Turma:</label>
        <select id="classSelect" value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)}>
          <option value="">Selecionar turma</option>
          {classGroups.map((classGroup) => (
            <option key={classGroup.id} value={classGroup.id}>
              {classGroup.topicDescription} ({classGroup.year}/{classGroup.semester})
            </option>
          ))}
        </select>
        <button type="submit" disabled={!selectedClassId || saving || pendingChanges === 0}>
          {saving ? 'Salvando...' : 'Salvar avaliacoes'}
        </button>
      </form>

      {error && <p>{error}</p>}
      {info && <p>{info}</p>}
      {pendingChanges > 0 && <p>Alteracoes pendentes: {pendingChanges}</p>}

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
          {enrolledStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              {goals.map((goal) => (
                <td key={goal.id}>
                  <select
                    value={getConcept(student.id, goal.id)}
                    onChange={(event) => {
                      setDraftConcept(student.id, goal.id, event.target.value as EvaluationConcept | '');
                    }}
                  >
                    <option value="">-</option>
                    {concepts.map((concept) => (
                      <option key={concept} value={concept}>
                        {concept}
                      </option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
