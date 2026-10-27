export const THEMES = [
  { id: 'auto', n: 'Automático', d: 'Segue o tema do seu dispositivo' },
  { id: 'light', n: 'Claro', d: 'Fundo claro e contraste alto' },
  { id: 'dark', n: 'Escuro', d: 'Azul-marinho, confortável à noite' },
  { id: 'ocean', n: 'Oceano', d: 'Azul-petróleo, claro e fresco' },
  { id: 'violet', n: 'Violeta', d: 'Roxo suave, tema claro' },
  { id: 'sand', n: 'Areia', d: 'Tons quentes de bronze, claro' },
  { id: 'graphite', n: 'Grafite', d: 'Escuro neutro e minimalista' },
  { id: 'amethyst', n: 'Ametista', d: 'Escuro com destaque em orquídea' },
];

export function themeOk(id) {
  return THEMES.some((t) => t.id === id);
}

export function applyTheme(id) {
  const el = document.documentElement;
  if (!themeOk(id) || id === 'auto') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', id);
}

export function browserTheme() {
  try {
    const t = localStorage.getItem('almox-theme');
    return themeOk(t) ? t : 'auto';
  } catch (e) {
    return 'auto';
  }
}
