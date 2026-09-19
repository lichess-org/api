import { example, localClient } from "./config";

export default async function oauth() {
  const tokensToTest = "lip_jose,lip_badToken";

  await example(
    "oauth",
    "testMultipleOauthTokens-request",
    tokensToTest,
    "txt",
  );

  await example(
    "oauth",
    "testMultipleOauthTokens",
    localClient().POST("/api/token/test", {
      headers: {
        "Content-Type": "text/plain",
      },
      body: tokensToTest,
      bodySerializer: (body) => body,
    }),
  );
}
