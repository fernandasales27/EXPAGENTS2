import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../services/api';
const emptyForm = {
    name: '',
    cpf: '',
    email: ''
};
export default function AlunosPage() {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    async function loadStudents() {
        try {
            setError('');
            setStudents(await api.students.list());
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    useEffect(() => {
        void loadStudents();
    }, []);
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            setError('');
            if (editingId) {
                await api.students.update(editingId, form);
            }
            else {
                await api.students.create(form);
            }
            setForm(emptyForm);
            setEditingId(null);
            await loadStudents();
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    function handleEdit(student) {
        setEditingId(student.id);
        setForm({
            name: student.name,
            cpf: student.cpf,
            email: student.email
        });
    }
    async function handleDelete(id) {
        try {
            setError('');
            await api.students.remove(id);
            if (editingId === id) {
                setEditingId(null);
                setForm(emptyForm);
            }
            await loadStudents();
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    return (_jsxs("section", { children: [_jsx("h2", { children: "Alunos" }), _jsxs("form", { onSubmit: (event) => void handleSubmit(event), children: [_jsx("input", { placeholder: "Nome", value: form.name, onChange: (event) => setForm((current) => ({ ...current, name: event.target.value })) }), _jsx("input", { placeholder: "CPF", value: form.cpf, onChange: (event) => setForm((current) => ({ ...current, cpf: event.target.value })) }), _jsx("input", { placeholder: "Email", value: form.email, onChange: (event) => setForm((current) => ({ ...current, email: event.target.value })) }), _jsx("button", { type: "submit", children: editingId ? 'Salvar' : 'Cadastrar' }), editingId && (_jsx("button", { type: "button", onClick: () => {
                            setEditingId(null);
                            setForm(emptyForm);
                        }, children: "Cancelar" }))] }), error && _jsx("p", { children: error }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Nome" }), _jsx("th", { children: "CPF" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Acoes" })] }) }), _jsx("tbody", { children: students.map((student) => (_jsxs("tr", { children: [_jsx("td", { children: student.name }), _jsx("td", { children: student.cpf }), _jsx("td", { children: student.email }), _jsxs("td", { children: [_jsx("button", { type: "button", onClick: () => handleEdit(student), children: "Editar" }), _jsx("button", { type: "button", onClick: () => void handleDelete(student.id), children: "Remover" })] })] }, student.id))) })] })] }));
}
