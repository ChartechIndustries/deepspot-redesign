# "live from the discord." — 10 build variations (2026-10-22, Opus plan → Sonnet build)

## Ask (Charlie)
"I don't like the new live from discord section, can we do 10 build variations." He wanted the ORIGINAL discord section
(content of 2026-10-20: cobalt header bar, title, real stats — new spots this month + 151 members — live dot,
"join now ↗"; #announcements pinned post; #polls poll with 4 real options + local vote + gate hook `data-opt`; "featured
messages" live feed of real forum posts) with a more exciting composition. The 10/22 asymmetric attempt (feed bleeding
past the bar, tilted pinned note, wide poll) did not land.

## Rules for variations (Charlie's standing rule)
Same design system and same content in all 10 — vary only the LAYOUT / composition / how information is staged.
Site palette (cobalt #3c60ff, green #07d653, aqua #83cdce, cream #f5f4ee, ink #0c101b, panel), site type (big lowercase
display with period, mono kickers), fine 1px lines, real data only (no invented counts, %, online numbers, times).
Each must work dark + light + colour-off, 1440 and 390 (phone designed, not squeezed), no horizontal overflow, axe 0.
Hover-only motion + the feed rotation (pauses on hover/focus/offscreen/hidden; static for reduced motion).

## The 10 (make them truly different; each a strong idea)
1. **classic+** — the original 3 columns, refined: equal cards under the cobalt bar, bigger type, stronger hierarchy.
2. **chat window** — the section as one big Discord-like app window: channel sidebar (#announcements, #polls, #general…
   only real channels), main pane = live feed, right rail = poll; title + stats in the window's title bar.
3. **bento** — bento grid of tiles of different sizes: giant stat tiles (28, 151), feed tile tall, poll tile wide,
   pinned tile, join tile in green.
4. **newspaper** — editorial front page: masthead "live from the discord.", the pinned post as the lead story with big
   headline, poll as a "reader poll" box, feed as a "wire" column; thin rules, mono datelines.
5. **ticker + stage** — a full-width scrolling ticker of message snippets at the top, then a centred big poll stage
   with the pinned post and stats flanking it.
6. **phone mock** — a big phone frame showing the live feed like a real chat on the right; left side huge title, stats,
   poll and join button.
7. **stacked cards** — feed messages as a fanned stack of message cards that deal forward one at a time (matches the
   passport deck language), poll + pinned beside it.
8. **split cobalt / ink** — hard 50/50 split: left full cobalt with giant title + stats + join; right ink with pinned,
   poll, feed stacked tightly.
9. **poll hero** — the poll is the hero: giant question, four huge option bars full-width; pinned post and live feed as
   a slim strip below.
10. **marquee wall** — the feed as two slow opposing marquee rows of message bubbles across the full width (wall of
   voices), title/stats/join centred between them, poll + pinned below in two cards.

## Build
- Keep the current section code as variant "now" (`?dc=now`). Implement the 10 in `site/community-v2.mjs/.css` behind
  `?dc=1..10` (default stays the current one until Charlie picks). Shared data/handlers (poll vote, gate hook, feed timer)
  reused, not duplicated per variant.
- Review page `source/discord-variations.html`: lists the 10 (+ now) with name + one-line idea + link to
  `/community/?dc=N#dc` (anchor jumps to the section), and a thumbnail per variant (screenshot images saved under
  `source/community-assets/dc-thumbs/` ≤ 900px wide webp).
- PC is shared with gaming: ONE headless browser at a time, below-normal priority (psutil), no swiftshader.
  Server 8766 runs detached — do not start another. MSYS_NO_PATHCONV=1. Backup first
  (`backups/before-dc-variations-20261022/`). Bump keys (community-v2.mjs key must match in pages.mjs AND giveaway-hero.mjs).
  README log. Do not commit/push.

## Checks
- `node --check`; `node --test qa/*.test.mjs`.
- Screens → `qa/dc-variations/`: each variant at 1440 dark, 1440 light, 390 dark (section only). Look at every shot;
  fix anything weak, cramped, empty or off-system; ≥2 rounds. Poll vote + feed rotation work in every variant.
- axe 0 on each variant (1440 dark + 390), console 0, scrollWidth == viewport.
- Final: contact sheet `qa/dc-variations/sheet.png` of all 10 at 1440 dark, numbered.
