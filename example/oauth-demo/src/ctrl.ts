import { Auth } from './auth';
import { GameCtrl } from './game';
import { Game, Page } from './interfaces';
import { readStream } from './ndJsonStream';

export class Ctrl {
  auth: Auth = new Auth();
  page: Page = 'home';
  games: Game[] = [];
  game?: GameCtrl;

  constructor(readonly redraw: () => void) {}

  openGame = async (id: string) => {
    this.game = await GameCtrl.startEventStream(this, id);
    this.redraw();
  };

  startEventStream = async () => {
    if (this.auth.me) {
      const stream = await this.auth.fetch('/api/stream/event');
      await readStream(this.messageHandler)(stream);
      await this.startEventStream(); // reconnect
    }
  };

  messageHandler = (msg: any) => {
    switch (msg.type) {
      case 'gameStart':
        console.log(msg.game);
        this.games.push(msg.game);
        this.redraw();
        break;
      default:
        console.error(`Unknown message type: ${msg.type}`, msg);
    }
  };
}
