import json, glob, base64, io
from fontTools import subset
from fontTools.ttLib import TTFont
import re
def _blend(hexc, a):
    h=hexc.lstrip('#')
    if len(h)==3: h=''.join(c*2 for c in h)
    r,g,b=(int(h[i:i+2],16) for i in (0,2,4))
    f=lambda c: round(c*a+255*(1-a))
    return '#%02x%02x%02x'%(f(r),f(g),f(b))
def flatten_opacity(sv):
    # 白黒プリンターで透明部分が黒くつぶれないよう、透明度を白との合成色に置きかえる
    def tag(m):
        t=m.group(0)
        for attr in ('fill','stroke'):
            mo=re.search(attr+r'-opacity="([\d.]+)"', t); mc=re.search(r' '+attr+r'="(#[0-9a-fA-F]{3,6})"', t)
            if mo and mc:
                t=t.replace(mc.group(0), ' '+attr+'="'+_blend(mc.group(1), float(mo.group(1)))+'"').replace(mo.group(0),'')
        mo=re.search(r' opacity="([\d.]+)"', t)
        if mo:
            a=float(mo.group(1))
            for attr in ('fill','stroke'):
                mc=re.search(r' '+attr+r'="(#[0-9a-fA-F]{3,6})"', t)
                if mc: t=t.replace(mc.group(0), ' '+attr+'="'+_blend(mc.group(1), a)+'"')
            t=t.replace(mo.group(0),'')
        return t
    return re.sub(r'<[a-z]+ [^>]*opacity="[^>]*>', tag, sv)
def slim(sv):
    sv=flatten_opacity(sv)
    m=re.search(r'viewBox="0 0 ([\d.]+) ',sv)
    if not m or float(m.group(1))<500: return sv
    return re.sub(r' d="([^"]*)"', lambda mm: ' d="'+re.sub(r'-?\d+\.\d+', lambda x: str(round(float(x.group(0)))), mm.group(1))+'"', sv)

FILES = [
  ('中学社会プリント.html', '中学社会', '中学社会 解いて覚えるプリント',
   [f'geo{n:02d}' for n in range(1, 22)] + ['geo90'] + [f'his{n:02d}' for n in range(1, 20)] + ['his90', 'his04y', 'his05y', 'his06y', 'his07y'] + [f'civ{n:02d}' for n in range(1, 14)]),
]
allfigs={}
for f in sorted(glob.glob('figs*.json'), key=lambda p: (len(p), p)):
    allfigs.update(json.load(open(f)))
allfigs={k:slim(v) for k,v in allfigs.items()}
faces=[('UDP Print','fonts/BIZUDPGothic-Regular.ttf',400),('UDP Print','fonts/BIZUDPGothic-Bold.ttf',700),('UD Num Print','fonts/BIZUDGothic-Bold.ttf',700)]
def sub(path, text):
    f=TTFont(path); o=subset.Options(); o.flavor='woff2'; o.layout_features=['*']; o.name_IDs=['*']
    s=subset.Subsetter(o); s.populate(text=text); s.subset(f)
    b=io.BytesIO(); f.flavor='woff2'; f.save(b); return base64.b64encode(b.getvalue()).decode()
built = {}
for fname, label, title, ids in FILES:
    for i in ids:
        p=f'units/{i}.js'
        try: open(p).close(); built[i]=label
        except FileNotFoundError: pass
import sys
for fname, label, title, ids in FILES:
    have=[i for i in ids if i in built]
    if not have: continue
    units=''.join(open(f'units/{i}.js',encoding='utf-8').read() for i in have)
    used={k:v for k,v in allfigs.items() if re.search(r"['\"]"+re.escape(k)+r"['\"]", units)}
    other={i:l for i,l in built.items() if l!=label}
    t=open('template.html',encoding='utf-8').read()
    t=t.replace('/*__TITLE__*/',title).replace('/*__FILELABEL__*/','講座を読んで、問題をたくさん解いて覚える')
    t=t.replace('/*__FIGS__*/','const FIGS='+json.dumps(used,ensure_ascii=False)+';').replace('/*__UNITS__*/',units).replace('/*__OTHER__*/',json.dumps(other,ensure_ascii=False))
    chars=set(t)|set(chr(c) for c in range(0x20,0x7f))|set(chr(c) for c in range(0x3000,0x3100))|set(chr(c) for c in range(0xff01,0xff5f))|set('①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳°〜→←⇔＞・…')
    text=''.join(sorted(c for c in chars if ord(c)>=0x20))
    css=''.join(f"@font-face{{font-family:'{n}';src:url(data:font/woff2;base64,{sub(p,text)}) format('woff2');font-weight:{w};font-style:normal;font-display:block}}\n" for n,p,w in faces)
    t=t.replace('<style>','<style>\n'+css,1)
    open('out/'+fname,'w',encoding='utf-8').write('<!doctype html>\n<html lang="ja">\n'+t+'\n</html>\n')
    print(fname, len(t)//1024,'KB', len(have),'units', len(used),'figs')

# ---- ウェブ公開用（iPadなどでURLから開く）：図を別ファイルに分けて、1ファイルを10MB未満にする ----
import os, zipfile, shutil
def build_web():
    src=open('out/中学社会プリント.html',encoding='utf-8').read()
    m=re.search(r'const FIGS=(\{.*?\});\n', src, re.S)
    figs=json.loads(m.group(1))
    parts=[]; cur={}; size=0
    for k,v in figs.items():
        b=len(v.encode())
        if size+b>7_000_000 and cur: parts.append(cur); cur={}; size=0
        cur[k]=v; size+=b
    if cur: parts.append(cur)
    d='out/web'; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    for i,pt in enumerate(parts):
        open(f'{d}/figs{i+1}.js','w',encoding='utf-8').write('(window.__FIGS=window.__FIGS||[]).push('+json.dumps(pt,ensure_ascii=False)+');\n')
    html=src[:m.start()]+'const FIGS=Object.assign({},...(window.__FIGS||[]));\n'+src[m.end():]
    tags=''.join(f'<script src="figs{i+1}.js"></script>\n' for i in range(len(parts)))
    k=html.index('<script>'); html=html[:k]+tags+html[k:]
    open(f'{d}/index.html','w',encoding='utf-8').write(html)
    z='out/中学社会プリント_ウェブ公開用.zip'
    with zipfile.ZipFile(z,'w',zipfile.ZIP_DEFLATED) as zf:
        for f in sorted(os.listdir(d)): zf.write(f'{d}/{f}', f'shakai/{f}')
    print('web', [(f, round(os.path.getsize(f'{d}/{f}')/1e6,1)) for f in sorted(os.listdir(d))], round(os.path.getsize(z)/1e6,1),'MB zip')
build_web()
