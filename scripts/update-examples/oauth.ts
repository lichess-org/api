import { example, localClient } from "./config";

const tokensToTest = "lip_jose,lip_badToken";

example("oauth", "testMultipleOauthTokens-request", tokensToTest, "txt");

example(
  "oauth",
  "testMultipleOauthTokens",
  await localClient().POST("/api/token/test", {
    headers: {
      "Content-Type": "text/plain",
    },
    body: tokensToTest,
    bodySerializer: (body) => body,
  }),
);
