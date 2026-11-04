import sys
from playwright.sync_api import sync_playwright
ids = sys.argv[1:] or ['tp2611c2gj','tp2611c2hj']
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    for uid in ids:
        for teach in [0,1]:
            pg.evaluate(f"state.view='print';document.body.classList.remove('read');state.unit='{uid}';state.subject='test';state.sel=null;state.jteach={'true' if teach else 'false'};renderAll()"); pg.wait_for_timeout(1500)
            if not teach:
                print(uid, pg.evaluate("[...document.querySelectorAll('.sheet-tag')].map(t=>t.textContent).join(',')"))
                print(pg.evaluate("""[...document.querySelectorAll('#sheets .jg')].map(y=>{const kids=[...y.children];const used=kids.filter(k=>!k.classList.contains('yspacer')).reduce((a,k)=>a+k.offsetHeight,0)+ (kids.length-1)*9;return 'free='+((y.clientHeight-used)/3.78).toFixed(0)+'mm over='+(y.scrollHeight-y.clientHeight)}).join(' | ')"""))
                print('ans', pg.evaluate("""[...document.querySelectorAll('#sheets .ya')].map(a=>{const q=a.closest('.pgi')||a.parentElement;return q.scrollHeight-q.clientHeight}).join(',')"""))
            pg.emulate_media(media='print'); pg.pdf(path=f'tmp/{uid}{"_t" if teach else ""}.pdf', prefer_css_page_size=True, print_background=True); pg.emulate_media(media='screen')
    print(errs)
