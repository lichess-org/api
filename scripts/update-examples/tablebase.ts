import createClient from "openapi-fetch";
import { example } from "./config";
import { paths } from "@lichess-org/types";

const client = createClient<paths>({
  baseUrl: "https://tablebase.lichess.ovh",
});

example(
  "tablebase",
  "lookupStandard",
  await client.GET("/standard", {
    params: {
      query: {
        fen: "4k3/6KP/8/8/8/8/7p/8 w - - 0 1",
      },
    },
  }),
);

example(
  "tablebase",
  "lookupAtomic",
  await client.GET("/atomic", {
    params: {
      query: {
        fen: "r3k1nr/p2p1pp1/bp2p3/1B5p/1b1q4/2NPP1PP/PPP2P2/R1BQK2R b KQkq - 0 10",
      },
    },
  }),
);

example(
  "tablebase",
  "lookupAntichess",
  await client.GET("/antichess", {
    params: {
      query: {
        fen: "6nr/4kp1p/2P5/8/3P1P1P/8/6B1/4K1NR b - - 0 18",
      },
    },
  }),
);
