"""
Generate PWA icons from the ByfiPlay logo.
Run from project root: python scripts/generate-icons.py
Requires: pip install Pillow
"""

from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit('Install Pillow first: pip install Pillow')

ROOT = Path(__file__).resolve().parent.parent
LOGO = ROOT / 'img' / 'IMG-20251201-WA0006.jpg'
OUT_DIR = ROOT / 'img'

SIZES = {
    'icon-192.png': 192,
    'icon-512.png': 512,
    'apple-touch-icon.png': 180,
}

if not LOGO.exists():
    raise SystemExit(f'Logo not found: {LOGO}')

img = Image.open(LOGO).convert('RGBA')
width, height = img.size
side = min(width, height)
left = (width - side) // 2
top = (height - side) // 2
img = img.crop((left, top, left + side, top + side))

OUT_DIR.mkdir(parents=True, exist_ok=True)

for filename, size in SIZES.items():
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(OUT_DIR / filename, 'PNG')
    print(f'Created {OUT_DIR / filename}')

print('Done.')
