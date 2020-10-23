import { Game, ServerLogin } from './types';
import { Api as Chessground } from 'chessground/api';
import ndjson from './ndjson';

const lichess = 'http://l.org';

export default class Ctrl {

  authorization: { Authorization: string };
  mainLog = Array<string>()
  gameLog = Array<string>()
  game?: Game;
  chessground?: Chessground;

  constructor(readonly login: ServerLogin, readonly redraw: () => void) {
    this.authorization = { 'Authorization': `Bearer ${login.token}` };
    fetch(`${lichess}/api/stream/event`, { headers: this.authorization })
      .then(res => {
        this.mainLog.push('Connected');
        return res;
      })
      .then(ndjson(this.onMainEvent)).then(location.reload);
  }

  onMainEvent = (event: any) => {
    this.mainLog.push(event);
    this.mainLog = this.mainLog.slice(-300);
    if (event['type'] == 'gameStart') this.gameStart(event['game']['id']);
    this.redraw();
  }

  gameStart = (id: string) =>
    fetch(`${lichess}/api/board/game/stream/${id}`, { headers: this.authorization })
      .then(ndjson(this.onGameEvent));

  onGameEvent = (event: any) => {
    this.gameLog.push(event);
    this.gameLog = this.gameLog.slice(-300);
    if (event['type'] == 'gameFull') this.game = event as Game;
    this.redraw();
  }

  setChessground(cg: Chessground) {
    this.chessground = cg;
  }
}
