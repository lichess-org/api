import { example, firstNdJson, prodClient, streamTimeout } from "./config";

export default async function bot() {
  await example(
    "bot",
    "getOnlineBots",
    firstNdJson(
      await prodClient().GET("/api/bot/online", {
        headers: {
          Accept: "application/x-ndjson",
        },
        parseAs: "stream",
        signal: streamTimeout(),
      }),
    ),
  );
}
