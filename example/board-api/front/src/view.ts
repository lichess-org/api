import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode';
import Ctrl from './ctrl';

export default function(ctrl: Ctrl): VNode {
  return h('main.app', [
    h('section.top', [
      h('h1', 'Lichess Board API example'),
      h('div.top__right', [
        h('strong', ctrl.login.username),
        h('a', { attrs: { href: '/logout' } }, 'Log out')
      ])
    ]),
    h('section.event-log', [
      h('h2', 'Main Event Log'),
      h('pre', ctrl.eventLog.map(o => JSON.stringify(o)))
    ])
  ]);
}
