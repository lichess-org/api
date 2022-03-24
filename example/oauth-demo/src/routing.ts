import { Ctrl } from './ctrl';
import page from 'page';

export default function (ctrl: Ctrl) {
  page('/', async ctx => {
    if (ctx.querystring.includes('code=liu_')) history.pushState({}, '', '/');
    else {
      ctrl.page = 'home';
      ctrl.redraw();
    }
  });
  page('/login', async _ => {
    if (ctrl.auth.me) return page('/');
    await ctrl.auth.login();
  });
  page('/logout', async _ => {
    await ctrl.auth.logout();
    location.href = '/';
  });
  page('/game/:id', ctx => {
    ctrl.page = 'game';
    ctrl.openGame(ctx.params.id);
  });
  page({ hashbang: true });
}
