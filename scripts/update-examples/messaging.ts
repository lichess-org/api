import { example, localClient } from "./config";

export default async function messaging() {
  await example(
    "messaging",
    "sendPrivateMessage",
    localClient().POST("/inbox/{username}", {
      params: {
        path: {
          username: "mary",
        },
      },
      body: {
        text: `Thank you for the game! (${new Date().toISOString()})`,
      },
    }),
  );
}
