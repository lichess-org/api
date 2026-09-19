import { example, tablebaseClient } from "./config";

export default async function tablebase() {
  const client = tablebaseClient();

  await example(
    "tablebase",
    "lookupStandard",
    client.GET("/standard", {
      params: {
        query: {
          fen: "4k3/6KP/8/8/8/8/7p/8 w - - 0 1",
        },
      },
    }),
  );

  await example(
    "tablebase",
    "lookupAtomic",
    client.GET("/atomic", {
      params: {
        query: {
          fen: "r3k1nr/p2p1pp1/bp2p3/1B5p/1b1q4/2NPP1PP/PPP2P2/R1BQK2R b KQkq - 0 10",
        },
      },
    }),
  );

  await example(
    "tablebase",
    "lookupAntichess",
    client.GET("/antichess", {
      params: {
        query: {
          fen: "6nr/4kp1p/2P5/8/3P1P1P/8/6B1/4K1NR b - - 0 18",
        },
      },
    }),
  );
}
