import { Auth } from './auth';
import { GameCtrl } from './game';
import { Page } from './interfaces';
import { readStream } from './ndJsonStream';
import OngoingGames from './ongoingGames';
import page from 'page';

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

  playAi = async () => {
    this.game = undefined;
    this.page = 'game';
    this.redraw();
    const game = await this.auth.fetchBody('/api/challenge/ai', {
      method: 'post',
      body: formData({
        level: 1,
        'clock.limit': 60 * 60,
        'clock.increment': 2,
      }),
    });
    page(`/game/${game.id}`);
  };

  startEventStream = async () => {
    if (this.auth.me) {
      const stream = await this.auth.fetchResponse('/api/stream/event');
      await readStream(this.messageHandler)(stream);
      await this.startEventStream(); // reconnect
    }
  };

  private messageHandler = (msg: any) => {
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

const formData = (data: any): FormData => {
  const formData = new FormData();
  for (const k of Object.keys(data)) formData.append(k, data[k]);
  return formData;
};
