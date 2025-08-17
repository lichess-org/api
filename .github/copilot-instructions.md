# Lichess.org API Repository - Copilot Instructions

## Repository Overview

This repository contains the **Lichess.org API documentation, TypeScript types, and example implementations**. Lichess is a free/libre, open-source chess server powered by volunteers and donations. The repository serves as the authoritative source for API documentation, generates TypeScript types for developers, and provides comprehensive OAuth examples.

This repository documents HTTP endpoints that are implemented on [lila, the Lichess server](https://github.com/lichess-org/lila). Documentation can be inferred from the lila source code.

**Repository Characteristics:**

- **Size**: ~239MB (primarily due to generated documentation assets)
- **Main Language**: YAML (OpenAPI specifications), TypeScript, JavaScript
- **Architecture**: Monorepo with 3 main workspaces using pnpm
- **Purpose**: API documentation, type generation, and developer examples
- **Target**: Chess application developers and API consumers

## Project Structure

The repository is organized into three main workspaces:

### 1. `/doc/` - API Documentation (208MB)

Contains the core OpenAPI specification and documentation build system.

**Key Files:**

- `specs/lichess-api.yaml` - Main OpenAPI 3.1 spec (787 lines)
- `specs/examples/` - Auto-generated API response examples (614 YAML files)
- `package.json` - Documentation build dependencies
- `redocly.yaml` - Redocly configuration for doc generation
- `spectral.yaml` - OpenAPI linting rules
- `.prettierrc.json` - Code formatting configuration

### 2. `/types/` - TypeScript Definitions (28MB)

Generates and publishes TypeScript types from the OpenAPI specification.

**Key Files:**

- `package.json` - Type generation dependencies
- `lichess-api.d.ts` - Generated TypeScript definitions (auto-generated)
- Published to npm as `@lichess-org/types`

### 3. `/scripts/update-examples/` - Example Generation (2.8MB)

TypeScript scripts that call live Lichess API endpoints to generate response examples.

**Key Files:**

- `config.ts` - Shared API client configuration
- `*.ts` - Individual endpoint example generators
- Generated examples are saved to `/doc/specs/examples/`

### 4. `/example/` - OAuth Examples (236KB)

Complete working examples of different OAuth authentication patterns:

- `oauth-personal-token/` - Personal token authentication
- `oauth-backend/` - Server-side OAuth flow
- `oauth-app/` - Client-side OAuth flow
- `oauth-demo/` - Demo application making use of a few authenticated endpoints

## Build and Development Instructions

### Prerequisites

- **Node.js**: Version 22 (specified in CI)
- **pnpm**: Version 10.12.1+ (critical - do not use npm or yarn)

### Installation

**ALWAYS install pnpm first before any other commands:**

```bash
npm install -g pnpm@10.12.1
```

### Documentation Workflow (Primary)

**Working Directory:** Always run these commands from `/doc/` directory:

```bash
cd doc
pnpm install  # Takes ~55 seconds, installs 422 packages
```

**Core Development Commands:**

```bash
# Lint OpenAPI specification (ALWAYS run before committing)
pnpm spectral  # Spectral OpenAPI linting
pnpm lint      # Redocly OpenAPI linting

# Format code (ALWAYS run before committing)
pnpm check-format  # Check formatting
pnpm format        # Fix formatting

# Build documentation
pnpm build    # Generate HTML docs (~3ms)
pnpm bundle   # Generate openapi.yaml bundle
pnpm serve    # Development server on http://localhost:8089
```

**Validation Sequence (CRITICAL):**
Always run this sequence before making changes:

```bash
cd doc && pnpm install && pnpm spectral && pnpm lint && pnpm check-format
```

### TypeScript Types Workflow

**Working Directory:** `/types/` directory:

```bash
cd types
pnpm install  # Takes ~2 seconds, installs 34 packages

# Generate types from OpenAPI spec
pnpm gen      # Takes ~783ms, generates lichess-api.d.ts

# Format generated types
pnpm format
```

### Example Scripts Workflow

**Working Directory:** `/scripts/update-examples/` directory:

```bash
cd scripts/update-examples
pnpm install  # Takes ~1 second, installs 5 packages

# Run individual example generators
pnpx tsx account.ts
pnpx tsx broadcasts.ts
# ... other script files
```

## GitHub Actions / CI Pipeline

The repository uses GitHub Actions with these workflows:

### 1. Lint Workflow (`.github/workflows/lint.yml`)

**Triggers:** Every push and pull request
**Working Directory:** `doc/`
**Commands:**

```bash
pnpm install
pnpm spectral
pnpm lint
pnpm check-format
```

**Duration:** ~1-2 minutes

### 2. Publish Workflow (`.github/workflows/publish.yml`)

**Triggers:** Daily cron (10 AM UTC) and manual dispatch
**Publishes:** TypeScript types to npm and documentation to GitHub Pages
**Process:**

1. Generate new types from latest spec
2. Auto-increment version if changes detected
3. Publish to npm with provenance
4. Build and deploy docs to GitHub Pages

## Configuration Files Reference

### Redocly Configuration (`doc/redocly.yaml`)

```yaml
theme:
  openapi:
    htmlTemplate: ./template.hbs
extends:
  - recommended-strict
rules:
  operation-4xx-response: off
  no-ambiguous-paths: off
```

### Spectral Configuration (`doc/spectral.yaml`)

```yaml
extends: spectral:oas
formats: [oas3.1]
```

### Prettier Configuration (`doc/.prettierrc.json`)

```json
{
  "printWidth": 120
}
```

## Common Development Patterns

### Document a new endpoint

1. Look for the endpoint implementation in [lila](https://github.com/lichess-org/lila). Use the [routes file](https://github.com/lichess-org/lila/blob/master/conf/routes) to identify the controller, then the implementation details.
2. Find the code that produces the response and infer the response structure.
3. If the endpoint is GET, try to use it on lichess.org to get response examples.
4. Follow the next point "Making Changes to API Specification" to document the endpoint in `doc/specs/lichess-api.yaml`.

### Making Changes to API Specification

1. **Always start in `/doc/` directory**
2. **Always run validation first:** `pnpm spectral && pnpm lint && pnpm check-format`
3. **Edit:** `doc/specs/lichess-api.yaml`
4. **Test locally:** `pnpm serve` (view at http://localhost:8089)
5. **Validate changes:** `pnpm spectral && pnpm lint && pnpm check-format`
6. **Format:** `pnpm format`
7. **Build:** `pnpm build`

### Adding New API Examples

1. **Edit:** Appropriate script in `/scripts/update-examples/`
2. **Run script:** `cd scripts/update-examples && pnpx tsx scriptname.ts`
3. **Generated examples** appear in `/doc/specs/examples/`
4. **Format:** `cd doc && pnpm format`

### Updating TypeScript Types

1. **After OpenAPI spec changes:** `cd types && pnpm gen`
2. **Format:** `pnpm format`
3. **Types are auto-published** via GitHub Actions

## Critical Timing Information

**Command Durations (for timeout planning):**

- `pnpm install` (doc): ~55 seconds first time, ~700ms subsequent
- `pnpm install` (types): ~2 seconds first time, ~500ms subsequent
- `pnpm install` (scripts): ~1 second first time, ~450ms subsequent
- `pnpm gen`: ~783ms
- `pnpm build`: ~3ms
- `pnpm spectral`: <1 second
- `pnpm lint`: ~1 second
- **Full validation sequence**: ~3-4 seconds after initial install

## File Size and Scope Awareness

- **Main OpenAPI spec**: 787 lines (`doc/specs/lichess-api.yaml`)
- **Total YAML files**: 614 (mostly auto-generated examples)
- **Repository size**: 239MB (primarily node_modules in doc/)
- **When making changes**: Focus on core spec files, not generated content

## Common Issues and Solutions

### Build Failures

1. **Missing pnpm**: Install with `npm install -g pnpm@10.12.1`
2. **Wrong directory**: Always run commands from correct workspace directory
3. **Dependencies out of sync**: Run `pnpm install` in affected workspace
4. **Build scripts warning**: Ignore "Ignored build scripts: core-js, protobufjs" warning - this is expected

### Linting Failures

1. **OpenAPI validation**: Check `pnpm spectral` and `pnpm lint` output
2. **Format issues**: Run `pnpm format` to auto-fix
3. **Check CLI output**: Both tools provide detailed error locations

### Example Generation Issues

1. **API connection**: Most scripts require live Lichess API access or local dev server
2. **Authentication**: Some scripts need local Lichess instance running on localhost:8080
3. **Check script logs**: Scripts output detailed connection information
4. **Network failures**: Some example scripts may fail if external APIs are down

## Dependencies Not Obvious from Structure

- **OpenAPI specification** drives everything - types, docs, examples
- **Generated files** should not be manually edited (lichess-api.d.ts, examples/)
- **pnpm workspaces** create interdependencies between packages
- **Live API calls** are required for example generation
- **GitHub Actions** auto-publish and deploy, requiring secrets for npm and pages

## Agent Instructions

**Trust these instructions** and only search for additional information if:

1. Commands fail with errors not covered here
2. New functionality needs to be added
3. These instructions appear outdated or incorrect

**Always:**

1. Start with the validation sequence: `cd doc && pnpm install && pnpm spectral && pnpm lint && pnpm check-format`
2. Use the correct working directory for each command
3. Run `pnpm format` before committing changes
4. Test builds with `pnpm build` after making changes
5. Focus changes on source files, not generated content

**Never:**

1. Use npm or yarn instead of pnpm
2. Edit generated files manually (lichess-api.d.ts, examples/\*.yaml)
3. Skip linting and format checks
4. Make changes without testing locally first

