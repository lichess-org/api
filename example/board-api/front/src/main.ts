import { init } from 'snabbdom';
import { VNode } from 'snabbdom/vnode'
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
/* import { Chessground } from 'chessground'; */
import Ctrl from './ctrl';

const patch = init([klass, attributes]);

import view from './view';
import { ServerLogin } from './types';

export function start(login: ServerLogin) {

  const element = document.querySelector('main') as HTMLElement;

  let vnode: VNode;

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  const ctrl = new Ctrl(login, redraw);

  const blueprint = view(ctrl);
  element.innerHTML = '';
  vnode = patch(element, blueprint);

  redraw();

  window.addEventListener('resize', () => document.body.dispatchEvent(new Event('chessground.resize')));
};
