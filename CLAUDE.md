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
  app/          routes, providers, router, app shell with the 4 tabs (Drop, Likes, Chats, You)
                routes: `/` = public waitlist (pre-launch), `/app/*` = the app
  features/     now: waitlist (copy its shape: api → hook → screen → form/view), auth,
                     admin, profile, tonight (drop + Likes list), chats (list, chat, safety, swaps), settings,
                     guess (guessing someone's cards: GuessGame, slotted into tonight; the chat has its own inline panel),
                     hide (hide list at /app/you/hidden), blocks (blocked list at /app/you/blocked),
                     notifications (push switch, 9 PM nudge, install steps)
    <feature>/  api/  components/  hooks/  types/  (only what it needs)
  components/   shared UI (Button, Sheet, CardStrip, Toggle, ListRow/ListCard for grouped rows)
  lib/          api client, query client, push.ts (feature detection, subscribe), pwa.ts (install prompt, standalone, iOS, in-app browsers)
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

- Look = **Daylight editorial** from the "Reveal app mockup" canvas, as CSS variables in `src/index.css`, mapped into Tailwind. Don't use raw hex in components.
  - **Daylight editorial** (the app's theme): paper bg `#F3ECE3`, surface `#FBF8F3`, ink text `#1E1A16`, muted `#6B6057`, terracotta accent `#B4532C` (small text uses `accent-text` `#A14522`), marigold locked `#9A5B00` on `#FFF0D6`, forest open `#2F6B47`, warn `#A14A2A`. Brand panels: `forest` `#1F3A2D` (countdown, my chat bubbles), `night` `#14110F` (sealed photo, waitlist form), `peach` `#F7B48C` (highlights on dark panels).
  - **Editorial night** under `[data-theme='editorial-night']` is the same look on a dark panel. The waitlist's sign-up panel and the contact card editor set it.
- Accent is only for the one committing action on a screen (Swap, Send, Continue). Everything else is neutral.
- Fonts: Instrument Serif for headings, nicknames and the users' written lines (answers in italic); DM Sans for everything else. Instrument Serif has one weight: use `font-normal` with `font-display`, never bold (the page turns off faked bold).
- Secondary buttons inside a section are ink pills (`bg-text text-bg`); main actions are 54px pills.
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
- `notifications/hooks/usePush` reduces everything to one `PushState` (disabled when the server has no VAPID key, unavailable, install, denied, off, on). The You tab's `NotificationsCard` and Tonight's `DropReminder` (once caught up, dismissible) render from it. An existing subscription is re-sent once per visit so a shared phone follows whoever is signed in.
- Push payloads come from the server as `{title, body, url, tag}`; `sw.ts` shows them with the tag (one per chat) and focuses an open window on tap.
- Hide list (`features/hide`): phone, email or Instagram, plus the Contact Picker where the browser has one (Android Chrome). The list shows only the server's masked hints.

## Conventions

- Components are small and do one thing. A component that fetches does not also lay out a page; split container and view when it grows.
- Accessible by default: real `<button>`, `<a>`, `<label>`; `aria-label` on icon-only buttons; no `onClick` on `div`.
- Every query screen handles loading, empty and error states; empty states tell the user what to do next.
- No `any`. No non-null `!` to silence the compiler; handle the case.
- Env only via `src/config/env.ts` (validated with zod). No secrets in the frontend.
- **Auth:** Google's button (`GoogleSignInButton`) hands an ID token to `POST /v1/auth/google`; the returned session token lives in localStorage (`src/lib/auth/token.ts`) and the API client adds `Authorization: Bearer` itself. Bearer, not cookies: the API is cross-site and iOS Safari blocks those cookies. The signed-in account is the `useMe` query (null = signed out); `/app/*` sits behind `RequireAuth` and then `RequireVerified`, which sends students who haven't verified yet to `/verify` (college Google account via `POST /v1/auth/college-email`, or ID card + selfie at `/verify/id-card` → waiting screen `/verify/pending`, or ask an admin to let them in). Verified students then fill the six profile screens at `/profile/setup/:step` (basics, prompts, guesses, cards, preferences, photo) (`RequireProfile` sends them to the first unfinished one, never to photo, which is optional; choices come from `GET /v1/profile/options`). Every onboarding screen shows the shared `StepProgress` ("Step n of 7": verification is step 1, setup is 2 to 7). Admins get `/admin` (behind `RequireAdmin`): ID check queue with photos fetched as blobs through the API, approve/reject with a reason, let someone in by email, and the decision log. Photos are shrunk and re-encoded on the phone (`src/utils/compressImage.ts`), which also strips GPS data. In tests use `signInAs()` and `stubGoogleButton()` from `src/testing/auth.ts`.
- **Drop and likes** (`features/tonight`): the Drop tab (`/app/tonight`) shows one profile from `GET /v1/drops/tonight` at a time (`DropProfile`: photo, prompts, shown/hidden cards) with `GuessInvite` into the game; a heart on a prompt or the big Like opens Send like; Pass is one tap. Once caught up, `NextDrop` fills the screen (forest panel, Tonight/Tomorrow at 9, blurred stand-ins, timer, my interests via the `interests` slot = `app/MyInterests.tsx`, the drop reminder). Full-screen routes outside `AppShell`: `/app/tonight/:itemId` (`DropGuessScreen`, the guess game), `/app/tonight/:itemId/like` (`SendLikeScreen`: tabs for each guessed guess card and each prompt, optional 140-char line, `{guess_card_id | prompt_id, comment}`; a match goes straight to `/app/chats/{match_id}`), `/app/likes/:likeId` (`LikeGuessScreen`, "Guess first" on someone who liked me; Match likes back). The Likes tab (`/app/likes`, `?tab=sent` for Sent) lists received likes (Not for me = silent pass, Guess first, Match → chat) and sent likes (`GET /v1/likes/sent`, always "Waiting for them": a pass looks the same, never say otherwise; Take back = confirm then `DELETE /v1/likes/sent/{id}`). The tab bar counts waiting received likes from `useLikes`, so tests get an empty `GET /v1/likes` by default (`src/testing/server.ts`). Everyone has the same layout (looking for shown, the rest hidden). In tests use `mockDrop(items, { hintUsed })`, `mockLikes()`, `mockSentLikes()`, `sampleLike()`, `sampleSent()` and the sample profiles in `src/testing/drops.ts`.
- **Guess cards** (`features/guess`): everyone writes 3 (setup, `GuessesForm`, one card at a time with a fixed kind per slot, all three saved together by one `PUT /v1/profile/me/guesses` from the last card; listed in the You tab by `GuessCardsSection`). In the drop and likes, others guess them in `GuessGame` (one card at a time: pick, Guess, true answer, Next card, then "N of 3 right"; one try per card, so no Try again), passed as the `game` render slot into `DropGuessScreen` and `LikeGuessScreen` from `routes.tsx`. Its hint (`POST /v1/guesses/{card_id}/hint`, one per person per night, tracked by the drop's `hint_used`) strikes the option the server returns; each card's `struck` shows it crossed out and disabled. Those screens update their own cache via `onGuessed`/`onHinted`/`onHintGone`/`onStale` (`hooks/useGuessed.ts`). The chat guesses one card at a time instead: tapping an unguessed guess tile opens `GuessPanel` docked above the message box (chats' own `guessCard` call, then the thread reloads so the answer and any new photo piece arrive); the swap request banner hides while it's open. Guessing never gates Pass, Like or Like back. When `has_blurred_photo`, the drop and likes show their photo from `GET /v1/drops/tonight/{item_id}/photo` / `GET /v1/likes/{like_id}/photo` as a blob, keyed by `right_guesses` so a right guess refetches it. Server field errors inside lists use `ApiError.fieldPaths` (`cards.1.options.2`).
- **You tab** (`settings/YouScreen`, slots filled in `routes.tsx`): `YouHeader` (64px own-photo avatar, nickname, "vibe · interests" line, Edit → basics, and the dark link to `/app/you/preview`), `GuessCardsSection` (question + "61% guess right" from `right_count/guessed_count`, "No guesses yet" at 0; never the answer), `SwapCardsSection` (one `ListRow` per swap card from `utils/myCards.ts`; branch/hometown open the cards setup step, photo/voice/contact open `/app/you/cards/:card` → `CardEditorScreen`), then Settings: `NotificationsCard` and one `ListCard` of hide, blocked and account rows. `/app/you/preview` (`ProfilePreviewScreen` → `DropPreview`) renders my own `MyProfile` the way the drop shows it, read-only, inside the profile feature (it must not import tonight). `/app/you/blocked` lists `GET /v1/blocks` (list only; there is no unblock).
- **Photo** (card 6): `PhotoSection` at `/app/you/cards/photo` and the last setup step (`PhotoStep`, with the `PhotoStages` preview: blurred in the drop, sharper after right guesses, pieces after swaps, whole once both say yes) share `usePhotoEditor`, which picks a photo, shrinks it on the phone (`compressImage`), uploads it to `PUT /v1/profile/me/photo` and shows it back from `GET /v1/profile/me/photo` as a blob (token-authenticated, so never a plain `<img src>`). Only the owner sees it; matches will get pieces through swaps.
- **Voice note** (card 5, optional): `VoiceRecorder` (wrapped by `VoiceSection` at `/app/you/cards/voice` and by the photo setup step) records with `useRecorder` (MediaRecorder; WebM/Opus or MP4/AAC on Safari, auto-stops at 30 s), previews, then uploads to `PUT /v1/profile/me/voice` and plays the saved note back as a blob. Handles mic denied and no-MediaRecorder browsers. In tests, fake `MediaRecorder` and `navigator.mediaDevices` (see `src/app/Voice.test.tsx`). The in-app browser pane blocks the microphone, so check real recording on a phone.
- **Swaps** (in `features/chats`, since every swap happens in a chat): `GET /v1/chats/{id}` carries `swaps` (each card's state, `asked_at`/`decided_at`, and open `photo_pieces`). `CardStrip` under the chat header is a row of two-line tiles (small-caps kicker over value or what to do): their 3 guess cards (✓ when guessed right, the answer once guessed, "Guess it →" before), then each swap card (open = value, can_ask = hatched "Ask to swap", they_asked/you_asked = accent outline, locked/needs = lock), ending in the dark **Finale · Full picture →** tile for the photo. Asking goes through `SwapSheet` (both outcomes, Not yet / Swap); my own pending request opens `SwapSheet` in withdraw mode ("Changed my mind" → `DELETE /v1/chats/{id}/swaps/{card}`). Their request shows as `SwapRequest` above the message box. Opened swaps appear in the timeline ("You swapped hometowns · Mira is from Dehradun"), merged with messages by `decided_at` under day separators (`utils/timeline.ts`). The Finale tile opens `FullPictureSheet` (my photo via the `me` slot from the profile feature's `MyPhotoAvatar`, their pieces, who's ready; "I'm ready" shows a second confirm with both outcomes before it asks or accepts; "Changed my mind" withdraws; locked/needs states explain why not yet). When the photo swap opens, `Revealed` (full-bleed photo, no-save layer, what it took, chips, contact card with "Swap contact" through `SwapSheet`) shows once per match per phone (`useRevealedOnce`, localStorage `reveal:revealed:{matchId}`), then only from the Finale tile. Their photo comes from `GET /v1/chats/{id}/photo` already cut by the server (query key includes the open pieces, so a new piece refetches); `TheirPhoto` hatches closed cells and blocks drag/long-press. Voice plays from `GET /v1/chats/{id}/voice`. Polling the thread is how the other side's answers arrive. In tests use `freshBoard` / `mockThread(messages, overrides)` from `src/testing/chats.ts`.
- **Contact card** (card 7): `ContactSection` at `/app/you/cards/contact` adds, changes or removes an Instagram handle or phone via `PUT/DELETE /v1/profile/me/contact`. Optional; the server cleans the value and returns it only in `MyProfile.contact`. Opens to a match only through the last swap (part 4).
- **Chat** (`features/chats`): the Chats tab lists live matches (`GET /v1/chats`, polled every 15 s): matches with no messages yet in a **New matches** row, the rest under **Talking** with a pip bar ("4 of 7 open" from the pair's `shown_cards`/`hidden_cards`), a waiting swap (`pending_swap`) in place of the last message, and a small "3/9" tag from `photo_pieces` (no photo in lists). Rows and the chat header use their first name once open ("N of M cards open · was {nickname}"); `/app/chats/:matchId` is a full-screen chat outside `AppShell` that polls `GET /v1/chats/{id}` every 3 s (stops on error, e.g. the chat ended) and marks their latest message read. Either person can write first; there's no timer (product decision, don't add one). The shield button opens `SafetySheet`: Report (reason + optional details, also blocks), Block, Unmatch, each with a "Not yet" confirm; all end the chat for both and land back on Chats with a status line. Admins see reports in the Reports tab. Card labels shared by the drop and chat live in `src/utils/cardLabels.ts`. In tests use `src/testing/chats.ts`.

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
