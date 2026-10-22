# Onboarding v2.1 — Charlie's phone + desktop review (2026-10-21, Opus plan → Sonnet build)

Builds on ONBOARDING-V2-SPEC.md (read it + README log). Keep every delight moment exactly: the print-in issue animation +
small REGISTERED stamp, the stamp-on-done when a slot is filled, the green check, the final big blue ISSUED stamp slam +
shake + confetti, the passport-page issued moment. Do not remove or weaken any of them.

## 1. Cleaner slot outlines
Today: dashed green boxes + green "+" circles + nested outlines → messy. Make each empty slot ONE clean element:
a 1.5px solid rounded outline (radius matching the part, 10–14px) in a soft green at ~55% with a slow, subtle glow pulse
(box-shadow breathing, 2.4s, low amplitude), and a small pill label inside/at the corner — "add photo", "add name",
"add type", "add bio", "sign here", "style" — 13px bold, green text on a pale green pill. No "+" circles, no dashes, no
overlapping outlines between neighbouring slots (give slots a 4–6px gap; name+user is one slot; type its own).
The "next" required slot pulses slightly stronger. Filled slots: no outline at all (the content speaks).
Light/dark/colour-off variants must stay clean.

## 2. Mole roll: skip the accessories
`site/mole/mole-reveal.mjs`: while traits/accessories roll in one by one, show a "skip" button (bottom centre, pill,
48px tall, also Escape/Enter-safe) that jumps straight to the final rolled mole + keep/roll again. Applies everywhere the
reveal opens.

## 3. No flip — bio on the front
Remove the flip button, the back face, and the 3D flip. Put the BIO slot on the front in the empty band between the photo
block and the "my mark" line (it's negative space today). Filled: the bio text in the card's type at a size that fits
(2–3 lines, auto-shrink to fit, never cut mid-word; ellipsis only as a last resort), slight ink tone.
Places step leaves onboarding (users add places later from "my map" on their passport) — remove its slot + sheet; keep
any already-saved want-to-go data untouched. Progress becomes "x / 6" (photo, name, type, bio, mark, style) with the same
required set (photo, name, type). Update tests/flow.

## 4. Desktop: much larger
At 1440×900 and full-screen 1920×1080 the card is tiny. Scale the card to fill: card height ≈ min(82vh, …) with width from
the card ratio, centred; on wide screens put the tip + progress on the left of the card and finish on the right, or keep
them above/below but compact, whatever lets the card be biggest. Popovers stay anchored to slots and must not go
off-screen. Check 1280×720, 1440×900, 1920×1080, 2560×1440. Still no page scroll.

## 5. Mole reroll: light consumes the screen
After loading, the reveal's background light/glow shows an edge (a visible box/vignette boundary). Make the backdrop fill
the entire viewport (fixed, inset 0, 100vw×100dvh, plus overscan so blur/scale never reveals an edge), the glow a
radial gradient centred on the mole that extends past every edge; no seams during the loading→reveal transition. Check
390×844, 1440×900, 1920×1080.

## 6. Passport bevel/emboss reads as double vision
Shared passport card CSS (profile `.pp-id9`, community `site/passport-mini.css` `.pm-card`, `profile/passport-edit.mjs`
card / onboarding card): the type + rules emboss uses hard 1px light-below + dark-above text-shadows → looks doubled.
Replace with a SOFT bevel: e.g. `text-shadow: 0 .5px .5px rgba(255,255,255,.55), 0 -.5px .8px rgba(0,0,0,.12)`
(tune by eye at DPR 1 and 2), rules get a soft inset highlight instead of a hard second line. Must look crisp, single,
slightly pressed — not blurry. Compare before/after crops at 2× zoom of the name rows and MRZ in all three places.
NOTE: source/profile/* edits are allowed for this item (no other session is editing).

## Checks
- `node --check`; `node --test qa/*.test.mjs` all pass (update tests for 6 slots); update + run `qa/onboarding-v2/flow.py`.
- Screens → `qa/onboarding-v2.1/`: phone 390/360/320 + desktop 1440/1920/2560: account, issue, card empty, each sheet,
  card filled, finish stamp; mole reveal loading→reveal frames + skip; emboss before/after crops (profile, community,
  onboarding). Look at every shot; ≥2 rounds of fixes.
- No page scroll anywhere on /welcome/. axe 0, console 0, scrollWidth == viewport.
- Server on 8766 runs detached — do not start another. Headless only. MSYS_NO_PATHCONV=1. Backup first
  (`backups/before-onboarding-v2.1-20261021/`). Bump keys. README log. Do NOT commit/push (Opus reviews + publishes).
