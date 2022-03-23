import { h } from 'snabbdom';
import { Renderer } from '../interfaces';

export const renderHome: Renderer = ctrl =>
  ctrl.auth.me
    ? [h('div.alert.alert-success.mt-5', ['Welcome, ', ctrl.auth.me.username])]
    : [loginButton(), ctrl.auth.error ? h('div', 'Error: ' + ctrl.auth.error) : undefined];

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
