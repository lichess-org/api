import { Auth } from './auth';
import page from 'page';
import { Page } from './interfaces';

export class Ctrl {
  auth: Auth = new Auth();
  page: Page = 'home';

  constructor(private redraw: () => void) {
    page('/', async () => {
      this.page = 'home';
      this.redraw();
    });
    page('/login', async _ctx => {
      if (this.auth.me) return page('/');
      await this.auth.login();
    });
    page('/logout', async _ => {
      await this.auth.logout();
      page('/');
    });
  }
}
