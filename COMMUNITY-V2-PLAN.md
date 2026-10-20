# Community page v2 — plan (2026-10-19)

## Ask (Charlie)
Rebuild `/community/` to match the mockup `qa/community-v2/mockup.png` (2093×5647). The graphics in the
mockup are placeholders: use real graphics. Follow the redesign's design system (same as the other pages).

## Where
- Route: `source/community/index.html` → `site/pages.mjs` → `site/community-hub.mjs` + `site/community-hub.css`.
- Current hub (10/13) keeps working under `?v=old`. Keep that rollback: put v2 behind the default and keep
  the existing hub reachable at `/community/?v=hub1` (rename the old `?v=old` path if needed, do not delete it).
- Server: http://localhost:8766 (running). Headless Playwright only, no windows.

## Design system (reuse, do not invent)
Tokens/components already in the site: cobalt `#3c60ff` (text panels with small text: `#3858f0`),
green `#07d653`, aqua `#83cdce`, ink/navy page `#0c101b`, panel `#141d28`, cream `#f5f4ee`. Big lowercase
display headings ending with a period, Arial/Helvetica bold, tight negative tracking. `.ds-button`, `.ds-eyebrow`,
`action()`, `icon()`, `esc()` from `site/core.mjs`. Fine 1px borders. Dark and light themes (`data-theme`) and
the panel-color toggle (`data-panel-color`) must both work — check `panel-colors.css` patterns.
Hover-only animation (plus the carousel and the countdown tick). `prefers-reduced-motion` = static.
Contrast: 4.5:1 small text, 3:1 large. Phone layouts (≤650) and tablet (651–1000) must be designed, not squeezed.

## Sections (top → bottom, as in the mockup)

### 1. Banner carousel (full-width cobalt band)
Kicker, huge headline, one line of text, pill CTA, round prev/next arrows on the sides, dots below.
Slides: keep the 3 real slides from the current hub (giveaway, photo contest, invite & earn) + the mockup slide
"refer a friend / bring a friend. you both get a month free. / Send your invite link. When your friend joins,
you each get a free month of founding membership. / get my link ↗" → `/invites/`. (Mockup copy is Charlie's.)
Autoplay with pause control (existing hub logic), keyboard arrows, dots are buttons.

### 2. Leaderboard + passports (two panels side by side; stack on phone)
**leaderboard.** (green panel left):
- `$300` + "for your curiosity." (competition copy). Podium: real top-3 member photos
  (`site/assets/member-*.webp`, from `content.json` leaderboard; Wayfarer has no photo → use the existing initial
  avatar style), rank blocks 1/2/3 with prize ($300 / $100 / $100 — real competition prizes).
- Live countdown to the end of the current month (local time): days / hrs / min / sec tiles, "left in October"
  (month name computed). "official rules ↗" → `/competition/`.
**top contributors · <month> <year>** (dark list right of the green block): real leaderboard data, This month /
All time toggle (data has both). Rows: rank, avatar, name, "view passport ↗" (→ `/profile/?user=<handle>`), spots
count. No rank-change arrows (no data). Last row "you": the viewer's account draft (name, mole/photo avatar from
`site/account-state.mjs`), their spots = 0, text "N more spots to crack the top 10" computed from real data.
"Every approved spot = 1 entry. Resets on the 1st." note.

**passports.** (right panel, cream cards on dark): carousel of passport cards, 4 visible on desktop, arrows +
"1 of N". One card per real contributor: passport header (PASSPORT / No. derived from rank), the contributor's
**3D mole** (`source/community-assets/moles/<handle>.png`, already rendered with the mole rules, transparent PNG
768²) cropped to the head on a colored circle (reuse the passport mole head-crop numbers from `profile/passport-art.mjs`
`moleCrop`), name, a colored tag (their top category), a signature line in a handwriting Google Font
(their display name), stamps row (reuse `stampArt()` from `profile/passport-art.mjs`), spots count.
Card links to their passport. Under the cards: "make your passport." + "Pick your mole, draw your signature,
start collecting stamps" + green CTA "create my passport ↗" → `/account/`.
Small note in the panel: "moles are a preview — each explorer rolls their own when passports launch".

### 3. live from the discord. (cobalt header bar + 3 columns)
Header: title, member count (real `COMMUNITY_METRICS.members` = 151, labeled "members"), a live dot, "join now ↗"
button → `DISCORD_URL` constant (unknown today: fall back to `https://www.deepspot.io/community`, comment TODO).
No invented "online" number.
Columns (real forum snapshot in `content.json.forum`):
- #announcements: "Community Guidelines & Welcome" (DeepSpot Team), excerpt, replies, "read ↗" → forum.
- #polls: the real poll "What feature should we build next?" with its 4 real options (Mobile App, Offline Maps,
  Social Features, More Regions). Clickable; the viewer's vote is saved locally; bars show only the viewer's
  choice + "4 replies on the forum" (no invented percentages). "vote ↗" → the forum topic.
- featured: the two other real topics (Underrated Region of Japan: Tohoku; Tips for photographing dark kissaten?)
  with author avatars (initial avatars if no photo), category, "open ↗".
Footer note with the capture date.

### 4. community spots. (cobalt header bar, tabs, 2×3 card grid)
Tabs: trending · highest voted · newest · near you (tabs are buttons; filter/sort real data; "near you" asks for
browser location and sorts the 10 mapped spots by distance, otherwise shows a short message).
Cards: real photo (catalog spots with local images; make 800 px card versions in `source/editorial-assets/cards/`
so cards do not load 1920 px files), place + country, title in the big lowercase style, "by <publisher>",
bookmark button (reuse the fieldbook save button), arrow link to `/spot/?id=`.
"belongs on Deep Spot?" row: yes / not quite buttons, vote saved locally; the bar shows the viewer's vote
(no invented % or counts). Comment row: viewer avatar + "add a comment ↗" → spot page (no invented quotes).
Include the 3 real **pending submissions** (Lana Velkov: Icarus statue, YU Biznis Centar, Tre Sorelle) as
"pending review" cards — find openly licensed photos on Wikimedia Commons, save ≤1200 px locally under
`source/community-assets/pending/`, credit (author + license) on the card.
Buttons: "see all community spots ↗" → `/browse/`, "submit a spot" → `/contribute/`.

### 5. roadmap. (cobalt header bar, 3 columns)
building now / up next / considering — 3 cards each, as in the mockup (Passports + profile moles, PictoChat
signatures, Monthly giveaways / Trip lists, Offline maps, Live meetups / AI route planner, TL;DR summaries,
Video spots). Up/down vote buttons with the viewer's vote saved locally; show the viewer's vote state, no
invented counts. Progress bars only on "building now" (passports 70%, signatures 60%, giveaways 90% — these are
our own build status, OK to state). "Vote on what we build next." → `/roadmap/`.

## Data honesty (project rule)
Never invent numbers, quotes or people. Real data: leaderboard, member photos, forum topics, poll options,
pending submissions, catalog spots, metrics snapshot. Where the mockup shows counts we do not have (online now,
vote %, roadmap counts, comment quotes), show the viewer's own local state or leave the count out.

## Checks
- `node --check` changed JS; existing qa tests pass.
- Headless screenshots: 1440 and 390, dark and light, color on/off. Compare with the mockup section by section
  (crop the mockup — it is tall). Look at every screenshot.
- `python qa/audit-20261019/crawl.py d390` style run on /community/ and /community/?v=hub1: no errors, no overflow.
- axe on /community/ at 1440 dark/light and 390: 0 violations.
- Weight of /community/ ≤ 3 MB.
- Backup first: `backups/before-community-v2-20261019/`. Bump `?v=` keys. README log entry.
