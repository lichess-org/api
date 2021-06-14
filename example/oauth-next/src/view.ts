import { h, VNode } from 'snabbdom';
import { Ctrl } from './ctrl';

export function view(ctrl: Ctrl): VNode {
  return h('table', [
    h('tr', [
      h('td', 'State'),
      h('td', ctrl.state),
    ]),
    h('tr', [
      h('td', 'Action'),
      h('td', [
        ctrl.state == 'unauthorized' ? h('button', {
          on: {
            click: () => ctrl.login(),
          }
        }, 'Login') : undefined,
      ]),
    ]),
  ]);
}
