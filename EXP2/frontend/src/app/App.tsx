import { useState } from 'react';
import AlunosPage from '../pages/alunos/AlunosPage';
import AvaliacoesPage from '../pages/avaliacoes/AvaliacoesPage';
import NotificacoesPage from '../pages/notificacoes/NotificacoesPage';
import TurmasPage from '../pages/turmas/TurmasPage';
import './App.css';

type Tab = 'alunos' | 'turmas' | 'avaliacoes' | 'notificacoes';

export default function App() {
  const [tab, setTab] = useState<Tab>('alunos');

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-kicker">Painel Academico</p>
        <h1>EXP2</h1>
        <p>Gerenciamento de alunos, turmas e avaliacoes por metas.</p>
      </header>

      <nav className="app-nav">
        <button type="button" className={tab === 'alunos' ? 'active' : ''} onClick={() => setTab('alunos')}>
          Alunos
        </button>
        <button type="button" className={tab === 'turmas' ? 'active' : ''} onClick={() => setTab('turmas')}>
          Turmas
        </button>
        <button
          type="button"
          className={tab === 'avaliacoes' ? 'active' : ''}
          onClick={() => setTab('avaliacoes')}
        >
          Avaliacoes
        </button>
        <button
          type="button"
          className={tab === 'notificacoes' ? 'active' : ''}
          onClick={() => setTab('notificacoes')}
        >
          Notificacoes
        </button>
      </nav>

      {tab === 'alunos' && <AlunosPage />}
      {tab === 'turmas' && <TurmasPage />}
      {tab === 'avaliacoes' && <AvaliacoesPage />}
      {tab === 'notificacoes' && <NotificacoesPage />}
    </main>
  );
}
