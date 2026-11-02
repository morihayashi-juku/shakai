# 使い方: python3 tmp/regroup.py hisNN [--dry]
# 講座の section の高さを測り、順番を変えずにページへ詰め直す
import re, sys, json, subprocess
from playwright.sync_api import sync_playwright
u=sys.argv[1]; dry='--dry' in sys.argv
p=f'units/{u}.js'; s=open(p).read()
a=s.index('  const lecture = [')+len('  const lecture = [')
b=s.index('\n  ];\n',a)
body=s[a:b]
pages=re.findall(r'`(.*?)`,', body, flags=re.S)
secs_file=[]
for pgtxt in pages:
    ss=re.findall(r'<section>.*?</section>', pgtxt, flags=re.S)
    rest=re.sub(r'<section>.*?</section>','',pgtxt,flags=re.S).strip()
    assert rest=='', (u, rest[:80])
    secs_file+=ss
with sync_playwright() as pw:
    br=pw.chromium.launch(); pg=br.new_page(viewport={'width':1440,'height':1000})
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1200)
    res=pg.evaluate("""(u)=>{const unit=UNITS[u];
      const host=document.createElement('div');host.style.cssText='position:absolute;left:-99999px;top:0';document.body.appendChild(host);
      const out={secs:[]};
      unit.lecture.forEach((L,i)=>{ if(typeof L==='object') return;
        host.innerHTML=lecturePage(unit,i);
        const pgEl=host.querySelector('.pg'); const lec=host.querySelector('.lecture'); const head=host.querySelector('.lhead');
        out.cap=(pgEl.clientHeight - head.getBoundingClientRect().height)/3.7795;
        [...lec.children].forEach(c=>out.secs.push(c.getBoundingClientRect().height/3.7795));
      });
      host.remove(); return out;}""", u)
    br.close()
assert len(res['secs'])==len(secs_file), (len(res['secs']), len(secs_file))
cap=res['cap']-3.2-1.5   # .pgi の gap と余裕
H=res['secs']; n=len(H)
def used(i,j): return sum(H[i:j])+3*(j-i-1)
# 最少ページ数（順番は変えない）
import math
INF=float('inf')
best={}  # (i,k) -> (cost, split)
def f(i,k):
    if i==n: return (0,None) if k==0 else (INF,None)
    if k==0: return (INF,None)
    if (i,k) in best: return best[(i,k)]
    r=(INF,None)
    for j in range(i+1,n+1):
        u_=used(i,j)
        if u_>cap: break
        c,_=f(j,k-1)
        c+= (cap-u_)**2 if j<n else 0
        if c<r[0]: r=(c,j)
    best[(i,k)]=r; return r
k=1
while f(0,k)[0]==INF: k+=1
groups=[]; i=0; kk=k
while i<n:
    j=f(i,kk)[1]; groups.append(list(range(i,j))); i=j; kk-=1
print(u,'cap %.0f'%cap,'heights',[round(x) for x in H])
print(' pages',[[round(sum(H[i] for i in g)+3*(len(g)-1))] for g in groups], 'n=',len(groups))
if dry: sys.exit()
new='\n'+''.join(f"    // ---------------- 講座 {k+1} ----------------\n    `\n"+'\n'.join(secs_file[i] for i in g)+"`,\n" for k,g in enumerate(groups))
s=s[:a]+new.rstrip('\n')+s[b:]
open(p,'w').write(s)
