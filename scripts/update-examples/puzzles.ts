import { example, localClient, prodClient } from "./config";

example(
  "puzzles",
  "getDailyPuzzle",
  await prodClient().GET("/api/puzzle/daily"),
);

example(
  "puzzles",
  "getPuzzleById",
  await prodClient().GET("/api/puzzle/{id}", {
    params: {
      path: {
        id: "PSjmf",
      },
    },
  }),
);

example(
  "puzzles",
  "getNewPuzzle",
  await prodClient().GET("/api/puzzle/next", {
    params: {
      query: {
        angle: "attraction",
        difficulty: "harder",
      },
    },
  }),
);

const puzzleBatch = await localClient().GET("/api/puzzle/batch/{angle}", {
  params: {
    path: {
      angle: "mix",
    },
    query: {
      nb: 2,
    },
  },
});

example("puzzles", "getMultiplePuzzlesAtOnce", puzzleBatch);

example(
  "puzzles",
  "solveMultiplePuzzlesAtOnce",
  await localClient().POST("/api/puzzle/batch/{angle}", {
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
          id: puzzleBatch.data?.puzzles![0].puzzle.id,
          win: true,
          rated: true,
        },
      ],
    },
  }),
);

example(
  "puzzles",
  "getYourPuzzleActivity",
  await localClient().GET("/api/puzzle/activity", {
    params: {
      query: {
        max: 1,
      },
    },
  }),
);

example(
  "puzzles",
  "getPuzzlesToReplay",
  await localClient().GET("/api/puzzle/replay/{days}/{theme}", {
    params: {
      path: {
        days: 90,
        theme: "mix",
      },
    },
  }),
);

example(
  "puzzles",
  "getYourPuzzleDashboard",
  await localClient().GET("/api/puzzle/dashboard/{days}", {
    params: {
      path: {
        days: 30,
      },
    },
  }),
);

example(
  "puzzles",
  "getStormDashboardOfPlayer",
  await prodClient().GET("/api/storm/dashboard/{username}", {
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

example(
  "puzzles",
  "createAndJoinPuzzleRace",
  await localClient().POST("/api/racer"),
);

example(
  "puzzles",
  "getRaceResults",
  await prodClient().GET("/api/racer/{id}", {
    params: {
      path: {
        id: "nkEw7",
      },
    },
  }),
);
