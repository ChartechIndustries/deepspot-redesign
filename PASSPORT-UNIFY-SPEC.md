# One passport everywhere (2026-10-21, Opus plan → Sonnet build)

## Ask (Charlie)
1. "The passport needs to be longer in the actual profile view to include the bio."
2. "Have the archetype stamp in the bottom left corner."
3. "The passports on the community page should reflect the passports we have now ... the top should go back to
   'DEEPSPOT PASSPORT'; the icon at the top should reflect the archetype they are ... these passports on the community
   page should reflect what your passport looks like on the profile section."

## Today
- Profile card: `.pp-id9` in `source/profile/profile.js` (~line 205–225) + `profile.css`; shared card builder in
  `source/profile/passport-edit.mjs` (used by the edit dialog preview + onboarding; onboarding v2.2 made it taller
  5:7.6 with a full-width BIO band under the photo block and the style sticker on the photo block).
- Community card: `source/site/passport-mini.mjs/.css` (`pm-` prefix, v3.1: big archetype as the header line, colourway
  by archetype group, watermark, foil by rank, photo patterns, stamp ink/angle, ribbons) inside the participants deck in
  `community-v2.mjs` (deck → deals into carousel on scroll, restacks when out of view).

## Build
1. ONE card component. Extend `profile/passport-edit.mjs` (or a new `profile/passport-card.mjs` that both import) so it
   renders the full passport for ANY profile model (own or other): header, photo block, rows (name/user/since/level or
   type), BIO band (full-width, under the photo block, above MY MARK; auto-fit text 2–4 lines; empty bio → the band shows
   a quiet "no bio yet" line for others' passports, nothing editable), MY MARK (contain-fit, the v2.2 rule), MRZ, foil,
   soft emboss (v2.1), tilt/sheen. The profile page main card, the edit-dialog preview, onboarding and the community
   deck ALL use it. Profile card becomes the same taller 5:7.6 shape (fit it into the left pane: `fitPassport` zoom).
2. Header everywhere: "DEEPSPOT" big + "EXPLORER PASSPORT · PASAPORTE · パスポート" small (as the profile had before v3.1),
   red number box on the right. The round CREST at top-left shows the person's archetype icon (`travelerMark(id)`,
   bold, centred, in the crest circle; no archetype → the DeepSpot star). Crest colour = the archetype group accent.
3. ARCHETYPE STAMP: the round ink stamp (archetype name + level title) moves from over the photo to the card's
   BOTTOM-LEFT corner (overlapping the MRZ band edge slightly, rotated −10…−16°, like a real entry stamp). Keep its ink
   colour/angle variation on community cards. Make sure it never covers the mark or MRZ text in a way that hurts reading.
4. Community deck: replace the `pm-` card with the shared card at the deck's size (keep the deck, deal-out on scroll,
   restack, centre-card tilt + holo, click → passport, arrows/keys/"1 / 10"). Keep the per-person variety that still fits
   the real passport: foil by rank (gold/chrome/holo), stamp ink + angle, crest accent by archetype group, 1st/2nd/3rd
   ribbon. Drop the v3.1 archetype-as-header and the big watermark (crest carries the archetype now). Community card =
   exactly what that person's profile passport shows (same data: bio, mark if any, level, since, number).
5. Keep every delight moment: onboarding print-in + REGISTERED stamp, stamp-on-done, ISSUED slam, passport-page issued
   moment, community deal-out, follow shake, hover tilt/sheen.
6. Icons: another builder is redrawing all 45 archetype icons in `site/account-state.mjs` (`travelerMark`) at the same
   time. Don't edit account-state.mjs or tools/archetypes.py; just render `travelerMark(id)`. Don't hard-code stroke
   widths for the crest icon beyond what's needed to size it.

## Checks
- PC shared with gaming: ONE headless browser at a time, below-normal priority (psutil), no swiftshader except WebGL shots.
- `node --check`; `node --test qa/*.test.mjs`; onboarding flow (`qa/onboarding-v2.2/flow.py` at 390 + 1440); edit dialog
  still saves.
- Screens → `qa/passport-unify/`: profile `/profile/?user=wayfarer`, `lampbane`, `preview` (filled) at 1440/1920/390;
  community participants deck closed + open at 1440/390; a contact sheet of all 10 community passports flat next to the
  matching profile passport crop (they must match). Look at every shot, fix, ≥2 rounds.
- axe 0, console 0, scrollWidth == viewport. Backup `backups/before-passport-unify-20261021/`. Bump keys (community-v2.mjs
  key must match in pages.mjs AND giveaway-hero.mjs). README log. Server 8766 runs detached — do not start another.
  MSYS_NO_PATHCONV=1. Do not commit/push.
