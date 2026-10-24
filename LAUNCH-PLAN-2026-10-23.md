# DeepSpot — launch plan from Charlie's Notes.docx (2026-10-23)

Source: Discord CHARTECH INDUSTRIES #files → `Notes.docx` (posted 10/24 03:32 UTC, copy in `C:\Users\CharD\Downloads\Notes.docx`).
Notes were taken on iPhone + iPad. Every item below has a **device** tag:
`phone` = ≤ 650 px touch · `tablet` = 651–1180 px touch (iPad) · `desktop` = mouse · `all`.
Companion doc: `UX-AUDIT-2026-10-23.md` (revision 3: one visual system "the mole world" = the tours page recipe + one big graphic per section). Its order of work runs alongside this plan.

Launch: about 3 weeks out (≈ 2026-11-13, confirm the date). Code freeze 2 days before launch.

---

## 0. Parked (do not work on now)

| Item | Why parked | Revisit |
|---|---|---|
| Make pages load faster | Hosting moves GitHub → Vercel backend. Speed and caching change after the merge. | First day after the Vercel merge. Measure again (`qa/audit-20261019/weight.py`), then fix. |
| Load glitch: parts load first and flicker | Same. Server render, fonts and caching on Vercel change it. | Same day. Record a phone video of each page first load and list each flicker. |

| Same 6–10 spots everywhere, different spot counts | Site not connected to the Vercel backend yet. | Connect the backend (next big step). |
| Sign-up wall position, map page, dev toggles/text, empty passports | Charlie 10/23: later / test build only. | After launch prep. |

Keep the facts: home is 3.9 MB (390) / 6.2 MB (1440) after the 10/22 pass. The flicker is most likely (a) web font swap, (b) JS-rendered blocks that pop in after fetch, (c) images without fixed size. Check those three first.

## 0b. Copy — waits for Kai

Do not write final copy for these. Build the layout with the current text, mark each string with `data-copy="kai-<id>"`, and keep a list in `COPY-FOR-KAI.md`.

| id | Where | What Charlie said |
|---|---|---|
| kai-1 | `/community/` all copy | "Need to change the copy, make sure to talk to Kai." |
| kai-2 | `/community/` hero eyebrow "deepspot initial giveaway · oct 2026" | Charlie does not like the type. **The style change (§5.1) is not copy and can go now.** The new words wait for Kai. |
| kai-3 | Community guidelines text (modal, §5.4) | "Update the actual community guidelines page." The modal can go now; the text waits for Kai. |
| kai-4 | Audit copy items (dev text that users see, "Japan" in the welcome post, roadmap names) | See audit §C. |

---

## Rules for every build round (unchanged)

- Opus writes the spec for the round and reviews the screenshots. Sonnet builds.
- Backup first: `backups/before-<round>-<date>/` with every file you change.
- After edits: `python tools/bump_keys.py`, then `--check` = 0 stale.
- Headless only. One browser at a time. Below-normal priority. swiftshader only for WebGL.
- **Device check matrix (new):** each item is checked at its device tag:
  - phone: 390×844 and 360×780, `is_mobile`, `has_touch`.
  - tablet: 820×1180 and 1180×820 (iPad Air portrait + landscape), and 1024×1366 (iPad Pro), `has_touch`.
  - desktop: 1440×900 and 1024×768 with a mouse.
- Real data only. No invented names, counts or quotes.
- Name the delight moments in every spec. Reduced motion turns all new motion off.
- README log entry per round. Commit per round. Publish from a clean worktree of HEAD (`git worktree add`).
- Charlie's real-device pass (iPhone + iPad) closes each round. Headless touch is not a real iPad.

---

## 1. Navigation

### 1.1 Burger menu on phone: remove guides, your fieldbook, contribute, membership — `phone` (also `tablet`, same menu)
- File: `source/site/navigation.js:40` (the `nav.innerHTML` list).
- Keep: browse, map, tours, community, your account.
- The routes stay live. Fieldbook stays as the bookmark icon in the header. Contribute stays in the "know a hidden gem?" banner and the footer. Membership and guides stay in the footer.
- Desktop nav is not changed by this item (check it has the same four or five main items; see audit §A2).
- Check: menu at 390/820 shows 5 items; every removed page still opens from the footer.

---

## 2. Home

### 2.1 Remove the odd dots over the pins — `all`
- Look: small green ovals/dashes float above and to the left of the pins on the globe (zoom shot: `qa/ux-audit-1023/sheets/zoom_pins.jpg`).
- Where: globe chunk `source/_next/static/chunks/page-C89T775K-v51.js` (+ `readable/page.js`), pin markup `.map-pin` in `source/index.html` and pin CSS in `index.3fOv_FAP.css` / `responsive.css`. Likely a pin "ground shadow" or pulse ring element that is placed in screen space but not on the pin base, or back-face pins drawn as dots.
- Fix: find the element (DOM inspect at 390 with `?raf=timer&snap=1`), then remove it or anchor it to the pin tip. SSR gotcha: if the pin markup changes, change `source/index.html` too (hydration #418).
- Check: zoom shots at 390/820/1440, three globe positions. No floating marks.

### 2.2 Center the location pop-up on the globe — `all` (most visible on `phone`)
- Now: the pop-up card sits bottom-left, over the globe edge, and is cut by the screen edge on phone.
- Fix: center the card horizontally under the active pin's screen position on phone/tablet (`left:50%; translateX(-50%)`, max-width `min(92vw, 360px)`), and center it on the globe stage on desktop. The active pin rotates to the center first (the current yaw target is "45° left of centre" — change it to centre on phone/tablet).
- Check: card fully on screen at 320/360/390/820/1440; no overlap with the explore bar.

### 2.3 "explore" goes to the map — `all`
- Now: the hero explore button opens a dialog.
- Fix: make it a link to `/map/?spot=<id>` of the active spot. `/map/` must read `?spot=` and fly to that pin and open its card. If `/map/` cannot fly yet, add it (`site/map.mjs`).
- The button keeps its look. SSR: change `<button class="explore-bar">` to `<a>` in BOTH the chunk and `source/index.html`.
- Delight: the pin on the globe does a short drop/bounce before the page goes (≤ 250 ms).
- Check: tap → `/map/` opens on that spot, card open, at 390 and 1440.

### 2.4 Banner is swipeable — `phone` + `tablet`
- Which banner: the "what's new?" panels (`<deepspot-news>`, `source/whats-new.js`). Also check the promo card row if it scrolls sideways.
- Fix: pointer-event swipe on the panel: the panel follows the finger 1:1, release past 20 % width or fast flick (> 0.4 px/ms) → next/previous with a spring; else snap back. `touch-action: pan-y` so vertical scroll still works. Autoplay pauses while touched and for 6 s after.
- Keep arrows, tabs, pause. Keyboard arrows still work.
- Check: headless touch swipe both ways at 390 and 820; vertical page scroll over the banner still works.

### 2.5 "browse all deep spots" button larger — `all`
- File: `source/editorial.js` / `editorial.css` (the green pill under the discover grid).
- Fix: same size family as the hero explore button: min-height 56 px, 20 px text, 28 px side padding; full width on phone (max 360 px), centered.

---

## 3. Browse

### 3.1 Category tabs follow the selection — `phone` + `tablet`
- File: `source/browse/browse.js` (`renderFilters`), `browse.css`.
- Fix: on tap, `tab.scrollIntoView({inline:'center', block:'nearest', behavior:'smooth'})` inside the tab row (not the page). Add a soft fade on the row edge that has more tabs, so users see the row scrolls.
- Same pattern for every sideways tab row on the site (profile 4.1, community, featured). Put it in one helper (`site/core.mjs`: `followTab(row, tab)`), use it everywhere.

### 3.2 "369 deep spots to discover" → small bubble next to "Browse Deep Spots" — `all`
- Now: the count sits in a cramped bar with the sort and view buttons.
- Fix: a pill right after the title ("369" bold + "spots"), green outline, same baseline as the title's second line; it updates with filters ("12 found"). Remove the old count from the toolbar.
- Also: home says "discover 277 deepspots" while browse says 369. One number from one source (`catalog.mjs` length), everywhere.

### 3.3 Remove stories and guides from browse — `all`
- Remove the "Deep Spots · Stories · Guides" tab row on `/browse/` and `/guides/`. Browse = spots only.
- `/guides/` stays as its own page (footer). Old links `?tab=guides` still redirect (`navigation.js:20`).

### 3.4 Remove stories fully — `all` (Charlie 10/23)
- Delete from the build: `/stories/`, `/story/`, the home "stories" section (`editorial.js` stories row + `data-all-stories`), the "new stories every week" CTA wording (becomes the weekly-find newsletter, copy → Kai), nav/footer links, profile "stories" stat and counts, leaderboard "stories" column, competition/community text that says "every story 100 points" (copy → Kai), `navigation.js` route lists, `profile/identity.mjs` allowed paths, `profile/profile.js` return labels.
- `/story/` and `/stories/` URLs redirect to `/browse/` (small `index.html` with a redirect, so old shared links do not 404).
- Data files (`editorial-stories.json`, story images) move to `_archive/stories-1023/`.
- Check: `grep -ri story` over `source/` shows no user-visible text; link crawl 0 bad links; `node --test`.

---

## 4. Profile (phone)

### 4.1 Tabs show that more tabs exist — `phone`
- File: `source/profile/profile.js` (VTABS), `profile.css`.
- Fix: the 3.1 helper on tap + an edge fade + the last visible tab cut in half on load (a "peek"). On first visit, the row does one short nudge (scrolls 40 px and back, 600 ms) to show it moves. Once per user (localStorage, try/catch).

### 4.2 Passport moves with the phone — `phone` + `tablet` (an addition, Charlie: "potential")
- Build it: it fits the brand and costs little. The foils already react to the pointer ("pointer-lit foil bump", 10/20) — feed the same light position from `deviceorientation`.
- Tilt: max ±8° rotateX/Y, smoothed (lerp 0.12), foil light follows. No motion when the page is not visible.
- iOS needs permission: show a small "tilt to shine ✦" chip on the passport on first view; tap → `DeviceOrientationEvent.requestPermission()`. If denied or unsupported, the chip hides and the passport stays as it is.
- Reduced motion: off. Delight: the first tilt makes the holo sweep once across the card.
- File: `profile/passport-edit.mjs` (shared card) so every passport gets it (profile, onboarding preview, community deck card in focus).

---

## 5. Community

### 5.1 Hero eyebrow type — `all` (style now, words wait for Kai = kai-2)
- Now: `DEEPSPOT INITIAL GIVEAWAY · OCT 2026` in small spaced mono caps. It reads like a code label.
- Fix: remove the mono eyebrow. Put the month into the countdown chip ("october race · ends in 8d 03h"). If Kai wants an eyebrow, use the site sans, 15 px, sentence case.
- File: `source/site/giveaway-hero.mjs:107` (+ css).

### 5.2 Passport deck moves smoothly — `all`
- Now: swipe or arrow keys hard-cut the cards.
- Fix (in `site/community-v2.mjs` participants deck + `site/passport-mini.*`):
  - Drag: the top card follows the finger/mouse 1:1 with a rotate that follows the drag (max 12°).
  - Release: past threshold → card flies off with the release speed and goes to the back of the stack; the next card scales up from 0.94 → 1 and lifts its shadow. Spring (stiffness 260, damping 26) — use WAAPI or a tiny spring step; no library.
  - Arrow keys/buttons play the same flight (not a cut).
  - Cards behind are always visible as a stack (offset 6 px, scale −3 % each), so there is something to move.
- Delight: a soft "deal" sound is out (no audio on web); instead a 1-frame paper "flick" shadow and the counter "3 / 10" ticks.
- Check: record a 3 s frame strip (10 frames) of a swipe and of an arrow press at 390 and 1440; no frame shows a jump.

### 5.3 The live feed looks like a live feed — `all`
- Now: a static list of 4 forum posts.
- Fix, with real data only (`content.json` → `forum[]`):
  - Chat look: avatar, name, channel tag, relative time ("2 h ago" from the real post date), message bubble.
  - Messages arrive one at a time at the bottom, the list scrolls up; a typing row ("● ● ●") shows 1.2 s before each arrival. Cycle the real posts, slow (one per 6–8 s), pause on hover/touch and when off screen.
  - Header: green pulsing dot + "#general · 137 members" (only if the member count is real; else no number).
  - Honesty rule: the label says "latest from the discord", not "live", until the Vercel backend reads Discord for real. Add a `LIVE_SOURCE` flag so the label switches when the feed is real.
- After the Vercel merge: a server route reads the newest messages from the Discord channel (bot, read-only) every 60 s. Note it in the Vercel backlog.

### 5.4 Community guidelines open as a pop-up — `all` (text = kai-3)
- Now: "Community Guidelines & Welcome" links out to a new page.
- Fix: open a modal: big round ✕ top-right (48 px hit area, sticky while the text scrolls), Esc closes, tap outside closes, focus trap, the back button closes it (push `#guidelines` to history), page behind blurred like the edit-profile dialog. Deep link `/community/#guidelines` opens it.
- Reuse the edit-profile dialog shell (`profile/passport-edit.mjs` dialog, `.pp-editdlg` styles) — one dialog component for the site.
- Phone: full-screen sheet that slides up; drag down to close.

### 5.5 "come say hi / join now" tile: too much empty space — `all`
- File: `site/community-v2.mjs:113` (`.dv-t-join`) + `community-v2.css`.
- Fix: the tile shrinks to its content (no fixed min-height), "join now" grows to 40–48 px, arrow sits on the same line as "join now", padding 20–24 px. On phone the tile is one row: "come say hi — join now →".

### 5.6 "your vote matters": remove "two ways to shape deepspot" — `all`
- File: `site/community-v2.mjs:264` — delete the `vm-k` span. Check the heading spacing after.

### 5.7 Participants animation starts on hover/click — `all`
- Now: a long scroll-driven deal-out the user must scroll through.
- Fix: the stack sits ready (stacked, title on top). Desktop: hover the stack = cards fan out a little (preview); click = full deal-out. Phone: tap = deal-out. A "deal again ↺" button after. Scroll no longer drives it, so the section is short.
- Keep the deal-out motion itself (named delight: deck deal-out).

---

## 6. Tours

### 6.1 Crop tighter on "under construction" at the start — `all`
- Now: at the start, the blurred "tours" page title shows in the corner behind the tape (visible top-left in `qa/ux-audit-1023/shots/t_tours_00.jpg`).
- File: `site/tours.mjs` + css. Fix: start scale so the frame is fully inside the tape scene (scale up 1.15–1.25 or cover-crop), or hide the blurred page header layer for the first frames. Check every size: 320/390/820/1180/1440/1920 first frame.

---

## 7. iPad

### 7.1 Profile picture crop is off — `tablet`
- Find where: the passport photo slot, profile header avatar, and community deck card, at 768/820/1024/1180. Compare with phone and desktop. Likely an `object-position` / aspect value set for phone and desktop breakpoints only, or the mole crop (`identity.mjs` `avatarHTML`, mole CROP table) using the wrong width breakpoint.
- Fix: one crop rule per image type (photo vs mole) that does not depend on viewport width — crop by the image box, not by the media query.
- Check: same face position at 390, 820, 1024, 1180, 1440 (pixel compare of eye line).

### 7.2 Signing the mark on iPad is hard — `tablet` (+ `phone`)
Three problems, three fixes (`profile/sign-pad.mjs`, `profile/profile.css:57`, onboarding mark sheet in `site/onboarding*.css`):
1. **Too small:** on tablet the mark sheet uses a pad at least 720×300 (landscape) / 600×260 (portrait); on phone the sheet goes full screen for signing, card preview shrinks to a strip at the top.
2. **Page gets selected:** on the sheet and pad: `user-select:none; -webkit-user-select:none; -webkit-touch-callout:none`. `touch-action:none` on the pad wrapper (not only the canvas). `preventDefault` on `pointerdown` inside the pad.
3. **Fast undo taps zoom the page:** `touch-action: manipulation` on undo / clear / done buttons and on the whole sheet. Do not use `user-scalable=no` (accessibility).
- Also: Apple Pencil pressure → line width (`pointerType==='pen'`, `e.pressure`), and palm rejection (ignore touch pointers while a pen is down).
- Check: headless touch stroke + 6 fast undo taps → no zoom, no selection (read `visualViewport.scale` = 1, `getSelection().toString()` = ''). Then Charlie on the iPad.

---

## 8. "Know a hidden gem?" Blender render v2

Charlie likes it. It can be better. Current: `source/banners/h3.webp`, scene `tools/blender_banners/H/` (`h3.py`, `h3.blend`, notes `PLAN.md`).

### What is weak now
- **No moment.** The mole stands next to the hole and does nothing. The picture shows objects, not a find.
- **The mole looks cheap:** flat grey, blocky low-poly feet, faceted flat-yellow hat, dead eyes. It is the weakest mole on the site (the tours moles and the passport moles are better).
- **The gem is dull:** flat green, few facets, no fire, no glow on its surroundings. It should be the brightest thing in the frame.
- **The base reads as a chocolate cake** (smooth brown disc with straight sides).
- **Sparkles are flat stickers.**
- **Light is flat studio light.** No story in the light.

### v2 direction (3 options, Charlie picks one)
- **A · Headlamp find (recommended):** construction mole (`BLOOD1_construction.blend`: hard hat, hi-vis vest, split claws) kneels at the rim, leans in; a headlamp on the hat throws a visible beam into the hole; the gem answers with green light that lights the mole's face and claws from below. Spade dropped beside it.
- **B · Got it:** mole holds the gem up over its head with both claws, gem blazing, soil clods falling off it; tiny dust kicked up.
- **C · Cutaway:** a ground chunk cut open like the W1 quarry: grass top, soil and rock layers on the cut face, a mole tunnel running down to a hollow where the gem glows; the mole is at the tunnel end. Says "deep" best.

### Quality bar (all options)
- Mole: the construction mole asset, subdivision + smooth shading, real eye highlights, a posed rig (no T-pose parts), contact with the ground (no float, no clip).
- Gem: brilliant cut (≥ 57 facets), glass with dispersion fake (3 IOR passes or a thin-film tint), emission core, green bounce light on soil and mole, 3D glint star (not a sticker).
- Ground: irregular chunk with grass lip and strata, soil texture at real scale, small stones, crumbs on the rim.
- Light: warm key, green gem light, cobalt rim that matches the banner background `#3a5bef`.
- Optional loop: 3 s seamless (gem pulse + glint sweep + mole blink), WebM/MP4 ≤ 400 KB with the still as poster; reduced motion = still.
- Process (Blender quality rule): full-res multi-angle QA renders before showing; crop test 0.9:1, 1.3:1, 2.2:1 with the text zone; check at 328 px wide.
- Output: `source/banners/h4.webp` (+ `h5`, `h6` for B, C); switch with `?bb=h4..h6`; review page row in `/blender-banners.html`.

---

## 9. Schedule

| Week | Dates | Work |
|---|---|---|
| 1 | 10/24 – 10/30 | Mole kit + proof page (audit §5.1). Round A (quick, low risk): 1.1, 2.5, 3.2, 3.3, 3.4, 5.5, 5.6, 6.1, 3.1 + 4.1 helper. Round B (iPad): 7.1, 7.2. Round C: 2.1, 2.2, 2.3. Gem render v2 options A/B/C in parallel (Blender, headless), in the tours style (ortho, construction mole). |
| 2 | 10/31 – 11/6 | Round D (motion): 2.4 swipe, 5.2 deck, 5.7 participants trigger, 4.2 tilt. Round E: 5.3 feed, 5.4 guidelines modal, 5.1 hero eyebrow. Gem pick → integrate. Home to the 6-block order with the audit §2 graphics. |
| 3 | 11/7 – 11/13 | Kai copy in. Vercel merge → the parked speed + flicker work. Real-device pass (Charlie's iPhone + iPad) on every page. Freeze 11/11. Launch. |

Each round: spec → build → screenshots at its device tags → Opus review → fix → Charlie on device → commit + publish.
