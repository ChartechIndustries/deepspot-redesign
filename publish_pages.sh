#!/usr/bin/env bash
# Build source/ for GitHub Pages (served at /deepspot-redesign/) and push it to the gh-pages branch.
set -euo pipefail
cd "$(dirname "$0")"
out="$(mktemp -d)/site"
python build_pages.py "$out" --base /deepspot-redesign
url="$(git remote get-url origin)"
cd "$out"
git init -q -b gh-pages
git add -A
git -c core.safecrlf=false commit -q -m "Pages build from main $(git -C "$OLDPWD" rev-parse --short HEAD 2>/dev/null || echo local)"
git push -f -q "$url" gh-pages
echo "published to gh-pages"
