import { example, localClient, prodClient, readNdJson } from "./config";

example(
  "arenas",
  "getCurrentTournaments",
  await prodClient().GET("/api/tournament"),
);

const newArena = await localClient().POST("/api/tournament", {
  body: {
    clockTime: 5,
    clockIncrement: 0,
    minutes: 60,
  },
});

example("arenas", "createArena", newArena);

example(
  "arenas",
  "getArenaById",
  await prodClient().GET("/api/tournament/{id}", {
    params: {
      path: {
        id: "may24lta",
      },
    },
  }),
);

example(
  "arenas",
  "updateArena",
  await localClient().POST("/api/tournament/{id}", {
    params: {
      path: {
        id: newArena.data!.id,
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

await prodClient()
  .GET("/api/tournament/{id}/results", {
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
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("arenas", "getResultsOfArena", line);
    }),
  );

example(
  "arenas",
  "getTeamStandingOfTeamBattle",
  await prodClient().GET("/api/tournament/{id}/teams", {
    params: {
      path: {
        id: "qVDS48xp",
      },
    },
  }),
);

await prodClient()
  .GET("/api/user/{username}/tournament/created", {
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
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("arenas", "getTournamentsCreatedByUser", line);
    }),
  );

await prodClient()
  .GET("/api/user/{username}/tournament/played", {
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
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("arenas", "getTournamentsPlayedByUser", line);
    }),
  );

await prodClient()
  .GET("/api/team/{teamId}/arena", {
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
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("arenas", "getTeamArenaTournaments", line);
    }),
  );
