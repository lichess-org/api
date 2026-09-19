import {
  example,
  localClient,
  localExternalEngineClient,
  localExternalEngineUrl,
  ok,
} from "./config";

export default async function externalEngine() {
  // Check first: failing after the engine is registered would leave it behind, and it would then
  // show up in the next run's listExternalEngines example.
  await fetch(localExternalEngineUrl).catch(() => {
    throw new Error(
      `Nothing is listening on ${localExternalEngineUrl}. Start the external engine first.`,
    );
  });

  const newExternalEngine = ok(
    await localClient().POST("/api/external-engine", {
      body: {
        name: "Stockfish 17",
        maxThreads: 8,
        maxHash: 2048,
        providerSecret: "abcdefgh12345678",
      },
    }),
  );

  await example(
    "externalEngine",
    "listExternalEngines",
    localClient().GET("/api/external-engine"),
  );

  await example("externalEngine", "createExternalEngine", newExternalEngine);

  await example(
    "externalEngine",
    "getExternalEngine",
    localClient().GET("/api/external-engine/{id}", {
      params: {
        path: {
          id: newExternalEngine.id,
        },
      },
    }),
  );

  await example(
    "externalEngine",
    "updateExternalEngine",
    localClient().PUT("/api/external-engine/{id}", {
      params: {
        path: {
          id: newExternalEngine.id,
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

  const [analysis] = await Promise.all([
    // The client asks for an analysis. This request stays open until the provider has answered it.
    localExternalEngineClient().POST("/api/external-engine/{id}/analyse", {
      params: {
        path: {
          id: newExternalEngine.id,
        },
      },
      body: {
        clientSecret: newExternalEngine.clientSecret,
        work: {
          sessionId: "1",
          threads: 1,
          hash: 2048,
          depth: 1,
          multiPv: 1,
          variant: "chess",
          initialFen:
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          moves: ["e2e4", "g8f6"],
        },
      },
    }),

    // The provider picks up that request and answers it.
    (async () => {
      const analysisRequest = ok(
        await localExternalEngineClient().POST("/api/external-engine/work", {
          body: {
            providerSecret: "abcdefgh12345678",
          },
        }),
      );
      await example(
        "externalEngine",
        "acquireAnalysisRequest",
        analysisRequest,
      );

      ok(
        await localExternalEngineClient().POST(
          "/api/external-engine/work/{id}",
          {
            params: {
              path: {
                id: analysisRequest.id,
              },
            },
            headers: {
              "Content-Type": "text/plain",
            },
            body: "info depth 1 seldepth 2 multipv 1 score cp 13 nodes 20 nps 10000 hashfull 0 tbhits 0 time 2 pv e2e4",
            bodySerializer: (body) => body,
          },
        ),
      );
    })(),
  ]);

  await example("externalEngine", "analyseWithExternalEngine", analysis);

  await example(
    "externalEngine",
    "deleteExternalEngine",
    localClient().DELETE("/api/external-engine/{id}", {
      params: {
        path: {
          id: newExternalEngine.id,
        },
      },
    }),
  );
}
