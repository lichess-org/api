import {
  example,
  firstNdJson,
  firstPgnGames,
  localClient,
  ok,
  streamTimeout,
} from "./config";

// Two short games, which are imported as two chapters.
const pgn = `[Event "Opera game"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0


[Event "Scholar's mate"]
[White "Alice"]
[Black "Bob"]
[Result "1-0"]

1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7# 1-0
`;

export default async function studies() {
  const owner = "bobby";

  const study = ok(
    await localClient(owner).POST("/api/study", {
      body: {
        name: "Example study",
        visibility: "unlisted",
        computer: "everyone",
        explorer: "everyone",
        cloneable: "everyone",
        shareable: "everyone",
        chat: "member",
      },
    }),
  );
  await example("studies", "createStudy", study);

  const chapters = ok(
    await localClient(owner).POST("/api/study/{studyId}/import-pgn", {
      params: {
        path: {
          studyId: study.id!,
        },
      },
      body: {
        pgn,
      },
    }),
  );
  await example("studies", "importPgnIntoStudy", chapters);

  await example(
    "studies",
    "exportOneChapterOfStudy",
    localClient(owner).GET("/api/study/{studyId}/{chapterId}.pgn", {
      params: {
        path: {
          studyId: study.id!,
          chapterId: chapters.chapters![0]!.id!,
        },
      },
      parseAs: "text",
    }),
    "pgn",
  );

  await example(
    "studies",
    "exportAllChaptersOfStudy",
    localClient(owner).GET("/api/study/{studyId}.pgn", {
      params: {
        path: {
          studyId: study.id!,
        },
      },
      parseAs: "text",
    }),
    "pgn",
  );

  await example(
    "studies",
    "listStudiesOfUser",
    firstNdJson(
      await localClient(owner).GET("/api/study/by/{username}", {
        params: {
          path: {
            username: owner,
          },
        },
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  await example(
    "studies",
    "exportAllStudiesOfUser",
    firstPgnGames(
      await localClient(owner).GET("/api/study/by/{username}/export.pgn", {
        params: {
          path: {
            username: owner,
          },
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
    "pgn",
  );
}
