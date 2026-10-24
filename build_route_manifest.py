"""Rebuild the prototype's known-content link map from its local data files."""
from pathlib import Path
import json

root = Path(__file__).resolve().parent / 'source'
def read(path):
    return json.loads((root / path).read_text(encoding='utf-8'))

catalog = read('featured-spots.json')
content = read('site/content.json')
routes = {
    'spots': list(dict.fromkeys(s['id'].rsplit('/', 1)[-1] for s in catalog
                                if s['id'].startswith('/blog/') and not s['title'].startswith('PART OF:'))),
    'stories': {},   # stories removed 2026-10-23
    'guides': [s['id'] for s in content['guides']],
    'profiles': {p['originalProfile'].rsplit('/', 1)[-1]: p['id']
                 for p in read('profile/profiles.json')['profiles'] if p.get('originalProfile')},
    'mapped': [key for key, spot in content['spots'].items() if spot.get('coordinates')],
}
(root / 'site/routes.json').write_text(json.dumps(routes, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print(f"Indexed {len(routes['spots'])} destinations, and {len(routes['guides'])} guides.")
