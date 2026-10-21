# New-user onboarding — spec (2026-10-21, Opus plan → Sonnet build)

## Ask (Charlie)
"Create a full onboarding for new users so they make great profiles from the jump. Once they put in their email,
password, etc. it should walk them through customizing their profile."

## Goal
Every new account leaves onboarding with a passport that looks finished: name + username, a rolled mole, an archetype,
a short bio, a mark (signature), a passport style, and a few want-to-go places. It must feel like making a character in a
game — big, bold, quick, fun — and never feel like a form. Every step but "account" and "name" can be skipped.

## Route + trigger
- New route `/welcome/` (`source/welcome/index.html`, same head/header pattern as other pages; header shows but the nav is
  quiet; footer hidden). Code: `source/site/onboarding.mjs` + `source/site/onboarding.css` (prefix `ob-`).
- Trigger: when the sign-in gate (`site/gate.mjs`) "continue" succeeds and the viewer has NOT finished onboarding
  (`localStorage['deepspot-onboarded-v1']` missing), go to `/welcome/?from=<safe return path>` (use `safeReturn` in
  `profile/identity.mjs`). The header account button on any page also goes to `/welcome/` instead of the passport
  while onboarding is not finished. `?onboard=1` on any page = force-open for review; `/welcome/?reset=1` clears progress.
- Finishing writes `deepspot-onboarded-v1` = timestamp and lands on the passport `/profile/?user=preview&welcome=1`, which
  plays a one-time "passport issued" moment (stamp thunk + the card tilting in), then normal page.

## Data (prototype — no backend; same storage the passport already reads)
- Account draft: `site/account-state.mjs` (`accountKey`, `readAccount`, `normalizeAccount` — name, username, bio, style,
  mole, signatureArt …). Session: `site/gate-state.mjs` (`readSession/writeSession`, email only).
- PASSWORD: never stored or sent anywhere. The field is real for UX (show/hide, strength meter: length ≥ 10, mixed),
  but on submit it is discarded; small mono note "preview: accounts connect at launch — your password is not kept".
- Progress per step saved to `deepspot-onboarding-v1` ({step, data}) so a refresh resumes where they left off.
- Reuse, don't rebuild: mole roll = `openMoleReveal` from `site/mole/mole-reveal.mjs?v=rules1` (see `rollMole` in
  `profile/profile.js` for how its result is saved); signature pad = `padHTML/initPad` from `profile/sign-pad.mjs`;
  want-to-go = `profile/want-to-go.mjs` (`readWantToGo/writeWantToGo/addItem`) + the catalog search used by the passport;
  archetypes = `travelerStyles`/`travelerMark`/`travelerGroups` from `site/account-state.mjs`; passport style keys =
  `deepspot-passport-style-v1` (bg + foil, see `readStyle/customizeHTML` in profile.js) and bio look `LOOK_KEY`.
  The edit-profile dialog (built just before this, see EDIT-PROFILE-MODAL-SPEC.md and README) has the archetype picker,
  swatches and live passport preview — EXTRACT the shared pieces into a module (e.g. `profile/passport-edit.mjs`) and use
  it in both places rather than copying. Keep profile.js working.

## Screen design
One full-viewport stage. Left (desktop ≥1000px, ~42%): the LIVE PASSPORT — the real passport card (v11 look) that
builds up as you go: starts as a blank cream card with dashed placeholders, and each step fills its part with a small
"stamp" moment (name types in, mole pops into the photo, archetype stamp thunks onto the photo, mark draws on the
signature line, foil sweeps across). Right: the step. Phone: card shrinks into a sticky strip at the top (≈30% height)
that still updates, step below.
Top: a progress track of 8 notches with the step names (mono, small) + "step 3 of 8"; back (←) and "skip for now" text
buttons where allowed. Bottom: one big green primary button per step ("next" / step-specific verb), ≥60px, Enter submits.
Step headings: site display style, lowercase, period, 56–80px desktop, two-tone (second half green like the gate).
Transitions: step content slides/fades 300ms; reduced motion = instant. Theme + colour-on/off aware.

## Steps
1. **account.** "let's get you a passport." — email (prefilled from the gate session), password + show/hide + strength
   meter, "I agree to the terms and privacy" checkbox (links). Or continue with Google / Apple (same buttons as the gate,
   same behaviour). Validation inline. Primary: "create my account".
2. **name.** "what do explorers call you?" — display name (big input) + @username with live availability check against
   the real handles in `profile/profiles.json` + reserved words; suggestions chips generated from the name. Card fills
   NAME + USER lines.
3. **mole.** "roll your mole." — explain in one line (your passport picture, one of a kind); big "roll" button opens the
   mole reveal; after a roll show the mole large with "keep it" / "roll again". Skip = initials placeholder.
4. **archetype.** "what kind of explorer are you?" — 10 group tabs or sections; big archetype cards (icon 40px, name 22px
   bold, 1-line description visible on the card, not only on hover). Pick 1 (optionally a second "also" pick shown small
   — only if trivial; otherwise one). Card stamps the archetype. Note: "your posts will refine this later."
5. **bio.** "say hi." — textarea (400), three tap-to-insert prompt chips that start a sentence ("I go looking for…",
   "My weirdest find was…", "Next on my list:"), live count. Card shows the first line on the back/bio preview.
6. **mark.** "sign your passport." — signature pad (`sign-pad.mjs`), clear / undo, "use my name in handwriting" fallback
   (Caveat font). Card draws the mark on the signature line.
7. **style.** "make it yours." — passport background + foil swatches (big tiles), bio look colour. Card updates live.
8. **places.** "where do you want to go?" — add 3+ want-to-go places with the catalog search (spots with photos) and
   free-text places; show them as small photo chips; suggestions = 6 popular catalog spots matching the archetype's tags
   (map archetype → tags via `TAG_TYPE` in `profile/passport-rules.mjs`, reversed). Skippable.
Finish screen: "your passport is ready." — the card flips to face the user, big, with a stamp "ISSUED <date>"; buttons
"see my passport" (primary), "share it", "start exploring" (→ /browse/). Light, short celebration (stamp + 12 confetti
dots in site colours), reduced motion = none.

## Rules
- Real data only; no invented counts. Nothing sent anywhere (all local).
- Accessibility: each step is a `<form>` with a labelled heading, focus moves to the heading on step change, progress is
  an ordered list with `aria-current="step"`, errors via `aria-describedby`, everything keyboard-usable, 4.5:1 contrast.
- Type: nothing under 14px except mono micro labels (13px).
- Backup first `backups/before-onboarding-20261021/`. Bump keys. README log entry. No commit/push.

## Checks
- `node --check` all changed/new JS; `node --test qa/*.test.mjs` (add `qa/onboarding.test.mjs` for the pure parts:
  username validation/availability, progress normalize, archetype→tags suggestions).
- Headless only (`--use-angle=swiftshader`), server on 8766 (running), `MSYS_NO_PATHCONV=1` in Git Bash. Use mouse
  coordinates / JS clicks (Playwright "stable" checks fail on animated pages).
- Full flow script: gate sign-in on /spot/ → lands on /welcome/ → all 8 steps → finish → passport shows every field;
  refresh mid-flow resumes; skip path works; back works.
- Screens of every step at 1440 and 390, dark + light, colour on/off → `qa/onboarding/`. Look at each one and fix.
- axe 0 on each step (1440 dark/light, 390). Console 0 errors. scrollWidth == viewport.
