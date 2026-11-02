# 使い方: python3 tmp/checkU.py <HTMLファイル名> <単元id> <PDFの出力先>
import asyncio, sys
from playwright.async_api import async_playwright
fname, uid, pdf = sys.argv[1], sys.argv[2], sys.argv[3]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':1000})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/shakai/out/'+fname); await pg.wait_for_timeout(1500)
        await pg.click('#tab-'+uid[:3]); await pg.wait_for_timeout(300)
        await pg.click('#u-'+uid); await pg.wait_for_timeout(800)
        for pat in ['0','1','2','3']:
            await pg.select_option('#pattern', pat); await pg.wait_for_timeout(400)
            r=await pg.evaluate('''()=>{document.getElementById('sheets').style.zoom=1;return [...document.querySelectorAll('#sheets .page')].map(p=>{const i=p.querySelector('.pgi');const g=p.querySelector('.pg');return (i.style.zoom?'Z'+(+i.style.zoom).toFixed(2):'')+((g.clientHeight-i.scrollHeight)/3.78).toFixed(1)})}''')
            print(pat, r)
        await pg.select_option('#pattern','0'); await pg.wait_for_timeout(300)
        await pg.emulate_media(media='print'); await pg.pdf(path=pdf, prefer_css_page_size=True, print_background=True)
        res = await pg.evaluate('''()=>{const out={};for(const id of Object.keys(UNITS)){const u=UNITS[id];if(u.sets)continue;let bad=0;
          for(let pat=0;pat<4;pat++)u.sheets.forEach((s,si)=>{const sh=buildSheet(u,si,pat);
            sh.blocks.flatMap(b=>b.qs).forEach(q=>{const a=sh.answers.find(x=>x.n===q.n).a;
              if(q.opts){const orig=s.blocks.flatMap(b=>b.qs).find(o=>o.q===q.q);if(q.opts[KANA.indexOf(a)]!==orig.c[orig.a])bad++;}
              else if(a!==q.a)bad++;});});
          out[id]={bad,total:u.sheets.reduce((t,s,i)=>t+buildSheet(u,i,0).total,0)}}return out}''')
        print('keys', res); print('errors', errs)
        await b.close()
asyncio.run(main())
