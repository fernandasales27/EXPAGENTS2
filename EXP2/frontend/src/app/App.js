import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import AlunosPage from '../pages/alunos/AlunosPage';
import AvaliacoesPage from '../pages/avaliacoes/AvaliacoesPage';
import NotificacoesPage from '../pages/notificacoes/NotificacoesPage';
import TurmasPage from '../pages/turmas/TurmasPage';
import './App.css';
export default function App() {
    const [tab, setTab] = useState('alunos');
    return (_jsxs("main", { className: "app-shell", children: [_jsxs("header", { className: "app-header", children: [_jsx("p", { className: "app-kicker", children: "Painel Academico" }), _jsx("h1", { children: "EXP2" }), _jsx("p", { children: "Gerenciamento de alunos, turmas e avaliacoes por metas." })] }), _jsxs("nav", { className: "app-nav", children: [_jsx("button", { type: "button", className: tab === 'alunos' ? 'active' : '', onClick: () => setTab('alunos'), children: "Alunos" }), _jsx("button", { type: "button", className: tab === 'turmas' ? 'active' : '', onClick: () => setTab('turmas'), children: "Turmas" }), _jsx("button", { type: "button", className: tab === 'avaliacoes' ? 'active' : '', onClick: () => setTab('avaliacoes'), children: "Avaliacoes" }), _jsx("button", { type: "button", className: tab === 'notificacoes' ? 'active' : '', onClick: () => setTab('notificacoes'), children: "Notificacoes" })] }), tab === 'alunos' && _jsx(AlunosPage, {}), tab === 'turmas' && _jsx(TurmasPage, {}), tab === 'avaliacoes' && _jsx(AvaliacoesPage, {}), tab === 'notificacoes' && _jsx(NotificacoesPage, {})] }));
}
