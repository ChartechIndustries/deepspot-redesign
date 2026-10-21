"""geocode_spots.py -- one-off: approximate coordinates for every featured spot, for the passport want-to-go globe.
Uses content.json coordinates when known, else OpenStreetMap Nominatim on the place name (1 request/second, per its policy).
Output: source/site/spot-coords.json  {slug: [lat, lng, "exact"|"approx"]}. Re-run resumes (cached results are kept)."""
import json, os, re, time, urllib.parse, urllib.request
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "source")
OUT = os.path.join(ROOT, "site", "spot-coords.json")
spots = json.load(open(os.path.join(ROOT, "featured-spots.json"), encoding="utf-8"))
content = json.load(open(os.path.join(ROOT, "site", "content.json"), encoding="utf-8"))
known = {k: v["coordinates"] for k, v in content.get("spots", {}).items() if v.get("coordinates")}
out = json.load(open(OUT, encoding="utf-8")) if os.path.exists(OUT) else {}
out.pop("_miss", None)
miss = []  # misses are retried on every run
UA = "DeepSpot-redesign-preview/1.0 (one-off geocode of public place names)"

def q(text, cc=None):
    """Photon (komoot) public OSM geocoder. cc='jp' keeps only results in Japan."""
    url = "https://photon.komoot.io/api/?" + urllib.parse.urlencode({"q": text, "limit": 5})
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=20) as r:
        d = json.load(r)
    time.sleep(1.2)
    for f in d.get("features", []):
        if cc == "jp" and f["properties"].get("countrycode", "").lower() != "jp":
            continue
        lon, lat = f["geometry"]["coordinates"]
        return [round(lat, 4), round(lon, 4)]
    return None

for s in spots:
    sid = s.get("id", "")
    if not sid.startswith("/blog/") or (s.get("title") or "").startswith("PART OF:"):
        continue
    slug = sid.split("/")[-1]
    if slug in out or slug in miss:
        continue
    if slug in known:
        out[slug] = [*known[slug], "exact"]
        continue
    place = s.get("place") or ""
    tries = []
    m = re.search(r"\(([^)]+)\)", place)
    if m:
        tries.append(m.group(1))                     # Japanese name in brackets
    tries.append(re.sub(r"\s*\([^)]*\)", "", place).strip())
    jp = bool(re.search(r"[぀-ヿ一-鿿]", place)) or "japan" in ((s.get("description") or "") + " " + (s.get("title") or "")).lower()
    hit = None
    for t in tries:
        if not t:
            continue
        for attempt in range(4):
            try:
                hit = q(t, "jp" if jp else None)
                break
            except Exception as e:
                print("err", slug, e, flush=True); time.sleep(20 * (attempt + 1))
        if hit:
            break
    if hit:
        out[slug] = [*hit, "approx"]
    else:
        miss.append(slug)
    print(slug, out.get(slug), flush=True)
    json.dump({**out, "_miss": miss}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
json.dump({**out, "_miss": miss}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
print("done", len(out), "found,", len(miss), "missing")
