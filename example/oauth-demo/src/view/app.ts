import { h, VNode } from 'snabbdom';
import { Ctrl } from '../ctrl';
import { Page, Renderer } from '../interfaces';
import { renderGame } from './game';
import { renderHome } from './home';
import layout from './layout';

export default function view(ctrl: Ctrl): VNode {
  return layout(ctrl, selectRenderer(ctrl)(ctrl));
}

const selectRenderer = (ctrl: Ctrl): Renderer => {
  if (ctrl.page == 'game') return ctrl.game ? renderGame(ctrl.game) : renderLoading;
  if (ctrl.page == 'home') return renderHome;
  throw `No renderer for page ${page}`;
};

const renderLoading: Renderer = (_: Ctrl) => [
  h(
    'div.loading',
    h('div.spinner-border.text-primary', { attrs: { role: 'status' } }, h('span.visually-hidden', 'Loading...'))
  ),
];
