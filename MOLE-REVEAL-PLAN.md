# Mole profile reveal — plan (2026-10-13)

## Ask (Charlie)
Clicking your profile auto-generates a random mole (from his mole PFP 3D models). The reveal should feel like a Pokémon evolution:
- a slow push-in on the mole
- the silhouette flickers while trait assets cycle in and out
- a final reveal of a fully random roll

## Source assets (reuse, don't rebuild)
`C:\Users\CharD\Downloads\Mole Export\outfitter-3d\`, a working three.js 0.180 viewer:
- `assets/base.glb`: the bare mole (Draco)
- `assets/traits/<Slot>/<Trait>.glb`: 62 traits. Body_Shirt 19, Head_Hat 26, Mouth_Area 9, Jackets 5, Face 2, Eyes 1.
- `assets/scene.json`: camera, slotOrder, slots → trait list (id, name, file, thumb), world/env and sun direction
- `assets/env.hdr`, `assets/thumbs/`
- `app.js`: already solves loading (GLTF + Draco from the jsdelivr three 0.180 path), prepare(), the trait cache, equip/unequip per slot, camera home, lighting (exposure 0.91, sun 1.10), randomOutfit() with NONE_CHANCE 0.15, and downloadPNG(). Lift these functions instead of rewriting them.
- Copy the assets into `source/site/mole/assets/` (about 11 MB). Don't edit the originals in Downloads.

## Where it lives in the redesign
- `/account/`: the profile avatar (`#account-avatar`, `#account-mini-avatar`). Add a third avatar mode, "mole", next to photo/style.
- Clicking the profile avatar opens the reveal. A "roll a mole" button does the same.
- The result is saved to the profile draft (localStorage `deepspot-profile-draft-v1`):
  - `avatarMode:'mole'`
  - `mole:{traits:{slot:id}, png:<dataURL ~512px>, rolledAt}`
- The PNG then shows in the mini avatar, the account avatar and the /profile/?user=preview passport, wherever the photo shows today.
- Keep the draft schema rules: no private data. Make sure the PNG stays well under the existing ~1 MB photo limit (512px WebP/PNG).
- Load three.js and the assets ONLY when the reveal opens (dynamic import). The page cost stays zero until the click.

## The reveal (about 6–7 s, Pokémon-evolution feel)
Full-screen overlay in the redesign palette: dark navy #0c101b and a soft radial cobalt (#3c60ff) glow behind the mole. Cream (#f5f4ee) silhouette.
1. **Intro (0–0.8 s):** the overlay fades in. The bare mole appears as a flat cream/white silhouette (override all materials with an unlit MeshBasicMaterial). The camera starts wide.
2. **Charge (0.8–4.8 s):**
   - The camera pushes in slowly (ease-in-out dolly) and adds a tiny idle sway.
   - The silhouette swaps random traits in every slot. The swaps start slow (~450 ms) and speed up to ~50 ms, like the evolution flicker.
   - The silhouette pulses between cream and cobalt-white.
   - Faint light rays or rings expand behind the mole.
   - Preload a pool of about 15–20 random traits across slots during the intro so the flicker never waits on the network. The final roll is chosen up front and loaded first.
3. **Flash (4.8–5.3 s):** a white flash fills the screen and the final traits lock in.
4. **Reveal (5.3 s+):**
   - The flash fades out to the real materials and lighting (env.hdr plus the sun, as in the outfitter).
   - Small sparkle particles burst out in green and cobalt.
   - A small bounce.
   - The trait names appear in mono below, e.g. "pirate · aviators · rose".
   - The title, in the site's two-color big type: "meet your mole."
5. **Actions:** "keep this mole" (saves to the draft and closes), "roll again" (replays the sequence), "download" (PNG). Close with Esc or ×.

## Rules
- The roll is uniformly random per slot. Each slot has a NONE_CHANCE of 0.15, but Body_Shirt and Head_Hat always get a trait so every mole looks dressed. Seed from crypto.getRandomValues.
- Reduced motion: no flicker or flash. A short fade from silhouette to the final mole.
- Accessibility: a focus trap in the overlay, aria-live announcement of the result, buttons reachable by keyboard, Esc closes.
- Performance: pixel ratio capped at 2, one renderer, disposed on close. Pause when the tab is hidden.
- Mobile 390/320: the overlay fits and the buttons stack.
- No other routes change except the avatar rendering spots listed. Back up the touched files to `backups/mole-reveal-20261013/` first.

## Files
- New: `source/site/mole/` (assets, `mole-reveal.mjs`, `mole-reveal.css`).
- Edit: `source/site/account.mjs` (mole mode, click handler, render), and the profile/passport rendering that shows the photo (find it under `source/profile/`).

## Checks
- node --check. `node --test qa/*.test.mjs` still passes. Add a small test for the draft mole schema/size if practical.
- Chrome: open /account/ and click the avatar. Watch the full sequence, take screenshots at the silhouette, the flicker, the flash and the reveal. Test roll again and keep. Reload and confirm the avatar persists in the mini avatar, the account avatar and the passport preview. Test dark and light mode, 390 px, and reduced motion (emulate it via JS matchMedia override or CSS check). No console errors.
- Automation tabs can report document.hidden=true, which pauses rAF. Use a visibility shim when verifying, and don't misread it as a bug.
- Remove any test mole draft afterwards, or restore the previous draft.
