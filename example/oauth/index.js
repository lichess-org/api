const express = require('express');
const simpleOauth = require('simple-oauth2');
const axios = require('axios');

/* --- Fill in your app config here --- */
const clientId = '';
const clientSecret = '';
const redirectUri = '';
const scopes = ['game:read', 'preference:read'];
/* --- End of your app config --- */

/* --- Lichess config --- */
const tokenHost = 'https://oauth.lichess.org';
const authorizePath = '/oauth/authorize';
const tokenPath = '/oauth';
/* --- End of lichess config --- */

const state = Math.random().toString(36).substring(2);

const oauth2 = simpleOauth.create({
  client: {
    id: clientId,
    secret: clientSecret,
  },
  auth: {
    tokenHost,
    tokenPath,
    authorizePath,
  },
});

const authorizationUri = `${tokenHost}${authorizePath}?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&state=${state}`;

const app = express();

// Initial page redirecting to Lichess
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', async (req, res) => {
  try {
    const result = await oauth2.authorizationCode.getToken({
      code: req.query.code,
      redirect_uri: redirectUri
    });
    console.log(result);
    const token = oauth2.accessToken.create(result);
    const userPrefs = await getUserPrefs(token.token);
    res.send(`<h1>Success!</h1>Your lichess preferences: <pre>${JSON.stringify(userPrefs.data)}</pre>`);
  } catch(error) {
    console.error('Access Token Error', error.message);
    res.status(500).json('Authentication failed');
  }
});

app.get('/', (req, res) => {
  res.send('Hello<br><a href="/auth">Log in with lichess</a>');
});

app.listen(3000, () => {
  console.log('Express server started on port 3000');
});

function getUserPrefs(token) {
  return axios.get('/account/preferences', {
    baseURL: 'https://lichess.org/',
    headers: {
      'Authorization': 'Bearer ' + token.access_token
    }
  });
}
