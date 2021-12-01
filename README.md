# Lichess API doc & examples

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

## Auto-generate client code

You may use the spec file to quickly auto-generate the client code needed to interface your software to the Lichess API.

To do so, you shall use the [OpenAPI Generator](https://openapi-generator.tech).

The generator does not yet support the 3.1 version of the OpenAPI specification ([see this issue](https://github.com/OpenAPITools/openapi-generator/issues/9083)), the one used by Lichess, hence for now you should use the `doc/specs/lichess-api-3.0.yaml` file with it.

The 3.1 format slightly differs from the 3.0 format, however the generated code is equivalent.
