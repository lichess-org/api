import { Chessground } from 'chessground';
import { h } from 'snabbdom';
import { Me } from '../auth';
import { Ctrl } from '../ctrl';
import { Game, Renderer } from '../interfaces';

export const renderHome: Renderer = ctrl => (ctrl.auth.me ? userHome(ctrl, ctrl.auth.me) : anonHome(ctrl));

const userHome = (ctrl: Ctrl, me: Me) => [
  h('div.alert.alert-success.mt-5', ['Welcome, ', me.username]),
  h('div.mt-5', [h('h1', 'Games in progress'), h('div.games', ctrl.games.games.map(renderGame(ctrl, me)))]),
];

const renderGame = (ctrl: Ctrl, me: Me) => (game: Game) =>
  h(
    'a.game-widget.text-decoration-none',
    {
      attrs: { href: `/game/${game.gameId}` },
    },
    [
      h('span.game-widget__opponent', [
        h('span.game-widget__opponent__name', game.opponent.username || 'Anon'),
        game.opponent.rating && h('span.game-widget__opponent__rating', game.opponent.rating),
      ]),
      h(
        'span.game-widget__board.cg-wrap',
        {
          hook: {
            insert(vnode) {
              const el = vnode.elm as HTMLElement;
              Chessground(el, {
                fen: game.fen,
                orientation: game.color,
                lastMove: game.lastMove.match(/.{1,2}/g),
                viewOnly: true,
                movable: { free: false },
                drawable: { visible: false },
                coordinates: false,
              });
            },
          },
        },
        'board'
      ),
    ]
  );

const anonHome = (ctrl: Ctrl) => [loginButton(), ctrl.auth.error ? h('div', 'Error: ' + ctrl.auth.error) : undefined];

const loginButton = () =>
  h(
    'div.login.text-center',
    h(
      'a.btn.btn-primary.btn-lg',
      {
        attrs: { href: '/login' },
      },
      'Login with Lichess'
    )
  );
