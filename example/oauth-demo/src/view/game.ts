import { Chessground } from 'chessground';
import { Color } from 'chessground/types';
import { opposite } from 'chessground/util';
import { h, VNode } from 'snabbdom';
import { GameCtrl } from '../game';
import { Renderer } from '../interfaces';

export const renderGame: (ctrl: GameCtrl) => Renderer = ctrl => _ => {
  return [
    h(
      `div.game-page.game-page--${ctrl.game.id}`,
      {
        hook: {
          destroy: ctrl.onUnmount,
        },
      },
      [
        renderPlayer(ctrl, opposite(ctrl.pov)),
        renderBoard(ctrl),
        renderPlayer(ctrl, ctrl.pov),
        ctrl.playing() ? renderButtons(ctrl) : renderState(ctrl),
      ]
    ),
  ];
};

const renderBoard = (ctrl: GameCtrl) =>
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
  );

const renderButtons = (ctrl: GameCtrl) =>
  h('div.btn-group.mt-4', [
    h(
      'button.btn.btn-secondary',
      {
        attrs: { type: 'button', disabled: !ctrl.playing() },
        on: {
          click() {
            if (confirm('Confirm?')) ctrl.resign();
          },
        },
      },
      ctrl.chess.fullmoves > 1 ? 'Resign' : 'Abort'
    ),
  ]);

const renderState = (ctrl: GameCtrl) => h('div.game-page__state', ctrl.game.state.status);

const renderPlayer = (ctrl: GameCtrl, color: Color) => {
  const p = ctrl.game[color];
  return h(
    'div.game-page__player',
    {
      class: {
        turn: ctrl.chess.turn == color,
      },
    },
    [
      h('div.game-page__player__user', [
        h('h2.game-page__player__user__name', p.aiLevel ? `Stockfish level ${p.aiLevel}` : p.name || 'Anon'),
        h('span.game-page__player__user__rating', p.rating || ''),
      ]),
      h('div.game-page__player__clock.display-4.font-monospace', clockContent(ctrl, color, true)),
    ]
  );
};

function clockContent(ctrl: GameCtrl, color: Color, showTenths: boolean): Array<string | VNode> {
  const time = ctrl.timeOf(color);
  if (!time && time !== 0) return ['-'];
  const decay =
    color == ctrl.chess.turn && ctrl.chess.fullmoves > 1 && ctrl.playing() ? ctrl.lastUpdateAt - Date.now() : 0;
  const date = new Date(time + decay),
    millis = date.getUTCMilliseconds(),
    sep = ':',
    baseStr = pad2(date.getUTCMinutes()) + sep + pad2(date.getUTCSeconds());
  if (!showTenths || time >= 3600000) return [Math.floor(time / 3600000) + sep + baseStr];
  return [baseStr, h('tenths', '.' + Math.floor(millis / 100).toString())];
}

const pad2 = (num: number) => (num < 10 ? '0' : '') + num;
