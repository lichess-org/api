# Lichess API doc & examples
[![Lint OpenAPI specification and publish documentation](https://github.com/lichess-org/api/actions/workflows/main.yml/badge.svg)](https://github.com/lichess-org/api/actions/workflows/main.yml)

- [API documentation](https://lichess.org/api)
- [Example code](https://github.com/lichess-org/api/tree/master/example/)
- [Which authentication is right for me](https://github.com/lichess-org/api/tree/master/example/README.md)

## Contribute documentation

```shell
cd doc
npm install
npm run serve -- --watch
```

Now open http://localhost:8080/. You should see the generated API doc.

Make modifications to `doc/specs/lichess-api.yaml`, and reload the page to see your changes.
