"""Raise small type across the site (2026-10-21, Charlie: "type larger across the board").

Maps every font size below 20px to a larger size, in font-size declarations, the size part
of `font:` shorthands, clamp()/min()/max() arguments inside them, and the Tailwind
--text-xs/sm/base tokens of the home bundle. Sizes of 20px and up stay as they are.
Run once from the project root:  python tools/type_scale.py  (backup: backups/before-type-scale-20261021)
"""
import re, pathlib

MAP = {6: 13, 7: 13, 8: 13, 9: 13, 10: 14, 11: 14, 12: 15, 13: 15.5, 14: 16, 15: 17, 16: 18, 17: 18.5, 18: 19.5, 19: 20}

def up(px):
    if px >= 20: return px
    lo = int(px)
    a, b = MAP.get(lo, 10), MAP.get(lo + 1, 20)
    return round(a + (b - a) * (px - lo), 2)

def fmt(v):
    return ('%g' % v)

def px_sub(m):
    return fmt(up(float(m.group(1)))) + 'px'

def rem_sub(m):
    v = float(m.group(1)) * 16
    return fmt(round(up(v) / 16, 4)) + 'rem' if v < 20 else m.group(0)

NUM_PX = re.compile(r'(?<![\w.-])(\d+(?:\.\d+)?)px')
NUM_REM = re.compile(r'(?<![\w.-])(\d*\.?\d+)rem')

def scale_value(v):
    v = NUM_PX.sub(px_sub, v)
    return NUM_REM.sub(rem_sub, v)

FS = re.compile(r'(font-size\s*:\s*)([^;}!]+)')
# font shorthand: optional style/weight words, then SIZE[/line-height], then family
FONT = re.compile(r'(\bfont\s*:\s*(?:(?:italic|normal|bold|bolder|lighter|\d{3}|small-caps)\s+)*)(\d*\.?\d+)(px|rem)')
TOKENS = re.compile(r'(--text-(?:xs|sm|base)\s*:\s*)(\d*\.?\d+)rem')

def scale_css(s):
    s = FS.sub(lambda m: m.group(1) + scale_value(m.group(2)), s)
    def font(m):
        n = float(m.group(2))
        if m.group(3) == 'rem':
            return m.group(1) + fmt(round(up(n * 16) / 16, 4)) + 'rem'
        return m.group(1) + fmt(up(n)) + 'px'
    s = FONT.sub(font, s)
    s = TOKENS.sub(lambda m: m.group(1) + fmt(round(up(float(m.group(2)) * 16) / 16, 4)) + 'rem', s)
    return s

if __name__ == '__main__':
    root = pathlib.Path('source')
    n = 0
    for f in root.rglob('*.css'):
        if any(p in f.parts for p in ('_archive', 'vendor', 'backups')):
            continue
        t = f.read_text(encoding='utf-8')
        u = scale_css(t)
        if u != t:
            f.write_text(u, encoding='utf-8'); n += 1
            print('scaled', f)
    print(n, 'files')
