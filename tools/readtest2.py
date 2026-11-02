from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8767/#his04'); pg.wait_for_timeout(2500)
    print('lecture shown:', pg.evaluate("document.querySelectorAll('#reader .lecture').length"), 'his19 in list:', pg.evaluate("!!document.querySelector('#rsel option[value=his19]')"))
    for k in range(4):
        pg.click(f'.rpat button[data-p="{k}"]'); pg.wait_for_timeout(500)
        ok=pg.evaluate("""(k)=>{const u=UNITS.his04;const qs=[...document.querySelectorAll('#reader .rq')];let i=0,bad=0;
          u.sheets.forEach((_,si)=>{const sh=buildSheet(u,si,k);sh.blocks.flatMap(b=>b.qs).forEach((q,j)=>{const el=qs[i++];if(!el.querySelector('.rt').textContent.startsWith(q.q.slice(0,8)))bad++;if(!el.querySelector('.rans b').textContent.startsWith(String(sh.answers[j].a)))bad++;});});return [i,qs.length,bad]}""", k)
        print('pattern',k,ok)
    pg.click('.rpat button[data-p="1"]'); pg.wait_for_timeout(400); pg.evaluate("scrollTo(0,0)"); pg.screenshot(path='tmp/rd7.png')
    pg.goto('http://localhost:8767/#his05y'); pg.wait_for_timeout(2000); pg.screenshot(path='tmp/rd8.png')
    pg.goto('http://localhost:8767/#his90'); pg.wait_for_timeout(2000); print('sets buttons', pg.evaluate("document.querySelectorAll('.rpat button').length"))
    print(errs)
