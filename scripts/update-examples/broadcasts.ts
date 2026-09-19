import {
  example,
  localClient,
  ok,
  prodClient,
  readLines,
  streamTimeout,
} from "./config";

export default async function broadcasts() {
  const newOfficialTournament = ok(
    await localClient("admin").POST("/broadcast/new", {
      body: {
        name: "Knight Invitational",
        tier: 5,
      },
    }),
  );
  console.log(`Created tournament ${newOfficialTournament.tour.url}`);

  const nowMs = Date.now();

  for (let i = 1; i <= 3; i++) {
    const round = ok(
      await localClient("admin").POST(
        `/broadcast/{broadcastTournamentId}/new`,
        {
          params: {
            path: {
              broadcastTournamentId: newOfficialTournament.tour.id,
            },
          },
          body: {
            name: `Round ${i}`,
            startsAt: nowMs + i * 1000 * 60 * 60,
          },
        },
      ),
    );
    console.log(`Created round ${round.round.url}`);
  }

  const finalRound = ok(
    await localClient("admin").POST("/broadcast/{broadcastTournamentId}/new", {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.tour.id,
        },
      },
      body: {
        name: "Final Round",
      },
    }),
  );

  const pushPgn = await localClient("admin").POST(
    "/api/broadcast/round/{broadcastRoundId}/push",
    {
      headers: {
        "Content-Type": "text/plain",
      },
      params: {
        path: {
          broadcastRoundId: finalRound.round.id,
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

  await example(
    "broadcasts",
    "getOfficialBroadcasts",
    localClient().GET("/api/broadcast", {
      params: {
        query: {
          nb: 1,
        },
      },
    }),
  );

  await example(
    "broadcasts",
    "getPaginatedToBroadcastPreviews",
    localClient().GET("/api/broadcast/top"),
  );

  ok(
    await localClient().POST("/broadcast/new", {
      body: {
        name: "Bobby's Tournament",
        "info.format": "5-round Swiss",
        "info.location": "Chess Club",
      },
    }),
  );

  await example(
    "broadcasts",
    "getBroadcastsCreatedByUser",
    localClient().GET("/api/broadcast/by/{username}", {
      params: {
        path: {
          username: "bobby",
        },
      },
    }),
  );

  await example(
    "broadcasts",
    "searchBroadcasts",
    localClient().GET("/api/broadcast/search", {
      params: {
        query: {
          q: "Knight",
        },
      },
    }),
  );

  await example(
    "broadcasts",
    "createBroadcastTournament",
    newOfficialTournament,
  );

  await example(
    "broadcasts",
    "getBroadcastTournament",
    localClient().GET("/api/broadcast/{broadcastTournamentId}", {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.tour.id,
        },
      },
    }),
  );

  await example(
    "broadcasts",
    "getPlayersOfBroadcastTournament",
    localClient().GET("/broadcast/{broadcastTournamentId}/players", {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.tour.id,
        },
      },
    }),
  );

  await example(
    "broadcasts",
    "getPlayer",
    localClient("anon").GET(
      "/broadcast/{broadcastTournamentId}/players/{playerId}",
      {
        params: {
          path: {
            broadcastTournamentId: newOfficialTournament.tour.id,
            playerId: "123",
          },
        },
      },
    ),
  );

  await example(
    "broadcasts",
    "updateBroadcastTournament",
    localClient("admin").POST("/broadcast/{broadcastTournamentId}/edit", {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.tour.id,
        },
      },
      body: {
        name: "Knight Invitational 2",
      },
    }),
  );

  await example("broadcasts", "createBroadcastRound", finalRound);

  await example(
    "broadcasts",
    "getBroadcastRound",
    localClient().GET(
      "/api/broadcast/{broadcastTournamentSlug}/{broadcastRoundSlug}/{broadcastRoundId}",
      {
        params: {
          path: {
            broadcastTournamentSlug: "-",
            broadcastRoundSlug: "-",
            broadcastRoundId: finalRound.round.id,
          },
        },
      },
    ),
  );

  await example(
    "broadcasts",
    "getBroadcastRoundWithCustomScoring",
    prodClient().GET(
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
  );

  await example(
    "broadcasts",
    "updateBroadcastRound",
    localClient("admin").POST("/broadcast/round/{broadcastRoundId}/edit", {
      params: {
        path: {
          broadcastRoundId: finalRound.round.id,
        },
      },
      body: {
        name: "Final Round 2",
      },
    }),
  );

  await example("broadcasts", "pushPgnToBroadcastRound", pushPgn);

  // The stream never ends on its own. Both pushed games are complete after 6 blank lines.
  const pgnLines: string[] = [];
  let blankLines = 0;
  for await (const line of readLines(
    await localClient().GET(
      "/api/stream/broadcast/round/{broadcastRoundId}.pgn",
      {
        params: {
          path: {
            broadcastRoundId: finalRound.round.id,
          },
        },
        parseAs: "stream",
        signal: streamTimeout(),
      },
    ),
  )) {
    pgnLines.push(line);
    if (line === "" && ++blankLines === 6) {
      await example(
        "broadcasts",
        "streamOngoingBroadcastRoundAsPgn",
        pgnLines.join("\n"),
        "pgn",
      );
      break;
    }
  }

  await example(
    "broadcasts",
    "exportOneRoundAsPgn",
    localClient().GET("/api/broadcast/round/{broadcastRoundId}.pgn", {
      params: {
        path: {
          broadcastRoundId: finalRound.round.id,
        },
      },
      parseAs: "text",
    }),
    "pgn",
  );

  await example(
    "broadcasts",
    "exportAllRoundsAsPgn",
    localClient().GET("/api/broadcast/{broadcastTournamentId}.pgn", {
      params: {
        path: {
          broadcastTournamentId: newOfficialTournament.tour.id,
        },
      },
      parseAs: "text",
    }),
    "pgn",
  );

  await example(
    "broadcasts",
    "resetBroadcastRound",
    localClient("admin").POST("/api/broadcast/round/{broadcastRoundId}/reset", {
      params: {
        path: {
          broadcastRoundId: finalRound.round.id,
        },
      },
    }),
  );

  await example(
    "broadcasts",
    "getYourBroadcastRounds",
    localClient("admin").GET("/api/broadcast/my-rounds", {
      params: {
        query: {
          nb: 1,
        },
      },
    }),
  );

  // Every team has an entry with all of its matches, which is more than an example needs
  const teamLeaderboard = ok(
    await prodClient().GET(
      "/broadcast/{broadcastTournamentId}/teams/standings",
      {
        params: {
          path: {
            broadcastTournamentId: "Y9YjcDKG",
          },
        },
      },
    ),
  );
  await example(
    "broadcasts",
    "getTeamLeaderboardOfBroadcastTournament",
    teamLeaderboard.slice(0, 2),
  );
}
