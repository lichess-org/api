# Lichess OAuth API with a personal token

You can make OAuth requests without going through the authorization code flow.

Instead, [generate a personal token](https://lichess.org/account/oauth/token)
that you can directly use in API requests.

Be careful, these tokens are like passwords so you should guard them carefully.
The advantage to using a token over putting your password into a script is that a token can be revoked,
and you can generate lots of them.

## Run this example

1. Create a personal token at https://lichess.org/account/oauth/token
2. Edit index.js with your token
3. Install dependencies with `yarn install`
4. Run with `node index.js`
