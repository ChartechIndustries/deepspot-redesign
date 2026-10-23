# What's new panels v2 — spec (2026-10-22)

The first banner set on the home page = `<deepspot-news>` (`source/whats-new.js` + `whats-new.css`):
an accordion carousel of colored panels with side rails, phone = tabs under the panel.
Before shots: `qa/banners-blender/wn/before_1440_*.png`, `before_390_*.png`.

## Charlie's ask
1. Remove the **tours** panel (tours is under construction).
2. **community** panel: show the live messages (forum feed) with a **join now** button.
3. The other two (**discoveries** = Rummu prison, **featured spot** = Maishima): change the composition a little so they look better.

## 1. Tours
- Delete the tours story. Carousel = 3 panels: discoveries (paper), community (aqua), featured spot (blue).
- Rails, phone tabs, prev/next, autoplay, recycle animation must still work with 3 (check the clone/wrap logic,
  `--wn-rail` widths, tab widths on phone: 3 equal tabs).

## 2. Community = live from the discord
Same data and voice as the /community/ page section "live from the discord" (`source/site/community-v2.mjs`,
`msg()` and `discordNow()`): forum posts in `/site/content.json` → `forum[]` (4 real posts: author, category,
replies, body). Do not invent messages, counts or names. Join link = the same `DISCORD_URL` constant (export
it from community-v2.mjs or move it to a tiny shared module; one source of truth).
- Left (copy column): kicker with a pulsing green "live" dot + "live now", heading **"live from<br>the discord."**,
  one line ("explorers swapping finds, tips and plans right now." — keep it short, no invented numbers),
  a big **join now ↗** button (navy on aqua, pill, same size family as the hero explore button), and a small
  "open the forum ↗" text link to `/forum/`.
- Right (where the photo was): a chat window card (dark navy `#0b1a2e`, rounded 14px, header row
  `# featured-messages` + "from the forum") holding the messages as chat rows: mole/face avatar (`avatarHTML`
  from `/profile/identity.mjs`), **author**, `#channel`, replies count, first ~120 chars of the post linking to
  `/forum/?id=…` (use `localURL` pattern like community-v2).
- Delight: messages arrive one by one when the panel becomes active (fade/slide up, 120 ms stagger), then the
  feed slowly scrolls (vertical marquee, pauses on hover/focus, off for reduced motion and when the carousel is
  paused). Live dot pulses.
- Phone: heading + join button on top, chat card below (3 messages visible), no overflow at 320px.
- The panel's `read more` link is replaced by join now (no read more on this panel).

## 3. Discoveries + featured spot: new compositions (same copy, same photos)
Make them different from each other and from the old "text left / photo right box" layout.
- **discoveries (paper, Rummu)** — "photo window": the photo fills the panel content area full-bleed (cover,
  focus on the prison block), and the copy sits in a paper-coloured card overlapping the photo at the
  bottom-left (card ~44% wide, 28px padding, slight shadow), heading big. Place caption top-right on the photo
  as a small label chip. read more = arrow link at the card's bottom.
- **featured spot (blue, Maishima)** — "poster": photo on the LEFT ~58%, tall, with a 10px inset white
  hairline frame; copy on the right with a giant two-line heading that overlaps the photo edge by ~40px
  (white text, slight text-shadow over the photo part), a small "featured spot" eyebrow chip, description,
  read more at the bottom-right. Place caption under the photo.
- Phone: discoveries = photo on top (4:3) with the paper card overlapping the photo bottom by ~40px; featured
  = photo on top with the heading overlapping its bottom edge. Nothing clipped at 320px.
- Keep panel heights equal to today's (desktop ~350px, phone as now) so the section does not jump between slides.

## Rules
- Backup first: `backups/before-whats-new-v2-20261022/` (whats-new.js, whats-new.css, any other changed file).
- Run `python tools/bump_keys.py` after edits (cache keys are content hashes; it rewrites references).
- Light + dark theme, panel-colors on/off: check. Contrast ≥ 4.5 for all text.
- Headless only: playwright, `--use-angle=swiftshader`, below-normal priority, one browser at a time. Pattern:
  `qa/banners-blender/wn_shot.py` (shoots every panel; update it for 3 panels). Server http://localhost:8766.
- Screenshots: 1440, 1024, 820, 390, 360, 320 — every panel, dark + light. Save `qa/banners-blender/wn/after_*`.
  Look at each one. No console errors, no horizontal scroll, no clipped text.
- README.md: short "What's new v2 (2026-10-22)" entry.
- Do not commit, push or publish.

## Report
Short: files changed, what each panel looks like now, screenshot paths, problems left.
