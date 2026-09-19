import {
  cleanUp,
  endGame,
  example,
  firstNdJson,
  firstPgnGames,
  localClient,
  makeMove,
  ok,
  presetChat,
  prodClient,
  readNdJson,
  startGame,
  streamTimeout,
  waitFor,
} from "./config";

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

  await example(
    "games",
    "streamGameMoves",
    await firstNdJsonLines(
      await prodClient().GET("/api/stream/game/{id}", {
        params: {
          path: {
            id: "q7ZvsdUF",
          },
        },
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
      5,
    ),
  );

  await importGame();
  await streamLiveGames();
}

/** The first `count` lines of an NDJSON stream, after which the stream is closed. */
async function firstNdJsonLines(
  result: Parameters<typeof readNdJson>[0],
  count: number,
) {
  const lines: unknown[] = [];
  for await (const line of readNdJson(result)) {
    lines.push(line);
    if (lines.length === count) break;
  }
  return lines;
}

// The game is only imported once: importing the same PGN again gives the same game.
const importedPgn = `[Event "Casual game"]
[Site "https://lichess.org"]
[Date "1858.11.02"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0`;

async function importGame() {
  const imported = ok(
    await localClient().POST("/api/import", {
      body: {
        pgn: importedPgn,
      },
    }),
  );
  await example("games", "importGame", imported);

  await example(
    "games",
    "exportImportedGames",
    firstPgnGames(
      await localClient().GET("/api/games/export/imports", {
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
    "pgn",
  );
}

/** Bookmarking is a toggle, so the bookmark is removed again for the next run to add it back. */
async function exportBookmarkedGame(gameId: string) {
  const toggleBookmark = () =>
    localClient().POST("/bookmark/{gameId}", {
      params: {
        path: {
          gameId,
        },
      },
    });

  ok(await toggleBookmark());
  let bookmarked = true;
  try {
    await example(
      "games",
      "exportBookmarkedGames",
      firstNdJson(
        await localClient().GET("/api/games/export/bookmarks", {
          params: {
            query: {
              max: 1,
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
      "games",
      "exportBookmarkedGames",
      firstPgnGames(
        await localClient().GET("/api/games/export/bookmarks", {
          params: {
            query: {
              max: 1,
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

    ok(await toggleBookmark());
    bookmarked = false;
  } finally {
    if (bookmarked) await cleanUp(toggleBookmark);
  }
}

/** Streams of games that are being played, which are all ended in the end. */
async function streamLiveGames() {
  const first = { white: "fatima", black: "iryna" };
  const second = { white: "dae", black: "suresh" };
  const firstGame = await startGame(first.white, first.black);
  const secondGame = await startGame(second.white, second.black);
  const stream = new AbortController();
  try {
    await example(
      "games",
      "streamGamesOfUsers",
      await firstNdJsonLines(
        await localClient().POST("/api/stream/games-by-users", {
          params: {
            query: {
              withCurrentGames: true,
            },
          },
          body: `${first.white},${first.black}`,
          headers: {
            "Content-Type": "text/plain",
            Accept: "application/x-ndjson",
          },
          bodySerializer: (body) => body,
          parseAs: "stream",
          signal: streamTimeout(),
        }),
        1,
      ),
    );

    // The stream stays open while more games are added to it
    const streamId = `example-${Date.now()}`;
    const streamedGames: any[] = [];
    const streaming = (async () => {
      const result = await localClient().POST("/api/stream/games/{streamId}", {
        params: {
          path: {
            streamId,
          },
        },
        body: firstGame,
        headers: {
          "Content-Type": "text/plain",
          Accept: "application/x-ndjson",
        },
        bodySerializer: (body) => body,
        parseAs: "stream",
        signal: AbortSignal.any([stream.signal, streamTimeout()]),
      });
      for await (const game of readNdJson(result)) streamedGames.push(game);
    })();
    streaming.catch(() => {});

    const waitForGame = async (id: string) => {
      for (let i = 0; i < 100; i++) {
        const game = streamedGames.find((g) => g.id === id);
        if (game) return game;
        await Bun.sleep(100);
      }
      throw new Error(`Game ${id} never arrived on the stream ${streamId}`);
    };

    const streamedFirstGame = await waitForGame(firstGame);

    await example(
      "games",
      "addGameIdsToStream",
      localClient().POST("/api/stream/games/{streamId}/add", {
        params: {
          path: {
            streamId,
          },
        },
        body: secondGame,
        headers: {
          "Content-Type": "text/plain",
        },
        bodySerializer: (body) => body,
      }),
    );
    const streamedSecondGame = await waitForGame(secondGame);
    stream.abort();
    await example("games", "streamGamesOfIds", [
      streamedFirstGame,
      streamedSecondGame,
    ]);

    // The first game is played a little, so that it can be exported like any other game
    ok(await makeMove(first.white, firstGame, "e2e4"));
    ok(await makeMove(first.black, firstGame, "e7e5"));

    // The players can write in the chat that spectators see. A message is saved a moment later.
    for (const [player, text] of [
      [first.white, presetChat.goodLuck],
      [first.black, presetChat.haveFun],
    ] as const) {
      ok(
        await localClient(player).POST("/api/board/game/{gameId}/chat", {
          params: {
            path: {
              gameId: firstGame,
            },
          },
          body: {
            room: "spectator",
            text,
          },
        }),
      );
    }
    await example(
      "games",
      "fetchSpectatorChat",
      await waitFor(
        "the chat messages to be saved",
        // Before the first message is saved there is no chat, which is a 404
        async () =>
          ok(
            await localClient("anon").GET("/api/game/{gameId}/chat", {
              params: {
                path: {
                  gameId: firstGame,
                },
              },
            }),
          ),
        (chat: any) =>
          [presetChat.goodLuck, presetChat.haveFun].every((text) =>
            chat.lines.some((line: any) => line.text === text),
          ),
      ),
    );

    ok(
      await localClient(first.white).POST("/api/board/game/{gameId}/resign", {
        params: {
          path: {
            gameId: firstGame,
          },
        },
      }),
    );
    await exportBookmarkedGame(firstGame);

    ok(
      await localClient(second.white).POST("/api/board/game/{gameId}/abort", {
        params: {
          path: {
            gameId: secondGame,
          },
        },
      }),
    );
  } catch (error) {
    await cleanUp(
      () => endGame(first.white, firstGame),
      () => endGame(second.white, secondGame),
    );
    throw error;
  } finally {
    stream.abort();
  }
}
