import {
  example,
  firstNdJson,
  prodClient,
  readLines,
  readNdJson,
  streamTimeout,
} from "./config";

export default async function tv() {
  await example(
    "tv",
    "getCurrentTvGames",
    prodClient().GET("/api/tv/channels"),
  );

  // The feed never ends: a new game is announced, then each move follows.
  for await (const line of readNdJson(
    await prodClient().GET("/api/tv/feed", {
      parseAs: "stream",
      signal: streamTimeout(),
    }),
  )) {
    if (line.t === "featured") {
      await example("tv", "streamCurrentTvGame-newGame", line);
    } else if (line.t === "fen") {
      await example("tv", "streamCurrentTvGame-move", line);
      break;
    }
  }

  // Three games are enough for the example
  const pgnLines: string[] = [];
  let games = 0;
  for await (const line of readLines(
    await prodClient().GET("/api/tv/{channel}", {
      params: {
        path: {
          channel: "bullet",
        },
      },
      headers: {
        Accept: "application/x-chess-pgn",
      },
      parseAs: "stream",
    }),
  )) {
    pgnLines.push(line);
    if (line.startsWith("1.") && ++games === 3) {
      await example(
        "tv",
        "getBestOngoingGamesOfTvChannel",
        pgnLines.join("\n"),
        "pgn",
      );
      break;
    }
  }

  await example(
    "tv",
    "getBestOngoingGamesOfTvChannel",
    firstNdJson(
      await prodClient().GET("/api/tv/{channel}", {
        params: {
          path: {
            channel: "bullet",
          },
          query: {
            nb: 1,
            pgnInJson: true,
            clocks: true,
            opening: true,
          },
        },
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
      }),
    ),
  );
}
