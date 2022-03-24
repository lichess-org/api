import { Chessground } from 'chessground';
import { Color } from 'chessground/types';
import { opposite } from 'chessground/util';
import { chessgroundDests } from 'chessops/compat';
import { makeFen } from 'chessops/fen';
import { h, VNode } from 'snabbdom';
import { GameCtrl } from '../game';
import { Game, Renderer } from '../interfaces';

export const renderGame: (ctrl: GameCtrl) => Renderer = ctrl => root => {
  const game = ctrl.game,
    pos = ctrl.chess;
  return [
    h(
      `div.game-page.game-page--${game.id}`,
      game
        ? [
            renderPlayer(ctrl, opposite(ctrl.pov)),
            h(
              'div.game-page__board',
              h(
                'div.cg-wrap',
                {
                  hook: {
                    insert(vnode) {
                      ctrl.ground = Chessground(vnode.elm as HTMLElement, ctrl.chessgroundConfig());
                    },
                  },
                },
                'loading...'
              )
            ),
            renderPlayer(ctrl, ctrl.pov),
          ]
        : h('div.game-page__board.loading', 'loading')
    ),
  ];
};

const renderPlayer = (ctrl: GameCtrl, color: Color) => {
  const p = ctrl.game[color];
  return h('div.game-page__player', [
    h('div.game-page__player__user', [
      h('h2.game-page__player__user__name', p.aiLevel ? `Stockfish level ${p.aiLevel}` : p.name || 'Anon'),
      h('span.game-page__player__user__rating', p.rating || ''),
    ]),
    h('div.game-page__player__clock.display-4', clockContent(ctrl.timeOf(color), false)),
  ]);
};

function clockContent(centis: number | undefined, showTenths: boolean): Array<string | VNode> {
  if (!centis && centis !== 0) return ['-'];
  const date = new Date(centis * 10),
    millis = date.getUTCMilliseconds(),
    sep = ':',
    baseStr = pad2(date.getUTCMinutes()) + sep + pad2(date.getUTCSeconds());
  if (!showTenths || centis >= 360000) return [Math.floor(centis / 360000) + sep + baseStr];
  return centis >= 6000 ? [baseStr] : [baseStr, h('tenths', '.' + Math.floor(millis / 100).toString())];
}

function pad2(num: number): string {
  return (num < 10 ? '0' : '') + num;
}
