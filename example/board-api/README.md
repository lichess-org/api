# Lichess OAuth2 and Board API example application

This app demonstrates "Login with Lichess"
with persistent session storage,
and playing with the Board API.

1. Create a Lichess OAuth app at https://lichess.org/account/oauth/app
  - Homepage URL: http://localhost:8087
  - Callback URL: http://localhost:8087/callback
2. Edit index.js to set the oauth app client id and secret
3. Install dependencies with `yarn install`
4. Run the webserver with `yarn start`
5. Browse to https://localhost:8087
