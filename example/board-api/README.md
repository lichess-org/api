# Lichess OAuth2 and Board API example application

This app demonstrates "Login with Lichess"
with persistent session storage,
and playing with the Board API.

1. Create a Lichess OAuth app at https://lichess.org/account/oauth/app
  - Homepage URL: http://localhost:8076
  - Callback URL: http://localhost:8076/oauth-callback
2. Edit back/src/config.ts to set the oauth app client id and secret
3. Build the app front-end:
  - `cd front`
  - `yarn install`
  - `yarn dev`
4. Build the app back-end:
  - `cd ../back`
  - `yarn install`
5. Run the webserver with `yarn start`
6. Browse to http://localhost:8076
