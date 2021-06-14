import { h, VNode } from 'snabbdom';
import { Ctrl } from './ctrl';

export function view(ctrl: Ctrl): VNode {
  return h('table', [
    h('tr', [
      h('td', 'Application state'),
      h('td', ctrl.state),
    ]),
    h('tr', [
      h('td', 'Error'),
      h('td', ctrl.error),
    ]),
    h('tr', [
      h('td', 'Error description'),
      h('td', ctrl.errorDescription),
    ]),
    h('tr', [
      h('td', ''),
      h('td', [
        h('button', {
          attrs: {
            disabled: ctrl.state != 'unauthorized',
          },
          on: {
           click: () => ctrl.login(),
          }
        }, 'Login'),
      ]),
    ]),
  ]);
}
