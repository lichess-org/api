import { example, firstNdJson, prodClient } from "./config";

export default async function games() {
  await example(
    "games",
    "exportOneGame",
    prodClient().GET("/game/export/{gameId}", {
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

  await example(
    "games",
    "exportOneGame",
    prodClient().GET("/game/export/{gameId}", {
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

  await example(
    "games",
    "apiUserCurrentGameJson",
    prodClient().GET("/api/user/{username}/current-game", {
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

  await example(
    "games",
    "apiUserCurrentGamePgn",
    prodClient().GET("/api/user/{username}/current-game", {
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
        Accept: "application/x-chess-pgn",
      },
      parseAs: "text",
    }),
    "pgn",
  );

  await example(
    "games",
    "apiGamesUserJson",
    firstNdJson(
      await prodClient().GET("/api/games/user/{username}", {
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
      }),
    ),
  );

  await example(
    "games",
    "apiGamesUserPgn",
    prodClient().GET("/api/games/user/{username}", {
      params: {
        path: {
          username: "lance5500",
        },
        query: {
          max: 1,
        },
      },
      parseAs: "text",
    }),
    "pgn",
  );

  await example(
    "games",
    "gamesExportIds",
    prodClient().POST("/api/games/export/_ids", {
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

  await example(
    "games",
    "gamesExportIds",
    prodClient().POST("/api/games/export/_ids", {
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
        Accept: "application/x-chess-pgn",
      },
      parseAs: "text",
      bodySerializer: (body) => body,
    }),
    "pgn",
  );
}
