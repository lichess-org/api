import { createApiReference } from "@scalar/api-reference";
import "@scalar/api-reference/style.css";

createApiReference("#app", {
  favicon: "./favicon.svg",
  hideModels: true,
  url: "./openapi.yaml",
  withDefaultFonts: false,
  expandAllResponses: true,
  agent: {
    disabled: true,
  },
  hideClientButton: true,
  mcp: {
    disabled: true,
  },
  telemetry: false,
  orderSchemaPropertiesBy: "preserve",
  showOperationId: true,
  defaultHttpClient: {
    targetKey: "shell",
    clientKey: "curl",
  },
  featuredClients: ["shell/curl", "js/fetch", "python/requests"],
  documentDownloadType: "yaml",
  setPageTitle: ({ title }) => `${title} | Lichess.org API`,
});
