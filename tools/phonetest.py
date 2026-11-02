from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8766/'); pg.wait_for_timeout(2500)
    pg.screenshot(path='tmp/phone1.png')
    pg.click('#tab-his'); pg.wait_for_timeout(300); pg.click('#u-his04y'); pg.wait_for_timeout(1500)
    pg.evaluate("document.querySelector('#bar').scrollIntoView()"); pg.wait_for_timeout(300)
    pg.screenshot(path='tmp/phone2.png')
    print(errs, pg.evaluate("document.documentElement.scrollWidth"))
