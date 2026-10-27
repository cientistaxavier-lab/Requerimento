import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Logo } from '../common/icons';

const PATTERN = ['ok', 'ok', 'low', 'ok', 'out', 'ok', 'ok', 'free', 'ok', 'ok', 'low', 'ok', 'ok', 'ok', 'free', 'ok', 'ok', 'ok'];

const DEMO = {
  almox: [
    ['gestor', 'gestor123', 'Gestor, 2ª aprovação e usuários'],
    ['rafael', 'rafael123', 'Almoxarife'],
  ],
  solic: [
    ['bruno', 'bruno123', 'Manutenção'],
    ['camila', 'camila123', 'Expedição'],
  ],
};

export default function LoginScreen({ initialMsg }) {
  const { login } = useAuth();
  const { data } = useData();
  const [panel, setPanel] = useState('almox');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState(initialMsg || '');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const f = e.target;
    setErr('');
    setBusy(true);
    const res = await login(panel, f.elements.user.value, f.elements.pw.value);
    setBusy(false);
    if (res.error) setErr(res.error);
  }

  const cells = PATTERN.map((p, i) => {
    if (p === 'free') return <div className="slot s-free" key={i} />;
    const it = data.items[(i * 3) % data.items.length];
    const pct = p === 'out' ? 100 : p === 'low' ? 30 : 40 + ((i * 7) % 55);
    return (
      <div className={'slot s-' + p} key={i}>
        <span className="sc">{it.code}</span>
        <span className="fill" style={{ width: pct + '%' }} />
      </div>
    );
  });

  return (
    <section className="login">
      <div className="lg-art">
        <div className="brand">
          <Logo />
          <div>
            <div className="bn">Almoxarifado Digital</div>
            <div className="bs">Protótipo (MVP)</div>
          </div>
        </div>
        <div>
          <h2>Do pedido à entrega, tudo sob controle.</h2>
          <p>Estoque, solicitações, aprovações e relatórios em um só lugar. Entre com o seu usuário para acessar o painel do seu perfil.</p>
        </div>
        <div className="lg-rack" aria-hidden="true">
          {cells}
        </div>
      </div>
      <div className="lg-card">
        <h1>Entrar</h1>
        <p className="muted" style={{ margin: '6px 0 22px' }}>
          Escolha o painel e informe usuário e senha.
        </p>
        <form onSubmit={onSubmit} noValidate>
          <div className="field" style={{ marginBottom: 14 }}>
            <span className="lbl">Painel</span>
            <div className="seg" role="radiogroup" aria-label="Painel">
              <label className="rd">
                <input type="radio" name="panel" value="almox" checked={panel === 'almox'} onChange={() => setPanel('almox')} />
                <span>Almoxarifado</span>
              </label>
              <label className="rd">
                <input type="radio" name="panel" value="solic" checked={panel === 'solic'} onChange={() => setPanel('solic')} />
                <span>Solicitante</span>
              </label>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 14 }}>
            <label htmlFor="lg-user">Usuário</label>
            <input id="lg-user" name="user" autoComplete="username" autoCapitalize="off" spellCheck="false" />
          </div>
          <div className="field" style={{ marginBottom: 8 }}>
            <label htmlFor="lg-pw">Senha</label>
            <div className="pw">
              <input id="lg-pw" name="pw" type={showPw ? 'text' : 'password'} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPw((s) => !s)}>
                {showPw ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
          <div className="errbox" id="lg-err" role="alert">
            {err}
          </div>
          <button className="btn primary" type="submit" style={{ width: '100%', padding: 11 }} disabled={busy}>
            Entrar
          </button>
        </form>
        <details className="demo">
          <summary>Contas de demonstração</summary>
          <table>
            <tbody>
              {DEMO[panel].map((r) => (
                <tr key={r[0]}>
                  <td>
                    Usuário <code>{r[0]}</code>
                  </td>
                  <td>
                    Senha <code>{r[1]}</code>
                  </td>
                  <td className="muted">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note" style={{ marginTop: 8 }}>
            Contas apenas para teste. Se a senha tiver sido alterada, use a nova.
          </p>
        </details>
      </div>
    </section>
  );
}
