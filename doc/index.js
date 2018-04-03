import SwaggerUI from 'swagger-ui'

SwaggerUI({
  url: "/lichess-api.yaml",
  dom_id: '#swagger-ui',
  deepLinking: true,
  presets: [
    SwaggerUI.presets.apis,
    SwaggerUI.SwaggerUIStandalonePreset
  ],
  defaultModelsExpandDepth: -1,
  // layout: "StandaloneLayout"
  layout: "BaseLayout"
});
