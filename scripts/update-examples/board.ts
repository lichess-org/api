import {
  example,
  followGame,
  localClient,
  makeMove,
  ok,
  startGame,
} from "./config";

const isGameFull = (event: any) => event.type === "gameFull";

export default async function board() {
  // Victory or a draw can only be claimed when the opponent has been gone for about a minute.
  // Wait for that in the background, while the other requests are made.
  const claims = Promise.all([claimVictory(), claimDraw()]);
  // If something else fails first, nobody awaits this anymore
  claims.catch(() => {});

  await playGame();
  await abortGame();

  await claims;
}

async function playGame() {
  const white = "kenneth";
  const black = "salma";

  const gameId = await startGame(white, black);
  const stream = followGame(white, gameId);

  await example(
    "board",
    "streamBoardGameState-gameFull",
    await stream.next(isGameFull),
  );

  await example("board", "makeBoardMove", makeMove(white, gameId, "e2e4"));
  await example(
    "board",
    "streamBoardGameState-gameState",
    await stream.next((e) => e.type === "gameState" && e.moves === "e2e4"),
  );
  ok(await makeMove(black, gameId, "e7e5"));

  await example(
    "board",
    "writeInChat",
    localClient(white).POST("/api/board/game/{gameId}/chat", {
      params: {
        path: {
          gameId,
        },
      },
      body: {
        room: "player",
        text: "Good luck!",
      },
    }),
  );
  await example(
    "board",
    "streamBoardGameState-chatLine",
    await stream.next((e) => e.type === "chatLine" && e.text === "Good luck!"),
  );

  // A chat message is saved a moment after it is posted
  await Bun.sleep(1000);
  await example(
    "board",
    "fetchPlayerChat",
    localClient(white).GET("/api/board/game/{gameId}/chat", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );

  await example(
    "board",
    "handleTakebackOffer",
    localClient(white).POST("/api/board/game/{gameId}/takeback/{accept}", {
      params: {
        path: {
          gameId,
          accept: "yes",
        },
      },
    }),
  );
  ok(
    await localClient(black).POST(
      "/api/board/game/{gameId}/takeback/{accept}",
      {
        params: {
          path: {
            gameId,
            accept: false,
          },
        },
      },
    ),
  );

  await example(
    "board",
    "handleDrawOffer",
    localClient(white).POST("/api/board/game/{gameId}/draw/{accept}", {
      params: {
        path: {
          gameId,
          accept: "yes",
        },
      },
    }),
  );
  ok(
    await localClient(black).POST("/api/board/game/{gameId}/draw/{accept}", {
      params: {
        path: {
          gameId,
          accept: false,
        },
      },
    }),
  );

  await example(
    "board",
    "resignGame",
    localClient(white).POST("/api/board/game/{gameId}/resign", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
  stream.close();
}

/** A game can only be aborted before both players have moved. */
async function abortGame() {
  const white = "kenneth";
  const gameId = await startGame(white, "salma");

  await example(
    "board",
    "abortGame",
    localClient(white).POST("/api/board/game/{gameId}/abort", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
}

/**
 * A game where black connects to the game stream, and disconnects when it is its turn to move.
 * Resolves once white is told that its opponent is gone, and then how long it has to wait.
 */
async function abandonedGame(white: string, black: string) {
  const gameId = await startGame(white, black);
  const whiteStream = followGame(white, gameId);
  const blackStream = followGame(black, gameId);
  await Promise.all([
    whiteStream.next(isGameFull),
    blackStream.next(isGameFull),
  ]);

  ok(await makeMove(white, gameId, "e2e4"));
  ok(await makeMove(black, gameId, "e7e5"));
  ok(await makeMove(white, gameId, "g1f3"));
  blackStream.close();

  const gone = await whiteStream.next((e) => e.type === "opponentGone", 60);
  return { gameId, gone, whiteStream };
}

async function claimVictory() {
  const white = "lola";
  const { gameId, gone, whiteStream } = await abandonedGame(white, "mei");

  await example("board", "streamBoardGameState-opponentGone", gone);

  await Bun.sleep((gone.claimWinInSeconds + 3) * 1000);
  await example(
    "board",
    "claimVictory",
    localClient(white).POST("/api/board/game/{gameId}/claim-victory", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
  whiteStream.close();
}

async function claimDraw() {
  const white = "qing";
  const { gameId, gone, whiteStream } = await abandonedGame(white, "svetlana");

  await Bun.sleep((gone.claimWinInSeconds + 3) * 1000);
  await example(
    "board",
    "claimDraw",
    localClient(white).POST("/api/board/game/{gameId}/claim-draw", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
  whiteStream.close();
}
