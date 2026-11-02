from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    for name in ['chromium','webkit']:
        try: b=getattr(p,name).launch()
        except Exception as e: print(name,'not available'); continue
        pg=b.new_page(viewport={'width':1180,'height':820})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        pg.goto('http://localhost:8765/'); pg.wait_for_timeout(2500)
        pg.click('#tab-geo'); pg.wait_for_timeout(300); pg.click('#u-geo04'); pg.wait_for_timeout(1200)
        n=pg.evaluate("Object.keys(FIGS).length"); svgs=pg.evaluate("document.querySelectorAll('#sheets svg').length")
        print(name,'figs',n,'svgs on page',svgs,'errors',errs)
        pg.screenshot(path=f'tmp/web_{name}.png'); b.close()
