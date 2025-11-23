import { example, localClient, localExternalEngineClient } from "./config";

const newExternalEngine = await localClient().POST("/api/external-engine", {
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
  await localClient().GET("/api/external-engine"),
);

example("externalEngine", "createExternalEngine", newExternalEngine);

example(
  "externalEngine",
  "getExternalEngine",
  await localClient().GET("/api/external-engine/{id}", {
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
  await localClient().PUT("/api/external-engine/{id}", {
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

localExternalEngineClient()
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

const analysisRequest = await localExternalEngineClient().POST(
  "/api/external-engine/work",
  {
    body: {
      providerSecret: "abcdefgh12345678",
    },
  },
);
example("externalEngine", "acquireAnalysisRequest", analysisRequest);

(await localExternalEngineClient().POST("/api/external-engine/work/{id}", {
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
    await localClient().DELETE("/api/external-engine/{id}", {
      params: {
        path: {
          id: newExternalEngine.data!.id,
        },
      },
    }),
  ));
