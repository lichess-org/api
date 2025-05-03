import { example, localClient, readNdJson } from "./config";

const abortController = new AbortController();
const signal = abortController.signal;
await localClient()
  .GET("/api/rel/following", {
    headers: {
      Accept: "application/x-ndjson",
    },
    signal,
    parseAs: "stream",
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("relations", "getMyFollowing", line);
      abortController.abort();
    }),
  );

example(
  "relations",
  "followPlayer",
  await localClient().POST("/api/rel/follow/{username}", {
    params: {
      path: {
        username: "admin",
      },
    },
  }),
);

example(
  "relations",
  "unfollowPlayer",
  await localClient().POST("/api/rel/unfollow/{username}", {
    params: {
      path: {
        username: "admin",
      },
    },
  }),
);

example(
  "relations",
  "blockPlayer",
  await localClient().POST("/api/rel/block/{username}", {
    params: {
      path: {
        username: "jose",
      },
    },
  }),
);

example(
  "relations",
  "unblockPlayer",
  await localClient().POST("/api/rel/unblock/{username}", {
    params: {
      path: {
        username: "jose",
      },
    },
  }),
);
