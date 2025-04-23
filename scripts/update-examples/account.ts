import { example, localClient } from "./config";

example("account", "getMyProfile", await localClient().GET("/api/account"));
example(
  "account",
  "getMyEmailAddress",
  await localClient().GET("/api/account/email"),
);
example(
  "account",
  "getMyPreferences",
  await localClient().GET("/api/account/preferences"),
);
example(
  "account",
  "getMyKidModeStatus",
  await localClient().GET("/api/account/kid"),
);
example(
  "account",
  "setMyKidModeStatus",
  await localClient().POST("/api/account/kid", {
    params: {
      query: {
        v: true,
      },
    },
  }),
);
example(
  "account",
  "getMyTimeline",
  await localClient().GET("/api/timeline", {
    params: {
      query: {
        since: 0,
      },
    },
  }),
);
