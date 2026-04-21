import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
const today = new Date().toISOString().slice(0, 10);
const pageSize = 5;
export default function NotificacoesPage() {
    const [statusFilter, setStatusFilter] = useState('');
    const [studentNameFilter, setStudentNameFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortOption, setSortOption] = useState('date-desc');
    const [page, setPage] = useState(1);
    const [dispatchDate, setDispatchDate] = useState(today);
    const [notifications, setNotifications] = useState([]);
    const [students, setStudents] = useState([]);
    const [classGroups, setClassGroups] = useState([]);
    const [goals, setGoals] = useState([]);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    async function loadNotifications() {
        try {
            setError('');
            const data = await api.emailNotifications.list({
                status: statusFilter || undefined,
                date: dateFilter || undefined
            });
            setNotifications(data);
            setPage(1);
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    useEffect(() => {
        async function loadReferenceData() {
            try {
                const [studentsData, classesData, goalsData] = await Promise.all([
                    api.students.list(),
                    api.classes.list(),
                    api.goals.list()
                ]);
                setStudents(studentsData);
                setClassGroups(classesData);
                setGoals(goalsData);
            }
            catch (currentError) {
                setError(currentError.message);
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
    async function handleDispatch() {
        try {
            setError('');
            setInfo('');
            const result = await api.emailNotifications.dispatchDaily(dispatchDate || undefined);
            setInfo(`Envio diario executado. Lotes processados: ${result.processed}.`);
            await loadNotifications();
        }
        catch (currentError) {
            setError(currentError.message);
        }
    }
    async function handleFilter(event) {
        event.preventDefault();
        await loadNotifications();
    }
    return (_jsxs("section", { children: [_jsx("h2", { children: "Notificacoes de Email" }), _jsxs("form", { onSubmit: (event) => void handleFilter(event), children: [_jsxs("select", { value: statusFilter, onChange: (event) => setStatusFilter(event.target.value), children: [_jsx("option", { value: "", children: "Todos os status" }), _jsx("option", { value: "pending", children: "Pendente" }), _jsx("option", { value: "sent", children: "Enviado" })] }), _jsx("input", { placeholder: "Nome do aluno", value: studentNameFilter, onChange: (event) => setStudentNameFilter(event.target.value) }), _jsx("input", { type: "date", value: dateFilter, onChange: (event) => setDateFilter(event.target.value) }), _jsxs("select", { value: sortOption, onChange: (event) => setSortOption(event.target.value), children: [_jsx("option", { value: "date-desc", children: "Data mais recente" }), _jsx("option", { value: "date-asc", children: "Data mais antiga" }), _jsx("option", { value: "status", children: "Status (pendente primeiro)" })] }), _jsx("button", { type: "submit", children: "Filtrar" })] }), _jsxs("div", { className: "dispatch-box", children: [_jsx("input", { type: "date", value: dispatchDate, onChange: (event) => setDispatchDate(event.target.value) }), _jsx("button", { type: "button", onClick: () => void handleDispatch(), children: "Executar Dispatch Diario" })] }), error && _jsx("p", { children: error }), info && _jsx("p", { children: info }), _jsxs("p", { children: ["Exibindo ", pagedNotifications.length, " de ", processedNotifications.length, " notificacoes."] }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Aluno" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Data" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Itens" })] }) }), _jsx("tbody", { children: pagedNotifications.map((batch) => {
                            const studentName = studentById.get(batch.studentId)?.name ?? batch.studentId;
                            return (_jsxs("tr", { children: [_jsx("td", { children: studentName }), _jsx("td", { children: batch.studentEmail }), _jsx("td", { children: batch.date }), _jsx("td", { children: batch.sentAt ? `Enviado em ${batch.sentAt}` : 'Pendente' }), _jsx("td", { children: _jsx("ul", { children: batch.items.map((item, index) => (_jsxs("li", { children: ["Turma ", classById.get(item.classGroupId)?.topicDescription ?? item.classGroupId, ' | ', "Meta ", goalById.get(item.goalId)?.name ?? item.goalId, ' | ', "Conceito ", item.concept] }, `${item.goalId}-${item.classGroupId}-${index}`))) }) })] }, `${batch.studentId}-${batch.date}`));
                        }) })] }), _jsxs("div", { className: "pager-box", children: [_jsx("button", { type: "button", disabled: page <= 1, onClick: () => setPage((current) => current - 1), children: "Anterior" }), _jsxs("span", { children: ["Pagina ", page, " de ", totalPages] }), _jsx("button", { type: "button", disabled: page >= totalPages, onClick: () => setPage((current) => current + 1), children: "Proxima" })] })] }));
}
