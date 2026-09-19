import {
  cleanUp,
  example,
  localClient,
  localExternalEngineClient,
  localExternalEngineUrl,
  ok,
  readNdJson,
  streamTimeout,
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

  // The engine is deleted in the end, and also when something goes wrong before that
  try {
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
      // The client asks for an analysis. This request stays open until the provider has answered it,
      // and the answer is a stream of updates.
      (async () => {
        const { response } = await localExternalEngineClient().POST(
          "/api/external-engine/{id}/analyse",
          {
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
            parseAs: "stream",
            signal: streamTimeout(),
          },
        );
        const updates: unknown[] = [];
        // The types describe the response as if it was parsed, but this is the stream itself
        for await (const update of readNdJson({
          response,
          data: response.body,
        }))
          updates.push(update);
        return updates;
      })(),

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
              // It is White to move after 1.e4 Nf6. The engine ignores a variation from the first
              // move on that is not legal, and needs the answer to end with `bestmove`.
              body: [
                "info depth 1 seldepth 2 multipv 1 score cp 13 nodes 20 nps 10000 hashfull 0 tbhits 0 time 2 pv e4e5 f6d5",
                "bestmove e4e5 ponder f6d5",
                "",
              ].join("\n"),
              bodySerializer: (body) => body,
            },
          ),
        );
      })(),
    ]);

    // The first update has the analysis as far as it has got, and the last one also the best move
    await example("externalEngine", "analyseWithExternalEngine", analysis[0]);

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
  } catch (error) {
    await cleanUp(() =>
      localClient().DELETE("/api/external-engine/{id}", {
        params: {
          path: {
            id: newExternalEngine.id,
          },
        },
      }),
    );
    throw error;
  }
}
