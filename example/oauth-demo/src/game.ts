import { Ctrl } from './ctrl';
import { Game } from './interfaces';
import { Api as CgApi } from 'chessground/api';
import { readStream } from './ndJsonStream';
import { Color, Key } from 'chessground/types';
import { parseUci } from 'chessops/util';
import { Chess, defaultSetup } from 'chessops';
import { makeFen, parseFen } from 'chessops/fen';
import { chessgroundDests } from 'chessops/compat';

export class GameCtrl {
  game: Game;
  pov: Color;
  chess: Chess = Chess.default();
  lastMove?: [Key, Key];
  ground?: CgApi;

  constructor(game: Game, private root: Ctrl) {
    this.game = game;
    this.pov = this.game.black.id == this.root.auth.me?.id ? 'black' : 'white';
    this.onUpdate();
  }

  private onUpdate = () => {
    const setup = this.game.initialFen == 'startpos' ? defaultSetup() : parseFen(this.game.initialFen).unwrap();
    this.chess = Chess.fromSetup(setup).unwrap();
    const moves = this.game.state.moves.split(' ');
    moves.forEach((uci: string) => this.chess.play(parseUci(uci)!));
    const lastMove = moves[moves.length - 1];
    this.lastMove = lastMove && [lastMove.substr(0, 2) as Key, lastMove.substr(2, 2) as Key];
    this.ground?.set(this.chessgroundConfig());
    if (this.chess.turn == this.pov) this.ground?.playPremove();
  };

  timeOf = (color: Color) => this.game.state[`${color[0]}time`];

  userMove = async (orig: Key, dest: Key) => {
    await this.root.auth.fetch(`/api/board/game/${this.game.id}/move/${orig}${dest}`, { method: 'post' });
  };

  chessgroundConfig = () => ({
    orientation: this.pov,
    fen: makeFen(this.chess.toSetup()),
    lastMove: this.lastMove,
    turnColor: this.chess.turn,
    check: !!this.chess.isCheck(),
    movable: {
      free: false,
      color: this.pov,
      dests: chessgroundDests(this.chess),
    },
    events: {
      move: this.userMove,
    },
  });

  static startEventStream = (root: Ctrl, id: string): Promise<GameCtrl> => {
    return new Promise<GameCtrl>(async resolve => {
      let ctrl: GameCtrl;
      const handler = (msg: any) => {
        if (ctrl) ctrl.handle(msg);
        else {
          ctrl = new GameCtrl(msg, root);
          resolve(ctrl);
        }
      };
      const stream = await root.auth.fetch(`/api/board/game/stream/${id}`);
      await readStream(handler)(stream);
    });
  };

  private handle = (msg: any) => {
    console.log(msg);
    switch (msg.type) {
      case 'gameFull':
        this.game = msg;
        this.onUpdate();
        this.root.redraw();
        break;
      case 'gameState':
        this.game.state = msg;
        this.onUpdate();
        this.root.redraw();
        break;
      default:
        console.error(`Unknown message type: ${msg.type}`, msg);
    }
  };
}
