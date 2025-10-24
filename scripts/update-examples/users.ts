import { example, localClient, prodClient } from "./config";

example(
  "users",
  "getRealTimeUsersStatus",
  await localClient().GET("/api/users/status", {
    params: {
      query: {
        ids: "mary,ana",
        withSignal: true,
        withGameIds: true,
        withGameMetas: true,
      },
    },
  }),
);

example("users", "getAllTop10", await prodClient().GET("/api/player"));

example(
  "users",
  "getOneLeaderboard",
  await localClient().GET("/api/player/top/{nb}/{perfType}", {
    params: {
      path: {
        nb: 3,
        perfType: "blitz",
      },
    },
  }),
);

example(
  "users",
  "getUserPublicData",
  await localClient().GET("/api/user/{username}", {
    params: {
      path: {
        username: "mary",
      },
    },
  }),
);

example(
  "users",
  "getRatingHistoryOfAUser",
  await localClient().GET("/api/user/{username}/rating-history", {
    params: {
      path: {
        username: "mary",
      },
    },
  }),
);

example(
  "users",
  "getPerformanceStatisticsOfAUser",
  await prodClient().GET("/api/user/{username}/perf/{perf}", {
    params: {
      path: {
        username: "thibault",
        perf: "blitz",
      },
    },
  }),
);

example(
  "users",
  "getUserActivity",
  await prodClient().GET("/api/user/{username}/activity", {
    params: {
      path: {
        username: "thibault",
      },
    },
  }),
);

example(
  "users",
  "getUsersById",
  await prodClient().POST("/api/users", {
    body: "thibault,maia1,maia5",
    headers: {
      "Content-Type": "text/plain",
    },
    bodySerializer: (body) => body,
  }),
);

example(
  "users",
  "getLiveStreamers",
  await prodClient().GET("/api/streamer/live"),
);

example(
  "users",
  "getCrosstable",
  await prodClient().GET("/api/crosstable/{user1}/{user2}", {
    params: {
      path: {
        user1: "DrNykterstein",
        user2: "RebeccaHarris",
      },
    },
  }),
);

example(
  "users",
  "autocompleteUsernames-object",
  await localClient().GET("/api/player/autocomplete", {
    params: {
      query: {
        term: "bob",
        object: true,
      },
    },
  }),
  "json",
  true,
);

example(
  "users",
  "autocompleteUsernames-list",
  await localClient().GET("/api/player/autocomplete", {
    params: {
      query: {
        term: "bob",
        object: false,
      },
    },
  }),
  "json",
  true,
);

example(
  "users",
  "addNoteForUser",
  await localClient().POST("/api/user/{username}/note", {
    params: {
      path: {
        username: "mary",
      },
    },
    body: {
      text: "this is a private note",
    },
  }),
);

example(
  "users",
  "getNotesForUser",
  await localClient().GET("/api/user/{username}/note", {
    params: {
      path: {
        username: "mary",
      },
    },
  }),
);
