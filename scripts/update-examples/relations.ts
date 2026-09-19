import { example, firstNdJson, localClient, streamTimeout } from "./config";

export default async function relations() {
  await example(
    "relations",
    "getMyFollowing",
    firstNdJson(
      await localClient().GET("/api/rel/following", {
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );

  await example(
    "relations",
    "followPlayer",
    localClient().POST("/api/rel/follow/{username}", {
      params: {
        path: {
          username: "admin",
        },
      },
    }),
  );

  await example(
    "relations",
    "unfollowPlayer",
    localClient().POST("/api/rel/unfollow/{username}", {
      params: {
        path: {
          username: "admin",
        },
      },
    }),
  );

  await example(
    "relations",
    "blockPlayer",
    localClient().POST("/api/rel/block/{username}", {
      params: {
        path: {
          username: "jose",
        },
      },
    }),
  );

  await example(
    "relations",
    "unblockPlayer",
    localClient().POST("/api/rel/unblock/{username}", {
      params: {
        path: {
          username: "jose",
        },
      },
    }),
  );
}
