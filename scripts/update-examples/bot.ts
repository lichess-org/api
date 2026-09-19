import {
  example,
  firstNdJson,
  followGame,
  localClient,
  makeMove,
  ok,
  prodClient,
  startGame,
  streamTimeout,
} from "./config";

const isGameFull = (event: any) => event.type === "gameFull";

export default async function bot() {
  await example(
    "bot",
    "getOnlineBots",
    firstNdJson(
      await prodClient().GET("/api/bot/online", {
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  // Victory or a draw can only be claimed when the opponent has been gone for about a minute.
  // Wait for that in the background, while the other requests are made.
  const claims = Promise.all([claimVictory(), claimDraw()]);
  // If something else fails first, nobody awaits this anymore
  claims.catch(() => {});

  await playGame();
  await abortGame();

  await claims;
}

// A bot can only be challenged by a human, who plays through the Board API.
async function playGame() {
  const human = "akeem";
  const bot = "bot0";

  const gameId = await startGame(human, bot);
  const stream = followGame(bot, gameId, "bot");

  await example(
    "bot",
    "streamBotGameState-gameFull",
    await stream.next(isGameFull),
  );

  ok(await makeMove(human, gameId, "e2e4"));
  await example(
    "bot",
    "streamBotGameState-gameState",
    await stream.next((e) => e.type === "gameState" && e.moves === "e2e4"),
  );

  await example("bot", "makeMove", makeMove(bot, gameId, "e7e5", "bot"));

  await example(
    "bot",
    "writeInChat",
    localClient(bot).POST("/api/bot/game/{gameId}/chat", {
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
    "bot",
    "streamBotGameState-chatLine",
    await stream.next((e) => e.type === "chatLine" && e.text === "Good luck!"),
  );

  // A chat message is saved a moment after it is posted
  await Bun.sleep(1000);
  await example(
    "bot",
    "fetchGameChat",
    localClient(bot).GET("/api/bot/game/{gameId}/chat", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );

  await example(
    "bot",
    "handleTakebackOffer",
    localClient(bot).POST("/api/bot/game/{gameId}/takeback/{accept}", {
      params: {
        path: {
          gameId,
          accept: "yes",
        },
      },
    }),
  );
  ok(
    await localClient(human).POST(
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
    "bot",
    "handleDrawOffer",
    localClient(bot).POST("/api/bot/game/{gameId}/draw/{accept}", {
      params: {
        path: {
          gameId,
          accept: "yes",
        },
      },
    }),
  );
  ok(
    await localClient(human).POST("/api/board/game/{gameId}/draw/{accept}", {
      params: {
        path: {
          gameId,
          accept: false,
        },
      },
    }),
  );

  await example(
    "bot",
    "resignGame",
    localClient(bot).POST("/api/bot/game/{gameId}/resign", {
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
  const bot = "bot0";
  const gameId = await startGame("akeem", bot);

  await example(
    "bot",
    "abortGame",
    localClient(bot).POST("/api/bot/game/{gameId}/abort", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
}

/**
 * A game where the human connects to the game stream, and disconnects when it is its turn to move.
 * Resolves once the bot is told that its opponent is gone, and then how long it has to wait.
 */
async function abandonedGame(human: string, bot: string) {
  const gameId = await startGame(human, bot);
  const humanStream = followGame(human, gameId);
  const botStream = followGame(bot, gameId, "bot");
  await Promise.all([humanStream.next(isGameFull), botStream.next(isGameFull)]);

  ok(await makeMove(human, gameId, "e2e4"));
  ok(await makeMove(bot, gameId, "e7e5", "bot"));
  humanStream.close();

  const gone = await botStream.next((e) => e.type === "opponentGone", 60);
  return { gameId, gone, botStream };
}

async function claimVictory() {
  const bot = "bot1";
  const { gameId, gone, botStream } = await abandonedGame("idris", bot);

  await example("bot", "streamBotGameState-opponentGone", gone);

  await Bun.sleep((gone.claimWinInSeconds + 3) * 1000);
  await example(
    "bot",
    "claimVictory",
    localClient(bot).POST("/api/bot/game/{gameId}/claim-victory", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
  botStream.close();
}

async function claimDraw() {
  const bot = "bot2";
  const { gameId, gone, botStream } = await abandonedGame("ikem", bot);

  await Bun.sleep((gone.claimWinInSeconds + 3) * 1000);
  await example(
    "bot",
    "claimDraw",
    localClient(bot).POST("/api/bot/game/{gameId}/claim-draw", {
      params: {
        path: {
          gameId,
        },
      },
    }),
  );
  botStream.close();
}
