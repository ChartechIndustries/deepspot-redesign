"""bump_keys.py -- one cache key per file.

Every local .css / .js / .mjs reference in source/ (html attributes, ES imports, dynamic imports, module-preload lists,
the home page's RSC payload) gets  ?v=<key>.  key = short content hash of the file (8 hex chars), computed over the
file's own text (with its keys stripped) plus the keys of the files it references. So when a file changes, its key
changes, and so do the keys of every file that points to it (up to the html pages). One file has ONE key everywhere.
Files that point at each other in a loop (the home chunk trio: page / index / layout-segment) share one key.

Run from the project root after ANY change to a css/js/mjs file:
    python tools/bump_keys.py            # rewrite files in place, print what changed
    python tools/bump_keys.py --check    # change nothing; exit 1 if any key is stale or a file has several keys
Not keyed on purpose: sw.js (a service worker keeps one stable URL), files under backups/.
"""
import hashlib, os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'source'))
SCAN_EXT = ('.html', '.css', '.js', '.mjs')
TARGET_EXT = ('.css', '.js', '.mjs')
NO_KEY = {'sw.js'}
SKIP_DIRS = {'backups', 'node_modules', '.git'}
NO_SCAN_DIRS = {'vendor'}          # third-party files are keyed but never edited
TOKEN = re.compile(r'''(?P<q>\\?["'`])(?P<pre>css:)?(?P<path>[^"'`\s?#<>(){}\\]*\.(?:css|js|mjs))(?P<query>\?[^"'`\s#\\]*)?(?P=q)''')


def rel(p):
    return os.path.relpath(p, ROOT).replace(os.sep, '/')


def walk():
    files = []
    for base, dirs, names in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for n in names:
            if n.lower().endswith(SCAN_EXT):
                files.append(os.path.join(base, n))
    return sorted(files)


def resolve(token_path, src_file):
    p = token_path
    if re.match(r'^(https?:|data:|//|mailto:|javascript:)', p) or '${' in p:
        return None
    cands = []
    if p.startswith('/'):
        cands.append(os.path.join(ROOT, p.lstrip('/')))
    else:
        cands.append(os.path.join(os.path.dirname(src_file), p))
        cands.append(os.path.join(ROOT, p))
    for c in cands:
        c = os.path.normpath(c)
        if c.startswith(ROOT + os.sep) and os.path.isfile(c) and c.lower().endswith(TARGET_EXT) \
                and os.path.basename(c) not in NO_KEY and not (set(rel(c).split('/')) & SKIP_DIRS):
            return c
    return None


def with_key(query, key):
    """query like '?v=3&x=1' -> drop v=..., add v=key (or drop v entirely when key is None)."""
    parts = [x for x in (query or '').lstrip('?').split('&') if x and not x.startswith('v=')]
    if key:
        parts.append('v=' + key)
    return ('?' + '&'.join(parts)) if parts else ''


def rewrite(text, src_file, keys):
    """keys: {abs target: key} or None (None = strip keys: the normalised form that gets hashed)."""
    def sub(m):
        t = resolve(m.group('path'), src_file)
        if not t:
            return m.group(0)
        key = keys.get(t) if keys is not None else None
        if keys is not None and not key:
            return m.group(0)
        return m.group('q') + (m.group('pre') or '') + m.group('path') + with_key(m.group('query'), key) + m.group('q')
    return TOKEN.sub(sub, text)


def refs_of(text, src_file):
    out = set()
    for m in TOKEN.finditer(text):
        t = resolve(m.group('path'), src_file)
        if t and t != src_file:
            out.add(t)
    return out


def tarjan(nodes, edges):
    idx, low, on, stack, res, counter = {}, {}, set(), [], [], [0]
    sys.setrecursionlimit(10000)

    def strong(v):
        idx[v] = low[v] = counter[0]; counter[0] += 1
        stack.append(v); on.add(v)
        for w in edges.get(v, ()):
            if w not in idx:
                strong(w); low[v] = min(low[v], low[w])
            elif w in on:
                low[v] = min(low[v], idx[w])
        if low[v] == idx[v]:
            comp = []
            while True:
                w = stack.pop(); on.discard(w); comp.append(w)
                if w == v:
                    break
            res.append(comp)
    for v in sorted(nodes):
        if v not in idx:
            strong(v)
    return res          # dependencies come before their dependants


def main(check=False):
    files = walk()
    text = {}
    for f in files:
        with open(f, encoding='utf-8', newline='') as fh:
            text[f] = fh.read()
    targets = {f for f in files if f.lower().endswith(TARGET_EXT) and os.path.basename(f) not in NO_KEY}
    # third-party / non-scanned targets still need a key (vendor): hash raw content
    edges = {}
    for f in targets:
        edges[f] = set() if (set(rel(f).split('/')) & NO_SCAN_DIRS) else {r for r in refs_of(text[f], f) if r in targets}
    keys = {}
    for comp in tarjan(targets, edges):
        h = hashlib.sha1()
        members = sorted(comp)
        ext = sorted({d for f in members for d in edges[f] if d not in comp})
        for f in members:
            h.update(rel(f).encode() + b'\0')
            body = text[f] if (set(rel(f).split('/')) & NO_SCAN_DIRS) else rewrite(text[f], f, None)
            h.update(body.encode('utf-8', 'surrogatepass') + b'\0')
        for d in ext:
            h.update((rel(d) + ':' + keys[d]).encode() + b'\0')
        k = h.hexdigest()[:8]
        for f in comp:
            keys[f] = k
    changed, stale = [], []
    for f in files:
        if set(rel(f).split('/')) & NO_SCAN_DIRS:
            continue
        new = rewrite(text[f], f, keys)
        if new != text[f]:
            (stale if check else changed).append(rel(f))
            if not check:
                with open(f, 'w', encoding='utf-8', newline='') as fh:
                    fh.write(new)
    nref = sum(len(refs_of(text[f], f)) for f in files)
    if check:
        print('stale files: %d' % len(stale))
        for s in stale[:40]:
            print('  ', s)
        return 1 if stale else 0
    print('keyed %d files, %d references scanned, %d files rewritten' % (len(targets), nref, len(changed)))
    for c in changed[:80]:
        print('  ', c)
    return 0


if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
