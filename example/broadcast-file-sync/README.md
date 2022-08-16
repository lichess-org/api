# Lichess Broadcast file sync

This simple script will synchronise a local PGN file
with a Lichess broadcast round ([example](https://lichess.org/broadcast/chinese-championship-women/round-1/50tLRtMd)).

See also:

- [How to use Lichess Broadcasts](https://lichess.org/page/broadcasts)
- [API documentation](https://lichess.org/api#tag/Broadcasts)

## Run this example

1. Install dependencies with `npm install`
2. Copy `.env.default` to `.env`
3. Create a [personal token](https://lichess.org/account/oauth/token/create?scopes[]=study:write&description=broadcast)
4. Set the token in `.env`
5. [Create a Lichess broadcast](https://lichess.org/broadcast/new)
6. Create a round in the Lichess broadcast
7. Write down the round ID, which is at the end of the URL.
   For instance, the ID of `https://lichess.org/broadcast/test/round-1/vzxfVdyVH` is `vzxfVdyVH`
8. Run with `node index.js ROUND_ID example.pgn`
   Where `ROUND_ID` is your Lichess broadcast round ID, and `example.pgn` is the local file containing the games.
