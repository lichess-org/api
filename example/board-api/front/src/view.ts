import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode';
import { Chessground } from 'chessground';
import Ctrl from './ctrl';
import { Game } from './types';
import { Chess, parseUci } from 'chessops';
import { Color } from 'chessground/types';
import { makeBoardFen } from 'chessops/fen';
import { chessgroundDests } from 'chessops/compat';

export default function(ctrl: Ctrl): VNode {
  return h('main.app', [
    h('section.top', [
      h('h1', 'Lichess Board API example'),
      h('div.top__right', [
        h('strong', ctrl.login.username),
        h('a', { attrs: { href: '/logout' } }, 'Log out')
      ])
    ]),
    h('div.content', [
      h('div.board.chessground.merida.blue', [
        ctrl.game ?
          h('div.cg-wrap', {
            hook: {
              insert(vnode) {
                ctrl.setChessground(Chessground(vnode.elm as HTMLElement, chessgroundConfig(ctrl.game!)));
              }
            }
          }) :
          h('div.cg-wrap.waiting')
      ]),
      h('div.ui', [
        h('section.main-log.box', [
          h('h2', 'Main Event Log'),
          h('div.log', ctrl.mainLog.map(o => h('p', JSON.stringify(o))))
        ]),
        h('section.game-log.box', [
          h('h2', 'Game Event Log'),
          h('div.log', ctrl.gameLog.map(o => h('p', JSON.stringify(o))))
        ]),
      ])
    ])
  ]);
}

const chessgroundConfig = (game: Game) => {
  const color: Color = game.state.moves.length % 2 == 0 ? 'white' : 'black';
  const chess = Chess.default();
  game.state.moves.split(' ').forEach(m => chess.play(parseUci(m)!));
  return {
    fen: makeBoardFen(chess.board),
    orientation: 'white' as Color,
    turnColor: color,
    check: chess.isCheck(),
    movable: {
      free: false,
      color: color,
      dests: chessgroundDests(chess)
    },
    /* events: { */
    /*   move(orig: Key, dest: Key) { */
    /*     ctrl.onMove(`${orig}${dest}`); */
    /*   } */
    /* }, */
    premovable: {
      enabled: false
    },
    drawable: {
      enabled: true
    },
    disableContextMenu: true
  }
}
