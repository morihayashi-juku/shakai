# 使い方: python3 tools/civcheck.py civ01 [civ02 ...]  → 各ページの余白(mm)・縮小(Z)・答えの一致を表示し、tmp_civ/<id>.pdf を作る
import asyncio, sys, os
from playwright.async_api import async_playwright
ids = sys.argv[1:]
os.makedirs('tmp_civ', exist_ok=True)
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1440, 'height': 1000})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + os.path.abspath('out/中学社会プリント.html')); await pg.wait_for_timeout(1500)
        await pg.evaluate("setView('print')"); await pg.wait_for_timeout(300)
        await pg.click('#mode-kouza'); await pg.wait_for_timeout(300); await pg.click('#tab-civ'); await pg.wait_for_timeout(300)
        for uid in ids:
            await pg.click('#u-' + uid); await pg.wait_for_timeout(1200)
            for pat in ['0', '1', '2', '3']:
                await pg.select_option('#pattern', pat); await pg.wait_for_timeout(500)
                r = await pg.evaluate('''()=>[...document.querySelectorAll('#sheets .page')].map(p=>{const i=p.querySelector('.pgi');const g=p.querySelector('.pg');return (i.style.zoom?'Z'+(+i.style.zoom).toFixed(2)+':':'')+((g.clientHeight-i.scrollHeight)/3.78).toFixed(0)})''')
                if pat == '0' or any(x.startswith('Z') or x.startswith('-') for x in r): print(uid, 'pat', pat, ' '.join(r))
            await pg.select_option('#pattern', '0'); await pg.wait_for_timeout(400)
            await pg.emulate_media(media='print'); await pg.pdf(path=f'tmp_civ/{uid}.pdf', prefer_css_page_size=True, print_background=True); await pg.emulate_media(media='screen')
            res = await pg.evaluate('''(id)=>{const u=UNITS[id];let bad=0,n=0;
              for(let pat=0;pat<4;pat++)u.sheets.forEach((s,si)=>{const sh=buildSheet(u,si,pat);
                sh.blocks.flatMap(b=>b.qs).forEach(q=>{const a=sh.answers.find(x=>x.n===q.n).a;n++;
                  if(q.opts){const orig=s.blocks.flatMap(b=>b.qs).find(o=>o.q===q.q);if(q.opts[KANA.indexOf(a)]!==orig.c[orig.a])bad++;}
                  else if(a!==q.a)bad++;});});
              return {bad, perPattern:n/4, figsMissing:[...document.querySelectorAll('#sheets')].map(d=>(d.innerHTML.match(/\\{\\{fig:[^}]*\\}\\}/g)||[]).join(',')).join('')}}''', uid)
            print(uid, res)
        print('errors', errs)
        await b.close()
asyncio.run(main())
