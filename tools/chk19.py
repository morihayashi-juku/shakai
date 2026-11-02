from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1500,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1200)
    pg.click('#tab-his'); pg.wait_for_timeout(300); pg.click('#u-his19'); pg.wait_for_timeout(800)
    print('pages', pg.evaluate("document.querySelectorAll('#sheets .page').length"), pg.inner_text('#count'))
    print(pg.evaluate("[...document.querySelectorAll('.tl')].map(t=>[...t.querySelectorAll('.why')].map(e=>(e.scrollWidth-e.clientWidth)).join(',')).join(' | ')"))
    print(pg.evaluate("[...document.querySelectorAll('#sheets .page')].map(p=>{const i=p.querySelector('.pgi');const g=p.querySelector('.pg');return (i.style.zoom?'Z'+i.style.zoom:'')+((g.clientHeight-i.scrollHeight)/3.78).toFixed(1)}).join(' ')"))
    for i in range(4):
        pg.query_selector_all('#sheets .page')[i].screenshot(path=f'/home/claude/shakai/tmp/land{i+1}.png')
    pg.emulate_media(media='print'); pg.pdf(path='/home/claude/shakai/out/h19.pdf', prefer_css_page_size=True, print_background=True)
    print('errors', errs)
