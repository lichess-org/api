import { example, localClient, ok } from "./config";

export default async function account() {
  await example("account", "getMyProfile", localClient().GET("/api/account"));

  await example(
    "account",
    "getMyEmailAddress",
    localClient().GET("/api/account/email"),
  );

  const prefs = ok(await localClient().GET("/api/account/preferences"));
  if (prefs.prefs?.bgImg && !prefs.prefs.bgImg.includes("http")) {
    prefs.prefs.bgImg = `https://lichess1.org${prefs.prefs.bgImg}`;
  }
  await example("account", "getMyPreferences", prefs);

  await example(
    "account",
    "getMyKidModeStatus",
    localClient().GET("/api/account/kid"),
  );

  await example(
    "account",
    "setMyKidModeStatus",
    localClient().POST("/api/account/kid", {
      params: {
        query: {
          v: true,
        },
      },
    }),
  );

  // Kid mode would otherwise stay on: it restricts bobby for the scripts that run after this one,
  // and the next run would record getMyKidModeStatus as `true`.
  ok(
    await localClient().POST("/api/account/kid", {
      params: {
        query: {
          v: false,
        },
      },
    }),
  );
}
