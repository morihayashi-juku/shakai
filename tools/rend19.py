from playwright.sync_api import sync_playwright
import subprocess, glob, os
from PIL import Image
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1500,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1200)
    pg.click('#tab-his'); pg.wait_for_timeout(300); pg.click('#u-his19'); pg.wait_for_timeout(800)
    print('errs',errs)
    print('overflow', pg.evaluate("[...document.querySelectorAll('.tlh .lb, .tlh .sm')].filter(e=>e.scrollWidth>e.clientWidth+1||e.scrollHeight>e.clientHeight+1).map(e=>e.textContent.slice(0,14)+':'+(e.scrollWidth-e.clientWidth)+'/'+(e.scrollHeight-e.clientHeight))"))
    print('overlap', pg.evaluate("""(()=>{const out=[];document.querySelectorAll('.tlh').forEach((t,pi)=>{const ls=[...t.querySelectorAll('.lb')].map(e=>e.getBoundingClientRect());ls.sort((a,b)=>a.left-b.left);for(let i=1;i<ls.length;i++) if(ls[i].left<ls[i-1].right-0.5) out.push(pi+':'+i);const pr=t.getBoundingClientRect();ls.forEach((r,i)=>{if(r.left<pr.left-1||r.right>pr.right+1) out.push('edge'+pi+':'+i)})});return out})()"""))
    pg.emulate_media(media='print'); pg.pdf(path='out/h19.pdf', prefer_css_page_size=True, print_background=True)
for f in glob.glob('tmp/ph19*.png'): os.remove(f)
subprocess.run(['pdftoppm','-r','100','-png','out/h19.pdf','tmp/ph19'])
for f in sorted(glob.glob('tmp/ph19-*.png')):
    Image.open(f).rotate(-90,expand=True).save(f.replace('ph19-','ph19r-'))
print(sorted(glob.glob('tmp/ph19r-*.png')))
