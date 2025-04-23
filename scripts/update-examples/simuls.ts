import { example, prodClient } from "./config";

example("simuls", "getCurrentSimuls", await prodClient().GET("/api/simul"));
