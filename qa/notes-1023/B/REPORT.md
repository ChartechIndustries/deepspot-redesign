# Builder B report (2026-10-23)
Backups: backups/before-notes-1023/{site/navigation.js,site/core.mjs,site/pages.mjs,site/tours.mjs,browse/*,guides/index.html,tours/*}

- 1.1 burger: done. navigation.js (home + any page with .header), core.mjs SiteHeader (guides, stories, tours, saved ... pages), browse/index.html mobile nav. 5 items: browse, map, tours, community, your account. Checked 390 + 820 on /, /browse/, /guides/, /stories/, /tours/, /map/.
- 3.1 tabs follow: done. browse.js uses followTab + tabFades on .br-tabs (first paint instant, later smooth). browse.css overrides the fixed phone mask in refinements.css so the fade shows only on the side with more tabs. Checked: last tab click scrolls row (390: scrollLeft 408, has-more-left only).
- 3.2 count bubble: done. Pill in h1 after "Deep Spots" ("369 spots"; "80 found"; "saved"). aria-hidden; toolbar summary kept as sr-only live region. Phone: pill wraps under the title (390/360/320). Home count (A) not touched.
- 3.3 tab row: done. Removed from browse/index.html; collectionTabs() in core.mjs returns '' (guides + stories pages lose it). /stories/ still works. ?tab= redirect untouched.
- 6.1 tours: done. First frames show only tape; blurred page + 3D word fade in during the pull (css tr-reveal), zoom raised (.72H/h, W/3.3h). Reduced motion: no animation. 320/390/820/1180/1440/1920, dark+light.
- Files: site/navigation.js, site/core.mjs (collectionTabs, header menu list only), site/tours.mjs, tours/tours.css, browse/index.html, browse/browse.js, browse/browse.css. Not changed: pages.mjs, guides/index.html.
- Open: browse.js imports core.mjs?v=149e30e7 (stale key, lead runs bump_keys). core.mjs import adds weight to browse. At 1180 tablet no tab fade (row fits).
- Screenshots: qa/notes-1023/B/ (bs_phone.png, bs_big.png, menus.png, pages.png, tours_*_sheet.png; scripts browse_shots.py, menu_check.py, tours_first.py).
