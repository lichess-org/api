import { example, localClient } from "./config";

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

(async () => {
  const challengeToAccept = await localClient("jacob").POST(
    "/api/challenge/{username}",
    {
      params: {
        path: {
          username: "aaron",
        },
      },
    },
  );
  example(
    "challenges",
    "acceptChallenge",
    await localClient("aaron").POST("/api/challenge/{challengeId}/accept", {
      params: {
        path: {
          challengeId: challengeToAccept.data!.id,
        },
      },
    }),
  );
})();

(async () => {
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

(async () => {
  const challengeToCancel = await localClient("diego").POST(
    "/api/challenge/{username}",
    {
      params: {
        path: {
          username: "elena",
        },
      },
    },
  );
  example(
    "challenges",
    "cancelChallenge",
    await localClient("elena").POST("/api/challenge/{challengeId}/cancel", {
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

(async () => {
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

example(
  "challenges",
  "adminChallengeTokens",
  await localClient("admin").POST("/api/token/admin-challenge", {
    body: {
      users: "bobby,mary,boris",
      description: "created by admin",
    },
  }),
);
