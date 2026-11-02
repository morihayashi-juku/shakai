from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1400,'height':900})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8767/'); pg.wait_for_timeout(2500)
    pg.click('#tab-his'); pg.wait_for_timeout(300); pg.click('#u-his04'); pg.wait_for_timeout(1000)
    print('pages', pg.evaluate("document.querySelectorAll('#sheets .page').length"))
    pg.click('#toRead'); pg.wait_for_timeout(800)
    print('read', pg.evaluate("document.body.classList.contains('read')"), pg.evaluate("location.hash"))
    pg.click('#toPrint'); pg.wait_for_timeout(1000)
    print('back pages', pg.evaluate("document.querySelectorAll('#sheets .page').length"), errs)
