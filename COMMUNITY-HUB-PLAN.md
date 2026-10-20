# Community hub redesign — plan (2026-10-13)

## Ask (Charlie)
Current /community/ is bad. Lay it out like https://www.deepspot.io/community:
1. carousel banner
2. animated metrics underneath: members, spots discovered, added this month
3. "see what others have discovered" section + CTA to keep exploring
4. the forum (also asked for)
Make a few versions to compare. Follow the redesign's design style.

## Original page (captured 2026-10-13, logged-in Chrome)
- Banner carousel, 3 slides, arrows top-right, dots:
  1. THIS MONTH'S GIVEAWAY: "DeepSpot Initial Giveaway". First place $300 plus a one-of-one custom character item; 2nd/3rd $100 each plus an item; every participant gets a character item and 3 months free (approved map spots only). CTA "View Details"
  2. COMMUNITY CHALLENGE: "Monthly Photo Contest". Share your most stunning photos of Kyoto; top 3 win exclusive DeepSpot merch. CTA "View Details"
  3. INVITE & EARN: "Invite Friends, Earn Badges". Invite friends to unlock the "Connector" badge. CTA "Invite Now"
- Stats bar (navy): 151 MEMBERS (LIVE dot) · 487 SPOTS DISCOVERED · 28 ADDED THIS MONTH. Each has an icon; numbers count up.
- "Community Discovered": a full-bleed auto-scrolling strip of photo cards (publisher avatar+name, date, category, title overlaid).
- Submissions | Forum toggle. Forum = "Discussion Forum" with a New Post button, category chips with counts (All 2, Travel Advice 1, Recommendations 0, Photography 1, Meetups 0, Other 0), and rows: PINNED/category badge · author · date, title, excerpt, reply count, arrow.
- Below that: Top Contributors, Community Guides, Roadmap (out of scope here).

## Redesign style to follow (source/, see homepage + pages.css)
- Tokens: ink #0b1b27, cobalt #3c60ff, aqua #83cdce, green #07d653, cream #f5f4ee, dark page #0c101b, light page #f6f3ec. Use the existing --ds-* vars.
- Huge, heavy Arial/Helvetica two-color titles (cobalt line + green line), lowercase section headings ending in a period ("around the community."), fine borders, aqua panels, compact pill buttons with arrow icon (action()/outbound() helpers), mono for small meta.
- Light/dark and the panel-color toggle must keep working. Mobile at 320 and 390 px with no horizontal overflow.
- Charlie's web taste: magazine spreads, not stacked "coded" sections; type is the layout; dramatic scale contrast. Simple hover animations only.

## Data (all local, no invention)
- Banner slides: copy above. CTAs: giveaway → outbound https://www.deepspot.io/community (data-original); contest → /competition/; invite → /invites/.
- Metrics: 151 / 487 / 28. Live values read from deepspot.io on 2026-10-13. Put them in one constant with a capturedAt date and show a small note "community figures from DeepSpot, Oct 13, 2026". Do NOT label them LIVE.
- Discovered: featured-spots.json entries that have an image, newest first by date, about 12. Use the existing spotURL/photo/authorLink helpers so links and saves work.
- Forum: content.forum (4 topics: poll, announcement, travel advice, photography) linking to /forum/?id=. Derive the category chips and counts from the data. Pinned = the poll and the announcement (DeepSpot Team). The New Post button goes outbound to https://www.deepspot.io/community.
- Submissions tab: content.pending (keep the existing behavior and copy).

## Versions (one route, switchable)
/community/?v=a|b|c. Default = a. A small fixed "compare: A B C old" switcher pill (bottom-left, keyboard reachable) keeps theme params. Old page at ?v=old.

CORRECTION (Charlie, 2026-10-13): all three versions share ONE visual style, the redesign's. Same type, colors, panels, buttons, cards and spacing (ds-spot-card, ds-tabs, ds-forum-list, ds-section-heading, action()). Versions differ ONLY in arrangement. Content order is the same in all: carousel, metrics, "see what others have discovered." + keep exploring, submissions/forum.

- **A.** Contained banner carousel; metrics as a 3-cell strip under it; discovered as a horizontal snap-scroll strip of spot cards with arrows, centered title, CTA below; forum as a tabbed list with category chips and a New Post button.
- **B.** Full-width split banner (text left, key fact in huge type right); metrics as large numbers under it; discovered as one feature card plus a list of compact rows; forum as two columns (pinned post panel left, topic list right).
- **C.** Banner with the three metric tiles stacked beside it (below on mobile); discovered as a 3-column card grid (6 cards); forum with a category sidebar and the topic list.

## Behavior rules (all versions)
- Count-up runs once when it enters view (IntersectionObserver), about 1.2 s ease-out. With reduced motion, show the final numbers right away.
- Carousel: buttons with aria-labels, dots as buttons, left/right keys when focused, aria-live polite on the slide, autoplay off under reduced motion, pause control.
- No new libraries. No hydration risk (this page is pages.mjs-rendered, not React).

## Files
- New: source/site/community-hub.mjs (renders A/B/C plus the switcher, wires the carousel, count-up and tabs), source/site/community-hub.css (linked in community/index.html after refinements.css).
- pages.mjs community branch: delegate to community-hub unless v=old. Make sure the trailing `if(route==='community')wireCommunity(...)` call in loadData doesn't break or double-wire.
- Back up community/index.html and pages.mjs to backups/community-hub-20261013/ first.
- Don't touch other routes or the homepage chunks.

## Checks before handback
- node --check on the changed modules. Existing tests still pass (node --test qa/).
- Chrome: each version in dark and light at desktop width, plus 390 and 320 px. Screenshot each. No console errors. Carousel arrows/dots/autoplay, count-up, tabs and chips all work. Links resolve (200).
- Visual QA: spacing, image crops, overlaps, text contrast. Fix before reporting.
