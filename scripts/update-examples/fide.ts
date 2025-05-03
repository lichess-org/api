import { example, prodClient } from "./config";

example(
  "fide",
  "getFidePlayer",
  await prodClient().GET("/api/fide/player/{playerId}", {
    params: {
      path: {
        playerId: 35009192,
      },
    },
  }),
);

example(
  "fide",
  "searchFidePlayers",
  await prodClient().GET("/api/fide/player", {
    params: {
      query: {
        q: "Erigaisi",
      },
    },
  }),
);
