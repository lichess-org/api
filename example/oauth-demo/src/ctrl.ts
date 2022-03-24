import { Auth } from './auth';
import { GameCtrl } from './game';
import { Page } from './interfaces';
import { readStream } from './ndJsonStream';
import OngoingGames from './ongoingGames';

export class Ctrl {
  auth: Auth = new Auth();
  page: Page = 'home';
  games = new OngoingGames();
  game?: GameCtrl;

  constructor(readonly redraw: () => void) {}

  openGame = async (id: string) => {
    this.game = undefined;
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
        this.games.onStart(msg.game);
        this.redraw();
        break;
      case 'gameFinish':
        this.games.onFinish(msg.game);
        this.redraw();
        break;
      default:
        console.error(`Unknown message type: ${msg.type}`, msg);
    }
  };
}
