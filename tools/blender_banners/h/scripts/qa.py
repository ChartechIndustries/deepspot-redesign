import sys
sys.path.insert(0, r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h\scripts")
import post
from PIL import Image, ImageDraw, ImageFont
H = r"C:\Users\CharD\Desktop\DeepSpot Globe\tools\blender_banners\h" + "\\"
BG = post.BG
bold = r"C:\Windows\Fonts\arialbd.ttf"
reg = r"C:\Windows\Fonts\arial.ttf"


def desktop(img):
    c = Image.new('RGBA', (707, 413), BG + (255,))
    s = img.resize((360, 360), Image.LANCZOS)
    c.alpha_composite(s, (707 - 360 - 14, (413 - 360) // 2))
    d = ImageDraw.Draw(c)
    f1 = ImageFont.truetype(bold, 56); f2 = ImageFont.truetype(reg, 17); f3 = ImageFont.truetype(bold, 16)
    d.text((55, 55), "know a", font=f1, fill='white'); d.text((55, 112), "hidden gem?", font=f1, fill='white')
    d.text((55, 215), "Help us map the unmapped. Share your favorite obscure spots and", font=f2, fill='white')
    d.text((55, 248), "become part of our community of explorers worldwide.", font=f2, fill='white')
    d.rounded_rectangle((55, 303, 304, 357), 27, fill=(7, 214, 83))
    d.text((79, 322), "contribute a spot", font=f3, fill=(10, 20, 20))
    return c


def phone(img):
    c = Image.new('RGBA', (360, 560), BG + (255,))
    s = img.resize((200, 200), Image.LANCZOS)
    c.alpha_composite(s, (130, 14))
    d = ImageDraw.Draw(c)
    f1 = ImageFont.truetype(bold, 44); f2 = ImageFont.truetype(reg, 15); f3 = ImageFont.truetype(bold, 15)
    d.text((24, 230), "know a", font=f1, fill='white'); d.text((24, 278), "hidden gem?", font=f1, fill='white')
    d.text((24, 350), "Help us map the unmapped. Share your favorite", font=f2, fill='white')
    d.text((24, 372), "obscure spots and become part of our community", font=f2, fill='white')
    d.rounded_rectangle((24, 430, 250, 478), 24, fill=(7, 214, 83))
    d.text((46, 445), "contribute a spot", font=f3, fill=(10, 20, 20))
    return c


rows = []
for v in '123':
    im = Image.open(H + 'renders\\h%s.png' % v).convert('RGBA')
    d, p = desktop(im), phone(im)
    sheet = Image.new('RGBA', (707 + 360 + 328 // 2 + 20, 560), (30, 30, 30, 255))
    sheet.alpha_composite(d, (0, 0)); sheet.alpha_composite(p, (707 + 10, 0))
    sm = Image.new('RGBA', (328 // 2 + 0, 160), BG + (255,))
    sheet.save(H + 'qa\\h%s_crops.png' % v)
    # 328 px wide downscale
    t = Image.new('RGBA', (328, 328), BG + (255,)); t.alpha_composite(im.resize((328, 328), Image.LANCZOS)); t.save(H + 'qa\\h%s_328.png' % v)
    big = Image.new('RGBA', (1600, 1600), BG + (255,)); big.alpha_composite(im); big.convert('RGB').save(H + 'qa\\h%s_full_on_bg.png' % v)
print('ok')
