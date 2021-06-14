import { h, VNode } from 'snabbdom';
import { Ctrl } from './ctrl';

export function view(ctrl: Ctrl): VNode {
  return h('div', 'Hello world!');
}
