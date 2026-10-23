#!/usr/bin/env bash
# Build source/ for GitHub Pages (served at /deepspot-redesign/) and push it to the gh-pages branch.
set -euo pipefail
cd "$(dirname "$0")"
out="$(mktemp -d)/site"
python build_pages.py "$out" --base deepspot-redesign  # no leading slash: Git Bash rewrites "/x" args into Windows paths
# build_pages.py drops the dev/review pages (DEV_FILES); fail the publish if any slipped through
for f in discord-variations promo-variations giveaway-variations banner-variations gate-preview blender-banners; do
  if [ -e "$out/$f.html" ]; then echo "dev page $f.html is in the build, aborting"; exit 1; fi
done
url="$(git remote get-url origin)"
cd "$out"
git init -q -b gh-pages
git add -A
git -c core.safecrlf=false commit -q -m "Pages build from main $(git -C "$OLDPWD" rev-parse --short HEAD 2>/dev/null || echo local)"
git push -f -q "$url" gh-pages
echo "published to gh-pages"
