import { Ctrl } from './ctrl';
import { Game } from './interfaces';
import { Api as CgApi } from 'chessground/api';
import { readStream } from './ndJsonStream';
import { Color } from 'chessground/types';

export class GameCtrl {
  pov: Color = 'white';
  ground?: CgApi;

  constructor(public game: Game, private root: Ctrl) {}

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
      while (true) {
        const stream = await root.auth.fetch(`/api/board/game/stream/${id}`);
        await readStream(handler)(stream);
      }
    });
  };

  private handle = (msg: any) => {
    console.log(msg);
    switch (msg.type) {
      case 'gameFull':
        this.setGame(msg);
        this.root.redraw();
        break;
      default:
        console.error(`Unknown message type: ${msg.type}`, msg);
    }
  };

  private setGame = (game: Game) => {
    this.game = game;
    this.pov = this.game.black.id == this.root.auth.me?.id ? 'black' : 'white';
  };

  timeOf = (color: Color) => this.game.state[`${color[0]}time`];
}
