import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={'width':1440,'height':1000})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); await pg.wait_for_timeout(1500)
        await pg.click('#u-geo07'); await pg.wait_for_timeout(800)
        for pat in ['0','1','2','3']:
            await pg.select_option('#pattern', pat); await pg.wait_for_timeout(400)
            r=await pg.evaluate('''()=>{document.getElementById('sheets').style.zoom=1;return [...document.querySelectorAll('#sheets .page')].map(p=>{const i=p.querySelector('.pgi');const g=p.querySelector('.pg');return (i.style.zoom?'Z'+(+i.style.zoom).toFixed(2):'')+((g.clientHeight-i.scrollHeight)/3.78).toFixed(1)})}''')
            print(pat, r)
        await pg.select_option('#pattern','0'); await pg.wait_for_timeout(300)
        await pg.emulate_media(media='print'); await pg.pdf(path='out/g7.pdf', prefer_css_page_size=True, print_background=True)
        print('errors', errs)
        await b.close()
asyncio.run(main())
