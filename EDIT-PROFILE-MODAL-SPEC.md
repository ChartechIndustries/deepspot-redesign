# Edit profile → in-page window over a blurred page (2026-10-21, Opus plan → Sonnet build)

## Ask (Charlie)
"Edit profile should open up a window within the page that blurs the background. This allows you to organize things
better and make it larger, more bold, and more exciting."

## Where (source/profile/profile.js, profile.css)
- `editHTML(lk)` (~line 296) builds `<form id="pp-edit">` inline in the bio block; `archHTML(sel)` + `archDesc(t)` = the new
  traveler archetype picker (45 chips in 10 groups, fixed-height description box that follows hover/focus/selection).
- `wireV4()` (~line 335): `setEdit(on)`, live look preview (`sec.dataset[...]`), bio counter, cancel → `applyStyle()`,
  draw → `setTab('mark')`, archetype hover/focus wiring, submit (saves account incl. `style`, `LOOK_KEY`, `writeStyle(czPick())`,
  then `loadProfile('preview')` + `render()`).
- `customizeHTML()` (~line 522) = left-pane background + passport foil swatches (`cz-` radios), `czPick()`, `applyStyle()`
  previews them live. `LOOKS` (~line 291) = bio background / type / align.
- Roll mole: `[data-set-roll]` click handler (~line 472) → `rollMole(trigger)`.
- Owner-only: the "edit profile" button `[data-edit]` exists only on your own passport (`?user=preview`).
- No other session is editing profile files right now. Backup first: `backups/before-edit-modal-20261021/`.

## Build
1. Use a native `<dialog class="pp-editdlg">` opened with `showModal()` (focus trap, Escape, top layer for free).
   `::backdrop` = ink tint `rgba(6,10,18,.55)` + `backdrop-filter: blur(14px) saturate(1.1)`; fade in .25s.
   Dialog enters with a short rise + scale (from 0.96, .35s, slight overshoot); reduced motion = plain fade.
   The inline form is removed from the bio block; `[data-edit]` opens the dialog (aria-haspopup="dialog").
   Closing (X, Escape, cancel, backdrop click) = cancel: restore previews (`applyStyle()`, bio look) and return focus
   to `[data-edit]`. Save = current save logic, then close and show the toast.
2. Size: desktop `min(1180px, 94vw)` × `min(860px, 92vh)`, radius 28px, panel colour of the theme, 1px line border, big
   shadow. Phone (≤650): full-screen sheet sliding up from the bottom, 100dvh, sticky header + footer.
3. Layout (desktop): two columns.
   - LEFT (≈380px, sticky): LIVE PREVIEW — a clone of the owner's passport card (`.pp-id9` + its mark strip, or rebuild with
     the same markup) on the chosen left-pane background swatch, with the chosen foil. Updates live: name, @username,
     archetype stamp/text, bio-look colour chip, foil + background. Under it a small "preview" mono label. Hover tilt OK.
   - RIGHT (scrolls): big header "edit your passport." (display style, ≈56–64px, lowercase, green period) + close X (48px).
     Then numbered sections with BIG headings (32–40px bold) and generous spacing:
       01 who you are — name, username, bio (big inputs: 20px text, 60px tall; textarea 4 rows; counter).
       02 traveler archetype — the existing picker, larger: description box on top (icon 56px, name 28px bold, text 17px),
          chips 17px/800, 44px tall, group labels mono. Fixed-height description box (no layout jump on hover).
       03 bio look — background, type, align as large visual swatches (≥64px tiles showing the real colour / a sample "Aa"
          in that face / alignment glyph), not tiny radio pills.
       04 passport style — left background + foil from `customizeHTML()` as large swatch tiles (locked ones show a lock).
       05 your mark + mole — two big buttons "draw my mark" and "roll my mole" (close the dialog first, then do what they
          do today; drawing returns to the pad as now).
     Optional: a slim left index of the 5 sections inside the right column header that scroll-spies — only if it stays clean.
   - Sticky FOOTER bar across the dialog: unsaved-changes dot + text, "cancel" ghost button, big green "save profile"
     pill (≥56px tall, 20px bold).
4. Colours: site palette (green #07d653, cobalt #3c60ff, aqua #83cdce, cream #f5f4ee, ink #0c101b); light + dark themes;
   colour on/off (`data-panel-color`). Big, bold, exciting — but no new random motion beyond the entrance and hover states.
5. Keep all existing behaviour: archetype save + own pick wins, bio look keys, cz styles, cancel restores, toast.

## Checks
- `node --check`; `node --test qa/*.test.mjs` (34 pass).
- Headless (`--use-angle=swiftshader`), server on 8766 (running, do not start another), `MSYS_NO_PATHCONV=1` in Git Bash.
  Use mouse coordinates / JS clicks; Playwright's "stable" check fails on this animated page.
- Screens of the open dialog at 1440, 1920, 390, 320 — dark + light, colour on/off → `qa/edit-modal/`. Look at each.
- Flow test: open → type name → preview updates → pick archetype → change bio look + foil → save → passport shows them;
  open → change → Escape → nothing saved, previews restored, focus back on edit button.
- axe 0 on the open dialog (1440 dark/light, 390). Console 0 errors. scrollWidth == viewport.
- Bump keys in profile/index.html (profile css/js). README log entry. No commit/push.
