import { example, firstNdJson, localClient, ok, prodClient } from "./config";

export default async function arenas() {
  await example(
    "arenas",
    "getCurrentTournaments",
    prodClient().GET("/api/tournament"),
  );

  const newArena = ok(
    await localClient().POST("/api/tournament", {
      body: {
        clockTime: 5,
        clockIncrement: 0,
        minutes: 60,
      },
    }),
  );

  await example("arenas", "createArena", newArena);

  await example(
    "arenas",
    "getArenaById",
    prodClient().GET("/api/tournament/{id}", {
      params: {
        path: {
          id: "may24lta",
        },
      },
    }),
  );

  await example(
    "arenas",
    "updateArena",
    localClient().POST("/api/tournament/{id}", {
      params: {
        path: {
          id: newArena.id,
        },
      },
      body: {
        name: "Updated Arena",
        clockTime: 5,
        clockIncrement: 0,
        minutes: 60,
      },
    }),
  );

  await example(
    "arenas",
    "getResultsOfArena",
    firstNdJson(
      await prodClient().GET("/api/tournament/{id}/results", {
        headers: {
          Accept: "application/x-ndjson",
        },
        params: {
          path: {
            id: "may25bta",
          },
          query: {
            nb: 1,
            sheet: true,
          },
        },
        parseAs: "stream",
      }),
    ),
  );

  await example(
    "arenas",
    "getTeamStandingOfTeamBattle",
    prodClient().GET("/api/tournament/{id}/teams", {
      params: {
        path: {
          id: "qVDS48xp",
        },
      },
    }),
  );

  await example(
    "arenas",
    "getTournamentsCreatedByUser",
    firstNdJson(
      await prodClient().GET("/api/user/{username}/tournament/created", {
        headers: {
          Accept: "application/x-ndjson",
        },
        params: {
          path: {
            username: "NateBrady23",
          },
          query: {
            nb: 1,
          },
        },
        parseAs: "stream",
      }),
    ),
  );

  await example(
    "arenas",
    "getTournamentsPlayedByUser",
    firstNdJson(
      await prodClient().GET("/api/user/{username}/tournament/played", {
        headers: {
          Accept: "application/x-ndjson",
        },
        params: {
          path: {
            username: "thibault",
          },
          query: {
            nb: 1,
          },
        },
        parseAs: "stream",
      }),
    ),
  );

  await example(
    "arenas",
    "getTeamArenaTournaments",
    firstNdJson(
      await prodClient().GET("/api/team/{teamId}/arena", {
        headers: {
          Accept: "application/x-ndjson",
        },
        params: {
          path: {
            teamId: "bradys-blunder-buddies",
          },
          query: {
            max: 1,
          },
        },
        parseAs: "stream",
      }),
    ),
  );
}
