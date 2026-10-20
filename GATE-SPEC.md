# Sign-in / paid gate — spec (2026-10-20)

## Ask (Charlie)
A pop-up gate that makes people sign in / pay to view parts of the site. Reference: `qa/gate-reference.png`
(NYT): the article loads, its top stays visible and fades out, and a sheet from the bottom says
"Create a free account, or log in." — one email field, a solid Continue, "or", legal line, Continue with Google /
Apple, SSO link, and "Enjoy unlimited access … See subscription options". Do it in OUR style.

## What is gated (must match the site's own FAQ + membership page — do not contradict them)
FAQ: browsing the core map, contributing, voting and commenting are free; founding membership ($1/week, billed
monthly) adds Google Images access, monthly giveaway entries and the Early Supporter badge.
- **Free-account wall** (signed-out visitors):
  - `/spot/` and `/story/`: the page renders; everything after the intro/first ~2 paragraphs (spot) or first
    ~3 paragraphs (story) is behind the gate (content stays in the DOM below a fade so SEO/structure is kept; it is
    `inert` + visually clipped until unlocked).
  - Actions: save to fieldbook, save/share a trip (`/plan-trip/` save), submit on `/contribute/`, spot yes/not-quite
    votes, roadmap votes, poll votes, add a comment → open the same sheet (action version: "sign in to save this.").
- **Member wall** (signed in, not a member): the Google Images photo gallery on spot pages ("take a closer look"
  beyond the first photo) and entering the giveaway ("join now" on the race CTA) → member sheet.
- **Never gated:** home, browse, map, community (viewing), stories list, guides list, profiles/passports, membership,
  FAQ, legal, app, mission, 404.

## States (prototype — no backend)
`site/gate.mjs` keeps `deepspot-session-preview` in localStorage: `{state:'out'|'free'|'member', email}`.
- Email Continue: validate format → set `free` (email stored locally only, never sent) → unlock in place with a short
  success line. A small mono note at the sheet bottom: "preview: accounts connect at launch".
- Google / Apple buttons: open the original DeepSpot sign-in (`https://www.deepspot.io` login URL already used by
  /account/ — find it) in a new tab; do not fake OAuth.
- Member sheet "become a founding member — $1/week" → `/membership/`; a "preview: mark me as a member" text button
  sets `member` (prototype only, clearly labeled).
- Review switch: `?gate=out|free|member|off` sets the state for testing; `off` disables gates entirely.
- Account page (`/account/`): show the preview session state + "sign out of preview".

## Design (our style, NYT structure)
- Page underneath: the gated page renders normally; from ~55% of the first viewport (or right after the allowed
  paragraphs) a gradient fade to `var(--br-bg)` covers the rest; content below is clipped (`max-height` +
  overflow hidden) and `inert`. No blur on text above the fade.
- **Sheet**: docked to the bottom of the viewport (not a centered modal), full width, `var(--br-panel)` with a 1px
  top border `var(--br-line)` and a 3px green top edge; content column max 440px centered; padding 32/24 (phone
  24/16); slides up 240ms ease-out (reduced motion: no slide).
  - Kicker mono 11px: `deepspot · free account`.
  - Heading (site display, lowercase, period): `create a free account, or log in.` (member: `go deeper.` +
    `$1 / week` big in green like the membership page).
  - One line of body: what the free account gives (full spots and stories, your fieldbook, trips, voting).
  - Email label (mono) + input (site input style, 48px tall) + **continue** (site primary green button, full width).
  - `or` divider (hairline + mono `or`).
  - Legal line (13px muted) with links to /terms/ and /privacy/.
  - Secondary full-width outline buttons: continue with Google, continue with Apple (official mono-color icons, inline
    SVG, no brand colors needed except the G may be monochrome).
  - Footer: "unlimited photos, giveaway entries and the early supporter badge." + `see membership ↗` link.
  - Close: no close on the reading wall (like NYT); the action version (save/vote) has an × and Escape.
- Accessibility: sheet is `role="dialog" aria-modal="true"` with a labelled heading, focus moves to the email field,
  focus is trapped inside the sheet, the rest of the page `inert`; announce unlock via a status line.
- Dark + light + panel off; 1440/768/390/320.

## Files
`source/site/gate.mjs` + `source/site/gate.css` (linked on gated routes), wiring in the spot/story renderers and the
action handlers (fieldbook save, votes, trip save, contribute submit, giveaway join). Keep module keys consistent.
Review page `source/gate-preview.html`: links to each gated state (out/free/member) for spot, story, actions.

## Checks
- `node --check`; qa tests pass (add a test for the session state helper).
- Screenshots in `qa/gate/`: spot + story at out/free/member, action sheet (save + vote), member sheet (gallery +
  giveaway join), each at 1440 dark, 1440 light, 390 dark. Look at each; two review→fix rounds against the reference.
- Flows: email continue unlocks in place and persists after reload; sign out relocks; Escape closes the action sheet;
  focus trap; `?gate=off` shows everything; never-gated routes never show a gate (crawl all routes in `out` state).
- 0 console errors / failed requests, no overflow 390/320, axe 0 on gated spot (out), story (out), member sheet.
- Backup `backups/before-gate-20261020/`. Bump keys. No deploy, no README edit.
