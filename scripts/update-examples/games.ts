import { example, prodClient, readNdJson } from "./config";

example(
  "games",
  "exportOneGame",
  await prodClient().GET("/game/export/{gameId}", {
    params: {
      path: {
        gameId: "q7ZvsdUF",
      },
      query: {
        clocks: false,
        accuracy: true,
        literate: true,
      },
    },
    headers: {
      Accept: "application/json",
    },
  }),
);

example(
  "games",
  "exportOneGame",
  await prodClient().GET("/game/export/{gameId}", {
    params: {
      path: {
        gameId: "q7ZvsdUF",
      },
      query: {
        clocks: false,
        accuracy: true,
        literate: true,
      },
    },
    headers: {
      Accept: "application/x-chess-pgn",
    },
    parseAs: "text",
  }),
  "pgn",
);

example(
  "games",
  "apiUserCurrentGameJson",
  await prodClient().GET("/api/user/{username}/current-game", {
    params: {
      path: {
        username: "lance5500",
      },
      query: {
        clocks: false,
        accuracy: true,
        division: true,
        literate: true,
      },
    },
    headers: {
      Accept: "application/json",
    },
  }),
);

await prodClient()
  .GET("/api/games/user/{username}", {
    params: {
      path: {
        username: "lance5500",
      },
      query: {
        max: 1,
        clocks: false,
        evals: true,
        accuracy: true,
        opening: true,
        division: true,
        literate: true,
      },
    },
    headers: {
      Accept: "application/x-ndjson",
    },
    parseAs: "stream",
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("games", "apiGamesUserJson", line);
    }),
  );

example(
  "games",
  "gamesExportIds",
  await prodClient().POST("/api/games/export/_ids", {
    body: "TJxUmbWK",
    params: {
      query: {
        clocks: false,
        evals: true,
        accuracy: true,
        opening: true,
        division: true,
        literate: true,
      },
    },
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/x-ndjson",
    },
    bodySerializer: (body) => body,
  }),
);
