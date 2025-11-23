import { example, localClient, prodClient, readTextStream } from "./config";

const newOfficialTournament = await localClient("admin").POST(
  "/broadcast/new",
  {
    body: {
      name: "Knight Invitational",
      tier: 5,
    },
  },
);
console.log(`Created tournament ${newOfficialTournament.data!.tour.url}`);

const nowMs = Date.now();

for (let i = 1; i <= 3; i++) {
  const round = await localClient("admin").POST(
    `/broadcast/{broadcastTournamentId}/new`,
    {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.data!.tour.id,
        },
      },
      body: {
        name: `Round ${i}`,
        startsAt: nowMs + i * 1000 * 60 * 60,
      },
    },
  );
  console.log(`Created round ${round.data!.round.url}`);
}

const finalRound = await localClient("admin").POST(
  "/broadcast/{broadcastTournamentId}/new",
  {
    params: {
      path: {
        broadcastTournamentId: newOfficialTournament.data!.tour.id,
      },
    },
    body: {
      name: "Final Round",
    },
  },
);

const pushPgn = await localClient("admin").POST(
  "/api/broadcast/round/{broadcastRoundId}/push",
  {
    headers: {
      "Content-Type": "text/plain",
    },
    params: {
      path: {
        broadcastRoundId: finalRound.data!.round.id,
      },
    },
    body: `
[Event "Knight Invitational"]
[White "Player 1"]
[WhiteFideId "123"]
[Black "Player 2"]
[BlackFideId "456"]
[Result "*"]

1. e4 e5


[Event "Knight Invitational"]
[White "Player 3"]
[Black "Player 4"]
[Result "*"]

1. d4 d5
`,
    bodySerializer: (body) => body,
  },
);

example(
  "broadcasts",
  "getOfficialBroadcasts",
  await localClient().GET("/api/broadcast", {
    params: {
      query: {
        nb: 1,
      },
    },
  }),
);

example(
  "broadcasts",
  "getPaginatedToBroadcastPreviews",
  await localClient().GET("/api/broadcast/top"),
);

await localClient().POST("/broadcast/new", {
  body: {
    name: "Bobby's Tournament",
    "info.format": "5-round Swiss",
    "info.location": "Chess Club",
  },
});

example(
  "broadcasts",
  "getBroadcastsCreatedByUser",
  await localClient().GET("/api/broadcast/by/{username}", {
    params: {
      path: {
        username: "bobby",
      },
    },
  }),
);

example(
  "broadcasts",
  "searchBroadcasts",
  await localClient().GET("/api/broadcast/search", {
    params: {
      query: {
        q: "Knight",
      },
    },
  }),
);

example("broadcasts", "createBroadcastTournament", newOfficialTournament.data);

example(
  "broadcasts",
  "getBroadcastTournament",
  await localClient().GET("/api/broadcast/{broadcastTournamentId}", {
    params: {
      path: {
        broadcastTournamentId: newOfficialTournament.data!.tour.id,
      },
    },
  }),
);

example(
  "broadcasts",
  "getPlayersOfBroadcastTournament",
  await localClient().GET("/broadcast/{broadcastTournamentId}/players", {
    params: {
      path: {
        broadcastTournamentId: newOfficialTournament.data!.tour.id,
      },
    },
  }),
);

example(
  "broadcasts",
  "getPlayer",
  await localClient("anon").GET(
    "/broadcast/{broadcastTournamentId}/players/{playerId}",
    {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.data!.tour.id,
          playerId: "123",
        },
      },
    },
  ),
);

example(
  "broadcasts",
  "updateBroadcastTournament",
  await localClient("admin").POST("/broadcast/{broadcastTournamentId}/edit", {
    params: {
      path: {
        broadcastTournamentId: newOfficialTournament.data!.tour.id,
      },
    },
    body: {
      name: "Knight Invitational 2",
    },
  }),
);

example("broadcasts", "createBroadcastRound", finalRound);

example(
  "broadcasts",
  "getBroadcastRound",
  await localClient().GET(
    "/api/broadcast/{broadcastTournamentSlug}/{broadcastRoundSlug}/{broadcastRoundId}",
    {
      params: {
        path: {
          broadcastTournamentSlug: "-",
          broadcastRoundSlug: "-",
          broadcastRoundId: finalRound.data!.round.id,
        },
      },
    },
  ),
  "json",
);

example(
  "broadcasts",
  "getBroadcastRoundWithCustomScoring",
  await prodClient().GET(
    "/api/broadcast/{broadcastTournamentSlug}/{broadcastRoundSlug}/{broadcastRoundId}",
    {
      params: {
        path: {
          broadcastTournamentSlug: "-",
          broadcastRoundSlug: "-",
          broadcastRoundId: "ZpRw34eP",
        },
      },
    },
  ),
  "json",
);

example(
  "broadcasts",
  "updateBroadcastRound",
  await localClient("admin").POST("/broadcast/round/{broadcastRoundId}/edit", {
    params: {
      path: {
        broadcastRoundId: finalRound.data!.round.id,
      },
    },
    body: {
      name: "Final Round 2",
    },
  }),
);

example("broadcasts", "pushPgnToBroadcastRound", pushPgn);

const abortController = new AbortController();
const signal = abortController.signal;
let pgnLines: string[] = [];
setTimeout(() => abortController.abort(), 1000 * 2);
await localClient()
  .GET("/api/stream/broadcast/round/{broadcastRoundId}.pgn", {
    params: {
      path: {
        broadcastRoundId: finalRound.data!.round.id,
      },
    },
    signal,
    parseAs: "stream",
  })
  .then((response) => {
    readTextStream(response.response, (text: string) => {
      pgnLines.push(text);
      if (pgnLines.filter((line) => line === "").length === 6) {
        const pgn = pgnLines.join("\n");
        example("broadcasts", "streamOngoingBroadcastRoundAsPgn", pgn, "pgn");
      }
    });
  });

example(
  "broadcasts",
  "exportOneRoundAsPgn",
  await localClient().GET("/api/broadcast/round/{broadcastRoundId}.pgn", {
    params: {
      path: {
        broadcastRoundId: finalRound.data!.round.id,
      },
    },
    parseAs: "text",
  }),
  "pgn",
);

example(
  "broadcasts",
  "exportAllRoundsAsPgn",
  await localClient().GET("/api/broadcast/{broadcastTournamentId}.pgn", {
    params: {
      path: {
        broadcastTournamentId: newOfficialTournament.data!.tour.id,
      },
    },
    parseAs: "text",
  }),
  "pgn",
);

example(
  "broadcasts",
  "resetBroadcastRound",
  await localClient("admin").POST(
    "/api/broadcast/round/{broadcastRoundId}/reset",
    {
      params: {
        path: {
          broadcastRoundId: finalRound.data!.round.id,
        },
      },
    },
  ),
);

example(
  "broadcasts",
  "getYourBroadcastRounds",
  await localClient("admin").GET("/api/broadcast/my-rounds", {
    params: {
      query: {
        nb: 1,
      },
    },
  }),
);
