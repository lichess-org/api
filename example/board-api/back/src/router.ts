import Express from 'express';
import Env from './env';
import * as oauth from './oauth';

export default function(app: Express.Express, env: Env) {

  app.get('/', async (req, res) => {
    const auth = await env.mongo.auth.get(req.session?.authId || '');
    if (!auth) return res.send(htmlPage(`<a href="/auth">Login with Lichess to continue</a>`));
    return res.send(htmlPage(`
    <main></main>
    <script src="/dist/app.dev.js"></script>
    <script>App.start(${JSON.stringify({
      username: auth.username,
      token: auth.access_token
    })})</script>
`));
  });

  app.get('/logout', (req, res) => {
    req.session!.authId = '';
    res.redirect('/');
  });

  app.get('/auth', (_, res) => res.redirect(oauth.authorizationUri));

  app.get('/oauth-callback', async (req, res) => {
    const token = await oauth.getToken(req.query.code as string);
    const user = await oauth.getUserInfo(token);
    const authId = await env.mongo.auth.save(token.token, user.username);
    req.session!.authId = authId;
    res.redirect('/');
  });

  app.get('/logout', (req, res) => {
    req.session!.authId = '';
    res.redirect('/');
  });
}

const htmlPage = (content: string) => `
<html>
  <head>
    <title>Lichess App example</title>
    <link href="/style.css" rel="stylesheet">
  </head>
  <body>
    ${content}
  </body>
</html>`;
