# Lichess.org API Types

## Installation

```bash
npm install @lichess-org/types
```

## Usage

```typescript
import { components } from "@lichess-org/types";

type LichessGame = components["schemas"]["GameJson"];
```

## For Maintainers

To regenerate:

```bash
pnpm gen
pnpm format
```

To publish:

```bash
npm version patch --no-git-tag-version
npm publish
```
