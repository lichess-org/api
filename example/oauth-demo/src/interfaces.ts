import { VNode } from 'snabbdom';
import { Ctrl } from './ctrl';

export type Page = 'home';

export type MaybeVNodes = (VNode | undefined)[];
export type Renderer = (ctrl: Ctrl) => MaybeVNodes;
