from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    pg.click('#tab-his'); pg.wait_for_timeout(300); pg.click('#u-his05y'); pg.wait_for_timeout(800)
    pg.screenshot(path='tmp/yomu_app.png')
    pg.select_option('#yans','end'); pg.wait_for_timeout(800)
    print(pg.evaluate("[...document.querySelectorAll('.sheet-tag')].map(t=>t.textContent).join(',')"), pg.inner_text('#count'))
    pg.emulate_media(media='print'); pg.pdf(path='tmp/his05y_end.pdf', prefer_css_page_size=True, print_background=True)
    print(errs)
