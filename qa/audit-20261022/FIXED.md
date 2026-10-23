# Audit 2026-10-22 — what was fixed (tighten pass, same day)

Backups: `backups/before-tighten-1022/`. Checks and shots: `qa/tighten-1022/` (`res_*.json` = audit crawl after the fixes, `shots/`, `after_shots/`).
Status: FIXED / SKIPPED (reason).

## P1
- P1-1 FIXED. Every page reads `?theme=` then `localStorage['deepspot-theme']` then dark, in the head script. Page load never writes storage. Only a toggle click writes it (browse, profile, onboarding, core header, home).
- P1-2 FIXED. Home toggle writes localStorage. Label is now "☼ light" / "☾ dark".
- P1-3 FIXED. New `tools/bump_keys.py`: every local css/js/mjs reference (html, imports, dynamic imports, preload lists, home RSC payload) has `?v=<hash>`; one file = one key. `--check` reports stale keys. Home chunk trio shares one key; no hydration error.
- P1-4 FIXED. Forum rows: `minmax(0,1fr)` column, words break only when needed, one column under 480px. No overflow at 320.

## P2
- P2-1 FIXED. Light home header is cream with ink text and a line, like other pages. Label matches.
- P2-2 FIXED. Video 5.6 MB to 1.6 MB (desktop) and 0.55 MB (phone / save-data). Card images are 800 and 400 webp variants with srcset (`site/img.mjs`, `tools/make_card_images.py`). Cloud texture is webp (0.36 MB). Originals kept (`_archive/media-before-tighten-1022/` for the video).
- P2-3 FIXED. Home "top contributors" ranks by leaderboard points (same list as the race). Profile "based on N of M postings (the ones in this collection)". `/roadmap/` and the community block render from `site/roadmap-data.mjs`.
- P2-4 FIXED, one exception. Meta is 14px or more, body copy 17px or more on all audited pages. Exception: `p.pp-mono` "based on N of M postings…" is a 15px mono caption (meta). Passport card labels stay as designed; at 390 the card now renders at 79 percent, so 14px labels show at 11px. Below 390 the card cannot be wider than the screen, so labels are 10px at 360 and 9.5px at 320.
- P2-5 FIXED. Deep Spots / Stories / Guides tabs on browse, stories and guides, local links.
- P2-6 FIXED. Profile shows the site footer below 1100px (footer only, no CTA). Desktop fixed window unchanged. `/account/` already had a footer.
- P2-7 FIXED. Others: no big empty-bio line (the card says "no bio yet."). Own: one muted 17px line with an "add a bio" link.
- P2-8 FIXED. Phone edit dialog: the preview is a small sticky strip (mini card + name); "full preview" opens the big card. Form and focused name field are in view.
- P2-9 FIXED. Last chip sizes to its text, "+" removed, fade cue on the phone scroller.
- P2-10 FIXED. Map minimum zoom fills the map (no grey bands), pins fit with padding, note has a 16px gap, phone list ends in a fade.
- P2-11 FIXED (guard only). The marquee already clips inside its window; partial neighbour cards at the edges are the marquee design. Added `overflow:clip` on the panel.
- P2-12 FIXED. Toast sits at the top on phones. ISSUED stamp lands on the bottom strip of the card, never on the bio.
- P2-13 FIXED. Empty-day text has `16px 18px` padding.
- P2-14 FIXED. Light "new spots" tile has a 1px edge.
- P2-15 FIXED. Placeholder "add a place"; the add button wraps in a very narrow panel.
- P2-16 FIXED. Tiles top-aligned; each follower count stays on one line.
- P2-17 FIXED. Head script sets `data-theme` before CSS on every page including home.

## P3
- P3-1 SKIPPED. Placeholder / preview copy: Charlie decides what stays.
- P3-2 FIXED. Invites uses a key icon; inbox uses a mail icon.
- P3-3 FIXED. Guide art caption matches ("take the long way."); the description prints once.
- P3-4 SKIPPED. Design call (which CTA to keep).
- P3-5 SKIPPED. Design call (last-row layout).
- P3-6 PARTLY. Typo `"witches" that` fixed. Empty-excerpt card gaps skipped (design).
- P3-7 PARTLY. Breadcrumb double gap fixed. Tag case skipped (design).
- P3-8 SKIPPED. Not cheap to do safely.
- P3-9, P3-10, P3-11 SKIPPED. Design decisions for Charlie.
- P3-12 SKIPPED. Needs a layout change on home at 390.
- P3-13 SKIPPED. Brand green on the blue panel is 2.5:1, below the 3:1 floor for large text. The current yellow-green passes.
- P3-14, P3-15, P3-16 SKIPPED. Design / art changes.
- P3-17 FIXED. `build_pages.py` drops all dev and review pages (`DEV_FILES`); `publish_pages.sh` aborts if one is in the build. None are linked. Files stay in `source/`.
