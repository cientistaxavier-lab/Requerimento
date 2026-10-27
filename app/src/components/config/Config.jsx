import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Head } from '../common/ui';
import { THEMES } from '../../lib/themes';
import { ROLES } from '../../data/seed';
import { useState } from 'react';
import MyPasswordModal from './MyPasswordModal';

function MiniPreview({ themeId }) {
  return (
    <div className="tp" data-theme={themeId}>
      <div className="ps">
        <i className="a" />
        <i />
        <i />
        <i />
      </div>
      <div className="pm">
        <div className="ph" />
        <div className="pr">
          <i />
          <i />
          <i className="b" />
        </div>
        <div className="pd">
          <span className="o" />
          <span className="w" />
          <span className="x" />
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ t, current, onPick }) {
  return (
    <button type="button" className="thm" aria-pressed={current === t.id} onClick={() => onPick(t.id)}>
      <div className="tpv" aria-hidden="true">
        {t.id === 'auto' ? (
          <>
            <MiniPreview themeId="light" />
            <div className="tpclip">
              <MiniPreview themeId="dark" />
            </div>
          </>
        ) : (
          <MiniPreview themeId={t.id} />
        )}
      </div>
      <span className="tn">
        <b>{t.n}</b>
        <span className="pill p-info use">Em uso</span>
      </span>
      <span className="d">{t.d}</span>
    </button>
  );
}

export default function Config() {
  const { current, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { show } = useToast();
  const [pwOpen, setPwOpen] = useState(false);

  function pick(id) {
    setTheme(id);
    const t = THEMES.find((x) => x.id === id);
    show('Tema ' + t.n + ' aplicado.');
  }

  return (
    <>
      <Head title="Configurações" sub="Personalize a aparência do sistema. A escolha fica salva na sua conta e vale também na tela de login deste navegador." />
      <section className="panel">
        <header>
          <h2>Tema</h2>
          <span className="muted">Tema atual: {THEMES.find((t) => t.id === theme)?.n}</span>
        </header>
        <div className="body">
          <div className="themes" role="group" aria-label="Tema do sistema">
            {THEMES.map((t) => (
              <ThemeCard key={t.id} t={t} current={theme} onPick={pick} />
            ))}
          </div>
        </div>
      </section>
      <section className="panel" style={{ marginTop: 18 }}>
        <header>
          <h2>Minha conta</h2>
        </header>
        <div className="body">
          <dl className="facts">
            <div>
              <dt>Nome</dt>
              <dd>{current.name}</dd>
            </div>
            <div>
              <dt>Usuário</dt>
              <dd>{current.user}</dd>
            </div>
            <div>
              <dt>Perfil</dt>
              <dd style={{ fontSize: 17 }}>
                {ROLES[current.role]}
                {current.role === 'solic' ? ', ' + current.sector : ''}
              </dd>
            </div>
          </dl>
          <div className="acts">
            <button className="btn" type="button" onClick={() => setPwOpen(true)}>
              Alterar minha senha
            </button>
            <button className="btn" type="button" onClick={() => logout()}>
              Sair
            </button>
          </div>
        </div>
      </section>
      <MyPasswordModal open={pwOpen} onClose={() => setPwOpen(false)} />
    </>
  );
}
