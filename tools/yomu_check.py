import sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    pg.click('#tab-his'); pg.wait_for_timeout(300)
    for uid in ['his07y']:
        pg.click('#u-'+uid); pg.wait_for_timeout(800)
        r=pg.evaluate("""()=>[...document.querySelectorAll('#sheets .ys')].map(y=>{const t=y.querySelector('.ytext'),b=y.querySelector('.ybot');
          const f=e=>(parseFloat(getComputedStyle(e).fontSize)*0.75).toFixed(1);
          // 自然な大きさでの余り（mm）
          const sl=e=>{const o=e.style.fontSize;e.style.fontSize='';const v=((e.clientHeight-e.scrollHeight)/3.78).toFixed(0);e.style.fontSize=o;return v};
          return sl(t)+'/'+sl(b)+'('+f(t)+'pt)'}).join('  ')""")
        print(uid, r)
        pg.emulate_media(media='print'); pg.pdf(path=f'tmp/{uid}.pdf', prefer_css_page_size=True, print_background=True); pg.emulate_media(media='screen')
    print(errs)
