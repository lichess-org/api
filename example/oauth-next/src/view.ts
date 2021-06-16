import { h, VNode } from 'snabbdom';
import { clientUrl, Ctrl } from './ctrl';

export function view(ctrl: Ctrl): VNode {
  return h('table', [
    h('tr', [
      h(
        'td',
        { attrs: { colspan: 2 } },
        'This is an example OAuth client that reads the users email address from the Lichess API.'
      ),
    ]),
    h('tr', [
      h('td', 'Lichess Host'),
      h('td', [
        h('input', {
          attrs: {
            disabled: ctrl.state != 'unauthorized',
            value: ctrl.lichessHost,
            list: 'hosts',
          },
          on: {
            change(el) {
              ctrl.setLichessHost((el.target as HTMLInputElement).value);
            },
          },
        }),
        h('datalist', { attrs: { id: 'hosts' } }, [
          h('option', { attrs: { value: 'https://lichess.org' } }),
          h('option', { attrs: { value: 'https://lichess.dev' } }),
          h('option', { attrs: { value: 'http://localhost:9663' } }),
          h('option', { attrs: { value: 'http://l.org' } }),
        ]),
      ]),
    ]),
    h('tr', [h('td', 'Client URL'), h('td', clientUrl)]),
    h('tr', [h('td', 'Application state'), h('td', ctrl.state)]),
    h('tr', [h('td', 'Error'), h('td', ctrl.error)]),
    h('tr', [h('td', 'Error description'), h('td', ctrl.errorDescription)]),
    h('tr', [h('td', 'Access token (secret)'), h('td', ctrl.accessToken)]),
    h('tr', [h('td', 'Lichess account email'), h('td', ctrl.email)]),
    h('tr', [
      h('td', ''),
      h('td', [
        h(
          'button',
          {
            attrs: { disabled: ctrl.state != 'unauthorized' },
            on: { click: () => ctrl.login() },
          },
          'Login'
        ),
        ' ',
        h(
          'button',
          {
            attrs: { disabled: ctrl.state != 'error' && ctrl.state != 'authorized' },
            on: { click: () => ctrl.logout() },
          },
          ctrl.state == 'authorized' ? 'Logout' : 'Reset'
        ),
      ]),
    ]),
  ]);
}
