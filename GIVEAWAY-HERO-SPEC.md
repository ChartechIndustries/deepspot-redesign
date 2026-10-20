# Community giveaway hero — 10 versions (2026-10-19)

## Ask (Charlie)
On `/community/`: remove the top banner carousel AND the leaderboard + passports panels. Replace all of them with one
large giveaway graphic. Rough layout: `qa/community-v2/giveaway-sketch.png`.
- Title on top.
- Below: a well-animated, horse-race-inspired graph. Each participant = a bar/track; the marker is their **mole
  profile picture** in a circle; their **name above** the circle; their **points** shown.
- Under the graph: a large CTA "join now" → posting a spot (`/contribute/`).
- A "read more" on the graphic → giveaway details: how it works, how to participate, points per action, prizes,
  rules, dates.
- Under that: the participants and their passports (cobalt band with passport cards, as in the sketch).
- Beautiful, seamless, in the redesign's style. **10 different versions** to compare.

## Same design system for all 10 (vary layout/graphic only)
Colors: page navy `#0c101b`, panel `#141d28`, cobalt `#3c60ff` (small text on it → `#3858f0` panel), green
`#07d653`, aqua `#83cdce`, cream `#f5f4ee`, yellow `#ffd400` (accent only, used in roadmap promo set).
Type: big lowercase display headings ending with a period, Arial/Helvetica bold, tight tracking; small mono-ish
labels like the rest of the site. Components from `site/core.mjs` (`esc`, `icon`, `action`, `.ds-button`).
Motifs available: halftone dot fields, hairline frames, white-bordered prints, round rank badges, contour lines,
green route lines, passport cards (already built in `site/community-v2.mjs`). Dark + light theme, panel color
on/off, 1440 / 1024 / 768 / 390 / 320.

## Real data only
- Participants: `content.json` leaderboard (this month), 10 people, real points (Kris 6800 … ). Points can differ
  by 30×: each version must stay readable (e.g. sqrt scale, broken axis, or ranked spacing) and say so in a
  small axis note if the scale is not linear.
- Moles: `source/community-assets/moles/<handle>.webp` (512², transparent; head-crop as in community-v2 passports).
- Prize/rules (from the competition page / old hub): first place $300 + a one-of-one custom character item;
  2nd and 3rd $100 + an item each; every participant gets a character item and 3 months free (approved map spots
  only). Points: +50 new spot, +100 story, +10 per upvote. Leaderboard resets on the 1st. Ends at the end of the
  month (live countdown, local time). Official rules → `/competition/` and the original site.
- Never invent numbers, quotes or people.

## Animation (all versions)
"Horse race": when the graphic scrolls into view, the race runs once — markers start at the gate and gallop to
their positions with staggered, springy easing and a small bob (≈2.5–4 s total), leader last to settle, then a
subtle idle (e.g. leader's mole breathes, flag waves). Replay button ("run it again"). Transform/opacity only,
60 fps, one rAF or CSS. `prefers-reduced-motion`: final state, no motion. No layout shift.

## Shared pieces (build once, every version uses them)
- `giveawayData()` → participants sorted, points, mole url, handle, passport url, rank.
- Read-more dialog (`<dialog>`, like `site/core.mjs` sharePage / `gallery.mjs` pattern; no browser alerts):
  sections "how it works", "how to join", "points" (table), "prizes", "dates & rules" (+ official rules link).
- CTA block: large "join now" → `/contribute/` + secondary "read more".
- Participants band: cobalt, "participants" label + passport cards row for all 10 (reuse/export the passport card
  renderer from `site/community-v2.mjs`), horizontal scroll with snap + arrows, cards link to `/profile/?user=`.

## The 10 versions (distinct compositions)
- G1 Bell bars (the sketch, literal): vertical green bars, leader in the middle, others alternating outward;
  mole circles on bar tops, names above; cobalt participants band below.
- G2 Finish line: vertical bars ranked left→right, a checkered finish line across the top at the leader's height,
  winner gets a green rosette.
- G3 Racetrack lanes: horizontal lanes (numbered gates on the left, turf texture), moles run left→right,
  finish post on the right, points at each lane end.
- G4 Oval track: top-down oval racecourse (SVG), moles placed along the track by points share, leader near the
  post, inner field holds title + prize.
- G5 Starting gates: stall numbers, bars rise out of gates like a stampede; dust/halftone burst behind leaders.
- G6 Halftone lollipops: thin stems on a big halftone dot field, oversized mole heads, giant points numerals.
- G7 Tote board: race-day tote/odds board (dark panel, cream split-flap style numerals) beside a compact bar race;
  "odds" = share of total points (real arithmetic, labeled).
- G8 Summit climb: contour-line mountain (roadmap motif); each mole climbs a route to a height = points; flag at
  the top for $300.
- G9 Photo finish: a wide "camera strip" frame with vertical scan line sweeping, moles crossing; split-second
  overlay labels with points.
- G10 Split hero: left = title, prize, countdown, CTA; right = horizontal bar race with moles at bar ends;
  passports band full-width below.

## Wiring
- New `source/site/giveaway-hero.mjs` (+ `giveaway-hero.css`): `renderGiveaway(root, data, variant)`.
- `/community/`: banner + leaderboard/passports removed; the giveaway hero renders first (default `g1` until
  Charlie picks), then the discord, community spots and roadmap sections unchanged.
- `/community/?giveaway=g1..g10` switches the version. Old pages stay: `?v=hub1`, `?v=old`.
- Review page `source/giveaway-variations.html`: all 10 stacked full width, each with a label
  ("G3 · racetrack lanes"), a jump menu, and a "phone width" toggle (390 frame).

## Checks
- `node --check`; qa tests pass.
- Headless screenshots of every version at 1440 dark + 390 dark (+ G1, G3, G10 in light and panel-off);
  capture the animation mid-race and final (use a `?race=final|mid` debug param). Look at every shot; two
  review→fix rounds minimum.
- No console errors, no failed requests, no page overflow at 390/320. axe 0 on /community/ for 3 versions.
- Dialog: opens, focus trapped, Escape closes, content readable on phone.
- Backup to `backups/before-giveaway-hero-20261019/`. Bump cache keys. No deploy, no README edit.
