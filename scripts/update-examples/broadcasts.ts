import { example, localClient } from "./config";

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
