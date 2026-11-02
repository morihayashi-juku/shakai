from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg.goto('http://localhost:8767/#geo90'); pg.wait_for_timeout(2500)
    pg.click('.rall >> nth=0'); pg.wait_for_timeout(300)
    pg.evaluate("document.querySelectorAll('.rq')[3].scrollIntoView({block:'start'})"); pg.evaluate("scrollBy(0,-70)"); pg.wait_for_timeout(300)
    pg.screenshot(path='tmp/rd5.png')
    pg.goto('http://localhost:8767/#his04y'); pg.wait_for_timeout(2500); pg.screenshot(path='tmp/rd3.png')
    pg.goto('http://localhost:8767/#geo11'); pg.wait_for_timeout(2500)
    pg.evaluate("document.getElementById('r-q3').scrollIntoView()"); pg.evaluate("scrollBy(0,-70)"); pg.wait_for_timeout(300); pg.screenshot(path='tmp/rd6.png')
