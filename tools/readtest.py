from playwright.sync_api import sync_playwright
units=['geo01','geo03','geo04','geo10','geo11','geo15','his04','his06','his12','his19','geo90','his90','his04y']
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':390,'height':844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8767/'); pg.wait_for_timeout(2500)
    print('body.read', pg.evaluate("document.body.classList.contains('read')"))
    for u in units:
        pg.select_option('#rsel', u); pg.wait_for_timeout(700)
        sw=pg.evaluate("document.documentElement.scrollWidth")
        # 横にはみ出している要素（スクロール枠の中は除く）
        wide=pg.evaluate("""()=>{const r=[];document.querySelectorAll('#reader *').forEach(e=>{if(e.closest('.rscroll'))return;const b=e.getBoundingClientRect();if(b.right>392&&b.width>0)r.push(e.className||e.tagName)});return [...new Set(r)].slice(0,6)}""")
        nq=pg.evaluate("document.querySelectorAll('.rq').length")
        print(u,'scrollW',sw,'qs',nq,'wide',wide)
    pg.select_option('#rsel','geo04'); pg.wait_for_timeout(700)
    pg.screenshot(path='tmp/rd1.png')
    pg.evaluate("document.getElementById('r-q2').scrollIntoView()"); pg.wait_for_timeout(300)
    pg.click('.rq .rbtn >> nth=20'); pg.wait_for_timeout(200)
    pg.evaluate("document.querySelectorAll('.rq')[20].scrollIntoView({block:'center'})"); pg.wait_for_timeout(300)
    pg.screenshot(path='tmp/rd2.png')
    pg.select_option('#rsel','his04y'); pg.wait_for_timeout(700); pg.screenshot(path='tmp/rd3.png')
    pg.select_option('#rsel','his06'); pg.wait_for_timeout(700); pg.screenshot(path='tmp/rd4.png', full_page=False)
    print(errs)
    # パソコン幅では印刷画面のまま
    pg2=b.new_page(viewport={'width':1400,'height':900}); pg2.goto('http://localhost:8767/'); pg2.wait_for_timeout(2500)
    print('desktop read?', pg2.evaluate("document.body.classList.contains('read')"))
    pg3=b.new_page(viewport={'width':1400,'height':900}); pg3.goto('http://localhost:8767/#his05'); pg3.wait_for_timeout(2500)
    print('hash link read?', pg3.evaluate("document.body.classList.contains('read')"), pg3.evaluate("state.unit"))
