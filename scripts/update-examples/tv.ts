import { example, prodClient, readNdJson, readTextStream } from "./config";

example("tv", "getCurrentTvGames", await prodClient().GET("/api/tv/channels"));

(async () => {
  const abortController = new AbortController();
  const signal = abortController.signal;
  await prodClient()
    .GET("/api/tv/feed", {
      parseAs: "stream",
      signal,
    })
    .then((response) =>
      readNdJson(response.response, (line: any) => {
        if (line.t === "featured") {
          example("tv", "streamCurrentTvGame-newGame", line, "json", true);
        } else if (line.t === "fen") {
          example("tv", "streamCurrentTvGame-move", line, "json", true);
          abortController.abort();
        }
      }),
    );
})();

(async () => {
  const pgnLines: string[] = [];
  await prodClient()
    .GET("/api/tv/{channel}", {
      params: {
        path: {
          channel: "bullet",
        },
      },
      headers: {
        Accept: "application/x-chess-pgn",
      },
      parseAs: "stream",
    })
    .then((response) => {
      readTextStream(response.response, (text: string) => {
        pgnLines.push(text);
        if (
          pgnLines.at(-1)?.startsWith("1.") &&
          pgnLines.filter((line) => line.startsWith("1.")).length === 3
        ) {
          example(
            "tv",
            "getBestOngoingGamesOfTvChannel",
            pgnLines.join("\n"),
            "pgn",
          );
        }
      });
    });
})();

(async () => {
  await prodClient()
    .GET("/api/tv/{channel}", {
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
    })
    .then((response) => {
      readNdJson(response.response, (line: any) => {
        example("tv", "getBestOngoingGamesOfTvChannel", line);
      });
    });
})();
