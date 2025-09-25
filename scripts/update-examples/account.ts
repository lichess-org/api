import { example, localClient } from "./config";

example("account", "getMyProfile", await localClient().GET("/api/account"));

example(
  "account",
  "getMyEmailAddress",
  await localClient().GET("/api/account/email"),
);

await (async () => {
  const prefs = await localClient().GET("/api/account/preferences");
  if (prefs.data?.prefs?.bgImg && !prefs.data.prefs.bgImg.includes("http")) {
    prefs.data.prefs.bgImg = `https://lichess1.org${prefs.data.prefs.bgImg}`;
  }
  example("account", "getMyPreferences", prefs);
})();

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
