# Community page v3 — spec (2026-10-21, Opus plan → Sonnet build)

## Ask (Charlie, verbatim intent)
1. The top graphic (the "race for $300" giveaway hero) must fill the whole screen horizontally.
2. He does not like the passports tucked under the graphic (current "deck A" fan hanging from the hero box).
3. Use the NEW passport design (profile v11: cream ID card, crest, red number stamp, mole photo + level bubble,
   traveler-type ink stamp, name/user/since/level rows, mark line, MRZ, holo foil + lit grain that follow the pointer)
   on the community page.
4. Make "live from the discord" + the voting part as exciting as the top graphic.
Also (site-wide, already done by Opus before you start, do not redo): type scale raised in every CSS file
(`tools/type_scale.py`, backup `backups/before-type-scale-20261021/`), nav 17px/800, authorLink now shows a profile
picture (`avatarHTML` in `profile/identity.mjs`, `.ds-av` in `profile/links.css`). Reuse `avatarHTML` for people.

## Where
- Route: `source/community/index.html` → `site/pages.mjs` → `site/community-v2.mjs` (+ `.css`) and
  `site/giveaway-hero.mjs` (+ `.css`). Hero = `renderGiveaway(root,data,'g1')`. Deck = `bandHTML` + `wireFan`.
  Discord section is in `community-v2.mjs` (search "discord"). "your vote matters" block + roadmap are also there.
- Passport card source of truth: `source/profile/profile.js` lines ~205–225 (`.pp-id9` markup) and `profile/profile.css`
  (47 `.pp-id9` rules + foil/bump rules: search `pp-foil`, `BUMP`, `moveBumpLight`). Do NOT edit profile files —
  other sessions own them. Copy what you need into NEW files `source/site/passport-mini.mjs` + `passport-mini.css`
  (prefix `pm-`), so the community card looks like the profile card but is independent.
- Server: http://localhost:8766 (running). Headless Playwright only (`--use-angle=swiftshader`), never open windows
  (Charlie may be gaming). In Git Bash set `MSYS_NO_PATHCONV=1` before passing "/paths" to python.
- Helpers already written: `qa/redo-1021/shot.py outdir /path ...` (full-page 1440 + 390 dark),
  `qa/redo-1021/find.py /path "<selector>" out.png` (element shot), `qa/redo-1021/probe.py` (font-size histogram + scrollWidth).

## 1. Hero full-bleed
- The g1 hero box spans the full viewport width (0 → 100vw) at every width. No outer side border/margin, no rounded
  box edge at the sides. Inner content (title, bars, "your spot could be next" row) keeps a comfortable gutter
  (use the site gutter, ~48px desktop / 16px phone) so text never touches the edge. The bars graphic may stretch wider:
  re-check the bar spacing at 1280, 1440, 1920, 2560 so it does not look sparse — scale bar width/gap with width.
- Fix the existing horizontal overflow: at 1440 the page `scrollWidth` is 1616 (> 1440). Must be exactly the viewport
  at 320, 390, 768, 1024, 1440, 1920.

## 2. Passports — own section, new card
- Remove the deck that hangs under the hero (`bandHTML`/`wireFan` usage on the community page). Keep the code paths
  for `?fan=` review variants only if trivial; otherwise remove cleanly.
- New full-bleed section directly after the hero: heading "participants." (display style, as other headings) +
  sub "<N> explorers in this month's race" (N = real count) + "<name>'s passport ↗" link pattern is fine.
- Cards: one `pm-` passport per real contributor (same data the deck used: leaderboard + `profiles.json`,
  mole = `/community-assets/moles/<id>.webp`, rank → "no. 00N", level/traveler type as the profile computes them —
  if the level/type logic is only in profile.js, port the minimal pure function; never invent values: omit a row
  if the data is not there). Card = faithful smaller copy of the v11 card (≈300–340px wide desktop, 260 phone):
  cream paper, crest + DEEPSPOT + small "explorer passport", red "no. 00N" stamp, mole square with level bubble and
  ink type stamp, NAME / USER / SINCE / LEVEL rows, "their mark" line (their signature art if profiles.json has one,
  else empty line), MRZ two lines. Holo foil sheen + lit grain that follows the pointer (copy the profile technique),
  gentle pointer tilt (max ~8°), mouse only; `prefers-reduced-motion` = flat, no sheen motion.
- Layout: a big, confident horizontal stage, not a tucked strip. Recommended: a coverflow / spread row on top of the
  animated halftone field (`site/halftone-field.mjs`, same as the hero ambient) — centre card large and tilted
  toward the viewer, neighbours smaller and angled, drag/swipe + arrow buttons + arrow keys, dots or "3 / 10".
  Click/Enter on the centre card opens `/profile/?user=<id>`; click a side card brings it to centre.
  Phone: one card centred, swipe. Accessible: buttons with labels, `aria-roledescription="carousel"`, live region.
- Use real colours of the system (cobalt #3c60ff, green #07d653, aqua #83cdce, cream #f5f4ee, ink #0c101b).

## 3. "live from the discord" + voting — match the hero's energy
The hero is loud: huge type, green bars, motion, numbers. The discord section today is a quiet 3-column grid.
Rebuild it as a full-bleed showpiece:
- Full-bleed cobalt (#3c60ff) stage with the halftone field in a lighter cobalt/ink as moving texture.
- Header: giant display title "live from the discord." (same scale as the hero title), a pulsing green live dot,
  the two real stats as BIG numbers that count up when the section enters view (new spots this month, members 151),
  "join now ↗" as a big green pill.
- Featured messages: a tall live chat wall — messages (real forum posts, avatar via `avatarHTML`, handle, #channel,
  replies) slide in one by one with a soft spring every ~3.5s, newest on top, oldest fade out; pause on hover/focus/
  offscreen/hidden tab; static list for reduced motion.
- Poll ("What feature should we build next?", 4 real options): big tappable option bars (≥64px tall, 22–28px bold
  type). Viewer's vote fills its bar green with an animated sweep + a check; the others stay outlined; no invented
  percentages (keep the existing local-vote logic and gate hook). Show "4 replies on the forum".
- Announcement: a pinned card styled like a big cream ticket/notice with a pin, title large.
- Merge the "your vote matters" block into this energy (same section family): two huge numbered cards
  "01 what makes the map." / "02 what we build next." with hover lift, linking as today.
- Everything must still work in light theme and with `data-panel-color` off (check `panel-colors.css` patterns).

## Rules
- Data honesty: never invent counts, quotes, people, percentages, online numbers, timestamps.
- Hover-only animation plus the named ambient motions; all motion off with `prefers-reduced-motion`.
- Contrast 4.5:1 small text, 3:1 large. Type: nothing under 14px on desktop except MRZ/legal (13px min).
- Backup first: `backups/before-community-v3-20261021/` (community-v2.*, giveaway-hero.*, pages.mjs, community/index.html).
- Bump `?v=` keys (giveaway-hero must import community-v2.mjs at the SAME key as pages.mjs — keep in sync).
- Do not edit `source/profile/*`. Do not publish / push. Do not commit.

## Checks (do all, look at every screenshot)
- `node --check` on changed JS/MJS.
- Screens: 1440 + 1920 + 390 + 320, dark and light, colour on/off → `qa/community-v3/`. Look at each.
- `scrollWidth == viewport` at 320/390/768/1024/1440/1920.
- axe: `python qa/audit-20261019/axe.py` style run on /community/ at 1440 dark/light and 390 → 0 violations.
- Console: 0 errors.
- README.md: add a log entry under the latest section (what changed, keys, backup path).
- Report back: what you built, keys, file list, screenshots paths, any open issues.
