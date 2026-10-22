# Onboarding v2 — fill in the passport itself (2026-10-21, Opus plan → Sonnet build)

## Ask (Charlie, on his phone)
"Scrolling sections to fill things out is not intuitive — it's easy to miss things. The onboarding starts with one large
unscrollable section where you enter the bureaucratic stuff (email, password, etc). Once that's confirmed, a nice
animation issues you your passport. The passport is unscrollable and you fill out the sections directly on the passport.
Rolling the mole takes a while to load, so make a loading screen: a silhouette of the mole with a loading bar underneath.
Fun, snappy, intuitive across the board." PHONE FIRST — he tests on mobile.

## Replace the 8-step v1 flow (`/welcome/`, `site/onboarding.mjs/.css`, `onboarding-state.mjs`)
Keep: the route, the triggers (gate continue → /welcome/, header account button, `?onboard=1`, `?reset=1`), storage keys,
password never stored/sent, `profile/passport-edit.mjs` shared pieces (archetype picker, swatches, passport card,
tilt), finish → `/profile/?user=preview&welcome=1` issued moment. Backup v1 first (`backups/before-onboarding-v2-20261021/`).

### Screen A — account (one screen, NO page scroll at 320×568 and up)
`html` locked to 100dvh while on /welcome/. Header hidden or reduced to the logo (no nav) so it fits.
Big heading "let's get you a passport." (two-tone), email, password (show/hide, strength bar), terms checkbox, big green
"issue my passport" button, "or" + Google / Apple (compact row of two). Errors inline. Nothing else on the screen.

### Issue animation (≈1.6s, snappy, skippable by tap; reduced motion = 200ms fade)
Screen A content lifts away → a blank cream passport card slides up out of a slot/printer line at the bottom (ink rollers
feel), lands centered with a small bounce → red "ISSUED · <date>" stamp thunks on with a tiny screen shake (reuse the
follow wobble keyframes feel, smaller) → stamp fades to the card's number box → Screen B.

### Screen B — the passport is the form (one screen, NO page scroll)
- The real passport card (passport-edit.mjs card, v11 look) scaled to fit the viewport (phone: ~92vw wide; desktop:
  ~min(560px, 70vh) tall) with a short top line "tap the glowing parts to fill in your passport." and a progress chip
  "3 / 7". Bottom: a big "finish" button (disabled look until required slots done; tapping it while disabled pulses the
  first empty required slot) and a small "flip ↻" button.
- FRONT slots (each a real `<button>` over its part of the card, with a soft pulsing green outline + "+" chip while empty):
  1. photo → roll your mole (required)    2. name + @username (required)    3. archetype (the big header line; required)
  4. mark / signature line (optional)       5. style: foil + left background — a small "✦ style" sticker on the card corner
- BACK of the card (flip with a 3D card flip, 450ms): 6. bio (optional) and 7. places I want to go (optional, 3 photo slots).
  Back has the same slot treatment and an MRZ strip at the bottom so it still feels like a passport page.
- Tap a slot → a focused editor opens: phone = bottom sheet (max 70dvh, drag handle, swipe down / ✕ to close); desktop =
  a popover card anchored next to the slot. The card dims except the active slot. One thing per editor:
  - name: display name + @username (live availability check, suggestions chips). Done.
  - archetype: group chips row (horizontal scroll) + archetype cards with the 1-line description always visible.
  - mark: the signature pad (`profile/sign-pad.mjs`) + "use my name in handwriting".
  - style: foil swatches + background swatches, live on the card.
  - bio: textarea + 3 prompt chips. places: catalog search + suggestions for their archetype; up to 3 shown on the card.
  - photo: opens the mole roll (below), then "keep it / roll again".
  On "done": sheet drops, the value STAMPS onto the card (small scale-in + ink settle), the slot outline turns into a tiny
  green check for 600ms, progress updates, and the next empty required slot gently pulses (guided, never forced).
- Everything saves as you go (`deepspot-onboarding-v1` + the account draft) so a refresh lands back on Screen B with the
  card filled. No page scroll anywhere: if content in a sheet is long, only the sheet scrolls.
- Finish: card does a quick celebratory tilt + "ready." stamp, then → passport page issued moment (existing).

### Mole roll loading screen (applies everywhere the mole reveal opens — onboarding, edit dialog, passport)
`site/mole/mole-reveal.mjs` (`openMoleReveal`). While its 3D assets load, show immediately (no blank wait):
a dark mole SILHOUETTE (make it from a mole render: `source/community-assets/moles/*.webp` with `filter:brightness(0)`
and a soft ink-blue tint, or export a single silhouette PNG once into `source/site/mole/assets/`) centred, gently
bobbing, with "rolling your mole…" and a LOADING BAR under it that reflects real progress (count the GLB/texture fetches
the reveal makes; if progress can't be measured, an eased bar that crawls to 90% and completes on ready). Snap into the
reveal when ready. Reduced motion = no bob. Must be visible within 100ms of the tap.

## Rules / checks
- Phone first: design at 390×844 and 360×740, then 320×568, then desktop 1440×900. No page scroll on /welcome/ at any
  of those (assert `scrollHeight <= innerHeight` and `scrollWidth <= innerWidth`).
- Snappy: every tap responds in <100ms visually; transitions 200–450ms; nothing blocks input except the 1.6s issue
  animation (tap to skip).
- Accessibility: slots are buttons with labels ("Add your name — required"), sheets are dialogs with focus trap and
  return focus to the slot, flip button has aria-pressed, progress is announced, 4.5:1 contrast, keyboard works.
- Real data only; password never stored/sent. Theme light/dark + colour on/off.
- Update `qa/onboarding/flow.py` for v2 (account → issue → fill every slot front + back → finish → passport shows all)
  and `qa/onboarding.test.mjs` pure parts. `node --test qa/*.test.mjs` all pass. axe 0 on Screen A, Screen B, each sheet.
  Console 0 errors.
- Screens → `qa/onboarding-v2/` at 390, 360, 320, 1440 (dark + light): Screen A, issue mid-frame, Screen B empty,
  each sheet open, B filled front, B back, mole loading screen. LOOK at every one (phone first) and fix; ≥2 rounds.
- Headless only (`--use-angle=swiftshader`), server on 8766 already running (detached; do not start another),
  `MSYS_NO_PATHCONV=1` in Git Bash, JS clicks/mouse coords (Playwright stability checks fail on animated pages).
- Bump keys, README log entry. Do NOT commit/push — Opus will review, then publish.
