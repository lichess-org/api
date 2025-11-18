import { createApiReference } from "@scalar/api-reference";
import "@scalar/api-reference/style.css";

createApiReference("#app", {
  url: "../public/openapi.yaml",
  withDefaultFonts: false,
  hideModels: true,
  favicon: "/favicon.png",
});
