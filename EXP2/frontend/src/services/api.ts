import type {
  ClassGroup,
  EmailNotificationBatch,
  Enrollment,
  Evaluation,
  EvaluationConcept,
  Goal,
  Student
} from '../types';

const baseUrl = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Erro ao processar requisicao.');
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const api = {
  students: {
    list: () => request<Student[]>('/students'),
    create: (payload: Omit<Student, 'id'>) =>
      request<Student>('/students', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Omit<Student, 'id'>) =>
      request<Student>(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/students/${id}`, { method: 'DELETE' })
  },
  classes: {
    list: () => request<ClassGroup[]>('/classes'),
    create: (payload: Omit<ClassGroup, 'id'>) =>
      request<ClassGroup>('/classes', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Omit<ClassGroup, 'id'>) =>
      request<ClassGroup>(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/classes/${id}`, { method: 'DELETE' })
  },
  goals: {
    list: () => request<Goal[]>('/goals')
  },
  enrollments: {
    listByClass: (classGroupId: string) => request<Enrollment[]>(`/classes/${classGroupId}/enrollments`),
    create: (classGroupId: string, studentId: string) =>
      request<Enrollment>(`/classes/${classGroupId}/enrollments`, {
        method: 'POST',
        body: JSON.stringify({ studentId })
      }),
    remove: (classGroupId: string, studentId: string) =>
      request<void>(`/classes/${classGroupId}/enrollments/${studentId}`, { method: 'DELETE' })
  },
  evaluations: {
    listByClass: (classGroupId: string) => request<Evaluation[]>(`/classes/${classGroupId}/evaluations`),
    set: (classGroupId: string, studentId: string, goalId: string, concept: EvaluationConcept) =>
      request<Evaluation>(`/classes/${classGroupId}/evaluations/${studentId}/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify({ concept })
      })
  },
  emailNotifications: {
    list: (filters?: { status?: 'pending' | 'sent'; studentId?: string; date?: string }) => {
      const params = new URLSearchParams();
      if (filters?.status) {
        params.set('status', filters.status);
      }
      if (filters?.studentId) {
        params.set('studentId', filters.studentId);
      }
      if (filters?.date) {
        params.set('date', filters.date);
      }

      const suffix = params.toString() ? `?${params.toString()}` : '';
      return request<EmailNotificationBatch[]>(`/emails/notifications${suffix}`);
    },
    dispatchDaily: (date?: string) =>
      request<{ processed: number }>('/emails/dispatch', {
        method: 'POST',
        body: JSON.stringify(date ? { date } : {})
      })
  }
};
