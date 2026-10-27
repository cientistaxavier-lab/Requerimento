export const NAV_STAFF = [
  ['dash', 'Painel'],
  ['estoque', 'Estoque'],
  ['movs', 'Movimentações'],
  ['solic', 'Solicitações'],
  ['ferramentas', 'Ferramentas'],
  ['emprestimos', 'Empréstimos'],
  ['repos', 'Reposição'],
  ['rel', 'Relatórios'],
];

export const NAV = {
  almox: [...NAV_STAFF, ['config', 'Configurações']],
  gestor: [...NAV_STAFF, ['usuarios', 'Usuários e regras'], ['config', 'Configurações']],
  solic: [
    ['nova', 'Nova solicitação'],
    ['minhas', 'Minhas solicitações'],
    ['nova-ferramenta', 'Solicitar ferramenta'],
    ['minhas-ferramentas', 'Minhas ferramentas'],
    ['config', 'Configurações'],
  ],
};
