from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    pg.evaluate("state.view='print';document.body.classList.remove('read');state.unit='his10z';state.subject='his';state.sel=null;renderAll()"); pg.wait_for_timeout(1500)
    print(pg.evaluate("[...document.querySelectorAll('.sheet-tag')].map(t=>t.textContent).join(',')"))
    print(pg.evaluate("""[...document.querySelectorAll('#sheets .y2')].map(y=>{const t=y.querySelector('.ytext');const kids=[...y.children];const used=kids.filter(k=>!k.classList.contains('yspacer')).reduce((a,k)=>a+k.offsetHeight,0);return (parseFloat(getComputedStyle(t).fontSize)*0.75).toFixed(1)+'pt free='+((y.clientHeight-used)/3.78).toFixed(0)+'mm'}).join(' | ')"""))
    pg.emulate_media(media='print'); pg.pdf(path='tmp/his10z.pdf', prefer_css_page_size=True, print_background=True)
    print(errs)
