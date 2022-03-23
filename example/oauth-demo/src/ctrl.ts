import { Auth } from './auth';
import { Game, Page } from './interfaces';
import { readStream } from './ndJsonStream';

export class Ctrl {
  auth: Auth = new Auth();
  page: Page = 'home';
  games: Game[] = [];

  constructor(readonly redraw: () => void) {}

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
        this.games.push(msg.game);
        this.redraw();
        break;
      default:
        console.error(`Unknown message type: ${msg.type}`, msg);
    }
  };
}
