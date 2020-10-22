import { ServerLogin } from './types';
import readStream from './ndjson';

export default class Ctrl {

  constructor(readonly login: ServerLogin, readonly redraw: () => void) {
    console.log(login.token);
    fetch('https://lichess.org/api/stream/event', {
      headers: { 'Authorization': `Bearer ${login.token}` }
    }).then(readStream(this.onServerEvent));
  }

  private onServerEvent = (event: any) => {
    console.log(event);
  }
}
