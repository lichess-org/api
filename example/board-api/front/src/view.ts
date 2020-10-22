import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode';
import Ctrl from './ctrl';

export default function(ctrl: Ctrl): VNode {
  return h('main.app', [
    'Logged in as ',
    ctrl.login.username
  ]);
}
