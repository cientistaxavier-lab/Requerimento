const PATHS = {
  dash: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  estoque: <><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  movs: <path d="M7 4v16M7 4 3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" />,
  solic: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4h6v3H9zM9 14l2 2 4-4" /></>,
  repos: <><path d="M3 3h2l2.4 11h10.2L20 7H6" /><circle cx="9" cy="19" r="1.5" /><circle cx="17" cy="19" r="1.5" /></>,
  rel: <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8" />,
  nova: <path d="M12 5v14M5 12h14" />,
  minhas: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  usuarios: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5M17 4.5a3.5 3.5 0 0 1 0 7M21.5 20c-.3-2.4-1.5-4-3.5-4.9" /></>,
  ferramentas: <path d="M14.7 6.3a4 4 0 0 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 1 5.4-5.4l-2.6 2.6-2-2z" />,
  emprestimos: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
  config: <><path d="M4 6h8.5M17.5 6H20M4 12h2.5M11.5 12H20M4 18h10.5M19.5 18H20" /><circle cx="15" cy="6" r="2.5" /><circle cx="9" cy="12" r="2.5" /><circle cx="17" cy="18" r="2.5" /></>,
};

export function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}

export function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h26M3 21h26" stroke="currentColor" strokeWidth="2" />
      <rect x="6.5" y="5.5" width="6" height="5" fill="#E0A100" />
      <rect x="15" y="14.5" width="7" height="5" fill="#7C99FF" />
      <rect x="8" y="23.5" width="8" height="3.5" fill="#4CC38A" />
    </svg>
  );
}
