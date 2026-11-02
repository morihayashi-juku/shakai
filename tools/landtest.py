import sys
from playwright.sync_api import sync_playwright
from PIL import Image, ImageOps
import subprocess, glob, os
mode=sys.argv[1]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':1000}); pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1200)
    pg.click('#tab-his'); pg.wait_for_timeout(300); pg.click('#u-his19'); pg.wait_for_timeout(800)
    if mode=='noland':
        pg.click('#pk-L0'); pg.click('#pk-L1'); pg.wait_for_timeout(500)
    pg.emulate_media(media='print'); pg.pdf(path='tmp/lt.pdf', prefer_css_page_size=True, print_background=True)
for f in glob.glob('tmp/lt-*.png'): os.remove(f)
subprocess.run(['pdftoppm','-r','70','-png','-l','3','tmp/lt.pdf','tmp/lt'])
for f in sorted(glob.glob('tmp/lt-*.png')):
    im=Image.open(f).convert('L'); inv=ImageOps.invert(im).point(lambda v:255 if v>40 else 0); print(f, im.size, inv.getbbox())
