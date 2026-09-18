# Fluento — Audit & Implementation Plan

> Generated from a full codebase review (API, web, mobile, AI gateway, migrations, docker).
> Use the checkboxes to track progress. Re-run this review after each phase to catch regressions.

---

## How to use this doc

- Work top to bottom — Phase A items actively corrupt data or fake core functionality, so they come first regardless of effort.
- Each item lists the file(s) involved so it's easy to jump straight to the fix.
- Check a box when the fix is merged **and** covered by at least a manual test (unit test where feasible).

---

## 🔴 Critical bugs (functional correctness)

- [ ] **AI persona's real reply is never shown — chat UI fakes it**
      `CallsService.addConversationTurn` (apps/api/src/modules/calls/calls.service.ts) already fetches the real LLM reply and saves it to `conversation_history`, but never returns it. Both `apps/web/.../calls/[id]/room/page.tsx` and `apps/mobile/.../calls/[id]/room.tsx` ignore this and `setTimeout` + post a **second, hardcoded canned reply** instead. Result: two assistant turns saved per user turn (one real & discarded, one fake & shown), and the "AI call" is actually scripted.
      **Fix:** `addConversationTurn` should return the generated reply (or the full turn object); controller returns it; frontend renders whatever comes back instead of generating its own text; delete the `setTimeout` canned-response blocks entirely.

- [ ] **STT/TTS pipeline (Whisper/Piper) is entirely dead code**
      `docker/ai-server/main.py` implements `/stt/transcribe` and `/tts/synthesize`. Nothing in web or mobile ever calls them — both use `webkitSpeechRecognition` instead, with no polyfill/fallback (`alert()` on unsupported browsers) and **no audio playback of the persona's voice at all**.
      **Fix:** wire an actual "record → POST /stt/transcribe → send transcript to /calls/:id/turns → POST reply to /tts/synthesize → play audio" pipeline, OR explicitly drop Whisper/Piper from the architecture and docs and ship as a text/Web-Speech-only product for now.

- [ ] **Mobile push notifications are permanently broken**
      `apps/mobile/src/app/_layout.tsx` calls `registerPushToken(`push*token*${Math.random()...}`, 'android')` — a **fake random string**, not a real Expo push token.
      **Fix:** replace with `Notifications.getExpoPushTokenAsync()` from `expo-notifications`, request permissions first, register the real token.

- [ ] **Image-study recommendation is permanently stubbed to `null`**
      `ProgressService.getRecommendation` (apps/api/src/modules/progress/progress.service.ts) returns `null` whenever weakest skill is `observation`/`expressiveness`, with a comment saying it's "returned from image module in Phase 8" — but `ImagesModule` is never imported into `ProgressModule`.
      **Fix:** import `ImagesModule` into `ProgressModule`, call `ImagesService.getRandomChallenge()` in that branch.

- [ ] **No token refresh anywhere**
      `authApi.refresh()` exists but is never invoked on web or mobile. Web's auth cookie expires on a fixed 7-day timer independent of the actual Supabase JWT lifetime, so middleware can pass an already-dead token through to a page that then fails ungracefully.
      **Fix:** add a 401-response interceptor (axios on web, equivalent on mobile) that calls `/auth/refresh` with the stored refresh token and retries the original request once; only hard-logout if refresh also fails.

- [ ] **Client can spoof `role: "assistant"` in call turns**
      `AddCallTurnSchema` (packages/shared/src/schemas/index.ts) accepts `role: z.enum(['user', 'assistant'])` from the client, and `CallsService.addConversationTurn` trusts it. Anyone can inject fake assistant messages into their own call history via `POST /calls/:id/turns`.
      **Fix:** change schema to `role: z.literal('user')`; assistant turns are only ever appended server-side from the LLM response.

- [ ] **"Random" topic/image selection isn't actually random**
      `TopicsService.getRandomExercise` / `ImagesService.getRandomChallenge` do `.limit(20)` with **no `ORDER BY`**, then `Math.random()` over that result set. Once tables exceed 20 rows, most content becomes practically unreachable.
      **Fix:** use `ORDER BY random()` for small-to-medium tables, or a `TABLESAMPLE`/keyset-based approach if these tables are expected to grow large.

- [ ] **No existence check before evaluating a submission**
      `ChallengesService.submitImageStudy` / `submitThoughtExercise` fetch by `imageId`/`topicId` via `findOne` but never check for `null` before proceeding — a bogus ID still produces a "valid" session report and rolling score update.
      **Fix:** throw `NotFoundException` if the fetched image/topic is `null`.

---

## 🟠 Security gaps

- [ ] No rate limiting on `/auth/login`, `/auth/register`, or challenge-submission endpoints — add `@nestjs/throttler` or Fastify rate-limit plugin.
- [ ] No `@fastify/helmet` (or equivalent) — missing CSP/HSTS/clickjacking headers in `apps/api/src/main.ts`.
- [ ] `AuthService.register` forces `email_confirm: true` (apps/api/src/modules/auth/auth.service.ts) — bypasses email verification entirely; anyone can register with an email address they don't control.
- [ ] Push tokens are never deleted on logout — no `DELETE /notifications/push-token` endpoint exists. Add one and call it from both platforms' logout flows.
- [ ] Mixed/duplicated auth storage on web: a non-httpOnly cookie **and** localStorage both hold the token (`apps/web/src/lib/stores/auth.store.ts`, `middleware.ts`). Pick one source of truth; move to httpOnly cookie set server-side if possible to reduce XSS blast radius.
- [ ] Admin check (`admin.guard.ts`) relies on `user_metadata.role`/`is_admin` OR a static `ADMIN_EMAILS` env var, with no endpoint to manage the former — document this clearly or add an admin-management flow.

---

## 🟡 Data-integrity / architecture issues

- [ ] **No DB transactions around multi-write flows.** `endCall`, `submitImageStudy`, `submitThoughtExercise` each do 3–5 sequential writes (report insert → rolling score update → score_history insert → streak update → activity log). A mid-sequence failure leaves inconsistent state.
      **Fix:** move this logic into a single Postgres RPC function per flow, called from the service, so it's atomic.
- [ ] **Streak math uses server time, not user timezone.** `StreaksService.recordActivity` / `getStreakCalendar` use `new Date()` without any per-user timezone — midnight-boundary edge cases can break or double-count streaks. No timezone field exists in the schema at all yet.
- [ ] **`updateRollingScores` has a read-then-write race.** Two near-simultaneous session completions can clobber one update. Add a `SELECT ... FOR UPDATE` or a Postgres advisory lock, or better, do the update as a single atomic SQL `UPDATE ... SET fluency = fluency*0.8 + $1*0.2` instead of read-in-app-then-write.
- [ ] **`confidence` score is computed but never persisted.** `EvaluationService.baseScores` for `voice_call` includes `confidence`, but `CallsService.endCall` only rolls `fluency`/`grammar`/`vocabulary` into `user_scores`. Either persist it (schema change) or document that it's session-report-only intentionally.
- [ ] **LLM JSON parsing is fragile.** `EvaluationService.evaluate` does `JSON.parse(json.response)` in a bare try/catch with no stripping of ` ```json ` code fences, which is how most chat models actually respond — likely silently falling back to the deterministic evaluator most of the time in practice.
- [ ] **Deterministic fallback ignores actual input.** `baseScores()` returns fixed numbers regardless of response length/quality, contradicting `ApiExplaination.md`'s description of it as length/type-aware. Either implement the length-aware heuristic or correct the docs.

---

## 🟢 Missing / incomplete features

- [ ] **Forgot-password flow doesn't exist.** Login page links to `/forgot-password` and `middleware.ts` whitelists it, but there's no page, no backend endpoint, and no `supabase.auth.resetPasswordForEmail()` call anywhere.
- [ ] **Image upload is unimplemented.** `AdminService.createImage` has a comment admitting it: "Full image upload + vision processing implemented in Phase 12" — currently only accepts a raw URL string; no Supabase Storage upload, no AI-generated `ImageMetadata` despite the schema being built for exactly that.
- [ ] **No account/profile settings screen** on either platform (change name/email/password).
- [ ] **No push-notification preferences UI** (opt out of specific notification types).
- [ ] **No pagination anywhere** — session history capped at 10 (`getRecentSessions`), journal page filters client-side over that same fixed 10.
- [ ] **`cancelled` call status is dead code.** Defined in `CallStatus` type but no code path ever sets it — only `missed` exists (via decline or auto-timeout).
- [ ] **No production Dockerfiles** for `apps/api` or `apps/web` — only the Python AI server + Ollama are containerized. Matches your own `PROJECT_CURRENT_STATUS.md` marking Phase 15 (Deployment) at 0%.
- [ ] **No Ollama model pull step** documented or scripted — following the README as-written, `docker-compose up` starts an empty Ollama container; `qwen3:8b` must be pulled manually or every LLM call silently falls back to canned responses.
- [ ] **No healthchecks in `docker-compose.yml`** — `ai-server`'s `depends_on: - ollama` only waits for the container to start, not for Ollama to actually be serving requests, causing race-condition failures on first boot.

---

## 🔵 Smaller correctness / UX issues

- [ ] Hardcoded "demo content" fallbacks (image-study / thought-exercise) are shown to the user with **no indication it isn't real backend data** — could mislead someone debugging a failed submission.
- [ ] `next.config.ts` configures `images.remotePatterns` for Supabase Storage, but every image tag in the app is a raw `<img>` (eslint-disabled) — the Next.js image-optimization config is unused.
- [ ] Onboarding goal/skill-level option lists are duplicated verbatim between web and mobile instead of living in `@fluento/shared`.
- [ ] `ImageChallenge['modeConfig']` isn't a proper discriminated union keyed by `mode` — forces manual `'in'` type-guards on the frontend instead of type-safe narrowing.
- [ ] `PIPER_URL` env var in `docker-compose.yml` is never actually read by any service — vestigial config to clean up (or wire up per the STT/TTS fix above).

---

## Phased Implementation Plan

### Phase A — Stop the bleeding (~1–2 days)

- [ ] Fix double-AI-turn bug: return real LLM reply from `addConversationTurn`, render it on both frontends, delete canned-response `setTimeout` blocks
- [ ] Fix mobile push token registration to use real `expo-notifications` tokens
- [ ] Restrict `AddCallTurnSchema` to `role: z.literal('user')`
- [ ] Add `ORDER BY random()` (or equivalent) to topic/image selection queries
- [ ] Add 404 checks before evaluating submissions with missing `imageId`/`topicId`

### Phase B — Auth & session robustness (~2–3 days)

- [ ] Implement token-refresh interceptor (web + mobile)
- [ ] Align web cookie expiry with actual JWT lifetime; consolidate to one auth-state source of truth
- [ ] Build forgot-password flow (backend endpoints + missing page + Supabase call)
- [ ] Add `DELETE /notifications/push-token` endpoint, call on logout (both platforms)
- [ ] Add rate limiting on `/auth/*` and evaluation-submission endpoints
- [ ] Add `@fastify/helmet`

### Phase C — Data integrity (~2–4 days)

- [ ] Wrap `endCall` / `submitImageStudy` / `submitThoughtExercise` writes in atomic Postgres RPC functions
- [ ] Persist `confidence` (and consider `clarity`/`argumentStrength`) into rolling scores, or document why they stay session-only
- [ ] Fix `EvaluationService.baseScores` to vary with input; strip markdown fences before `JSON.parse` on LLM responses
- [ ] Wire `ImagesModule` into `ProgressModule` for image-study recommendations
- [ ] Add locking/atomic update to `updateRollingScores`

### Phase D — Feature completion (~1–2 weeks)

- [ ] Real STT/TTS integration end-to-end (or formally retire Whisper/Piper from the architecture)
- [ ] Image upload to Supabase Storage + AI vision call to populate `ImageMetadata`
- [ ] Profile/settings screens (name, email, password, notification prefs)
- [ ] Pagination for session history / activity log
- [ ] Genuine `cancelled` call-status flow, distinct from `missed`

### Phase E — Deployment readiness (~3–5 days)

- [ ] Production Dockerfiles for `apps/api` and `apps/web`
- [ ] `docker-compose` healthchecks + automated Ollama model pull on first boot
- [ ] CI pipeline (lint/type-check/test on PR, build on merge)
- [ ] Structured logging/monitoring for the notification cron; distributed lock if ever running >1 API instance
