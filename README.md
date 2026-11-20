# reveal-fe

Installable PWA for Reveal. Vite + React + TypeScript. See `CLAUDE.md` for conventions.

## Run locally

```bash
pnpm install
pnpm dev            # http://localhost:5173 (expects reveal-be on :8000)
```

## Check

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Push notifications and offline only work in a production build: `pnpm build && pnpm preview`.
