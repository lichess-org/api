import { init, attributesModule, eventListenersModule, h } from 'snabbdom';
import { Ctrl } from './ctrl';
import view from './view/app';
import '../scss/style.scss';
import '../node_modules/bootstrap/js/dist/dropdown.js';
import '../node_modules/bootstrap/js/dist/collapse.js';
import '../node_modules/bootstrap-dark-5/dist/js/darkmode.js';
import routing from './routing';

export default function (element: HTMLElement) {
  const patch = init([attributesModule, eventListenersModule]);

  const ctrl = new Ctrl(redraw);

  let vnode = patch(element, h('div', 'loading...'));

  function redraw() {
    vnode = patch(vnode, view(ctrl));
  }

  ctrl.auth.init().then(() => {
    routing(ctrl);
    ctrl.startEventStream();
  });
}
