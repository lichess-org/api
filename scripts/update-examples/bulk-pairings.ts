import {
  example,
  firstNdJson,
  firstPgnGames,
  localClient,
  ok,
  streamTimeout,
} from "./config";

export default async function bulkPairings() {
  const white = "sai";
  const black = "nushi";

  const bulkPairing = ok(
    await localClient().POST("/api/bulk-pairing", {
      body: {
        // Players are paired by their API tokens
        players: `lip_${white}:lip_${black}`,
        "clock.limit": 300,
        "clock.increment": 0,
        // Without it, the response has `null` for the time when the clocks start
        startClocksAt: Date.now() + 60 * 60 * 1000,
      },
    }),
  );
  await example("bulkPairings", "createBulkPairing", bulkPairing);

  // The games are created a moment after the bulk pairing
  let pairedBulkPairing = bulkPairing;
  for (let i = 0; i < 50 && !pairedBulkPairing.pairedAt; i++) {
    await Bun.sleep(200);
    pairedBulkPairing = ok(
      await localClient().GET("/api/bulk-pairing/{id}", {
        params: {
          path: {
            id: bulkPairing.id,
          },
        },
      }),
    );
  }
  if (!pairedBulkPairing.pairedAt)
    throw new Error(`Bulk pairing ${bulkPairing.id} was never paired`);
  await example("bulkPairings", "getBulkPairing", pairedBulkPairing);

  await example(
    "bulkPairings",
    "exportGamesOfBulkPairing",
    firstNdJson(
      await localClient().GET("/api/bulk-pairing/{id}/games", {
        params: {
          path: {
            id: bulkPairing.id,
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
    "bulkPairings",
    "exportGamesOfBulkPairing",
    firstPgnGames(
      await localClient().GET("/api/bulk-pairing/{id}/games", {
        params: {
          path: {
            id: bulkPairing.id,
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
    "bulkPairings",
    "startClocksOfBulkPairing",
    localClient().POST("/api/bulk-pairing/{id}/start-clocks", {
      params: {
        path: {
          id: bulkPairing.id,
        },
      },
    }),
  );

  // Nobody is going to play these games
  for (const game of pairedBulkPairing.games) {
    ok(
      await localClient(game.white!).POST("/api/board/game/{gameId}/abort", {
        params: {
          path: {
            gameId: game.id!,
          },
        },
      }),
    );
  }

  await example(
    "bulkPairings",
    "cancelBulkPairing",
    localClient().DELETE("/api/bulk-pairing/{id}", {
      params: {
        path: {
          id: bulkPairing.id,
        },
      },
    }),
  );
}
