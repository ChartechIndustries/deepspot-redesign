# DeepSpot color audit — 24 September 2026

## Diagnosis
The Earth already establishes a strong cobalt/green identity, while the location photography supplies a wide range of colors. Color-on was repeating maximum saturation across the discovery frame, individual cards, bento headers, portraits, stories, promotions, and both closing panels. That made unrelated elements appear equally important. Alternating the three spot card backgrounds also implied distinctions that the content did not support.

## Applied hierarchy
- **Hero:** retain its existing Earth, colored title, pins, and green explore action.
- **What's new:** retain the original cream, green, aqua and cobalt accordion. This is the main large-format brand-color moment; it remains colored in both toggle states.
- **Discovery:** a theme-aware neutral frame and matching card surfaces allow the photos to lead. Green identifies the active tab, saved states, choice badges, browse action and live spot count. The rest of the discovery title is neutral.
- **Bento:** shared neutral headers unite the community and stories panels. Aqua belongs to the floating portraits. The contributor list and stories use the same quiet reading surface; the selected contributor receives a small green-tinted highlight.
- **Promotions:** cobalt is concentrated in the competition illustration and prize typography. The cathedral photograph remains the focal point of its card. A dark teal roadmap background lets the mountain and green trail stand out.
- **Closing CTA:** a quiet contribution panel gives the green action button priority. The pending newsletter uses a subtle blue surface and blue heading, with a restrained disabled signup control.
- **Footer:** keep the existing neutral treatment and restrained green brand details.

## Verification
Reviewed the whole page at desktop width, then checked the revised discovery, bento and closing CTA in light/dark and at 390px mobile width. No page overflow; contributor rows remain equal height. Checked the color toggle and confirmed the news banner retains all four colors and its light-mode border. Sampled text/background pairs across the changed light-mode surfaces: the lowest measured contrast was 4.72:1; this is a targeted contrast check, not a full accessibility certification.

## Implementation
The color-on rules are consolidated in `source/panel-colors.css`. The redundant community color-on override was removed from `source/community.css`. No content, animation or component-layout changes. Original files are in `backups/before-color-audit-20260924/`. Local preview only; not deployed.

## Follow-up: stronger color balance
The first pass was too restrained. The revised color-on treatment restores a cobalt category strip, matching cobalt bento headers, an aqua competition card, and a cobalt contribution panel. The photo frame, story reading surfaces and pending newsletter stay quieter. This introduces larger, repeated areas of the existing palette without restoring alternating card colors or a bright green newsletter block. Checked at desktop and mobile widths in dark/light; source backups are in `backups/before-color-balance-20260924/`.
