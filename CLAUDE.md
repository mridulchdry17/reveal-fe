# Reveal frontend

Installable PWA for Reveal, a college-only dating app where profiles are 7 cards and hidden cards open only by mutual swap. No app stores: it ships as a website that students add to their home screen. The API lives in `../reveal-be`.

## Commands

```bash
pnpm install
pnpm dev                    # http://localhost:5173, expects API on :8000
pnpm test                   # Vitest, all
pnpm test src/features/swaps/components/SwapSheet.test.tsx   # one file
pnpm lint                   # ESLint, includes import boundary rules
pnpm typecheck              # tsc --noEmit
pnpm gen:api                # regenerate src/lib/api/schema.d.ts from the backend OpenAPI
pnpm build && pnpm preview  # production build; the service worker only runs here
```

A change is done when `lint`, `typecheck` and `test` pass. Show the output, not a summary.

## Stack (decided, don't swap without asking)

Vite 8 + React 19 + TypeScript 6 (strict), React Router 8, TanStack Query 5 for all server data, React Hook Form + zod 4 for forms, vite-plugin-pwa 2 in `injectManifest` mode (custom service worker `src/sw.ts` for push), Tailwind 4 with the design tokens below, Vitest + Testing Library, MSW 3 for API mocks, ESLint 10 + typescript-eslint + import-x, pnpm. API calls go through the typed `openapi-fetch` client in `src/lib/api/client.ts`; types come from `openapi-typescript`. Never hand-write a type the schema already defines. Import from `@/…` (maps to `src/`).

## Layout: by feature (bulletproof-react)

```
src/
  app/          routes, providers, router, app shell with the 3 tabs
                routes: `/` = public waitlist (pre-launch), `/app/*` = the app
  features/     now: waitlist (copy its shape: api → hook → screen → form/view), auth,
                     tonight, chats, settings
                planned: verification, onboarding, profile, swaps, guess, safety
    <feature>/  api/  components/  hooks/  types/  (only what it needs)
  components/   shared UI (Button, Sheet, CardStrip, Toggle)
  lib/          api client, query client, push, watermark-safe image
  hooks/  stores/  config/  utils/  testing/
  sw.ts         service worker
```

- Imports flow one way: shared → features → app. A feature never imports another feature; compose them in `app/`. Shared code never imports features. ESLint `import/no-restricted-paths` enforces this; don't disable it.
- No barrel `index.ts` files; import the file directly.
- Keep this tree in sync when you add a feature. Delete it from this file once the code makes it obvious.

## Layers inside a feature: each file has one job

The frontend's version of MVCS. Calls go one way only: **component → hook → api → backend**.

| Layer | Where | Does | Never does |
|---|---|---|---|
| API (service) | `features/<f>/api/*.ts` | One function per endpoint using the typed client; query keys in `api/keys.ts` | React, state, UI text, deciding what to show |
| Hooks (controller) | `features/<f>/hooks/*.ts` | Wrap queries/mutations (`useTonightDrop`, `useAcceptSwap`), derive view data, handle optimistic updates and cache invalidation | JSX, direct `fetch`, styling |
| Screen (container) | `features/<f>/components/*Screen.tsx` | Call hooks, handle loading / empty / error, pass plain props down | Fetch directly, hold API data in `useState` |
| Component (view) | `features/<f>/components/*.tsx`, `src/components/` | Render props, raise events (`onSwap`, `onPass`) | Call hooks that fetch, know about the API or routes |
| Route (app) | `src/app/routes/*` | Map URL to a screen, compose features | Business logic, styling |

- View components are pure: same props, same output. They're the easiest to test and reuse.
- Logic that decides something (can I propose a swap now? is this chat fading?) goes in a hook or `utils/`, not inline in JSX.
- `src/components/` is for UI with no product knowledge (Button, Sheet, Toggle, CardStrip). A component that knows what a "swap" is belongs to a feature.
- **Errors:** API functions throw `ApiError` via `toApiError` (`src/lib/api/errors.ts`). Forms put `error.fieldErrors` on their inputs with `setError`; everything else maps `error.code` to words in the feature's `utils/errorMessage.ts`. Never show the backend's `detail` text to users.
- **Validation:** client-side checks are only for instant feedback (required, email shape). The backend owns real rules like the enrollment-number format; show its field error instead of copying its regex.

## State: put each thing in the right place

- **Server data** (profiles, drop, chats, swaps): TanStack Query only. Never copy query results into `useState` or a store, never fetch in `useEffect`. Query keys live in each feature's `api/keys.ts`.
- **URL state** (current tab, open chat, sheet open): the router.
- **Form state:** React Hook Form + zod schema.
- **Local UI state:** `useState` in the component; lift only when a sibling needs it.
- **Global client state:** only theme and push permission. Add a Zustand store only if a third thing truly needs it.

## Product rules the UI must respect

1. The UI shows what the API returns and nothing more. Never fetch a hidden card and hide it with CSS; the server decides visibility.
2. Every reveal is a confirm step with both outcomes stated ("Both open at once. Can't be undone.") and two buttons: **Not yet** and **Swap**.
3. Card states look different by more than colour: shown = solid + label, hidden = hatched + dashed border, pending = accent outline, sealed (photo, contact) = lock icon.
4. Photos render only as pieces until the photo swap. No long-press save, no drag, no right-click save; the server watermarks per viewer.
5. Notifications never contain names, message text or photos. Copy is generic ("Tonight's drop is in.", "Someone turned a card.").
6. Report and block are reachable in one tap from every chat and profile.

## Design system

- Look = **Golden hour** from the "Reveal UI Mockups" canvas, as CSS variables in `src/index.css`, mapped into Tailwind. Don't use raw hex in components.
  - **Golden hour** (the only theme in use): chai cream bg `#F8F1E7`, milk surface `#FFFDF9`, plum ink text `#2A1E2E`, muted `#75636B`, Rani pink accent `#B8336A`, marigold locked `#9A5B00` on `#FFF0D6`, tulsi green open `#1D7558` (a shade darker than the mockup for contrast), warn `#A14A2A`.
  - **After 9** (dark) is defined under `[data-theme='ink']` but not used: day theme only, no automatic night switch.
- Accent is only for the one committing action on a screen (Swap, Send, Continue). Everything else is neutral.
- Fonts: Fraunces (serif) for headings and the users' written lines; DM Sans for everything else.
- Mobile first at 390px wide. Touch targets ≥ 44px. Text contrast ≥ 4.5:1 in both themes.
- Words in the UI: **Shown / Hidden / Swap / Not yet**. No jargon like "face-up", "unlock", "reveal request".
- Show, don't label: illustrate with realistic content (a real-looking line, "CSE · 2nd year", a voice pill), never abstract codes like "LINE" or "01". If a visual needs explaining, add a one-line key.
- Hidden things use the `hatch` utility + dashed `border-locked` (marigold); sealed things add `LockIcon`. Inputs use the `border-field` token (3:1 contrast). Errors are `text-accent-text` with `AlertIcon`, directly under the field.
- Never imply something is live before it is (no "drops tonight" before launch). Copy is honest about what exists.
- Motion: CSS only, ease-out, ≤ 600ms, one-time unless it's a tiny ambient hint; every animated class is listed in the `prefers-reduced-motion` block in `index.css`, and its base style is the final state.

## PWA and push

- Push only works on iOS 16.4+ after Add to Home Screen, so detect standalone mode and show the install guide first; ask for notification permission only after install, from a user tap.
- Detect in-app browsers (Instagram, WhatsApp) and show "Open in browser" before anything else.
- Feature-detect (`'PushManager' in window`), never sniff user agents for push.
- The service worker is only active in `pnpm build && pnpm preview`; test push and offline there.

## Conventions

- Components are small and do one thing. A component that fetches does not also lay out a page; split container and view when it grows.
- Accessible by default: real `<button>`, `<a>`, `<label>`; `aria-label` on icon-only buttons; no `onClick` on `div`.
- Every query screen handles loading, empty and error states; empty states tell the user what to do next.
- No `any`. No non-null `!` to silence the compiler; handle the case.
- Env only via `src/config/env.ts` (validated with zod). No secrets in the frontend.
- **Auth:** Google's button (`GoogleSignInButton`) hands an ID token to `POST /v1/auth/google`; the returned session token lives in localStorage (`src/lib/auth/token.ts`) and the API client adds `Authorization: Bearer` itself. Bearer, not cookies: the API is cross-site and iOS Safari blocks those cookies. The signed-in account is the `useMe` query (null = signed out); `/app/*` sits behind `RequireAuth` and then `RequireVerified`, which sends students who haven't verified yet to `/verify` (college Google account via `POST /v1/auth/college-email`; ID card and admin options come next). In tests use `signInAs()` and `stubGoogleButton()` from `src/testing/auth.ts`.

## How to work here

- **Branches:** `pre-release` is the default branch. Feature branches open PRs into `pre-release`, never `main`: every merge to `main` goes live on tryreveal.vercel.app. Check changes on the pre-release preview (https://reveal-fe-git-pre-release-mriduls-projects-87388405.vercel.app), which talks to the staging API (`…/staging`, database `reveal_staging`) via a Preview-only `VITE_API_URL` set in Vercel. Release = a PR from `pre-release` into `main`. Merge PRs with merge commits, never squash.
- Before changing more than one file, state the plan: files, what changes, how it will be tested. Wait if it touches a product rule above.
- Test behaviour the user sees (Testing Library queries by role and text), not implementation details. Mock the API with MSW, not by mocking hooks.
- Small diffs. Keep a refactor and a behaviour change in separate commits.
- **DRY means one place per piece of knowledge.** Card-state styling, theme tokens and query keys each live in one place. Similar-looking JSX across two screens is fine; extract on the third repeat.
- **KISS / YAGNI:** no generic component framework, no state library "for later", no abstraction for a second college. Build what the current screen needs.
- For UI changes, run `pnpm dev`, check the screen at 390px in both themes, and say what you checked.
- After the backend changes an endpoint, run `pnpm gen:api` and fix the type errors it shows instead of casting.

## Gotchas

- TypeScript is pinned to 6.x on purpose. TypeScript 7 (native compiler) has no JS API, which `openapi-typescript` and `typescript-eslint` need. Don't upgrade until both support it.
- MSW 3 renamed the listen option: `onUnhandledFrame`, not `onUnhandledRequest`. Unmocked requests fail the test.
- The API client looks up `fetch` per call so MSW can intercept it. Keep that line in `client.ts` or tests silently hit the real backend.
- ESLint builds one import-boundary zone per folder in `src/features/`, read from disk. A new feature is covered automatically.
- `pnpm gen:api` needs the backend running on :8000. Commit the regenerated `schema.d.ts`.
- The app icon is SVG only. iOS needs a 180×180 PNG `apple-touch-icon` before real users install it.
