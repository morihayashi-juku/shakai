from playwright.sync_api import sync_playwright
import sys
units=sys.argv[1:] or [f'his{n:02d}' for n in range(3,19)]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1200)
    pg.click('#tab-his'); pg.wait_for_timeout(300)
    for u in units:
        pg.click('#u-'+u); pg.wait_for_timeout(500)
        r=pg.evaluate("""(()=>{const pages=[...document.querySelectorAll('#sheets .page')];
          const sl=pages.slice(0,5).map(p=>{const i=p.querySelector('.pgi'),g=p.querySelector('.pg');return (i.style.zoom?'Z'+(+i.style.zoom).toFixed(2):'')+((g.clientHeight-i.scrollHeight)/3.78).toFixed(0)});
          const bad=[...document.querySelectorAll('.fl .lb, .fl .era2 b')].filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1).map(e=>e.textContent.slice(0,10));
          const ov=[];document.querySelectorAll('.fl').forEach(t=>{const ls=[...t.querySelectorAll('.lb')].map(e=>e.getBoundingClientRect()).sort((a,b)=>a.left-b.left);for(let i=1;i<ls.length;i++) if(ls[i].left<ls[i-1].right-0.5) ov.push(i);const pr=t.getBoundingClientRect();ls.forEach(r=>{if(r.left<pr.left-1||r.right>pr.right+1) ov.push('edge')})});
          const eb=[...document.querySelectorAll('.fl .era2')].filter(e=>{const b=e.querySelector('b');return b.scrollWidth>e.clientWidth+1}).map(e=>e.textContent.slice(0,8));
          return sl.join(' ')+' | bad:'+bad.join(',')+' | ov:'+ov.join(',')+' | era:'+eb.join(',')})()""")
        print(u, r)
    print(errs)
