# Contributing to protoimsg

Thanks for your interest in contributing! protoimsg is AIM-inspired group chat built on the AT Protocol, and we welcome contributions of all kinds.

## Prerequisites

- Node.js 22+
- [pnpm](https://pnpm.io/) 9+
- Docker (for Postgres, and optionally Redis + translation backends)

## Setup

```bash
git clone https://github.com/grisha/protoimsg.git
cd protoimsg
pnpm install

# Start core services (Postgres + Redis)
docker compose up -d postgres redis --wait

# Configure and migrate
cp packages/server/.env.example packages/server/.env
pnpm --filter @protoimsg/server db:migrate

# Optional: seed dev DB with sample rooms and messages
pnpm --filter @protoimsg/server db:seed

# Run dev servers
pnpm dev
```

Server runs on `http://localhost:3000`, web app on `http://localhost:5173`.

> **Shortcut:** `pnpm dev:up` starts all Docker services (including translation backends), runs migrations, and launches dev servers in one command. See the Translation section below if you need the full stack.

## Project Structure

```
packages/
  shared/    # @protoimsg/shared — types + constants
  lexicon/   # @protoimsg/lexicon — ATProto Lexicon schemas + codegen
  server/    # @protoimsg/server — Express + WebSocket + Jetstream consumer
  ui/        # @protoimsg/ui — CSS Modules design system
  web/       # @protoimsg/web — React frontend
  desktop/   # @protoimsg/desktop — Tauri desktop wrapper
```

## Development Workflow

1. **Branch from `staging`** — use descriptive branch names (`fix/presence-visibility`, `feat/poll-ui`).
2. **Make your changes** — see style guidelines below.
3. **Validate** before pushing:
   ```bash
   pnpm lint          # ESLint (strict TS)
   pnpm typecheck     # TypeScript
   pnpm test          # Vitest
   pnpm build         # Full build
   ```
4. **Open a PR** against `staging`. CI runs lint, typecheck, build, lexicon validation, and tests. Merges to `main` are done via release cuts.

## Commit Messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

```
feat(server): add poll vote counting
fix(web): prevent stale closure in buddy list
chore(ci): add format check to pipeline
```

Common prefixes: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `style`.

## Code Style

### TypeScript

- Strict mode, no `any`
- ESM modules throughout
- Express routers use factory functions
- DB queries use postgres.js tagged templates (no ORM, no raw SQL strings)

### CSS

- **CSS Modules only** — no Tailwind in TSX, no inline style objects for layout
- **Always use design tokens** — never hardcode `px`, `rem`, hex colors, or `rgb()` values
- Tokens live in `packages/ui/src/tokens/index.css` (`var(--cm-*)`, `var(--color-*)`)
- If a token doesn't exist for the value you need, add it to the tokens file first

### ATProto / Lexicon

- Lexicon schemas are in `packages/lexicon/schemas/`
- After modifying schemas, run `pnpm --filter @protoimsg/lexicon codegen` to regenerate types
- `knownValues` fields are open sets — don't use strict enums for these in firehose validation
- Reference [Bluesky](https://github.com/bluesky-social) and [Blacksky](https://github.com/blacksky-algorithms/blacksky.community) for ATProto conventions

## Translation

Translation is optional for most development work. The system uses two backends:

- **LibreTranslate** — handles standard languages (en, es, ru, ar, etc.). Runs on port `5100`.
- **NLLB** (No Language Left Behind) — handles African languages (sw, ha). Runs on port `6060`.

Both backends are heavy containers. LibreTranslate downloads language models on first start (~1-2 min). NLLB downloads a ~3GB model on first start (~3 min). Skip them unless you're working on translation features.

### Running translation backends

```bash
# Start translation backends alongside core services
docker compose up -d postgres redis libretranslate nllb --wait

# Or start everything at once
docker compose up -d --wait
```

Then enable translation in your `.env`:

```env
TRANSLATE_ENABLED=true
LIBRETRANSLATE_URL=http://localhost:5100
NLLB_URL=http://localhost:6060
```

You can run either backend independently. If only `NLLB_URL` is set (no `LIBRETRANSLATE_URL`), NLLB handles all languages. If only `LIBRETRANSLATE_URL` is set, only the standard languages are available.

### Verifying it works

```bash
# Check both backends are healthy
docker compose ps

# Test the API
curl http://localhost:3000/api/translate/status
# → { "available": true, "languages": ["en","es","ru","ar",...,"sw","ha"] }
```

### Adding a new language

1. **Server:** If it's an NLLB-only language, add its ISO code to `NLLB_ONLY_CODES` in `packages/server/src/translate/lang-codes.ts`. Make sure the ISO-to-FLORES mapping exists in `ISO_TO_FLORES` and the franc detection mapping exists in `ISO3_TO_ISO1`.
2. **Locale files:** Create `packages/web/public/locales/<code>/` with all 8 namespace JSON files (common, auth, chat, dm, feed, rooms, settings, atproto). Match every key from the English locale. All translations must be reviewed by a native speaker before merging.
3. **Frontend:** Add the code to `supportedLngs` in `packages/web/src/i18n/index.ts` and add a `{ code, label }` entry to the `LANGUAGES` array in `packages/web/src/components/settings/LanguageSelector.tsx`.

### Architecture notes

- Both backends share the same `translation_cache` table in Postgres — no separate migration needed.
- Routing is by target language: codes in `NLLB_ONLY_CODES` go to NLLB, everything else goes to LibreTranslate.
- NLLB uses [franc-min](https://github.com/wooorm/franc) for source language detection and sends batch requests grouped by source language. LibreTranslate uses its built-in `source: "auto"` detection and sends sequential requests.

## Testing

```bash
pnpm test                                    # all tests
pnpm --filter @protoimsg/server test         # server only
```

Integration tests (`*.integration.test.ts`) require a running Postgres instance and are skipped in CI by default.

## Reporting Issues

Open an issue on GitHub. Include:

- What you expected vs what happened
- Steps to reproduce
- Browser/OS if it's a frontend issue

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
