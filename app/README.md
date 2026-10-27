# Almoxarifado Digital — versão React

Este é o mesmo sistema que vínhamos usando como página única, agora estruturado
como um projeto React (Vite), em componentes, contextos e hooks.

## Como rodar

Pré-requisito: Node.js instalado (baixe em https://nodejs.org, versão LTS).

```bash
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (normalmente `http://localhost:5173`).

Para gerar uma versão de produção (arquivos estáticos otimizados):

```bash
npm run build
npm run preview   # serve a versão de produção localmente, para conferir
```

## Contas de demonstração

As mesmas de sempre — aparecem também na própria tela de login, em
"Contas de demonstração":

- Painel **Almoxarifado**: `gestor` / `gestor123` (Gestor) ou `rafael` / `rafael123` (Almoxarife)
- Painel **Solicitante**: `bruno` / `bruno123` ou `camila` / `camila123` — **atenção**: `bruno`
  já entra **bloqueado**, de propósito, porque os dados de exemplo o deixam com uma
  ferramenta (a soldadora) atrasada. É assim que dá pra ver o bloqueio funcionando
  sem precisar esperar o prazo vencer de verdade. Para liberar, entre como `gestor`
  ou `rafael`, vá em **Empréstimos → Atrasadas** e clique em **Registrar devolução**.
  Use `thiago` / `thiago123` para testar um solicitante sem bloqueio.

## Empréstimo de ferramenta

Além da solicitação de material (consumo, dá baixa no estoque), agora existe um
fluxo separado para ferramentas com patrimônio — a ferramenta não é consumida,
é emprestada e precisa voltar:

- **Ferramentas** (Almoxarife/Gestor): catálogo com patrimônio único por
  ferramenta. Cadastrar/editar/excluir é só do Gestor; qualquer um da equipe
  vê o histórico (botão "Histórico").
- **Empréstimos** (Almoxarife/Gestor): aprova o pedido (e ajusta o prazo em
  horas ali mesmo), registra a retirada (é aí que o prazo começa a contar) e
  registra a devolução. A aba **Atrasadas** mostra quem está com o prazo
  vencido — o mesmo aparece na Central de alertas do Painel.
- **Solicitar ferramenta** / **Minhas ferramentas** (Solicitante): pede uma
  ferramenta disponível e acompanha o prazo de devolução.
- **Bloqueio**: se o prazo vence e a ferramenta não volta, o solicitante fica
  impedido de abrir qualquer novo pedido — de material ou de ferramenta — até
  a equipe do almoxarifado registrar a devolução. O desbloqueio é automático
  nesse momento, não precisa de um passo à parte.
- **Auditoria**: o relatório "Auditoria de ferramentas" (em Relatórios) lista
  todo empréstimo — retirada, prazo, devolução e horas de atraso.

## O que mudou em relação ao arquivo único

Nada na aparência ou no comportamento — é o mesmo sistema, só que dividido em
partes que podem ser editadas separadamente:

```
src/
  data/seed.js               dados de exemplo (itens, usuários, categorias)
  lib/                        funções puras: formatação, regras de estoque,
                              relatórios, senha (hash), exportação CSV, temas
  context/                    estado global via Context API
    DataContext.jsx           itens, movimentações, solicitações, usuários
    AuthContext.jsx           login, sessão, bloqueio por tentativas
    ThemeContext.jsx          tema atual e troca de tema
    ToastContext.jsx          notificações (toasts)
  hooks/useWarehouseDrag.js   arrastar-e-soltar no mapa do almoxarifado
  components/
    login/                    tela de login
    layout/                   barra lateral
    dashboard/                painel, mapa do almoxarifado, gráficos, alertas
    estoque/                   tabela de itens e modais (detalhe, editar, excluir, novo)
    movimentacoes/             lançamentos e histórico
    solicitacoes/              fluxo de aprovação (ticket, recusar)
    reposicao/                 lista de compra
    relatorios/                os 9 relatórios
    config/                    troca de tema e conta
    usuarios/                  gestão de usuários (só gestor)
```

Assim como antes, os dados (itens, movimentações, solicitações, usuários)
ficam salvos no navegador de quem abrir (localStorage) — não há servidor nem
banco de dados por trás ainda. Continua sendo o mesmo tipo de protótipo,
apenas com o código pronto para crescer.

## Próximo passo natural

Ligar isso a um backend de verdade (API + banco de dados), para que várias
pessoas vejam o mesmo estoque ao mesmo tempo e o login seja validado no
servidor. Posso montar essa parte quando você quiser.
