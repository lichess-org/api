import { example, prodClient } from "./config";

export default async function server() {
  await example(
    "server",
    "getServerVersion",
    prodClient().GET("/api/version"),
  );
}
