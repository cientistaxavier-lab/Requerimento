import { createContext, useCallback, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { themeOk, applyTheme, browserTheme } from '../lib/themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { current } = useAuth();
  const { setUserTheme } = useData();

  const theme = useMemo(() => (current && themeOk(current.theme) ? current.theme : browserTheme()), [current]);

  const setTheme = useCallback(
    (id) => {
      if (!themeOk(id)) return;
      applyTheme(id);
      if (current) setUserTheme(current.user, id);
      try {
        localStorage.setItem('almox-theme', id);
      } catch (e) {
        /* ignore */
      }
    },
    [current, setUserTheme]
  );

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme precisa estar dentro de <ThemeProvider>');
  return ctx;
}
