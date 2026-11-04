from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    for uid in ['tp2611c2gj','tp2611c2hj']:
        pg.evaluate(f"state.view='print';document.body.classList.remove('read');state.unit='{uid}';state.subject='test';state.sel=null;state.jmode='k';state.jteach=false;renderAll()"); pg.wait_for_timeout(1500)
        print(uid, pg.evaluate("[...document.querySelectorAll('#sheets .kp')].map(k=>(parseFloat(k.style.fontSize||getComputedStyle(k).fontSize)*0.75).toFixed(1)+'pt over='+(k.scrollHeight-k.clientHeight)+' free='+((k.clientHeight-[...k.children].reduce((a,c)=>a+c.offsetHeight,0)-(k.children.length-1)*7.5)/3.78).toFixed(0)+'mm').join(' | ')"))
        pg.emulate_media(media='print'); pg.pdf(path=f'tmp/{uid}_k.pdf', prefer_css_page_size=True, print_background=True); pg.emulate_media(media='screen')
    print(errs)
