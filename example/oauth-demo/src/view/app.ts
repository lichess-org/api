import { VNode } from 'snabbdom';
import { Ctrl } from '../ctrl';
import { Page, Renderer } from '../interfaces';
import { renderGame } from './game';
import { renderHome } from './home';
import layout from './layout';

export default function view(ctrl: Ctrl): VNode {
  return layout(ctrl, selectRenderer(ctrl)(ctrl));
}

const selectRenderer = (ctrl: Ctrl): Renderer => {
  if (ctrl.page == 'game' && ctrl.game) return renderGame(ctrl.game);
  if (ctrl.page == 'home') return renderHome;
  throw `No renderer for page ${page}`;
};
