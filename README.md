# Lichess API doc & examples

- [API documentation](https://lichess.org/api)
- [Example code](https://github.com/lichess-org/api/tree/master/example/)
- [Which authentication is right for me](https://github.com/lichess-org/api/tree/master/example/README.md)

## Run locally

```shell
cd doc
pnpm install
pnpm dev
```

Now open <http://localhost:8089/>. You should see the generated API doc.

Make modifications to `doc/specs/lichess-api.yaml`, and reload the page to see your changes.

### Check the yaml files for syntax errors:

```shell
pnpm spectral
pnpm lint
```

### Format the yaml files

```shell
pnpm format
```

### Publish (for maintainers)

The docs + npm package will be published automatically each day if there are changes, but if you want to publish changes immediately, you can trigger the `publish` workflow.

Option 1: In the Github UI, manually dispatch the [`publish` workflow](https://github.com/lichess-org/api/actions/workflows/publish.yml)

Option 2: From the command line:

```shell
gh workflow run publish
```
