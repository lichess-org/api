import { GameFull, GameState, ServerLogin } from './types';
import { Api as Chessground } from 'chessground/api';
import { makeBoardFen } from 'chessops/fen';
import ndjson from './ndjson';
import {Chess, parseUci} from 'chessops';

const lichess = 'https://lichess.org';

export default class Ctrl {

  authorization: { Authorization: string };
  mainLog = Array<string>()
  gameLog = Array<string>()
  game?: GameFull;
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
    if (event['type'] == 'gameFull') this.game = event as GameFull;
    else if (event['type'] == 'gameState' && this.game) {
      this.game.state = event as GameState;
      this.chessground!.set({
        fen: makeBoardFen(this.currentChess().board)
      });
    }
    this.redraw();
  }

  currentChess = () => {
    const chess = Chess.default();
    if (this.game) this.game.state.moves.split(' ').filter((m: string) => m).forEach((m: string) => chess.play(parseUci(m)!));
    return chess;
  }

  setChessground(cg: Chessground) {
    this.chessground = cg;
  }
}
