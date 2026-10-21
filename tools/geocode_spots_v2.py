"""geocode_spots_v2.py -- strict pin locations for the passport want-to-go globe.
Each spot's text (slug, title, place, description, tags) gives a country hint and, in Japan, a prefecture hint.
Photon (OSM) results are accepted only when their country (and prefecture, if hinted) match. No match = no pin.
Output source/site/spot-coords.json {slug: [lat, lng, "exact"|"verified"]}. Exact = content.json coordinates."""
import json, os, re, time, unicodedata, urllib.parse, urllib.request
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "source")
OUT = os.path.join(ROOT, "site", "spot-coords.json")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "geocode_cache.json")
spots = json.load(open(os.path.join(ROOT, "featured-spots.json"), encoding="utf-8"))
content = json.load(open(os.path.join(ROOT, "site", "content.json"), encoding="utf-8"))
known = {k: v["coordinates"] for k, v in content.get("spots", {}).items() if v.get("coordinates")}
cache = json.load(open(CACHE, encoding="utf-8")) if os.path.exists(CACHE) else {}
UA = "DeepSpot-redesign-preview/1.0 (one-off geocode of public place names)"

PREF = {"hokkaido":"北海道","aomori":"青森県","iwate":"岩手県","miyagi":"宮城県","akita":"秋田県","yamagata":"山形県","fukushima":"福島県","ibaraki":"茨城県","tochigi":"栃木県","gunma":"群馬県","saitama":"埼玉県","chiba":"千葉県","tokyo":"東京都","kanagawa":"神奈川県","niigata":"新潟県","toyama":"富山県","ishikawa":"石川県","fukui":"福井県","yamanashi":"山梨県","nagano":"長野県","gifu":"岐阜県","shizuoka":"静岡県","aichi":"愛知県","mie":"三重県","shiga":"滋賀県","kyoto":"京都府","osaka":"大阪府","hyogo":"兵庫県","nara":"奈良県","wakayama":"和歌山県","tottori":"鳥取県","shimane":"島根県","okayama":"岡山県","hiroshima":"広島県","yamaguchi":"山口県","tokushima":"徳島県","kagawa":"香川県","ehime":"愛媛県","kochi":"高知県","fukuoka":"福岡県","saga":"佐賀県","nagasaki":"長崎県","kumamoto":"熊本県","oita":"大分県","miyazaki":"宮崎県","kagoshima":"鹿児島県","okinawa":"沖縄県"}
CITY = {"yokohama":"kanagawa","kawasaki":"kanagawa","kamakura":"kanagawa","hakone":"kanagawa","nagoya":"aichi","kobe":"hyogo","himeji":"hyogo","sapporo":"hokkaido","hakodate":"hokkaido","otaru":"hokkaido","sendai":"miyagi","kesennuma":"miyagi","matsushima":"miyagi","kanazawa":"ishikawa","nikko":"tochigi","utsunomiya":"tochigi","beppu":"oita","naha":"okinawa","kitakyushu":"fukuoka","tono":"iwate","morioka":"iwate","hiraizumi":"iwate","ise":"mie","iga":"mie","matsuyama":"ehime","uwajima":"ehime","takamatsu":"kagawa","kurashiki":"okayama","onomichi":"hiroshima","miyajima":"hiroshima","okunoshima":"hiroshima","takayama":"gifu","shirakawa":"gifu","matsumoto":"nagano","karuizawa":"nagano","kofu":"yamanashi","atami":"shizuoka","izu":"shizuoka","ouchijuku":"fukushima","aizu":"fukushima","kumanocho":"tokyo","shinjuku":"tokyo","shibuya":"tokyo","asakusa":"tokyo","ueno":"tokyo","akihabara":"tokyo","akabane":"tokyo","koenji":"tokyo","nakano":"tokyo","machida":"tokyo","monzennakacho":"tokyo","kushimoto":"wakayama","koyasan":"wakayama","yakushima":"kagoshima","sakurajima":"kagoshima","goto":"nagasaki","hirosaki":"aomori","tsugaru":"aomori","kanagi":"aomori","yonezawa":"yamagata","sado":"niigata","nara park":"nara","arashiyama":"kyoto","inuyama":"aichi","tokoname":"aichi","yoro":"gifu","katsuyama":"fukui","kawagoe":"saitama","chichibu":"saitama","choshi":"chiba","noto":"ishikawa","izumo":"shimane","tottori":"tottori","shodoshima":"kagawa","naoshima":"kagawa","dogo":"ehime","kurobe":"toyama","oshu":"iwate","esashi":"iwate"}
COUNTRY = {"japan":"jp","japanese":"jp","england":"gb","london":"gb","wales":"gb","welsh":"gb","scotland":"gb","scottish":"gb","britain":"gb","british":"gb","uk":"gb","ireland":"ie","irish":"ie","united states":"us","usa":"us","america":"us","american":"us","california":"us","oregon":"us","texas":"us","new york":"us","nevada":"us","arizona":"us","washington":"us","florida":"us","pennsylvania":"us","virginia":"us","louisiana":"us","utah":"us","colorado":"us","montana":"us","alaska":"us","hawaii":"us","san francisco":"us","los angeles":"us","canada":"ca","mexico":"mx","germany":"de","german":"de","berlin":"de","france":"fr","french":"fr","paris":"fr","italy":"it","italian":"it","spain":"es","spanish":"es","portugal":"pt","netherlands":"nl","dutch":"nl","amsterdam":"nl","belgium":"be","austria":"at","vienna":"at","switzerland":"ch","denmark":"dk","danish":"dk","copenhagen":"dk","sweden":"se","swedish":"se","norway":"no","norwegian":"no","finland":"fi","iceland":"is","icelandic":"is","estonia":"ee","estonian":"ee","latvia":"lv","lithuania":"lt","poland":"pl","polish":"pl","czech":"cz","prague":"cz","slovakia":"sk","hungary":"hu","budapest":"hu","slovenia":"si","croatia":"hr","serbia":"rs","belgrade":"rs","bosnia":"ba","montenegro":"me","albania":"al","greece":"gr","greek":"gr","athens":"gr","bulgaria":"bg","romania":"ro","romanian":"ro","ukraine":"ua","russia":"ru","russian":"ru","georgia":"ge","armenia":"am","turkey":"tr","istanbul":"tr","malta":"mt","maltese":"mt","cyprus":"cy","china":"cn","chinese":"cn","hong kong":"hk","taiwan":"tw","korea":"kr","korean":"kr","seoul":"kr","india":"in","indian":"in","nepal":"np","sri lanka":"lk","thailand":"th","thai":"th","bangkok":"th","vietnam":"vn","cambodia":"kh","laos":"la","myanmar":"mm","malaysia":"my","singapore":"sg","indonesia":"id","bali":"id","philippines":"ph","australia":"au","australian":"au","new zealand":"nz","egypt":"eg","morocco":"ma","south africa":"za","kenya":"ke","brazil":"br","argentina":"ar","chile":"cl","peru":"pe","colombia":"co","bolivia":"bo","cuba":"cu","jordan":"jo","israel":"il","iran":"ir","uae":"ae","dubai":"ae","mongolia":"mn","kazakhstan":"kz","uzbekistan":"uz"}

def norm(t):
    return unicodedata.normalize("NFKD", t or "").encode("ascii", "ignore").decode().lower()

def hints(s):
    raw = " ".join([s.get("id", "").replace("-", " ").replace("_", " "), s.get("title", ""), s.get("place", ""), s.get("description", ""), s.get("tags", "")])
    t = " " + norm(raw).replace("/", " ") + " "
    jp_script = bool(re.search(r"[぀-ヿ一-鿿]", raw))
    pref = next((p for p in PREF if re.search(r"\b" + p + r"\b", t)), None) or next((CITY[c] for c in CITY if re.search(r"\b" + c + r"\b", t)), None)
    pref = pref or next((p for p, k in PREF.items() if k in raw or k[:-1] in raw), None)
    cc = "jp" if (jp_script or pref) else None
    if not cc:
        found = [v for k, v in COUNTRY.items() if re.search(r"\b" + re.escape(k) + r"\b", t)]
        if found:
            cc = max(set(found), key=found.count)
    return cc, pref

def photon(q):
    if q in cache:
        return cache[q]
    url = "https://photon.komoot.io/api/?" + urllib.parse.urlencode({"q": q, "limit": 8})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=20) as r:
                d = json.load(r)
            break
        except Exception as e:
            print("  retry", e, flush=True); time.sleep(10 * (attempt + 1)); d = {"features": []}
    time.sleep(1.1)
    res = [{"lat": f["geometry"]["coordinates"][1], "lon": f["geometry"]["coordinates"][0], "cc": (f["properties"].get("countrycode") or "").lower(),
            "state": f["properties"].get("state", ""), "name": f["properties"].get("name", "")} for f in d.get("features", [])]
    cache[q] = res
    json.dump(cache, open(CACHE, "w", encoding="utf-8"), ensure_ascii=False)
    return res

def names(s):
    out = []
    for field in (s.get("place", ""), s.get("description", "")[:80] if len(s.get("description", "")) < 80 else ""):
        if not field:
            continue
        for m in re.findall(r"\(([^)]+)\)", field):
            out.append(m)
        base = re.sub(r"\s*\([^)]*\)", "", field).strip()
        for part in re.split(r"\s+/\s+", base):
            if part:
                out.append(part)
    return [n for n in dict.fromkeys(out) if 2 < len(n) < 90]

out, report = {}, {"exact": 0, "verified": 0, "none": 0}
for s in spots:
    sid = s.get("id", "")
    if not sid.startswith("/blog/") or (s.get("title") or "").startswith("PART OF:"):
        continue
    slug = sid.split("/")[-1]
    if slug in known:
        out[slug] = [*known[slug], "exact"]; report["exact"] += 1; continue
    cc, pref = hints(s)
    hit = None
    if cc:
        for n in names(s):
            queries = [n] + ([f"{n} {pref}"] if pref else [])
            for q in queries:
                for r in photon(q):
                    if r["cc"] != cc:
                        continue
                    if cc == "jp" and pref and PREF[pref] not in r["state"] and pref not in norm(r["state"]):
                        continue
                    hit = r; break
                if hit: break
            if hit: break
    if hit:
        out[slug] = [round(hit["lat"], 4), round(hit["lon"], 4), "verified"]; report["verified"] += 1
    else:
        report["none"] += 1
    print(slug, cc, pref, out.get(slug), flush=True)
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False)
print("done", report)
