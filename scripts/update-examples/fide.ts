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
  "json",
  true,
);

example(
  "fide",
  "getFidePlayer-nullYear",
  await prodClient().GET("/api/fide/player/{playerId}", {
    params: {
      path: {
        playerId: 8700761,
      },
    },
  }),
  "json",
  true,
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
