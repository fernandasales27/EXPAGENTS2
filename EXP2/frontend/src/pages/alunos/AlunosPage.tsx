import { type FormEvent, useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { Student } from '../../types';

const emptyForm = {
  name: '',
  cpf: '',
  email: ''
};

export default function AlunosPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  async function loadStudents(): Promise<void> {
    try {
      setError('');
      setStudents(await api.students.list());
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    try {
      setError('');
      if (editingId) {
        await api.students.update(editingId, form);
      } else {
        await api.students.create(form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  function handleEdit(student: Student): void {
    setEditingId(student.id);
    setForm({
      name: student.name,
      cpf: student.cpf,
      email: student.email
    });
  }

  async function handleDelete(id: string): Promise<void> {
    try {
      setError('');
      await api.students.remove(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadStudents();
    } catch (currentError) {
      setError((currentError as Error).message);
    }
  }

  return (
    <section>
      <h2>Alunos</h2>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          placeholder="CPF"
          value={form.cpf}
          onChange={(event) => setForm((current) => ({ ...current, cpf: event.target.value }))}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <button type="submit">{editingId ? 'Salvar' : 'Cadastrar'}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(emptyForm);
            }}
          >
            Cancelar
          </button>
        )}
      </form>

      {error && <p>{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.cpf}</td>
              <td>{student.email}</td>
              <td>
                <button type="button" onClick={() => handleEdit(student)}>
                  Editar
                </button>
                <button type="button" onClick={() => void handleDelete(student.id)}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
