import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useData, PANEL_OF } from './DataContext';
import { hashPw } from '../lib/auth';
import { themeOk, applyTheme, browserTheme } from '../lib/themes';

const SESSION_KEY = 'almox-session';
const IDLE_MS = 15 * 60000;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { data } = useData();
  const [current, setCurrent] = useState(null);
  const [booted, setBooted] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState('');
  const attempts = useRef({});
  const idleTimer = useRef(null);

  const logout = useCallback((msg) => {
    setCurrent(null);
    setLogoutMsg(msg || '');
    clearTimeout(idleTimer.current);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (e) {
      /* ignore */
    }
    applyTheme(browserTheme());
  }, []);

  const bumpIdle = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => logout('Sessão encerrada por inatividade. Entre novamente.'), IDLE_MS);
  }, [logout]);

  useEffect(() => {
    if (!current) return undefined;
    bumpIdle();
    const evs = ['click', 'keydown', 'input'];
    evs.forEach((ev) => document.addEventListener(ev, bumpIdle, true));
    return () => {
      evs.forEach((ev) => document.removeEventListener(ev, bumpIdle, true));
      clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // Restaura a sessão da aba, se houver, ao carregar a página.
  useEffect(() => {
    try {
      const su = sessionStorage.getItem(SESSION_KEY);
      const u = su && data.users.find((x) => x.user === su && x.active);
      if (u) {
        setCurrent(u);
        if (themeOk(u.theme)) applyTheme(u.theme);
      }
    } catch (e) {
      /* ignore */
    }
    setBooted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantém o usuário logado sincronizado com o estado de dados (ex.: tema salvo).
  useEffect(() => {
    if (!current) return;
    const fresh = data.users.find((u) => u.user === current.user);
    if (fresh && fresh !== current) setCurrent(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.users]);

  const login = useCallback(
    async (panel, uname, pw) => {
      uname = uname.trim().toLowerCase();
      if (!uname || !pw) return { error: 'Informe usuário e senha.' };
      const a = attempts.current[uname] || (attempts.current[uname] = { n: 0, until: 0 });
      if (Date.now() < a.until) {
        return { error: 'Muitas tentativas. Aguarde ' + Math.ceil((a.until - Date.now()) / 1000) + ' segundos.' };
      }
      const u = data.users.find((x) => x.user === uname);
      let ok = false;
      if (u && u.active) ok = (await hashPw(pw, u.salt)) === u.hash;
      else await hashPw(pw, 'x');
      if (!ok) {
        a.n++;
        if (a.n >= 5) {
          a.n = 0;
          a.until = Date.now() + 30000;
          return { error: 'Muitas tentativas. Aguarde 30 segundos.' };
        }
        return { error: 'Usuário ou senha incorretos.' };
      }
      if (PANEL_OF(u.role) !== panel) {
        return { error: 'Este usuário não tem acesso ao painel ' + (panel === 'solic' ? 'do solicitante' : 'do almoxarifado') + '. Escolha o painel correto acima.' };
      }
      a.n = 0;
      setCurrent(u);
      try {
        sessionStorage.setItem(SESSION_KEY, u.user);
      } catch (e) {
        /* ignore */
      }
      if (themeOk(u.theme)) applyTheme(u.theme);
      return { error: null, user: u };
    },
    [data.users]
  );

  const isGestor = !!current && current.role === 'gestor';

  const value = { current, booted, login, logout, isGestor, logoutMsg };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
