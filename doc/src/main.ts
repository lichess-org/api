import { createApiReference } from "@scalar/api-reference";
import "@scalar/api-reference/style.css";

createApiReference("#app", {
  favicon: "./favicon.png",
  hideModels: true,
  url: "./openapi.yaml",
  withDefaultFonts: false,
});
