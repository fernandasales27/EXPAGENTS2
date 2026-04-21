import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import type { ClassGroup, EmailNotificationBatch, Goal, Student } from '../../types';

const today = new Date().toISOString().slice(0, 10);
const pageSize = 5;

type SortOption = 'date-desc' | 'date-asc' | 'status';

export default function NotificacoesPage() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'sent' | ''>('');
  const [studentNameFilter, setStudentNameFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-desc');
  const [page, setPage] = useState(1);
  const [dispatchDate, setDispatchDate] = useState(today);
  const [notifications, setNotifications] = useState<EmailNotificationBatch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classGroups, setClassGroups] = useState<ClassGroup[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  async function loadNotifications(): Promise<void> {
    try {
      setError('');
      const data = await api.emailNotifications.list({
        status: statusFilter || undefined,
        date: dateFilter || undefined
      });
      setNotifications(data);
      setPage(1);
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  useEffect(() => {
    async function loadReferenceData(): Promise<void> {
      try {
        const [studentsData, classesData, goalsData] = await Promise.all([
          api.students.list(),
          api.classes.list(),
          api.goals.list()
        ]);

        setStudents(studentsData);
        setClassGroups(classesData);
        setGoals(goalsData);
      } catch (currentError) {
        setError((currentError as Error).message);
      }
    }

    void loadReferenceData();
    void loadNotifications();
  }, []);

  const classById = useMemo(() => {
    return new Map(classGroups.map((classGroup) => [classGroup.id, classGroup]));
  }, [classGroups]);

  const goalById = useMemo(() => {
    return new Map(goals.map((goal) => [goal.id, goal]));
  }, [goals]);

  const studentById = useMemo(() => {
    return new Map(students.map((student) => [student.id, student]));
  }, [students]);

  const processedNotifications = useMemo(() => {
    const normalizedName = studentNameFilter.trim().toLowerCase();

    const filtered = notifications.filter((batch) => {
      if (!normalizedName) {
        return true;
      }

      const student = studentById.get(batch.studentId);
      const name = student?.name ?? '';
      return name.toLowerCase().includes(normalizedName);
    });

    const sorted = filtered.slice().sort((left, right) => {
      if (sortOption === 'status') {
        const leftStatus = left.sentAt ? 1 : 0;
        const rightStatus = right.sentAt ? 1 : 0;
        return leftStatus - rightStatus;
      }

      const leftTime = Date.parse(left.date);
      const rightTime = Date.parse(right.date);

      if (sortOption === 'date-asc') {
        return leftTime - rightTime;
      }

      return rightTime - leftTime;
    });

    return sorted;
  }, [notifications, sortOption, studentById, studentNameFilter]);

  const totalPages = Math.max(1, Math.ceil(processedNotifications.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pagedNotifications = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return processedNotifications.slice(start, end);
  }, [page, processedNotifications]);

  async function handleDispatch(): Promise<void> {
    try {
      setError('');
      setInfo('');
      const result = await api.emailNotifications.dispatchDaily(dispatchDate || undefined);
      setInfo(`Envio diario executado. Lotes processados: ${result.processed}.`);
      await loadNotifications();
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  async function handleFilter(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    await loadNotifications();
  }

  return (
    <section>
      <h2>Notificacoes de Email</h2>

      <form onSubmit={(event) => void handleFilter(event)}>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'pending' | 'sent' | '')}>
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="sent">Enviado</option>
        </select>

        <input
          placeholder="Nome do aluno"
          value={studentNameFilter}
          onChange={(event) => setStudentNameFilter(event.target.value)}
        />

        <input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />

        <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
          <option value="date-desc">Data mais recente</option>
          <option value="date-asc">Data mais antiga</option>
          <option value="status">Status (pendente primeiro)</option>
        </select>

        <button type="submit">Filtrar</button>
      </form>

      <div className="dispatch-box">
        <input type="date" value={dispatchDate} onChange={(event) => setDispatchDate(event.target.value)} />
        <button type="button" onClick={() => void handleDispatch()}>
          Executar Dispatch Diario
        </button>
      </div>

      {error && <p>{error}</p>}
      {info && <p>{info}</p>}

      <p>
        Exibindo {pagedNotifications.length} de {processedNotifications.length} notificacoes.
      </p>

      <table>
        <thead>
          <tr>
            <th>Aluno</th>
            <th>Email</th>
            <th>Data</th>
            <th>Status</th>
            <th>Itens</th>
          </tr>
        </thead>
        <tbody>
          {pagedNotifications.map((batch) => {
            const studentName = studentById.get(batch.studentId)?.name ?? batch.studentId;

            return (
            <tr key={`${batch.studentId}-${batch.date}`}>
              <td>{studentName}</td>
              <td>{batch.studentEmail}</td>
              <td>{batch.date}</td>
              <td>{batch.sentAt ? `Enviado em ${batch.sentAt}` : 'Pendente'}</td>
              <td>
                <ul>
                  {batch.items.map((item, index) => (
                    <li key={`${item.goalId}-${item.classGroupId}-${index}`}>
                      Turma {classById.get(item.classGroupId)?.topicDescription ?? item.classGroupId}
                      {' | '}
                      Meta {goalById.get(item.goalId)?.name ?? item.goalId}
                      {' | '}
                      Conceito {item.concept}
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pager-box">
        <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
          Anterior
        </button>
        <span>
          Pagina {page} de {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Proxima
        </button>
      </div>
    </section>
  );
}
