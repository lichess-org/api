import { Chessground } from 'chessground';
import { h } from 'snabbdom';
import { Ctrl } from '../ctrl';
import { Game, Renderer } from '../interfaces';

export const renderHome: Renderer = ctrl => (ctrl.auth.me ? userHome(ctrl) : anonHome());

const userHome = (ctrl: Ctrl) => [
  h('div.mt-5', [
    h('div.mt-5', [
      h(
        'button.btn.btn-primary.btn-lg',
        {
          attrs: { type: 'button' },
          on: { click: ctrl.playAi },
        },
        'Play the Lichess AI'
      ),
    ]),
    h('h1.mt-5', 'Games in progress'),
    h('div.games', ctrl.games.games.map(renderGameWidget)),
  ]),
];

const renderGameWidget = (game: Game) =>
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

const anonHome = () => [
  h('div.login.text-center', [
    h('p', [
      'This client-side app demonstrates usage of the ',
      h('a', { attrs: { href: 'https://lichess.org/api' } }, 'Lichess API'),
      '.',
    ]),
    h('p', 'Please log in to continue.'),
    h(
      'a.btn.btn-primary.btn-lg.mt-5',
      {
        attrs: { href: '/login' },
      },
      'Login with Lichess'
    ),
  ]),
];
