import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        pg=await b.new_page(viewport={'width':1440,'height':1000})
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); await pg.wait_for_timeout(1500)
        print('errors:',errs)
        ov=await pg.evaluate('''()=>[...document.querySelectorAll('#sheets .page')].map((p,i)=>{const g=p.querySelector('.pg');return [i,g.scrollHeight,g.clientHeight]})''')
        for i,s,c in ov: print(i, s, c, 'OVERFLOW' if s>c+1 else '')
        await pg.screenshot(path='out/ui.png')
        for pat in sys.argv[1:] or ['0']:
            await pg.select_option('#pattern', pat); await pg.wait_for_timeout(300)
            await pg.emulate_media(media='print')
            await pg.pdf(path=f'out/p{pat}.pdf', prefer_css_page_size=True, print_background=True)
            await pg.emulate_media(media='screen')
        await b.close()
asyncio.run(main())
