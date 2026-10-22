# Onboarding v2.2 — Charlie's notes (2026-10-21, Opus plan → Sonnet build)

Builds on v2.1 (README log, ONBOARDING-V2.1-SPEC.md). Keep every delight moment exactly (print-in + REGISTERED stamp,
stamp-on-done, green check, big ISSUED slam + shake + confetti, passport-page issued moment, mole skip button).

## 1. Slot hover → lighter hue
Empty slots (soft green ring + pill): on hover (mouse) and keyboard focus-visible, the ring + glow + pill shift to a
lighter, brighter green tint (e.g. ring #6ef29a-ish, pill background lighter, slot fill a faint green wash), 150ms ease.
Touch: same on :active. Light / colour-off variants get an equivalent lighter shift. Filled slots unchanged.

## 2. Mole reveal waits for the user
`site/mole/mole-reveal.mjs`: after the loading screen (silhouette + bar) reaches 100%, do NOT start the roll. Show the
silhouette at rest with a big green pill button at the bottom: "roll your mole" (≥56px tall, 20px bold, Enter/Space
work, autofocus). Tapping it starts the roll (charge → accessories → reveal) as today; the skip button appears only
once the roll is running. Applies everywhere the reveal opens. "roll again" after a reveal can roll immediately (no
second wait) — the wait is only for the first roll after loading.

## 3. Mark fills the signature line
Today a signature drawn edge to edge on the pad covers less than half the passport's mark line (pad aspect ≠ line
aspect, and the image is placed at natural size). Fix in the shared rendering (onboarding card, `profile/passport-edit.mjs`
preview, profile `.pp-id9` mark, community mini card if it shows marks):
- On save, crop the pad PNG to the drawn ink bounds (+ small padding) — in `profile/sign-pad.mjs` export, keep the stored
  data-URL format/limits in `normalizeAccount` (signatureArt ≤ its size cap).
- Display: the mark image fills the mark line area — `object-fit: contain` inside a box that spans the full line width and
  the line height band; scale up allowed; left-aligned; sits on the baseline like a real signature.
- Make the pad itself match the line's aspect better (wider, shorter) so drawing feels like signing that line.
- Old saved marks (uncropped) also render bigger via the same contain box.

## 4. Taller passport, bio in its own band
Make the passport card taller (portrait, about 5:7 → e.g. 5:7.6; tune by eye) in onboarding AND the edit-dialog preview
(profile page main card may stay as is unless it shares the layout — keep profile page working). Layout top → bottom:
header · photo + name/user/type/since rows · BIO full-width band (2–4 lines, auto-fit) · style sticker moves to a corner
where it does not crowd the bio (e.g. top-right of the photo block or bottom-right above the MRZ) · MY MARK line ·
MRZ. Bio slot = full-width band with the same clean slot treatment. Still no page scroll at 320×568 → 2560×1440; card
stays as large as v2.1 on desktop.

## Rules / checks
- PC is shared with gaming: ONE headless browser at a time, below-normal priority, swiftshader only for mole 3D shots.
- `node --check`; `node --test qa/*.test.mjs`; update + run `qa/onboarding-v2/flow.py` (or the v2.1 copy) at 390 + 1440.
- Screens → `qa/onboarding-v2.2/`: hover states, mole wait screen + roll + skip, mark drawn edge-to-edge on the pad and
  the resulting card (onboarding, edit dialog, profile), taller card empty/filled at 390/360/320/1440/1920. Look at every
  shot; fix; ≥2 rounds.
- axe 0, console 0, no page scroll on /welcome/. Backup `backups/before-onboarding-v2.2-20261021/`. Bump keys. README log.
- Server on 8766 runs detached — do not start another. MSYS_NO_PATHCONV=1. No commit/push (Opus reviews + publishes).
