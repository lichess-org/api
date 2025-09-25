import { example, localClient, readNdJson, sleep } from "./config";

const opponent = "mary";

const newChallenge = await localClient().POST("/api/challenge/{username}", {
  params: {
    path: {
      username: opponent,
    },
  },
});

example(
  "challenges",
  "listYourChallenges",
  await localClient(opponent).GET("/api/challenge"),
);

example("challenges", "createChallenge", newChallenge);

example(
  "challenges",
  "showOneChallenge",
  await localClient(opponent).GET("/api/challenge/{challengeId}/show", {
    params: {
      path: {
        challengeId: newChallenge.data!.id,
      },
    },
  }),
);

await (async () => {
  const challenger = "jacob";
  const challengee = "aaron";

  const abortController = new AbortController();
  const signal = abortController.signal;
  localClient(challenger)
    .GET("/api/stream/event", {
      headers: {
        Accept: "application/x-ndjson",
      },
      signal,
      parseAs: "stream",
    })
    .then((response) => {
      readNdJson(response.response, (line: any) => {
        if (line.type === "gameStart") {
          example("stream", "gameStart", line, "json", true);
        } else if (line.type === "gameFinish") {
          example("stream", "gameFinish", line, "json", true);
          abortController.abort();
        }
      });
    });

  const challengeToAccept = await localClient(challenger).POST(
    "/api/challenge/{username}",
    {
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
    },
  );
  example(
    "challenges",
    "acceptChallenge",
    await localClient(challengee).POST("/api/challenge/{challengeId}/accept", {
      params: {
        path: {
          challengeId: challengeToAccept.data!.id,
        },
      },
    }),
  );
  await sleep(1000);
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
    await localClient(move.player).POST(
      "/api/board/game/{gameId}/move/{move}",
      {
        params: {
          path: {
            gameId: challengeToAccept.data!.id,
            move: move.move,
          },
        },
      },
    );
  }
  await localClient(challenger).POST("/api/board/game/{gameId}/resign", {
    params: {
      path: {
        gameId: challengeToAccept.data!.id,
      },
    },
  });
})();

await (async () => {
  const challenger = "yulia";

  const abortController = new AbortController();
  const signal = abortController.signal;
  localClient(challenger)
    .GET("/api/stream/event", {
      headers: {
        Accept: "application/x-ndjson",
      },
      signal,
      parseAs: "stream",
    })
    .then((response) => {
      readNdJson(response.response, (line: any) => {
        if (line.type === "gameStart") {
          example("stream", "gameStart-ai", line, "json", true);
        } else if (line.type === "gameFinish") {
          example("stream", "gameFinish-ai", line, "json", true);
          abortController.abort();
        }
      });
    });

  const challenge = await localClient(challenger).POST("/api/challenge/ai", {
    body: {
      level: 1,
    },
  });
  await localClient(challenger).POST("/api/board/game/{gameId}/abort", {
    params: {
      path: {
        gameId: challenge.data!.id!,
      },
    },
  });
})();

await (async () => {
  const abortController = new AbortController();
  const signal = abortController.signal;
  localClient("gabriela")
    .GET("/api/stream/event", {
      headers: {
        Accept: "application/x-ndjson",
      },
      signal,
      parseAs: "stream",
    })
    .then((response) => {
      readNdJson(response.response, (line: any) => {
        if (line.type === "challenge") {
          example("stream", "challenge", line, "json", true);
        } else if (line.type === "challengeDeclined") {
          example("stream", "challengeDeclined", line, "json", true);
          abortController.abort();
        }
      });
    });

  await sleep(1000);

  const challengeToDecline = await localClient("adriana").POST(
    "/api/challenge/{username}",
    {
      params: {
        path: {
          username: "gabriela",
        },
      },
    },
  );
  example(
    "challenges",
    "declineChallenge",
    await localClient("gabriela").POST("/api/challenge/{challengeId}/decline", {
      params: {
        path: {
          challengeId: challengeToDecline.data!.id,
        },
      },
    }),
  );
})();

await (async () => {
  const challenger = "elena";
  const challengee = "diego";

  const abortController = new AbortController();
  const signal = abortController.signal;
  localClient(challengee)
    .GET("/api/stream/event", {
      headers: {
        Accept: "application/x-ndjson",
      },
      signal,
      parseAs: "stream",
    })
    .then((response) => {
      readNdJson(response.response, (line: any) => {
        if (line.type === "challengeCanceled") {
          example("stream", "challengeCanceled", line, "json", true);
          abortController.abort();
        }
      });
    });

  await sleep(1000);
  const challengeToCancel = await localClient(challenger).POST(
    "/api/challenge/{username}",
    {
      params: {
        path: {
          username: challengee,
        },
      },
    },
  );
  example(
    "challenges",
    "cancelChallenge",
    await localClient(challenger).POST("/api/challenge/{challengeId}/cancel", {
      params: {
        path: {
          challengeId: challengeToCancel.data!.id,
        },
      },
    }),
  );
})();

example(
  "challenges",
  "challengeAi",
  await localClient().POST("/api/challenge/ai", {
    body: {
      level: 1,
    },
  }),
);

example(
  "challenges",
  "openEndedChallenge",
  await localClient().POST("/api/challenge/open"),
);

await (async () => {
  const challenge = await localClient("david").POST(
    "/api/challenge/{username}",
    {
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
    },
  );
  await localClient("patricia").POST("/api/challenge/{challengeId}/accept", {
    params: {
      path: {
        challengeId: challenge.data!.id,
      },
    },
  });

  example(
    "challenges",
    "startClocks",
    await localClient().POST("/api/challenge/{gameId}/start-clocks", {
      params: {
        path: {
          gameId: challenge.data!.id,
        },
        query: {
          token1: "lip_david",
          token2: "lip_patricia",
        },
      },
    }),
  );

  example(
    "challenges",
    "addTimeToOpponent",
    await localClient("david").POST("/api/round/{gameId}/add-time/{seconds}", {
      params: {
        path: {
          gameId: challenge.data!.id,
          seconds: 60,
        },
      },
    }),
  );
})();

await (async () => {
  const tokens = await localClient("admin").POST("/api/token/admin-challenge", {
      body: {
        users: "bobby,mary,boris",
        description: "created by admin",
      },
    });
  const redacted: Record<string, string> = {};
  Object.keys(tokens.data!).forEach((k) => {
    redacted[k] = `lip_${k}_secret`;
  });
  example("challenges", "adminChallengeTokens", redacted)
})();
