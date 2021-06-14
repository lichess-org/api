import { init, attributesModule, eventListenersModule } from 'snabbdom';
import { Ctrl } from './ctrl';
import { view } from './view';

export default function (element: HTMLElement) {
  const patch = init([attributesModule, eventListenersModule]);

  const ctrl = new Ctrl(redraw);

  let vnode = patch(element, view(ctrl));

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  ctrl.init();
}
