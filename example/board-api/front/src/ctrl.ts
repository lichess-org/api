import { ServerLogin } from './types';
import ndjson from './ndjson';

export default class Ctrl {

  eventLog = Array<string>()

  constructor(readonly login: ServerLogin, readonly redraw: () => void) {
    fetch('https://lichess.org/api/stream/event', {
      headers: { 'Authorization': `Bearer ${login.token}` }
    }).then(ndjson(this.onServerEvent)).then(location.reload);
  }

  private onServerEvent = (event: any) => {
    this.eventLog.push(event);
    this.eventLog = this.eventLog.slice(-300);
    this.redraw();
  }
}
