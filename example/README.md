# Lichess OAuth examples

There are multiple ways to connect to the [Lichess API](https://lichess.org/api), depending on your needs.

Which authentication is right for you?

## Personal token

This is the simplest way, but it requires [manually creating a token](https://lichess.org/account/oauth/token).

It's the preferred way if you're only writing a client for yourself,
or if the users of your client are few, and tech-savvy.

Examples:

- A [Lichess bot](https://github.com/lichess-bot-devs/lichess-bot)
- A script that manages [Swiss](https://lichess.org/api#tag/Swiss-tournaments) or [Arena](https://lichess.org/api#tag/Arena-tournaments) tournaments or [broadcasts](https://lichess.org/api#tag/Broadcasts)
- A zulip/discord/slack bot

**Never use this for an app that will be used by multiple users.**
**Never share your personal token.**

Relevant code example: [oauth-personal-token](https://github.com/lichess-org/api/tree/master/example/oauth-personal-token)

## Login with Lichess, with a web server backend

Authenticate your users with a simple "Login with Lichess" button, **if you have a webserver**.
This allows you to make requests to Lichess on behalf of your app users.
It is safe, and scales very well with many users.

Examples:

- A web app that manages [Swiss](https://lichess.org/api#tag/Swiss-tournaments) or [Arena](https://lichess.org/api#tag/Arena-tournaments) tournaments on behalf of a user
- A [board API](https://lichess.org/api#tag/Board) client with a centralized server
- a web app that analyses [puzzle activity](https://lichess.org/api#operation/apiPuzzleActivity) or [games played](https://lichess.org/api#operation/apiGamesUser) on server-side

Relevant code example: [oauth-backend](https://github.com/lichess-org/api/tree/master/example/oauth-backend)

## Login with Lichess, without a web server backend

Authenticate your users with a simple "Login with Lichess" button, **if you don't have a webserver**.
Perfectly suited to **mobile apps**, **CLI apps**, **client-side JS apps**.

This allows you to make requests to Lichess on behalf of your app users.
It is safe, and scales very well with many users.

Examples:

- [Lichess API demo app](https://lichess-org.github.io/api-demo/)
- A client-side app that manages [Swiss](https://lichess.org/api#tag/Swiss-tournaments) or [Arena](https://lichess.org/api#tag/Arena-tournaments) tournaments on behalf of a user
- An e-board app to play using the [board API](https://lichess.org/api#tag/Board)
- A JS app that analyses [puzzle activity](https://lichess.org/api#operation/apiPuzzleActivity) or [games played](https://lichess.org/api#operation/apiGamesUser) on client-side

Relevant code example: [oauth-app](https://github.com/lichess-org/api/tree/master/example/oauth-app)

## No authentication

Many endpoints of the [Lichess API](https://lichess.org/api) don't require any authentication.
