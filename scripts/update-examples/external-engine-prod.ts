import createClient from "openapi-fetch";
import { example } from "./config";
import { paths } from "@lichess-org/types";

const api_token = process.env.LICHESS_API_TOKEN;

const prodClient = () =>
  createClient<paths>({
    baseUrl: "https://lichess.org",
    headers:{
      Authorization: `Bearer ${api_token}`,
    },
  });

const prodExternalEngineClient = () =>
  createClient<paths>({
    baseUrl: "https://engine.lichess.ovh",
  });

const newExternalEngine = await prodClient().POST("/api/external-engine", {
  body: {
    name: "Stockfish 17",
    maxThreads: 8,
    maxHash: 2048,
    providerSecret: "abcdefgh12345678",
  },
});

example(
  "externalEngine",
  "listExternalEngines",
  await prodClient().GET("/api/external-engine"),
);

example("externalEngine", "createExternalEngine", newExternalEngine);

example(
  "externalEngine",
  "getExternalEngine",
  await prodClient().GET("/api/external-engine/{id}", {
    params: {
      path: {
        id: newExternalEngine.data!.id,
      },
    },
  }),
);

example(
  "externalEngine",
  "updateExternalEngine",
  await prodClient().PUT("/api/external-engine/{id}", {
    params: {
      path: {
        id: newExternalEngine.data!.id,
      },
    },
    body: {
      name: "Stockfish 17.1",
      maxThreads: 8,
      maxHash: 2048,
      providerSecret: "abcdefgh12345678",
    },
  }),
);

prodExternalEngineClient()
  .POST("/api/external-engine/{id}/analyse", {
    params: {
      path: {
        id: newExternalEngine.data!.id,
      },
    },
    body: {
      clientSecret: newExternalEngine.data!.clientSecret,
      work: {
        sessionId: "1",
        threads: 1,
        hash: 2048,
        depth: 1,
        multiPv: 1,
        variant: "chess",
        initialFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        moves: ["e2e4", "g8f6"],
      },
    },
  })
  .then((response) => {
    example("externalEngine", "analyseWithExternalEngine", response);
  });

const analysisRequest = await prodExternalEngineClient().POST(
  "/api/external-engine/work",
  {
    body: {
      providerSecret: "abcdefgh12345678",
    },
  },
);
example("externalEngine", "acquireAnalysisRequest", analysisRequest);

(await prodExternalEngineClient().POST("/api/external-engine/work/{id}", {
  params: {
    path: {
      id: analysisRequest.data!.id,
    },
  },
  headers: {
    "Content-Type": "text/plain",
  },
  body: "info depth 1 seldepth 2 multipv 1 score cp 13 nodes 20 nps 10000 hashfull 0 tbhits 0 time 2 pv e2e4",
  bodySerializer: (body) => body,
}),
  example(
    "externalEngine",
    "deleteExternalEngine",
    await prodClient().DELETE("/api/external-engine/{id}", {
      params: {
        path: {
          id: newExternalEngine.data!.id,
        },
      },
    }),
  ));
