import express from 'express';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import { config } from './config';
import Env from './env';
import router from './router';

const app = express();

Env.make().then((env: Env) => {

  app.use(express.static('public'));

  app.use(bodyParser.json());

  app.use(cookieSession({
    name: 'session',
    keys: [ config.cookie.secret ],
    maxAge: 30 * 24 * 60 * 60 * 1000
  }))

  router(app, env);

  app.listen(config.http.port, () => {
    console.log(`⚡️[server]: Server is running at ${config.http.url}`);
  });
});
