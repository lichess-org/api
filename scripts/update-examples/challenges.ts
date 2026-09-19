import { example, localClient, ok, streamEvents } from "./config";

export default async function challenges() {
  const opponent = "mary";

  const newChallenge = ok(
    await localClient().POST("/api/challenge/{username}", {
      params: {
        path: {
          username: opponent,
        },
      },
    }),
  );

  await example(
    "challenges",
    "listYourChallenges",
    localClient(opponent).GET("/api/challenge"),
  );

  await example("challenges", "createChallenge", newChallenge);

  await example(
    "challenges",
    "showOneChallenge",
    localClient(opponent).GET("/api/challenge/{challengeId}/show", {
      params: {
        path: {
          challengeId: newChallenge.id,
        },
      },
    }),
  );

  await playAndResign();
  await abortAiGame();
  await declineChallenge();
  await cancelChallenge();

  await example(
    "challenges",
    "challengeAi",
    localClient().POST("/api/challenge/ai", {
      body: {
        level: 1,
      },
    }),
  );

  await example(
    "challenges",
    "openEndedChallenge",
    localClient().POST("/api/challenge/open"),
  );

  await startClocksAndAddTime();
  await adminChallengeTokens();
}

async function playAndResign() {
  const challenger = "jacob";
  const challengee = "aaron";

  const events = streamEvents(challenger, async (event) => {
    if (event.type === "gameStart") {
      await example("stream", "gameStart", event);
    } else if (event.type === "gameFinish") {
      await example("stream", "gameFinish", event);
      return true;
    }
  });

  const challengeToAccept = ok(
    await localClient(challenger).POST("/api/challenge/{username}", {
      params: {
        path: {
          username: challengee,
        },
      },
      body: {
        rated: true,
        color: "white",
        "clock.limit": 300,
        "clock.increment": 0,
      },
    }),
  );
  await example(
    "challenges",
    "acceptChallenge",
    localClient(challengee).POST("/api/challenge/{challengeId}/accept", {
      params: {
        path: {
          challengeId: challengeToAccept.id,
        },
      },
    }),
  );
  await Bun.sleep(1000);
  const moves = [
    {
      player: challenger,
      move: "e2e4",
    },
    {
      player: challengee,
      move: "e7e5",
    },
  ];
  for (const move of moves) {
    ok(
      await localClient(move.player).POST(
        "/api/board/game/{gameId}/move/{move}",
        {
          params: {
            path: {
              gameId: challengeToAccept.id,
              move: move.move,
            },
          },
        },
      ),
    );
  }
  ok(
    await localClient(challenger).POST("/api/board/game/{gameId}/resign", {
      params: {
        path: {
          gameId: challengeToAccept.id,
        },
      },
    }),
  );

  await events;
}

async function abortAiGame() {
  const challenger = "yulia";

  const events = streamEvents(challenger, async (event) => {
    if (event.type === "gameStart") {
      await example("stream", "gameStart-ai", event);
    } else if (event.type === "gameFinish") {
      await example("stream", "gameFinish-ai", event);
      return true;
    }
  });

  const challenge = ok(
    await localClient(challenger).POST("/api/challenge/ai", {
      body: {
        level: 1,
      },
    }),
  );
  ok(
    await localClient(challenger).POST("/api/board/game/{gameId}/abort", {
      params: {
        path: {
          gameId: challenge.id!,
        },
      },
    }),
  );

  await events;
}

async function declineChallenge() {
  const events = streamEvents("gabriela", async (event) => {
    if (event.type === "challenge") {
      await example("stream", "challenge", event);
    } else if (event.type === "challengeDeclined") {
      await example("stream", "challengeDeclined", event);
      return true;
    }
  });

  await Bun.sleep(1000);

  const challengeToDecline = ok(
    await localClient("adriana").POST("/api/challenge/{username}", {
      params: {
        path: {
          username: "gabriela",
        },
      },
    }),
  );
  await example(
    "challenges",
    "declineChallenge",
    localClient("gabriela").POST("/api/challenge/{challengeId}/decline", {
      params: {
        path: {
          challengeId: challengeToDecline.id,
        },
      },
    }),
  );

  await events;
}

async function cancelChallenge() {
  const challenger = "elena";
  const challengee = "diego";

  const events = streamEvents(challengee, async (event) => {
    if (event.type === "challengeCanceled") {
      await example("stream", "challengeCanceled", event);
      return true;
    }
  });

  await Bun.sleep(1000);

  const challengeToCancel = ok(
    await localClient(challenger).POST("/api/challenge/{username}", {
      params: {
        path: {
          username: challengee,
        },
      },
    }),
  );
  await example(
    "challenges",
    "cancelChallenge",
    localClient(challenger).POST("/api/challenge/{challengeId}/cancel", {
      params: {
        path: {
          challengeId: challengeToCancel.id,
        },
      },
    }),
  );

  await events;
}

async function startClocksAndAddTime() {
  const challenge = ok(
    await localClient("david").POST("/api/challenge/{username}", {
      params: {
        path: {
          username: "patricia",
        },
      },
      body: {
        rated: true,
        "clock.limit": 300,
        "clock.increment": 0,
      },
    }),
  );
  ok(
    await localClient("patricia").POST("/api/challenge/{challengeId}/accept", {
      params: {
        path: {
          challengeId: challenge.id,
        },
      },
    }),
  );

  await example(
    "challenges",
    "startClocks",
    localClient().POST("/api/challenge/{gameId}/start-clocks", {
      params: {
        path: {
          gameId: challenge.id,
        },
        query: {
          token1: "lip_david",
          token2: "lip_patricia",
        },
      },
    }),
  );

  await example(
    "challenges",
    "addTimeToOpponent",
    localClient("david").POST("/api/round/{gameId}/add-time/{seconds}", {
      params: {
        path: {
          gameId: challenge.id,
          seconds: 60,
        },
      },
    }),
  );
}

async function adminChallengeTokens() {
  const tokens = ok(
    await localClient("admin").POST("/api/token/admin-challenge", {
      body: {
        users: "bobby,mary,boris",
        description: "created by admin",
      },
    }),
  );
  const redacted: Record<string, string> = {};
  Object.keys(tokens).forEach((k) => {
    redacted[k] = `lip_${k}_secret`;
  });
  await example("challenges", "adminChallengeTokens", redacted);
}
