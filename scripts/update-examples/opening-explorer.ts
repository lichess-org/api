import createClient from "openapi-fetch";
import { example, readNdJson } from "./config";
import { paths } from "@lichess-org/types";

const client = createClient<paths>({
  baseUrl: "https://explorer.lichess.ovh",
});

example(
  "openingExplorer",
  "masters",
  await client.GET("/masters", {
    params: {
      query: {
        play: "d2d4,d7d5,c2c4,c7c6,c4d5",
      },
    },
  }),
);

example(
  "openingExplorer",
  "lichess",
  await client.GET("/masters", {
    params: {
      query: {
        variant: "standard",
        speeds: "blitz,rapid,classical",
        ratings: "2200,2500",
        fen: "rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2",
      },
    },
  }),
);

const abortController = new AbortController();
const signal = abortController.signal;
await client
  .GET("/player", {
    params: {
      query: {
        player: "revoof",
        color: "white",
        play: "d2d4,d7d5",
        recentGames: 1,
      },
    },
    signal,
    parseAs: "stream",
  })
  .then((response) => {
    readNdJson(response.response, (line: any) => {
      example("openingExplorer", "player", line);
      abortController.abort();
    });
  });

example(
  "openingExplorer",
  "otbMasterGame",
  await client.GET("/master/pgn/{gameId}", {
    params: {
      path: {
        gameId: "aAbqI4ey",
      },
    },
    parseAs: "text",
  }),
  "pgn",
);
