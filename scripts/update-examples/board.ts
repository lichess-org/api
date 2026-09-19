import {
  cleanUp,
  endGame,
  example,
  followGame,
  localClient,
  makeMove,
  ok,
  presetChat,
  readLines,
  startGame,
  streamTimeout,
  waitFor,
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
  await createSeeks();

  await claims;
}

async function playGame() {
  const white = "kenneth";
  const black = "salma";

  const gameId = await startGame(white, black);
  const stream = followGame(white, gameId);
  try {
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
          text: presetChat.goodLuck,
        },
      }),
    );
    await example(
      "board",
      "streamBoardGameState-chatLine",
      await stream.next(
        (e) => e.type === "chatLine" && e.text === presetChat.goodLuck,
      ),
    );

    // A chat message is saved a moment after it is posted
    await example(
      "board",
      "fetchPlayerChat",
      await waitFor(
        "the chat message to be saved",
        async () =>
          ok(
            await localClient(white).GET("/api/board/game/{gameId}/chat", {
              params: {
                path: {
                  gameId,
                },
              },
            }),
          ),
        (lines) => lines.some((line) => line.text === presetChat.goodLuck),
      ),
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
  } catch (error) {
    await cleanUp(() => endGame(white, gameId));
    throw error;
  } finally {
    stream.close();
  }
}

/**
 * A real-time seek is a stream that only sends empty lines until another player accepts it.
 * Closing the stream cancels the seek. A correspondence seek stays in the lobby instead, where
 * Lila keeps the 5 most recent seeks of a player and drops the older ones.
 */
async function createSeeks() {
  const player = "hui";

  const realTimeSeek = new AbortController();
  const stream = await localClient(player).POST("/api/board/seek", {
    body: {
      rated: false,
      time: 10,
      increment: 0,
    },
    parseAs: "stream",
    signal: AbortSignal.any([realTimeSeek.signal, streamTimeout()]),
  });
  try {
    for await (const line of readLines(stream)) {
      await example("board", "createRealTimeSeek", line);
      break;
    }
  } finally {
    realTimeSeek.abort();
  }

  await example(
    "board",
    "createCorrespondenceSeek",
    localClient(player).POST("/api/board/seek", {
      body: {
        rated: false,
        days: 3,
      },
    }),
  );
}

/** A game can only be aborted before both players have moved. */
async function abortGame() {
  const white = "kenneth";
  const gameId = await startGame(white, "salma");

  try {
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
  } catch (error) {
    await cleanUp(() => endGame(white, gameId));
    throw error;
  }
}

/**
 * A game where black connects to the game stream, and disconnects when it is its turn to move.
 * Resolves once white is told that its opponent is gone, and then how long it has to wait.
 */
async function abandonedGame(white: string, black: string) {
  const gameId = await startGame(white, black);
  const whiteStream = followGame(white, gameId);
  const blackStream = followGame(black, gameId);
  try {
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
  } catch (error) {
    whiteStream.close();
    blackStream.close();
    await cleanUp(() => endGame(white, gameId));
    throw error;
  }
}

async function claimVictory() {
  const white = "lola";
  const { gameId, gone, whiteStream } = await abandonedGame(white, "mei");

  try {
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
  } catch (error) {
    await cleanUp(() => endGame(white, gameId));
    throw error;
  } finally {
    whiteStream.close();
  }
}

async function claimDraw() {
  const white = "qing";
  const { gameId, gone, whiteStream } = await abandonedGame(white, "svetlana");

  try {
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
  } catch (error) {
    await cleanUp(() => endGame(white, gameId));
    throw error;
  } finally {
    whiteStream.close();
  }
}
