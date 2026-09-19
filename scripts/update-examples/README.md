## Update endpoint example responses

These scripts make API calls to the Lichess endpoints and save the responses to `doc/specs/examples`.

```bash
bun install
```

Run all of the scripts:

```bash
bun index.ts
```

Or only some of them, by name:

```bash
bun index.ts account tv
```

Each script is a file in this directory: `account`, `analysis`, `arenas`, `board`, `bot`, `broadcasts`, `bulk-pairings`, `challenges`, `external-engine`, `fide`, `games`, `messaging`, `oauth`, `opening-explorer`, `puzzles`, `relations`, `simuls`, `studies`, `swiss`, `tablebase`, `teams`, `tv`, `users`.

`board` and `bot` take about a minute: a victory or a draw can only be claimed once the opponent has been gone for that long.

A script that fails doesn't stop the others. The failures are listed at the end and the exit code is 1.

### Requirements

- Most scripts use a local lila at `http://localhost:8080` (lila-docker) as well as lichess.org.
- `external-engine` also needs the external engine running at `http://localhost:9666`.
- `teams` and `swiss` use the teams that [lila-db-seed](https://github.com/lichess-org/lila-db-seed#fixed-teams) always creates the same way (`open-chess-club` and `private-chess-club`, led by `bobby` and `mary`). Re-seed the database if they are missing or different, for instance with `./lila-docker db` in lila-docker.
- `opening-explorer` needs a lichess.org API token, which needs no scopes. Set `LICHESS_API_TOKEN`; Bun loads it from a `.env` file.

### Afterwards

Format the generated examples:

```bash
cd ../../doc && pnpm format
```

`bun run typecheck` checks the requests against the API types in `../../types` (run `pnpm gen` there after changing the spec), which catches an endpoint that has been renamed or removed.
