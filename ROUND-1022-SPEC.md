# Round 2026-10-22 — community discord, pressed icons, onboarding sheet + sign-up, profile cleanup

Read README (latest log: passport unify, icons v2, onboarding v2.2, community v3/v3.1). Keep every delight moment
(print-in, REGISTERED, stamp-on-done, ISSUED slam, issued moment, deal-out/restack, follow shake, tilt/sheen).
PC is shared with gaming: ONE headless browser at a time, below-normal priority (psutil), no swiftshader unless WebGL.
Server 8766 runs detached — do not start another. MSYS_NO_PATHCONV=1. Backup first (`backups/before-round-1022/`).
Bump keys (community-v2.mjs key must match in pages.mjs AND giveaway-hero.mjs). README log. Do not commit/push.

## 1. Community — "live from the discord." back to the original, more exciting composition
- Restore the ORIGINAL content of the discord section as it was on 2026-10-20 ("Discord section from the original
  mockup" README entry; code in `backups/before-community-v3-20261021/community-v2.mjs/.css`): cobalt header bar with
  title + the two real stats (new spots this month, members) + live dot + "join now ↗"; #announcements pinned post;
  #polls open poll (4 real options, local vote, gate hook `data-opt`); "Featured messages" live feed (forum posts as chat
  messages, next slides in every ~4s, pauses on hover/focus/offscreen/hidden; static for reduced motion). Same honesty
  rules (no invented numbers). Remove the v3 loud cobalt full-bleed showpiece version.
- Make the COMPOSITION more exciting than three equal columns while keeping that original look/content: e.g. an
  asymmetric grid — the live feed as a tall column on the left that bleeds slightly past the header bar, the pinned
  announcement as a tilted cream "pinned note" (−2°, pin) overlapping the feed edge, the poll as the widest block with
  big bars; scale contrast in type (big title, mono kickers); one accent colour per block. Stays in the site design system
  (cobalt #3c60ff header bar, panels, fine lines). Phone: stacked, feed first. Must fit width (no overflow) and pass axe.
- Leave "your vote matters" and the rest of the page as they are.

## 2. Passport cards — archetype icon pressed in
Shared card (`profile/passport-edit.mjs` cardHTML + profile.css `.pp-id9-crest`): make the crest look DEBOSSED into the
card and the icon pressed into the crest: crest = inset shadow (dark top-left inner, light bottom-right inner edge) + a
faint outer highlight ring; icon = soft inner-press look via CSS `filter: drop-shadow(0 1px 0 rgba(255,255,255,.35))
drop-shadow(0 -0.6px 0.4px rgba(0,0,0,.35))` (tune) so strokes read engraved, not doubled (Charlie disliked the hard
double emboss before — keep it SOFT). Check at 2× zoom on profile, community, onboarding; light + dark theme.

## 3. Passport photo (pfp) bigger + consistent mole crop
- The photo block on the shared card is too small on the profile page and on community cards. Make it noticeably bigger
  (≈ +30–40% area): rebalance the top section (photo wider/taller, rows beside it still readable; if needed rows move to
  a tighter layout). Same card everywhere.
- Own passport mole is cropped closer than other users (shirt cut off). Other users use
  `/community-assets/moles/<id>.webp` (full-body render, cropped with `moleCrop` in `profile/passport-art.mjs`); the own
  mole comes from the account draft PNG saved by the mole reveal (different framing). Make the crop consistent: measure
  both sources (alpha bbox), and either normalise the reveal PNG on save to the same framing as the community renders
  (preferred: pad/scale to the same canvas so `moleCrop` works for both) or apply a source-specific crop so head + shirt
  show the same way. Fix existing saved draft moles at render time too. Verify own vs others side by side.

## 4. Profile — remove the facts row under the bio
On the profile page record pane (top-left of the right pane), remove the three boxes under the bio ("latest find",
"top category", "level" — `factsHTML` in profile.js). Let the bio block breathe; check spacing after removal.

## 5. Onboarding — archetype sheet usability
`site/onboarding.mjs/.css` "your explorer type" sheet: the group category row must be STICKY at the top of the sheet
(stays visible while the archetype list scrolls under it, with a soft fade/shadow edge). Make the sheet much bigger:
phone = up to ~92dvh (it may cover the passport entirely), desktop popover = larger (e.g. 560×min(80vh,760)).
Archetype cards bigger (icon 40px, name 20px bold, 2-line description visible). Selecting a group tab scrolls the list
to that group (scroll-spy updates the active tab as you scroll). Done button stays pinned at the bottom.

## 6. Onboarding — sign-up order
Account screen: FIRST two big buttons "continue with Google", "continue with Apple" (same behaviour as now), then a
third equal button "use email". Only after tapping "use email" do the email + password + terms fields slide open (with
"issue my passport"). Keep the no-scroll rule at 320×568+ (fields may replace the buttons area; a small "back" link
returns). Prefill/remember as today. Password never stored or sent. Update flow tests.

## Checks
- `node --check`; `node --test qa/*.test.mjs`; onboarding flow (390 + 1440) updated for "use email".
- Screens → `qa/round-1022/`: community discord 1440/1920/390 dark+light; crest emboss 2× crops (profile, community,
  onboarding); profile wayfarer + preview (own mole after a roll fixture) 1440/390 and side-by-side own vs other mole
  crops; profile without facts row; onboarding archetype sheet 390/360/1440 scrolled mid-list (sticky tabs visible);
  account screen before/after "use email" at 390/320/1440. Look at every shot, fix, ≥2 rounds.
- axe 0, console 0, scrollWidth == viewport.
