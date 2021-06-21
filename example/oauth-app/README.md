# Lichess OAuth app example

This is an example for a fully client side OAuth app that reads the user's
email address from the Lichess API.

The main logic is in `src/ctrl.ts`, using the
[@bity/oauth2-auth-code-pkce](https://www.npmjs.com/package/@bity/oauth2-auth-code-pkce)
library.

## Running

1. `npm install`
2. `npm run serve` or any other method to serve the client on http://localhost:8000
