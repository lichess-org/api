import { example, prodClient } from "./config";

export default async function analysis() {
  await example(
    "analysis",
    "getCloudEvaluation",
    prodClient().GET("/api/cloud-eval", {
      params: {
        query: {
          fen: "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
          multiPv: 2,
        },
      },
    }),
  );
}
