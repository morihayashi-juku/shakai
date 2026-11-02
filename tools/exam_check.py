import sys, subprocess, glob, os
from playwright.sync_api import sync_playwright
uid=sys.argv[1]; sets=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else None
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    pg.click('#tab-'+uid[:3]); pg.wait_for_timeout(300); pg.click('#u-'+uid); pg.wait_for_timeout(600)
    n=pg.evaluate(f"UNITS.{uid}.sets.length")
    # 答えの確認
    bad=pg.evaluate("""(uid)=>{const u=UNITS[uid];let bad=0,tot=0;u.sets.forEach((s,p)=>s.sheets.forEach((sh,si)=>{const b=buildSheet(u,si,p);const orig=sh.blocks.flatMap(x=>x.qs);b.blocks.flatMap(x=>x.qs).forEach((q,i)=>{tot++;const a=b.answers[i].a;const o=orig[i];if(q.opts){if(q.opts[KANA.indexOf(a)]!==o.c[o.a])bad++;}else if(a!==o.a)bad++;});}));return [bad,tot]}""", uid)
    print('keys bad/total', bad)
    res=[]
    for k in range(n):
        pg.select_option('#pattern', str(k)); pg.wait_for_timeout(300)
        r=pg.evaluate("""[...document.querySelectorAll('#sheets .page')].map(p=>{const i=p.querySelector('.pgi'),g=p.querySelector('.pg');return (i.style.zoom?'Z'+(+i.style.zoom).toFixed(2):'')+((g.clientHeight-i.scrollHeight)/3.78).toFixed(0)}).join(' ')""")
        res.append(r); print('set',k+1, r)
        if sets and (k+1) in sets:
            pg.emulate_media(media='print'); pg.pdf(path=f'tmp/{uid}_s{k+1}.pdf', prefer_css_page_size=True, print_background=True); pg.emulate_media(media='screen')
    print(errs)
