import {
  cleanUp,
  example,
  firstNdJson,
  firstPgnGames,
  localClient,
  ok,
  prodClient,
  streamTimeout,
} from "./config";

export default async function swiss() {
  // A finished tournament, so these examples don't change from one run to the next
  const finishedSwiss = "YxwjQGYu";

  await example(
    "swiss",
    "getSwiss",
    prodClient().GET("/api/swiss/{id}", {
      params: {
        path: {
          id: finishedSwiss,
        },
      },
    }),
  );

  await example(
    "swiss",
    "getResultsOfSwiss",
    firstNdJson(
      await prodClient().GET("/api/swiss/{id}/results", {
        params: {
          path: {
            id: finishedSwiss,
          },
          query: {
            nb: 1,
          },
        },
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  await example(
    "swiss",
    "exportGamesOfSwiss",
    firstNdJson(
      await prodClient().GET("/api/swiss/{id}/games", {
        params: {
          path: {
            id: finishedSwiss,
          },
          query: {
            clocks: false,
            opening: true,
            division: true,
          },
        },
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  await example(
    "swiss",
    "exportGamesOfSwiss",
    firstPgnGames(
      await prodClient().GET("/api/swiss/{id}/games", {
        params: {
          path: {
            id: finishedSwiss,
          },
        },
        headers: {
          Accept: "application/x-chess-pgn",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
    "pgn",
  );

  await example(
    "swiss",
    "exportTrfOfSwiss",
    prodClient().GET("/swiss/{id}.trf", {
      params: {
        path: {
          id: finishedSwiss,
        },
      },
      parseAs: "text",
    }),
    "txt",
  );

  await localSwiss();
}

/**
 * Create, update, join, leave and then terminate a Swiss, so that nothing is left behind.
 *
 * Each player can create tournaments with a daily allowance of 240 credits, of which an arena
 * costs 20 and a Swiss 5. The arenas script spends the allowance of bobby, so another team leader
 * creates the Swiss.
 */
async function localSwiss() {
  const team = "knights-to-meet-you";
  const leader = "benjamin";
  // Only members of the team can join
  const member = "jiang";

  const newSwiss = ok(
    await localClient(leader).POST("/api/swiss/new/{teamId}", {
      params: {
        path: {
          teamId: team,
        },
      },
      body: {
        name: "Weekly Swiss",
        "clock.limit": 300,
        "clock.increment": 0,
        nbRounds: 5,
      },
    }),
  );

  try {
    await example("swiss", "createSwiss", newSwiss);

    await example(
      "swiss",
      "updateSwiss",
      localClient(leader).POST("/api/swiss/{id}/edit", {
        params: {
          path: {
            id: newSwiss.id,
          },
        },
        body: {
          name: "Weekly Swiss 2",
          "clock.limit": 300,
          "clock.increment": 0,
          nbRounds: 5,
        },
      }),
    );

    await example(
      "swiss",
      "joinSwiss",
      localClient(member).POST("/api/swiss/{id}/join", {
        params: {
          path: {
            id: newSwiss.id,
          },
        },
      }),
    );

    await example(
      "swiss",
      "withdrawFromSwiss",
      localClient(member).POST("/api/swiss/{id}/withdraw", {
        params: {
          path: {
            id: newSwiss.id,
          },
        },
      }),
    );

    await example(
      "swiss",
      "terminateSwiss",
      localClient(leader).POST("/api/swiss/{id}/terminate", {
        params: {
          path: {
            id: newSwiss.id,
          },
        },
      }),
    );
  } catch (error) {
    await cleanUp(() =>
      localClient(leader).POST("/api/swiss/{id}/terminate", {
        params: {
          path: {
            id: newSwiss.id,
          },
        },
      }),
    );
    throw error;
  }
}
