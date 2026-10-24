# Builder C report (community page)

Items: 5.1 done, 5.2 done (smoothness only measured numerically, see open issues), 5.3 done, 5.4 done, 5.5 done, 5.6 done, 5.7 done.

Files changed: site/community-v2.mjs/.css, site/giveaway-hero.mjs/.css, site/passport-mini.mjs/.css, site/discord-link.mjs (LIVE_SOURCE, ago), community/index.html (ds-dialog.css link), NEW site/ds-dialog.mjs/.css. Backups: backups/before-notes-1023/source/...

- 5.1 eyebrow: sans 16px sentence case "deepspot initial giveaway" (data-copy kai-2). Chip: "october race . ends in 8d ...".
- 5.2 deck: continuous position + spring (260/26). Drag follows 1:1, tilt max 12 deg, release flies (flick velocity), arrows/keys/side-card tap play the same flight, counter ticks, shadow lifts. Desktop: coverflow piles both sides. Phone: stack behind front card (6px / -3% steps), front card flies off left to the back.
- 5.3 chat: bubbles, avatar, name, #channel, replies; typing row 1.2 s, arrival every 6-8 s, pause on hover/touch/focus/offscreen/hidden tab. Real forum[] only. Posts have NO date, so no time is shown (ago() shows one as soon as a post has date/createdAt). Header "latest from the discord" + "151 members". LIVE_SOURCE in discord-link.mjs switches label to "live".
- 5.4 guidelines: ds-dialog (big 48px X sticky, Esc, outside tap, back button, #guidelines deep link, focus trap, blur; phone = full sheet, drag handle down closes). Text = forum post unchanged. Opens from pinned card and chat link. Tested open/back/Esc/outside/deep link/X, dark+light, 390+1440.
- 5.5 join tile: content height, join now 48px with arrow same line; phone one row.
- 5.6 vm-k removed.
- 5.7 deal-out: no scroll trigger. Desktop hover = peek fan, click/tap/Enter/button = deal. "deal again" button. Reduced motion: no peek/deal/flight (instant).

Copy for Kai (data-copy): kai-2 hero eyebrow; kai-4 chat label + "latest posts" kicker (was "live now"); kai-5 h2 "live from the discord." (claims live while LIVE_SOURCE is false); kai-6 new deck strings ("hover to peek, click to deal", "tap to deal", "deal again"). COPY-FOR-KAI.md does not exist; not created.

Screenshots (qa/notes-1023/C/): base-*, r5-part-*, r4-dc-1440-dark, r3-dc-390 (via r3), m2-peek/open/dragmid/arrow/swipe-*, dlg-*, rm-open-*, chat-typing-*.

Open issues
- Frame-jump check: machine was loaded (about 9 fps in headless), so per-frame px deltas are sampling gaps (max 106 px per ~100 ms frame during a 228-390 px flight); the 10-frame strips show the settled state. Real-device check needed.
- ds-dialog.mjs/css are new unkeyed refs: run bump_keys. D may adopt ds-dialog for the edit dialog.
- Pinned card still has empty space in the middle on desktop (grid row set by poll).
- Not tested: iPad widths 820/1180/1024, 360 width, light theme for the deck stack at phone.
