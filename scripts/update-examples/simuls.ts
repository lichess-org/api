import { example, prodClient } from "./config";

export default async function simuls() {
  await example("simuls", "getCurrentSimuls", prodClient().GET("/api/simul"));
}
