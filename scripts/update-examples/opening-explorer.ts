import { example, explorerClient, firstNdJson, streamTimeout } from "./config";

export default async function openingExplorer() {
  const client = explorerClient();

  await example(
    "openingExplorer",
    "masters",
    client.GET("/masters", {
      params: {
        query: {
          play: "d2d4,d7d5,c2c4,c7c6,c4d5",
        },
      },
    }),
  );

  await example(
    "openingExplorer",
    "lichess",
    client.GET("/lichess", {
      params: {
        query: {
          variant: "standard",
          play: "d2d4,d7d5,c2c4,c7c6,c4d5",
        },
      },
    }),
  );

  // Progress is streamed while the player's games are indexed. The first line is enough.
  await example(
    "openingExplorer",
    "player",
    firstNdJson(
      await client.GET("/player", {
        params: {
          query: {
            player: "revoof",
            color: "white",
            play: "d2d4,d7d5",
            recentGames: 1,
          },
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  await example(
    "openingExplorer",
    "otbMasterGame",
    client.GET("/masters/pgn/{gameId}", {
      params: {
        path: {
          gameId: "aAbqI4ey",
        },
      },
      parseAs: "text",
    }),
    "pgn",
  );
}
