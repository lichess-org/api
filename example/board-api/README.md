# Lichess OAuth2 and Board API example application

This app demonstrates "Login with Lichess"
with persistent session storage,
and playing with the Board API.

1. Create a Lichess OAuth app at https://lichess.org/account/oauth/app
   - Homepage URL: http://localhost:8076
   - Callback URL: http://localhost:8076/oauth-callback
2. Edit back/src/config.ts to set the oauth app client id and secret
3. Build the front-end:
   - `cd front`
   - `npm install`
   - `npm run dev` (`npm run dev --watch` to rebuild on save)
4. Build and start the back-end:
   - `cd ../back`
   - `npm install`
   - `npm run start`
5. Browse to http://localhost:8076. Log in with your lichess account.
6. Play a slow or untimed game vs. the computer on lichess.org. You should see them moves unfold in your app.
