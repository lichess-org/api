# Lichess API doc & examples

- [API documentation](https://lichess.org/api)
- [Example code](https://github.com/lichess-org/api/tree/master/example/)
- [Which authentication is right for me](https://github.com/lichess-org/api/tree/master/example/README.md)

## Run locally

```shell
cd doc
npm install
npm run serve
```

Now open <http://localhost:8089/>. You should see the generated API doc.

Make modifications to `doc/specs/lichess-api.yaml`, and reload the page to see your changes.

### Check the yaml files for syntax errors:

```shell
npm run lint
```
