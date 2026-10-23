# DeepSpot audit — 2026-10-22 ("tighten up everything")

Auditor only. No site files changed. Server: http://localhost:8766. All shot paths are relative to `qa/audit-20261022/`.

## Ranks
- **P1**: the item is broken. It causes wrong behaviour or a wrong deploy.
- **P2**: the item looks wrong. A user will see it.
- **P3**: polish.

Totals: **P1 4 · P2 17 · P3 17**.

## What passed (no action)
- **axe** (wcag2a + wcag2aa + best-practice): 0 violations on all 32 routes at d1440, d390 and l1440. The only violations are on the dev server's own 404 response, which is not `404.html`.
- **Console:** 0 errors on all routes. The only output is swiftshader "GPU stall" warnings from headless WebGL.
- **Links:** 183 unique internal links, 0 bad. Author ids that are not in `profiles.json` (bodhi-schulz, kris, six …) still render a profile.
- **Code checks:** `node --check` gives 0 failures on the source js/mjs. `node --test qa/*.test.mjs` gives 95/95.
- **Onboarding:** `qa/onboarding-v2.2/flow.py` gives 156/156 checks at 390 and 1440. The flow is gate → /welcome/ → account → issue → 6 slots → finish → profile.
- **Profile actions:** follow toggles and persists after reload. The edit dialog opens and Esc closes it, at 390 and 1440. A community "yes" vote opens the "sign in to vote." gate, as intended. The roadmap up-vote works.
- **Reduced motion:** no infinite animations run on home, community, tours, browse or profile when `prefers-reduced-motion: reduce` is set.
- **Overflow:** none at 360, 390 or 1440. At 320, only /forum/ overflows (see P1-3).
- **Dev links:** no dev or variation pages are linked from the nav, the footer or page content.

---

## Cross-site items (fix first)

### P1-1 · A saved light theme is lost on /browse/ and /profile/ (and on /account/, which redirects to /profile/)
- **Sizes:** all.
- **Wrong:** these pages read only `?theme=` in the head script. They then write `dark` back to `localStorage['deepspot-theme']` when they start. To repro:
  1. Set light.
  2. Open `/browse/` with no param. The page is dark.
  3. Open `/community/`, `/map/` or `/welcome/`. Every page is now dark.
- **Probe:** `probe3.py`. The output is: `/browse/ … final: dark /browse/?theme=dark`, and after that every page is dark.
- **Files:** the inline head script in `source/browse/index.html`, `source/profile/index.html`, `source/adventures/index.html` and `source/app/index.html` (this one is URL only). Also the start-up theme call in `browse/browse.js` (`theme()`) and `profile/profile.js` (`applyTheme`).
- **Fix:**
  1. Use the community head script: `?theme` → `localStorage` → `'dark'`.
  2. Do not write to storage on start-up. Write only when the user clicks the toggle.

### P1-2 · The home theme toggle does not save the choice
- **Sizes:** all.
- **Wrong:** the "☀ Light" button on home changes only the URL (`/?theme=light`). `localStorage` stays empty (`probe2.py`). If the user opens a new tab or types a URL, the site is dark again.
- **File:** `source/_next/static/chunks/page-C89T775K-v51.js:6193` (the toggle handler).
- **Fix:** in the toggle handler, also run `localStorage.setItem('deepspot-theme', next)`. This matches `browse.js`.

### P1-3 · Stale and duplicate `?v=` cache keys
These files changed in a later commit than the one that set their key. GitHub Pages users can get old CSS or JS. Data: `cachekeys.json`, script `cachekeys.py`.

| File | Key | Where | Refs |
|---|---|---|---|
| `panel-colors.css` | `?v=6` | all pages | 31 |
| `site-cta.css` | `?v=audit1` | all pages | 30 |
| `site/refinements.css` | `?v=5` | all pages | 29 |
| `site/account.css` | `?v=a11y1` | account, inbox, invites | 3 |
| `profile/links.css` | `?v=1` | home, browse, profile | 3 |
| `editorial.css` | `?v=banners11` | home | 1 |
| `whats-new.css` | `?v=9` | home | 1 |
| `responsive.css` | `?v=8` | home | 1 |
| `community.css` | `?v=6` | home | 1 |
| `site/community-hub.css` | `?v=1` | community | 1 |
| `profile/passport-rules.mjs` | `?v=pv2` | `profile.js`, `data.mjs` | 2 |
| `profile/sign-pad.mjs` | `?v=pv4` | `onboarding.mjs`, `profile.js` | 2 |
| `profile/data.mjs` | `?v=ob1` | `profile.js` | 1 |
| `profile/items.mjs` | `?v=it1` | `profile.js` | 1 |
| `site/onboarding-state.mjs` | `?v=ob3` | `onboarding.mjs` | 1 |
| `site/planner.mjs` | `?v=gate6` | `pages.mjs` | 1 |
| `site/tours.mjs` | `?v=art17` | `pages.mjs` | 1 |
| `site/account.mjs` | `?v=ld3` | `pages.mjs` | 1 |
| `site/pages.mjs` | `?v=ob1` | `tours/index.html` only | 1 |

- **Duplicate module:** `profile/passport-art.mjs` loads with two keys. `passport-rules.mjs` imports it with `?v=pad1` (stale). `passport-edit.mjs` and `passport-export.mjs` import it with `?v=r22a`. This gives two module instances and two downloads.
- **No key at all**, on 25–29 pages each: `/site/pages.css`, `/site/pages.mjs`, `/site/navigation.js`, `/site/install.js`, `/site/finishing.css`, `/profile/links.css`. Also `./core.mjs`, `../profile/identity.mjs` and `./identity.mjs` inside the modules. `pages.mjs` changed on 10/22.
- **Fix:**
  1. Bump each key listed above.
  2. Make the `passport-art.mjs` key the same in all 3 importers.
  3. Add keys to the unkeyed shared files.
  4. Run `python qa/audit-20261022/cachekeys.py` again. Expect `stale 0` and `multi 0`. The old review pages, `giveaway-variations.html` and others, still use old keys. Ignore them, or remove those pages (P3-17).

### P1-4 · /forum/ scrolls sideways at 320
- **Size:** 320×640.
- **Wrong:** `scrollWidth` is 353. The overflowing element is the `span.ds-eyebrow` row label in the topic list, for example "travel advice · Ben Wallace" and "photography · ShutterBug".
- **File:** the forum topic markup in `site/pages.mjs` (`class="ds-eyebrow">${esc(f.category)} · ${esc(f.author)}`), styled in `site/pages.css`.
- **Fix:** give the topic text column `min-width:0`. Give the eyebrow `overflow-wrap:anywhere`, or make it wrap.

### P2-1 · The home header does not follow the light theme, and its toggle labels differ
- **Sizes:** 390, 1440 (light).
- **Wrong:**
  - In light theme the home header bar stays dark navy. All other pages have a cream header.
  - The home toggle reads "☀ Light" / "☾ Dark", with a capital letter and a different sun glyph. All other pages read "☼ light" / "☾ dark".
- **Shots:** `shots/l1440_home_top.png`, `sheets/l390_home_p1.jpg`; compare with `sheets/l1440_community_p1.jpg`.
- **Files:** the home `header.header` styles (`_next/static/css/index.3fOv_FAP.css` and `site/account-nav.css`) and the label at `page-C89T775K-v51.js:6193`.
- **Fix:**
  1. Add a `[data-theme=light] header.header` rule with the same colours as `.br-header`.
  2. Change the label to lowercase "☼ light" / "☾ dark".

### P2-2 · The home page is too heavy: 13.8–15.6 MB on a phone
- **Sizes:** all. The 3 MB flag is for home, browse, map and stories.
- **Home:** `media/world-is-deeper.mp4` is 5.6 MB and loads when the banner scrolls into view. Other big files: `earth-clouds.jpg` 0.97 MB, `editorial-assets/boundary.jpg` 0.86 MB, `site/assets/story-moscow.jpg` 0.66 MB.
- **Browse:** 4.7 MB. Card images are full-size JPGs, for example `spots/tomb.jpg` 0.72 MB and `editorial-assets/spot-south-london…jpg` 0.65 MB.
- **Map:** 4.3 MB at 1440 (full-size list thumbnails).
- **Stories:** 3.6 MB.
- **Source:** `res_*.json` `top` field.
- **Fix:**
  1. Make a phone version of the mp4 at ≤1.5 MB (720p, CRF 30). Do not load it on phones with save-data or reduced data.
  2. Make 2× card-width WebP thumbnails (about 800px) for the browse, map and stories cards. `community-assets/cards/*.webp` already uses this pattern.

### P2-3 · Numbers disagree between pages
- **Wrong:**
  - Home "top contributors" ranks Wayfarer #1 (39 contributions) and kisekikana #2.
  - The community race and /leaderboard/ rank Kris #1 (6,800 pts) and Wayfarer #2.
  - Wayfarer's profile says "39 spots" but also "based on 11 postings".
  - /roadmap/ lists community groups, hidden secrets, travel quests, live events, AI routing, TL;DR and video uploads. The community "roadmap." block lists Passports + moles, PictoChat, Monthly giveaways, Trip lists, Offline maps and others. Both claim to be the roadmap.
- **Shots:** `sheets/d390_home_p1.jpg` (column 3/4), `sheets/d390_leaderboard_p1.jpg`, `sheets/d390_profile_user_wayfarer_p1.jpg`, `sheets/d390_roadmap_p1.jpg`, `sheets/d390_community_p2.jpg`.
- **Fix:**
  1. Take all rankings from one source (the leaderboard points). Label home "top contributors" by points, or rename it "most spots".
  2. Make "based on N postings" use the same count as "spots".
  3. Make /roadmap/ show the same list as the community roadmap block, or link the block to /roadmap/ and drop one list.

### P2-4 · Type below Charlie's minimum (meta ≥14px, body ≥17px)
Source: computed font sizes, `res_*.json` `small` and `smallBody`.

| Text | Size | Where | Selector or file |
|---|---|---|---|
| Race chart names | 11.5px | community | `span.gv-name`, `site/giveaway-hero.css` |
| "10 explorers in this month's race" | 13px | community | `p.pm-sub`, `passport-mini.css` |
| Ticker, globe preview place, globe credit, "oct 2026" chip, "contributions" (1440) | 13px | home | ticker span, `p.preview-place`, `div.map-credit`, `span.cl-sample` |
| Card tags ("AMUSEMENT PARKS"), result label | 13px | browse | card tag span, `#result-label` |
| Preview note | 13px | /welcome/ | `p.ob-note` |
| Passport header "explorer passport" | 13.5px | profile, community | span in `passport-edit.mjs` header |
| Mono labels (NAME / USER / SINCE, "SHARE IT, OR SAVE IT AS AN IMAGE", "vote" beside roadmap arrows) | about 10–12px on screen | profile, community | computed ≥14 but scaled down by the card zoom |
| Card body text | 15.5–16px | browse, stories, guides | `p.br-desc` (16), `.ds-card-text>p` (15.5), `.ds-guide-card p` (16), `.ds-story-card p` (16), `.ds-note` (15) |

- **Fix:**
  1. Raise the meta text to 14px.
  2. Raise card descriptions to 17px. Keep the 2–3 line clamp.
  3. The passport labels are a design object, so Charlie decides. If they stay, raise the zoom floor on phones.

### P2-5 · The Deep Spots / Stories / Guides tab bar differs between pages
- **Sizes:** all.
- **Wrong:** /browse/ shows 3 tabs. /stories/ and /guides/ show only "Deep Spots · Guides". The Stories tab is missing, so /stories/ has no active tab.
- **Shots:** `sheets/d390_stories_p1.jpg`, `sheets/d390_guides_p1.jpg`, `sheets/d1440_guides_p1.jpg`.
- **File:** `br-content-tabs` markup in `site/pages.mjs` (stories and guides render). `browse.js` has the 3-tab version.
- **Fix:** render the same 3 tabs everywhere, with `aria-current` on the active tab.

### P2-6 · No site footer on profile and account
- **Sizes:** 390, 1440.
- **Wrong:** every other page ends with `footer.ds-footer`. On a phone, the profile page ends after the tabs panel, with no footer and no legal links.
- **Shots:** `sheets/d390_profile_user_wayfarer_p1.jpg`, `sheets/d390_profile_user_preview_p1.jpg`.
- **File:** `profile/index.html`. It loads `site-cta.js` but has no footer mount point, or the mount is hidden.
- **Fix:** add the shared footer below `.pp-book` on phones (<1100px). The desktop "book" layout can stay full-height.

### P2-7 · The empty bio looks broken on other users' profiles
- **Sizes:** 390, 1440.
- **Wrong:** "no bio yet." appears twice: once in the card and once as a 28px bold grey heading in the BIO section. On the preview profile the BIO section shows "say something. edit profile to write your bio." at the same large size. Every community profile is empty at present.
- **Shots:** `sheets/d390_profile_user_wayfarer_p1.jpg`, `sheets/d1440_profile_user_wayfarer_p1.jpg`, `sheets/d1440_account_p1.jpg`.
- **File:** bio block in `profile/profile.js` and `profile.css`.
- **Fix:**
  - For others, when the bio is empty, hide the big bio line. Keep only the card text.
  - For your own profile, show one muted 17px line with an "add a bio" link.

### P2-8 · On a phone, the edit-profile dialog opens with the form off screen
- **Size:** 390.
- **Wrong:** the live preview card fills the first screen. The form heading "edit your" shows behind the cancel/save bar. The focused name input is below the fold, so the user sees nothing to type into.
- **Shot:** `shots/probe_editdialog_390.png` (desktop is fine: `shots/probe_editdialog_1440.png`).
- **File:** edit dialog in `profile/passport-edit.mjs` and `profile.css`.
- **Fix:** below 700px, put the form first and show the preview as a collapsible strip (about 120px) at the top. Another option: scroll the focused field into view.

### P2-9 · The browse category chips are clipped
- **Sizes:** 390, 1440.
- **Wrong:**
  - At 1440 the last chip reads "more categori▾", with the text cut off.
  - At 390 the row cuts "weird/funny" at the edge with no fade or scroll cue.
  - "more categories +" also has a chevron, so it has two affordances.
- **Shots:** `sheets/d1440_browse_p1.jpg`, `sheets/d390_browse_p1.jpg`.
- **File:** chip bar in `browse/browse.css` and `browse.js`.
- **Fix:**
  1. Let the last chip size to its content, or shorten it to "more ▾".
  2. Add a right-edge fade on the phone scroller.
  3. Drop the "+".

### P2-10 · Map page: the list is clipped, the note has no gap, and the phone map shows grey bands
- **Sizes:** 390, 1440.
- **Wrong:**
  - On the phone the place list box cuts the last row through the middle of the text ("Xwejni Salt Pans / The Sand-Covered").
  - The note "10 destinations have verified coordinates…" touches the map box with 0 gap, at both sizes.
  - On the phone the map opens at world zoom, with grey bands above and below the land.
- **Shots:** `sheets/d390_map_p1.jpg`, `sheets/d1440_map_p1.jpg`.
- **Files:** `site/map.mjs` and `.ds-map-shell` / `.ds-note` in `site/pages.css`.
- **Fix:**
  1. Call `fitBounds` on the pins with padding.
  2. Add `margin-top:16px` to the note.
  3. On the phone, give the list box a bottom fade or show all 10 rows.

### P2-11 · The home stories carousel shows a neighbour card under the community panel
- **Size:** 1440.
- **Wrong:** pieces of the previous story card show at the left edge of the stories panel ("· Stones / kers of / Kong", "na").
- **Shot:** `sheets/d1440_home_p1.jpg` (right column, bottom).
- **File:** `editorial.css` (`.ed-story-group` / `.ed-story`). The overflow probe shows `div.ed-story-group r=2196`.
- **Fix:** add `overflow:hidden` (or `clip-path: inset(0)`) on the stories panel track.

### P2-12 · After onboarding, the profile toast covers EDIT PROFILE, and the ISSUED stamp covers the bio
- **Size:** 390.
- **Wrong:**
  - The "Your passport is issued." toast sits on top of the EDIT PROFILE button and the settings icon.
  - After the slam, the ISSUED stamp stays over the bio band and hides part of the bio text ("quarries and quiet tunnels").
- **Shot:** `shots/ob_d390_9-profile.png`, and the 1440 version `shots/ob_d1440_9-profile.png`.
- **Files:** issued-moment code in `profile/profile.js`; toast `.br-toast`.
- **Fix:**
  1. Raise the toast above the share bar, or move it to the top on phones.
  2. After the moment, fade the stamp to a small corner mark, or put it over the photo or rows area instead of the bio. Keep the slam itself; it is a named delight moment.

### P2-13 · Plan trip: the empty-day text has no padding
- **Size:** 390.
- **Wrong:** "Room for a discovery. Add a spot from the collection." starts on the left border of its box.
- **Shot:** `sheets/d390_plan_trip_p1.jpg`.
- **File:** day drop-zone in `site/planner.mjs` and `pages.css`.
- **Fix:** add `padding:16px 18px` to the empty-day placeholder.

### P2-14 · Light theme: the community "new spots this month" tile has no edge
- **Sizes:** 390, 1440 (light).
- **Wrong:** the "28 / new spots this month" bento tile is the same cream as the page. It shows as a loose number.
- **Shots:** `sheets/l1440_community_p1.jpg`, `sheets/l390_community_p1.jpg`.
- **File:** `.dcv` / `dv-p` colour class in `site/community-v2.css` (light rules).
- **Fix:** give `dv-p` in light theme a 1px line border or a slightly darker panel colour.

### P2-15 · The profile "want to go" input placeholder is cut off at 1440
- **Size:** 1440.
- **Wrong:** in the narrow my-map side panel, the placeholder reads "a spot, a ci".
- **Shots:** `sheets/d1440_account_p1.jpg`, `sheets/d1440_profile_user_preview_p1.jpg`.
- **File:** want-to-go form in `profile/profile.js` and `profile.css`.
- **Fix:** shorten the placeholder to "add a place", or put the add button on its own row on narrow panels.

### P2-16 · The contribution tiles are misaligned when empty
- **Sizes:** 390, 1440.
- **Wrong:**
  - The "—" dash sits at the top in SPOTS and RANK, and at the bottom in STORIES, because the labels differ in line count.
  - "0 FOLLOWERS · 0 FOLLOWING" breaks in the middle of the phrase on phones.
- **Shot:** `sheets/d390_profile_user_preview_p1.jpg`.
- **File:** `.pp-statsrow` / contributions grid in `profile.css`.
- **Fix:**
  1. Top-align the tile content (value then label).
  2. Keep "N followers" and "N following" each on one line (`white-space:nowrap` per item).

### P2-17 · The home page has no theme attribute for about the first second
- **Size:** 1440.
- **Wrong:** `probe3.py` samples `data-theme` every 150ms. The first 7 samples on `/` have no attribute; all other pages set it right away. This can flash the wrong colours, especially for light-theme users (see P1-1 and P1-2).
- **File:** `source/index.html` head. The inline script only rewrites the URL.
- **Fix:** also set `document.documentElement.dataset.theme` in that inline script, before the CSS loads.

---

## Per-page polish (P3)

1. **Placeholder and dev copy that users can see** (Charlie decides what stays):
   - "newsletter signup coming soon." on every page CTA.
   - "publisher credit unavailable" on a browse card.
   - "Source content captured from DeepSpot on October 8, 2026." on leaderboard and roadmap.
   - "Discussion snapshot from October 8, 2026…" on forum.
   - "This preview shows the inbox layout" on inbox.
   - "Live keys are never copied into this preview" on invites.
   - "…not connected in this preview" on plan trip.
   - "Prizes and point values shown are from the original DeepSpot giveaway page" on competition.
   - Shots: `sheets/d390_*`.
2. **Icons:**
   - /invites/ "one good introduction." uses a pentagram-in-circle. It reads as occult. See `sheets/d390_invites_p1.jpg`.
   - /inbox/ uses the share/upload icon for "messages". See `sheets/d390_inbox_p1.jpg`.
   - Swap both in `site/pages.mjs`.
3. **Aizu guide placeholder art:** the caption is "take the long way." on the /guides/ card but "the long way round." on the guide page. The guide page also prints the same description twice (hero and "follow your curiosity."). See `sheets/d390_guides_p1.jpg` and `sheets/d390_guide_id_tas_aizu_samurai_cultural_tour_p1.jpg`.
4. **Two blue CTA blocks in a row** with a dark gap between them: guides ("a trip that's entirely yours." + "know a hidden gem?") and leaderboard ("curiosity has its rewards" + "know a hidden gem?"). Keep one per page. See `sheets/d390_guides_p1.jpg` and `sheets/d390_leaderboard_p1.jpg`.
5. **/guides/ at 1440:** 7 guides in 3 columns leaves 1 card alone on the last row. Make the last card span 3 columns, or show 6 cards plus a CTA tile. See `sheets/d1440_guides_p1.jpg`.
6. **/stories/:**
   - Cards with no excerpt leave tall empty gaps (The Man from the Basement, Ghost of Moscow, Witches).
   - Data typo: `"witches"that` is missing a space (`editorial-stories.json`).
   - See `sheets/d390_stories_p1.jpg`.
7. **Tag case and breadcrumbs:**
   - Card tags are UPPERCASE on browse but lowercase on spot, story and guide pages.
   - The breadcrumb has a double gap ("deep spots   / Oya History Museum").
   - See `sheets/d390_spot_*` and `sheets/d390_browse_p1.jpg`.
8. **Story header on a phone:** "save story" wraps onto its own centred line under "by Krista Watson · 3 min read · share". See `sheets/d390_story_id_shark_p1.jpg`.
9. **Page-title styles mix 2 systems:** two-colour blue/green (browse, stories, guides, invites, leaderboard, forum, mission, membership, competition, sponsored, roadmap) and white (map, fieldbook, plan trip, contribute, inbox). Pick one rule, for example "white for tools, two-colour for content".
10. **Buttons for the same action differ:** "continue with Google" / "continue with Apple" is a 56px, 18px pill in the gate but a 74px, 24px bold pill on /welcome/. Join/read-more pairs on community have different heights ("join now" 52px, "read more" 44px). See `sheets/d390_welcome_p1.jpg` and `shots/probe2_vote_390.png`.
11. **/welcome/:** the headline sits about 15px above the first button (tight). The only way back is the logo. See `sheets/d1440_welcome_p1.jpg`.
12. **Home at 390:**
   - The "featured spot" tab wraps to 2 lines.
   - Avatar circles cover letters of "the people behind the pins." ("pins" is half hidden).
   - See `sheets/d390_home_p1.jpg`.
13. **Competition:** "$300" uses a yellow-green (#d4f07a-ish) that no other page uses. Use the brand green. See `sheets/d390_competition_p1.jpg`.
14. **Light theme globe** (profile my-map): a white crescent at the bottom makes the globe look washed out. See `sheets/l390_profile_user_wayfarer_p1.jpg`.
15. **Community spot cards:** the cards are near-black until the lazy WebP loads, which looks empty on slow phones. Add a blurred background colour or an LQIP. See `sheets/l390_community_p1.jpg` (from the fast scroll) and `shots/probe4_comm_light_390.png`.
16. **Contribute:**
   - "start a new draft ↗" uses an external-link arrow for a local action and has no underline, but the link under it has one.
   - There is a large empty gap above "save draft".
   - See `sheets/d390_contribute_p1.jpg`.
17. **Review pages still in the published tree:** `discord-variations.html`, `promo-variations.html`, `giveaway-variations.html`, `banner-variations.html`, `gate-preview.html`. Nothing links to them, but they are public. Remove them in `publish_pages.sh`, or add noindex. `?dc=1..10` and `?promo=` still work on live pages.

---

## Known items in HANDOFF that I did not re-list
These are still visible and I confirmed each one:
- The profile globe is small on desktop.
- Long names get tiny at 320.
- Community bios and marks are empty.
- The urbex-rat icon reads as "factory".
- The prophet icon (torii) is Japan-specific.
- The chrome foil looks greyish.

## Checks that are not issues
These looked wrong in the full-page shots but are screenshot artefacts. I checked each one in the live viewport:
- A second home hero under the footer.
- The black hero at 1440.
- Dead space under the spot and story gate.
- One `/profile/?user=preview` request failed with ERR_CONNECTION_REFUSED. It happened while `links.py` loaded the dev server at the same time. It is not a site bug.

## Files
- **Scripts:** `crawl.py` + `check.js` (shots and mechanical checks per view), `cachekeys.py`, `links.py`, `probe.py` / `probe2.py` / `probe3.py` / `probe4.py` (gate, theme, colour, reduced motion, follow, vote, edit dialog), `ob_shots.py` (onboarding states), `sheet.py` (column sheets of full pages).
- **Data:** `res_{d320,d360,d390,d1440,l1440,l390}.json`, `cachekeys.json`, `links.json`, `probe.json`, `onboarding_flow.log`.
- **Shots:**
  - `shots/{view}_{route}_{top,full}.png`, with views d390, d360, d1440, l1440 and l390.
  - `sheets/*.jpg` (full pages in columns).
  - `shots/ob_*` (onboarding 390 dark, 390 light, 1440 dark).
  - `shots/probe*`.
