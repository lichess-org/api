import { h } from 'snabbdom';
import { Me } from '../auth';
import { Ctrl } from '../ctrl';
import { Game, Renderer } from '../interfaces';

export const renderHome: Renderer = ctrl => (ctrl.auth.me ? userHome(ctrl, ctrl.auth.me) : anonHome(ctrl));

const userHome = (ctrl: Ctrl, me: Me) => [
  h('div.alert.alert-success.mt-5', ['Welcome, ', me.username]),
  h('div.mt-5', [h('h1', 'Games in progress'), h('ul', ctrl.games.map(renderGame(ctrl, me)))]),
];

const renderGame = (ctrl: Ctrl, me: Me) => (game: Game) => h('li.game', game.opponent.username);

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
