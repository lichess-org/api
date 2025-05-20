import { example, prodClient, readNdJson } from "./config";

const abortController = new AbortController();
const signal = abortController.signal;

await prodClient()
  .GET("/api/bot/online", {
    headers: {
      Accept: "application/x-ndjson",
    },
    signal,
    parseAs: "stream",
  })
  .then((response) =>
    readNdJson(response.response, (line: any) => {
      example("bot", "getOnlineBots", line);
      abortController.abort();
    }),
  );
