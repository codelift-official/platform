import os
import sys
from PIL import Image, ImageDraw

rootDir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pubDir = os.path.join(rootDir, 'public')

pngPath = os.path.join(pubDir, 'logo.png')
if not os.path.exists(pngPath):
    pngPath = os.path.join(rootDir, 'logo.png')

if os.path.exists(pngPath):
    source = Image.open(pngPath).convert('RGBA')
    w, h = source.size
    dim = min(w, h)
    left = (w - dim) // 2
    top = (h - dim) // 2
    cropped = source.crop((left, top, left + dim, top + dim))

    size = 256
    cropped = cropped.resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new('L', (size * 4, size * 4), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0, size * 4, size * 4), fill=255)
    mask = mask.resize((size, size), Image.Resampling.LANCZOS)

    circular = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    circular.paste(cropped, (0, 0), mask=mask)

    favPng = os.path.join(pubDir, 'favicon.png')
    favIco = os.path.join(pubDir, 'favicon.ico')
    circular.save(favPng, 'PNG')
    circular.save(favIco, format='ICO', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    print('  [OK] Generated circular public/favicon.png and public/favicon.ico')
else:
    print('  [WARN] No logo.png found to generate favicon')
