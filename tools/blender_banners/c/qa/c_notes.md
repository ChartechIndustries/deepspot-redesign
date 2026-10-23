# Banner C QA notes
All three: clip check 0 pairs (C2 run at 0.25 mm tolerance, C1/C3 at 4 mm). Full-size renders read; crop sheets `qa/cN_final_sheet.png` (desktop 431x331, tablet 714x301, phone 328x331 and 328x371, 707x413, 360x413); 328 px downscale `qa/cN_final_328.png`; QA views hi34/lowside/back34 `qa/cN_*.png`.
## C1 podium (mole on step 1)
Rounds: 4 (framing, prop scale, mole scale/position, text-zone clearance). Found: props too small; mole hidden by prison; mole floated 7 cm (evaluated bounds included whisker curves, fixed with vertex-based bounds); hat touched "$300" (moved subject down/smaller). Mole outfit Tux + Partyhat, rules OK (no smock/shirt conflict). Limits: mole fur reads dark/low contrast at 328 px but silhouette + hat read; numerals look teal (green bounce).
## C2 coin drop
Rounds: 5. Found: gold read mint/pink (floor reflected into coins and AgX desaturation) -> floor shows dark warm tone to glossy rays, saturated gold, lower env; coin overlap fall3/fall5 (moved); top coin hit "for your curiosity" (lowered, scaled). Limits: coin undersides stay peach-bright (field material); stack is small on phone.
## C3 golden pin
Rounds: 4. Found: felt washed out (exposure -0.5, no sheen); card too big, pin overlapped text (smaller, lower); tails crossed stitching (shortened); tip embed 8 mm -> 3 mm. Limits: rosette pleats lift 5-10 mm above felt (ribbon on tails, intended); lower pin shows green felt reflection streak.
