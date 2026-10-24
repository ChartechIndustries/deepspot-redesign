# Copy for Kai (v1, 2026-10-23)

Every string Kai should write or approve is tagged in the code with `data-copy="kai-<n>"`.
Find them: `grep -rn 'data-copy="kai-' source --include=*.js --include=*.mjs --include=*.html`

| id | Where | What it is now | Why |
|---|---|---|---|
| kai-1 | /community/ — all copy | current words | Charlie: "change the copy, talk to Kai" |
| kai-2 | /community/ hero eyebrow (`site/giveaway-hero.mjs`) | "deepspot initial giveaway" (style changed to plain sans; month moved into the countdown chip) | Charlie dislikes it |
| kai-3 | Community guidelines modal text | the pinned forum post text, unchanged | needs a real guidelines text |
| kai-4 | /community/ feed label + kicker (`site/community-v2.mjs`) | "latest from the discord" / "latest posts" (switch to "live" when `LIVE_SOURCE` is true) | honesty until the feed is real |
| kai-5 | /community/ h2 "live from the discord." | unchanged | still claims "live" while the feed is not live |
| kai-6 | participants deck hints (`site/passport-mini.mjs`) | "hover to peek, click to deal" / "tap to deal" / "deal again" | new strings |
| kai-7 | newsletter CTA heading (`site-cta.js`) | "the weekly find." (was "new stories every week.") | stories removed |
| kai-8 | every string that changed because stories were removed: points rules, FAQ, gate perks, contribute labels, profile fine print, giveaway rules | edited to drop stories, meaning kept | stories removed |

Not tagged (no element to hang the tag on): the contribute page subtitle, the roadmap line "every spot", the `/profile/` meta description.
Also flagged in the audit: the welcome forum post says "hidden gems in Japan" (site is worldwide); roadmap item "PictoChat signatures" uses a Nintendo trademark.
