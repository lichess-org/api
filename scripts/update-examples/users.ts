import { example, localClient, prodClient } from "./config";

export default async function users() {
  await example(
    "users",
    "getRealTimeUsersStatus",
    localClient().GET("/api/users/status", {
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

  await example("users", "getAllTop10", prodClient().GET("/api/player"));

  await example(
    "users",
    "getOneLeaderboard",
    localClient().GET("/api/player/top/{nb}/{perfType}", {
      params: {
        path: {
          nb: 3,
          perfType: "blitz",
        },
      },
    }),
  );

  await example(
    "users",
    "getUserPublicData",
    localClient().GET("/api/user/{username}", {
      params: {
        path: {
          username: "mary",
        },
      },
    }),
  );

  await example(
    "users",
    "getRatingHistoryOfAUser",
    localClient().GET("/api/user/{username}/rating-history", {
      params: {
        path: {
          username: "mary",
        },
      },
    }),
  );

  await example(
    "users",
    "getPerformanceStatisticsOfAUser",
    prodClient().GET("/api/user/{username}/perf/{perf}", {
      params: {
        path: {
          username: "thibault",
          perf: "blitz",
        },
      },
    }),
  );

  await example(
    "users",
    "getUserActivity",
    prodClient().GET("/api/user/{username}/activity", {
      params: {
        path: {
          username: "thibault",
        },
      },
    }),
  );

  await example(
    "users",
    "getUsersById",
    prodClient().POST("/api/users", {
      body: "thibault,maia1,maia5",
      headers: {
        "Content-Type": "text/plain",
      },
      bodySerializer: (body) => body,
    }),
  );

  await example(
    "users",
    "getLiveStreamers",
    prodClient().GET("/api/streamer/live"),
  );

  await example(
    "users",
    "getCrosstable",
    prodClient().GET("/api/crosstable/{user1}/{user2}", {
      params: {
        path: {
          user1: "DrNykterstein",
          user2: "RebeccaHarris",
        },
      },
    }),
  );

  await example(
    "users",
    "autocompleteUsernames-object",
    localClient().GET("/api/player/autocomplete", {
      params: {
        query: {
          term: "bob",
          object: true,
        },
      },
    }),
  );

  await example(
    "users",
    "autocompleteUsernames-list",
    localClient().GET("/api/player/autocomplete", {
      params: {
        query: {
          term: "bob",
          object: false,
        },
      },
    }),
  );

  await example(
    "users",
    "addNoteForUser",
    localClient().POST("/api/user/{username}/note", {
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

  await example(
    "users",
    "getNotesForUser",
    localClient().GET("/api/user/{username}/note", {
      params: {
        path: {
          username: "mary",
        },
      },
    }),
  );
}
