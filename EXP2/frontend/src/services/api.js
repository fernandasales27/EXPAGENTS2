const baseUrl = '/api';
async function request(path, options) {
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
        return null;
    }
    return (await response.json());
}
export const api = {
    students: {
        list: () => request('/students'),
        create: (payload) => request('/students', { method: 'POST', body: JSON.stringify(payload) }),
        update: (id, payload) => request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
        remove: (id) => request(`/students/${id}`, { method: 'DELETE' })
    },
    classes: {
        list: () => request('/classes'),
        create: (payload) => request('/classes', { method: 'POST', body: JSON.stringify(payload) }),
        update: (id, payload) => request(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
        remove: (id) => request(`/classes/${id}`, { method: 'DELETE' })
    },
    goals: {
        list: () => request('/goals')
    },
    enrollments: {
        listByClass: (classGroupId) => request(`/classes/${classGroupId}/enrollments`),
        create: (classGroupId, studentId) => request(`/classes/${classGroupId}/enrollments`, {
            method: 'POST',
            body: JSON.stringify({ studentId })
        }),
        remove: (classGroupId, studentId) => request(`/classes/${classGroupId}/enrollments/${studentId}`, { method: 'DELETE' })
    },
    evaluations: {
        listByClass: (classGroupId) => request(`/classes/${classGroupId}/evaluations`),
        set: (classGroupId, studentId, goalId, concept) => request(`/classes/${classGroupId}/evaluations/${studentId}/goals/${goalId}`, {
            method: 'PUT',
            body: JSON.stringify({ concept })
        })
    },
    emailNotifications: {
        list: (filters) => {
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
            return request(`/emails/notifications${suffix}`);
        },
        dispatchDaily: (date) => request('/emails/dispatch', {
            method: 'POST',
            body: JSON.stringify(date ? { date } : {})
        })
    }
};
