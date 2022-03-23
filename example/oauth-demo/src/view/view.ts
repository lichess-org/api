import { VNode } from 'snabbdom';
import { Ctrl } from '../ctrl';
import { Page, Renderer } from '../interfaces';
import { renderHome } from './home';
import layout from './layout';

export default function view(ctrl: Ctrl): VNode {
  return layout(ctrl, selectRenderer(ctrl.page)(ctrl));
}

const selectRenderer = (page: Page): Renderer => {
  if (page == 'home') return renderHome;
  throw `No renderer for page ${page}`;
};
