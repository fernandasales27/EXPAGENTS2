import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
const concepts = ['MANA', 'MPA', 'MA'];
function buildKey(studentId, goalId) {
    return `${studentId}::${goalId}`;
}
export default function AvaliacoesPage() {
    const [classGroups, setClassGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [goals, setGoals] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [draft, setDraft] = useState({});
    const [selectedClassId, setSelectedClassId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    useEffect(() => {
        async function loadBaseData() {
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
            }
            catch (currentError) {
                setError(currentError.message);
            }
        }
        void loadBaseData();
    }, []);
    useEffect(() => {
        async function loadClassData() {
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
                const nextDraft = {};
                for (const evaluation of evaluationData) {
                    if (enrolledStudentIds.has(evaluation.studentId)) {
                        nextDraft[buildKey(evaluation.studentId, evaluation.goalId)] = evaluation.concept;
                    }
                }
                setDraft(nextDraft);
            }
            catch (currentError) {
                setError(currentError.message);
            }
        }
        void loadClassData();
    }, [selectedClassId]);
    const enrolledStudents = useMemo(() => {
        return enrollments
            .map((enrollment) => students.find((student) => student.id === enrollment.studentId))
            .filter((student) => Boolean(student));
    }, [enrollments, students]);
    const validEnrollmentStudentIds = useMemo(() => new Set(students.map((student) => student.id)), [students]);
    const validEnrollments = useMemo(() => enrollments.filter((enrollment) => validEnrollmentStudentIds.has(enrollment.studentId)), [enrollments, validEnrollmentStudentIds]);
    function getConcept(studentId, goalId) {
        return draft[buildKey(studentId, goalId)] ?? '';
    }
    const savedConceptMap = useMemo(() => {
        const map = new Map();
        for (const evaluation of evaluations) {
            map.set(buildKey(evaluation.studentId, evaluation.goalId), evaluation.concept);
        }
        return map;
    }, [evaluations]);
    function setDraftConcept(studentId, goalId, concept) {
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
    async function saveEvaluations(event) {
        event?.preventDefault();
        if (!selectedClassId || pendingChanges === 0) {
            return;
        }
        try {
            setError('');
            setInfo('');
            setSaving(true);
            const updates = [];
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
            const refreshedDraft = {};
            for (const evaluation of refreshed) {
                refreshedDraft[buildKey(evaluation.studentId, evaluation.goalId)] = evaluation.concept;
            }
            setDraft(refreshedDraft);
            setInfo('Avaliacoes salvas com sucesso.');
        }
        catch (currentError) {
            const errorMsg = currentError instanceof Error ? currentError.message : String(currentError);
            console.error('Save error:', errorMsg);
            setError(`Erro ao salvar: ${errorMsg}`);
        }
        finally {
            setSaving(false);
        }
    }
    return (_jsxs("section", { children: [_jsx("h2", { children: "Avaliacoes" }), _jsxs("form", { onSubmit: (event) => void saveEvaluations(event), children: [_jsx("label", { htmlFor: "classSelect", children: "Turma:" }), _jsxs("select", { id: "classSelect", value: selectedClassId, onChange: (event) => setSelectedClassId(event.target.value), children: [_jsx("option", { value: "", children: "Selecionar turma" }), classGroups.map((classGroup) => (_jsxs("option", { value: classGroup.id, children: [classGroup.topicDescription, " (", classGroup.year, "/", classGroup.semester, ")"] }, classGroup.id)))] }), _jsx("button", { type: "submit", disabled: !selectedClassId || saving || pendingChanges === 0, children: saving ? 'Salvando...' : 'Salvar avaliacoes' })] }), error && _jsx("p", { children: error }), info && _jsx("p", { children: info }), pendingChanges > 0 && _jsxs("p", { children: ["Alteracoes pendentes: ", pendingChanges] }), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Aluno" }), goals.map((goal) => (_jsx("th", { children: goal.name }, goal.id)))] }) }), _jsx("tbody", { children: enrolledStudents.map((student) => (_jsxs("tr", { children: [_jsx("td", { children: student.name }), goals.map((goal) => (_jsx("td", { children: _jsxs("select", { value: getConcept(student.id, goal.id), onChange: (event) => {
                                            setDraftConcept(student.id, goal.id, event.target.value);
                                        }, children: [_jsx("option", { value: "", children: "-" }), concepts.map((concept) => (_jsx("option", { value: concept, children: concept }, concept)))] }) }, goal.id)))] }, student.id))) })] })] }));
}
