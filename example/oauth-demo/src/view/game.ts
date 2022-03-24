import { Chessground } from 'chessground';
import { Color } from 'chessground/types';
import { opposite } from 'chessground/util';
import { h, VNode } from 'snabbdom';
import { GameCtrl } from '../game';
import { Game, Renderer } from '../interfaces';

export const renderGame: (ctrl: GameCtrl) => Renderer = ctrl => root => {
  const game = ctrl.game;
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
                      const el = vnode.elm as HTMLElement;
                      console.log(game?.fen);
                      if (game)
                        ctrl.ground = Chessground(el, {
                          fen: game.fen,
                          orientation: game.color,
                          lastMove: game.lastMove?.match(/.{1,2}/g),
                          viewOnly: true,
                          movable: { free: false },
                          drawable: { visible: false },
                          coordinates: false,
                        });
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

const renderPlayer = (ctrl: GameCtrl, color: Color) =>
  ctrl.game &&
  h('div.game-page__player', [
    h('div.game-page__player__user', [
      h('h2.game-page__player__user__name', ctrl.game[color].name || 'Anon'),
      h('span.game-page__player__user__rating', ctrl.game[color].rating || '?'),
    ]),
    h('div.game-page__player__clock.display-4', clockContent(ctrl.timeOf(color), false)),
  ]);

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
