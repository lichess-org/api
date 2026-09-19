import { example, ok, prodClient } from "./config";

export default async function fide() {
  await example(
    "fide",
    "getFidePlayer",
    prodClient().GET("/api/fide/player/{playerId}", {
      params: {
        path: {
          playerId: 35009192,
        },
      },
    }),
  );

  await example(
    "fide",
    "getFidePlayer-nullYear",
    prodClient().GET("/api/fide/player/{playerId}", {
      params: {
        path: {
          playerId: 8700761,
        },
      },
    }),
  );

  await example(
    "fide",
    "searchFidePlayers",
    prodClient().GET("/api/fide/player", {
      params: {
        query: {
          q: "Erigaisi",
        },
      },
    }),
  );

  // Every rating change is an entry, which is more than an example needs
  const ratings = ok(
    await prodClient().GET("/api/fide/player/{playerId}/ratings", {
      params: {
        path: {
          playerId: 35009192,
        },
      },
    }),
  );
  await example("fide", "getFidePlayerRatings", {
    standard: ratings.standard?.slice(-6),
    rapid: ratings.rapid?.slice(-6),
    blitz: ratings.blitz?.slice(-6),
  });
}
