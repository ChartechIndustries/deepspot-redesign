"""build_pages.py -- build source/ for a GitHub Pages project site (served under /<repo>/).

The site uses root-absolute URLs ("/site/core.mjs", "/community/", "/"). Pages serves this repo at
/<repo>/, so every root-absolute reference to a top-level entry of source/ (and the bare home "/") is
rewritten to "/<repo>/...". Run:  python build_pages.py <out_dir> [--base /deepspot-redesign]
"""
import os
import re
import shutil
import sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "source")
TEXT = (".html", ".js", ".mjs", ".css", ".json", ".webmanifest", ".svg", ".txt", ".xml")
SKIP_DIRS = {"backups"}
# Dev / review pages stay in the repo (source/) but never go on the public Pages site (tighten 2026-10-22).
DEV_FILES = [
    "banner-variations.html", "banner-studies.css", "banner-studies.js", "blender-banners.html",
    "discord-variations.html", "giveaway-variations.html", "gate-preview.html",
    "promo-variations.html", "promo-variations.css", "promo-variations.js",
]


def main(out, base):
    base = "/" + base.strip("/")
    if os.path.exists(out):
        shutil.rmtree(out)
    shutil.copytree(SRC, out, ignore=shutil.ignore_patterns(*SKIP_DIRS))
    for dev in DEV_FILES:
        try:
            os.remove(os.path.join(out, dev))
        except FileNotFoundError:
            pass
    top = sorted((e for e in os.listdir(out) if not e.startswith(".")), key=len, reverse=True)
    names = "|".join(re.escape(e) for e in top)
    # "/<top-level entry>" right after a quote, backtick, ( = , or whitespace
    ref = re.compile(r"""(?<=["'`(=,\s])/(?=(?:%s)(?:[/?#"'`)\s,;]|$))""" % names)
    # bare home only in href attributes ("/" "/?x" "/#x"); generic '/' strings (split, startsWith) stay
    home = re.compile(r"""(?<=href=["'])/(?=["'?#])""")
    B = base
    # explicit home links / path checks that a regex can't tell apart from split('/') etc.
    exact = {
        "site/navigation.js": [("new URL('/'+u.searchParams", "new URL('%s/'+u.searchParams" % B),
                               ("u.pathname='/'+parts[0]+'/'", "u.pathname='%s/'+parts[0]+'/'" % B),
                               ("u.pathname==='/'||localSections.has(u.pathname.split('/')[1])",
                                "u.pathname==='%s/'||localSections.has(u.pathname.split('/')[2])" % B),
                               ('`<a href="/${path}/?theme=', '`<a href="%s/${path}/?theme=' % B)],
        "site/core.mjs": [("localURL('/')", "localURL('%s/')" % B),
                          ("export function localURL(path,params={}){",
                           "export function localURL(path,params={}){if(typeof path==='string'&&path.startsWith('/')&&!path.startsWith('%s/'))path='%s'+path;" % (B, B))],
        "site/pages.mjs": [("action('back to the globe','/')", "action('back to the globe','%s/')" % B)],
        "browse/browse.js": [("['/','/browse/'", "['%s/','/browse/'" % B), ("a.href='/?theme='", "a.href='%s/?theme='" % B)],
        "profile/profile.js": [("['/','/browse/'", "['%s/','/browse/'" % B), ("a.href='/?theme='", "a.href='%s/?theme='" % B)],
        "profile/identity.mjs": [("['/','/browse/'", "['%s/','/browse/'" % B)],
        # home (vinext/vite): module-preload base + the header nav links built from a template
        "_next/static/chunks/index-B9ZOBUSp-v51.js": [("Cl=function(e){return`/`+e}", "Cl=function(e){return`%s/`+e}" % B)],
        "_next/static/chunks/page-C89T775K-v51.js": [("`/${e.toLowerCase()}/", "`%s/${e.toLowerCase()}/" % B)],
    }
    n = 0
    for root, _, files in os.walk(out):
        for f in files:
            if not f.lower().endswith(TEXT):
                continue
            p = os.path.join(root, f)
            try:
                s = open(p, encoding="utf-8").read()
            except UnicodeDecodeError:
                continue
            rel = os.path.relpath(p, out).replace(os.sep, "/")
            for a, b in exact.get(rel, []):
                if a not in s:
                    sys.exit("build_pages: expected text not found in %s: %s" % (rel, a))
                s = s.replace(a, b)
            t = home.sub(base + "/", ref.sub(base + "/", s))
            if t != open(p, encoding="utf-8").read():
                open(p, "w", encoding="utf-8", newline="").write(t)
                n += 1
    open(os.path.join(out, ".nojekyll"), "w").close()
    # Pages serves 404.html for unknown paths
    print("built", out, "base", base, "files rewritten", n)


if __name__ == "__main__":
    args = sys.argv[1:]
    base = "/deepspot-redesign"
    if "--base" in args:
        i = args.index("--base")
        base = args[i + 1]
        del args[i:i + 2]
    main(args[0] if args else "_site", base)
