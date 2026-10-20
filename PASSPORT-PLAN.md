# Passport upgrade — round 1 (2026-10-15)

Goal: make the explorer passport (`/profile/`) stronger. Round 1 = two features.

## Where
- Passport page: `source/profile/index.html`, `profile.js` (render()), `profile.css`, `data.mjs` (preview profile from account draft), `passport-export.mjs` (share image).
- Account editor: `source/site/account.mjs` (profile form), `site/account-state.mjs` (normalizeAccount, avatarImage, mole).
- Mole snapshot: `draft.mole.png`, a square full-body render from `site/mole/mole-reveal.mjs`.
- Server: http://localhost:8766/ (already running, serves `source/`). Own passport: `/profile/?user=preview`.

## Feature 1 — mole head crop in the passport portrait
- When the profile picture is a mole (`avatarMode==='mole'`), the `.pp-portrait-field` shows the mole cropped in on the head (head + top of shoulders), like an ID photo.
- Pass a flag from `data.mjs` (for example `imageKind:'mole'`) so the portrait gets a class (`pp-portrait-mole`).
- Crop with CSS (object-fit:cover + object-position + scale/transform on the img). Find the exact head position by rendering a real mole snapshot. Hats/head traits must not clip at the top; leave a little headroom.
- Same crop in the share image (`passport-export.mjs`): draw the cropped region with drawImage source rect.
- Photo and traveler-style avatars stay unchanged.

## Feature 2 — signature / art pad below the bio (PictoChat style)
- Place: on the passport page, directly below the bio (`.pp-bio`), inside `.pp-identity`. It replaces the current text signature block position; keep the text signature line if a text signature exists (show the drawing above it).
- Own passport (`profile.localPreview`): show an editable pad. Other profiles: show the saved drawing read-only, or nothing.
- Look: Nintendo DS PictoChat. Light ruled paper canvas (pale lines), a rounded gray/blue device frame, a left vertical tool strip with chunky pixel icon buttons, a name tag tab in the top-left of the canvas with the user's name, pixel font for UI labels (use a free Google Font such as "Press Start 2P" or "Silkscreen", loaded from Google Fonts only). It must still sit well inside the passport's design (respect light/dark theme tokens for the frame around it).
- Tools:
  - Brush toggle: free brush (smooth round strokes, pointer pressure if available) and pixel brush (snaps to a grid, for example 4px cells on a low-res buffer scaled up with `image-rendering:pixelated`).
  - Size: small / big (PictoChat has two).
  - Eraser.
  - Palette: about 12 colors in a swatch strip (black, white, gray, red, orange, yellow, green, teal, blue, indigo, pink, brown). Default black.
  - Clear (two-step confirm, no browser dialogs), undo (keep ~20 steps).
  - Save: stores a PNG data URL in the account draft as `signatureArt` (add to `normalizeAccount` with a size cap and data-URL regex like the mole png). Show a short status line.
- Canvas: fixed logical size (for example 256x96 like the PictoChat strip, scaled to the column width). Pointer events (mouse, touch, pen), `touch-action:none`. Strokes connect between pointer samples (no dotted gaps).
- Display: `data.mjs` passes `signatureArt` to the profile; read-only view shows it on the ruled paper. Add it to the share image under the bio.
- Account editor: add a small preview of the saved drawing next to the existing "passport signature" text field with a link "draw on your passport ↗" to `/profile/?user=preview#pp-pad`. Do not build a second pad there.
- Accessibility: buttons have aria-labels and aria-pressed; keyboard focus visible; the canvas has an aria-label. Reduced motion: no animations needed beyond simple hover.

## Rules
- Match the surrounding code style: terse one-line functions, `esc` for all user text, minified-looking CSS lines in `profile.css`. New pad code goes in a new module `source/profile/sign-pad.mjs` + rules appended to `profile.css`.
- Bump cache keys on changed files (`?v=`) in `profile/index.html` and wherever `account.mjs` is imported.
- Backup first: copy changed files to `backups/before-passport-r1-20261015/`.
- No browser windows. Visual QA with headless Chrome/Playwright only.
- Do not touch other pages.

## Checks
1. `node --check` on every changed JS/MJS file; run `qa/account-state.test.mjs` (add a test for signatureArt normalize).
2. Headless screenshots: `/profile/?user=preview` with a seeded draft (mole avatar + bio + drawing), desktop 1440 and phone 390, light and dark. Also a sample profile (no pad, read-only).
3. Mole crop: head centered, nothing clipped at top, at both widths.
4. Draw test: scripted pointer strokes in both brush modes, save, reload, drawing persists and shows in the passport and share image.
5. Log the change in README.md (short section, cache keys, backup path).
