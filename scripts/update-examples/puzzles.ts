import { example, localClient, ok, prodClient } from "./config";

export default async function puzzles() {
  await example(
    "puzzles",
    "getDailyPuzzle",
    prodClient().GET("/api/puzzle/daily"),
  );

  await example(
    "puzzles",
    "getPuzzleById",
    prodClient().GET("/api/puzzle/{id}", {
      params: {
        path: {
          id: "PSjmf",
        },
      },
    }),
  );

  await example(
    "puzzles",
    "getNewPuzzle",
    prodClient().GET("/api/puzzle/next", {
      params: {
        query: {
          angle: "attraction",
          difficulty: "harder",
        },
      },
    }),
  );

  const puzzleBatch = ok(
    await localClient().GET("/api/puzzle/batch/{angle}", {
      params: {
        path: {
          angle: "mix",
        },
        query: {
          nb: 2,
        },
      },
    }),
  );

  await example("puzzles", "getMultiplePuzzlesAtOnce", puzzleBatch);

  await example(
    "puzzles",
    "solveMultiplePuzzlesAtOnce",
    localClient().POST("/api/puzzle/batch/{angle}", {
      params: {
        path: {
          angle: "mix",
        },
        query: {
          nb: 2,
        },
      },
      body: {
        solutions: [
          {
            id: puzzleBatch.puzzles![0]!.puzzle.id,
            win: true,
            rated: true,
          },
        ],
      },
    }),
  );

  await example(
    "puzzles",
    "getYourPuzzleActivity",
    localClient().GET("/api/puzzle/activity", {
      params: {
        query: {
          max: 1,
        },
      },
    }),
  );

  await example(
    "puzzles",
    "getPuzzlesToReplay",
    localClient().GET("/api/puzzle/replay/{days}/{theme}", {
      params: {
        path: {
          days: 90,
          theme: "mix",
        },
      },
    }),
  );

  await example(
    "puzzles",
    "getYourPuzzleDashboard",
    localClient().GET("/api/puzzle/dashboard/{days}", {
      params: {
        path: {
          days: 30,
        },
      },
    }),
  );

  await example(
    "puzzles",
    "getStormDashboardOfPlayer",
    prodClient().GET("/api/storm/dashboard/{username}", {
      params: {
        path: {
          username: "thibault",
        },
        query: {
          days: 3,
        },
      },
    }),
  );

  await example(
    "puzzles",
    "createAndJoinPuzzleRace",
    localClient().POST("/api/racer"),
  );

  await example(
    "puzzles",
    "getRaceResults",
    prodClient().GET("/api/racer/{id}", {
      params: {
        path: {
          id: "nkEw7",
        },
      },
    }),
  );
}
