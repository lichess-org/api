import { example, prodClient } from "./config";

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
