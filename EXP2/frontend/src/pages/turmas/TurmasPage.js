import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
const emptyForm = {
    topicDescription: '',
    year: new Date().getFullYear(),
    semester: 1
};
export default function TurmasPage() {
    const [classGroups, setClassGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [goals, setGoals] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [studentToEnroll, setStudentToEnroll] = useState('');
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    async function loadData() {
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
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    useEffect(() => {
        void loadData();
    }, []);
    useEffect(() => {
        async function loadEnrollments() {
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
            }
            catch (currentError) {
                setError(currentError.message);
            }
        }
        void loadEnrollments();
    }, [selectedClassId]);
    const enrolledStudentIds = useMemo(() => new Set(enrollments.map((enrollment) => enrollment.studentId)), [enrollments]);
    function getConcept(studentId, goalId) {
        return (evaluations.find((evaluation) => evaluation.studentId === studentId && evaluation.goalId === goalId)
            ?.concept ?? '');
    }
    async function handleSubmit(event) {
        event.preventDefault();
        try {
            setError('');
            if (editingId) {
                await api.classes.update(editingId, form);
            }
            else {
                await api.classes.create(form);
            }
            setForm(emptyForm);
            setEditingId(null);
            await loadData();
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    async function handleDelete(id) {
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
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    async function handleEnroll() {
        if (!selectedClassId || !studentToEnroll) {
            return;
        }
        try {
            setError('');
            await api.enrollments.create(selectedClassId, studentToEnroll);
            setStudentToEnroll('');
            setEnrollments(await api.enrollments.listByClass(selectedClassId));
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    async function handleUnenroll(studentId) {
        if (!selectedClassId) {
            return;
        }
        try {
            setError('');
            await api.enrollments.remove(selectedClassId, studentId);
            setEnrollments(await api.enrollments.listByClass(selectedClassId));
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    return (_jsxs("section", { children: [_jsx("h2", { children: "Turmas" }), _jsxs("form", { onSubmit: (event) => void handleSubmit(event), children: [_jsx("input", { placeholder: "Topico", value: form.topicDescription, onChange: (event) => setForm((current) => ({ ...current, topicDescription: event.target.value })) }), _jsx("input", { type: "number", placeholder: "Ano", value: form.year, onChange: (event) => setForm((current) => ({ ...current, year: Number(event.target.value) })) }), _jsx("input", { type: "number", min: 1, max: 2, placeholder: "Semestre", value: form.semester, onChange: (event) => setForm((current) => ({ ...current, semester: Number(event.target.value) })) }), _jsx("button", { type: "submit", children: editingId ? 'Salvar' : 'Cadastrar' })] }), error && _jsx("p", { children: error }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Topico" }), _jsx("th", { children: "Ano" }), _jsx("th", { children: "Semestre" }), _jsx("th", { children: "Acoes" })] }) }), _jsx("tbody", { children: classGroups.map((classGroup) => (_jsxs("tr", { children: [_jsx("td", { children: classGroup.topicDescription }), _jsx("td", { children: classGroup.year }), _jsx("td", { children: classGroup.semester }), _jsxs("td", { children: [_jsx("button", { type: "button", onClick: () => setSelectedClassId(classGroup.id), children: "Selecionar" }), _jsx("button", { type: "button", onClick: () => {
                                                setEditingId(classGroup.id);
                                                setForm({
                                                    topicDescription: classGroup.topicDescription,
                                                    year: classGroup.year,
                                                    semester: classGroup.semester
                                                });
                                            }, children: "Editar" }), _jsx("button", { type: "button", onClick: () => void handleDelete(classGroup.id), children: "Remover" })] })] }, classGroup.id))) })] }), _jsx("h3", { children: "Matriculas" }), _jsxs("p", { children: ["Turma selecionada: ", selectedClassId || 'nenhuma'] }), _jsxs("div", { children: [_jsxs("select", { value: studentToEnroll, onChange: (event) => setStudentToEnroll(event.target.value), children: [_jsx("option", { value: "", children: "Selecionar aluno" }), students
                                .filter((student) => !enrolledStudentIds.has(student.id))
                                .map((student) => (_jsx("option", { value: student.id, children: student.name }, student.id)))] }), _jsx("button", { type: "button", onClick: () => void handleEnroll(), children: "Matricular" })] }), _jsx("ul", { children: enrollments.map((enrollment) => {
                    const student = students.find((current) => current.id === enrollment.studentId);
                    return (_jsxs("li", { children: [student?.name ?? enrollment.studentId, _jsx("button", { type: "button", onClick: () => void handleUnenroll(enrollment.studentId), children: "Desmatricular" })] }, enrollment.id));
                }) }), _jsx("h3", { children: "Avaliacoes da turma" }), _jsx("p", { children: "Os conceitos salvos na tela de avaliacoes ficam visiveis aqui por turma." }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Aluno" }), goals.map((goal) => (_jsx("th", { children: goal.name }, goal.id)))] }) }), _jsx("tbody", { children: enrollments.map((enrollment) => {
                            const student = students.find((current) => current.id === enrollment.studentId);
                            return (_jsxs("tr", { children: [_jsx("td", { children: student?.name ?? enrollment.studentId }), goals.map((goal) => (_jsx("td", { children: getConcept(enrollment.studentId, goal.id) || '-' }, `${enrollment.id}-${goal.id}`)))] }, `eval-${enrollment.id}`));
                        }) })] })] }));
}
