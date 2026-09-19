import { example, prodClient } from "./config";

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
}
