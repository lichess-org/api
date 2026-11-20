import { execSync } from "child_process";
import { defineConfig } from "vite";
import ViteRestart from "vite-plugin-restart";

export default defineConfig({
  plugins: [
    {
      name: "lichess-bundle-openapi",
      async buildStart() {
        execSync("pnpm bundle");
      },
    },
    ViteRestart({
      restart: ["specs/**/*"],
    }),
  ],
});
