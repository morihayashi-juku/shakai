import json, re, html, sys
sys.path.insert(0,'tmp')
from yomu_data import UNITS
from yomu_gloss import G, COUNTRY, SKIPC
GL_L, GL_R = '\u2063(', ')\u2063'   # 説明のしるし（あとで <span class="gl"> にする）
def inside(pp, i):
    return pp[:i].count(GL_L) > pp[:i].count(GL_R)
def gloss(uid, si, paras):
    specs=[(t,m) for t,m in G.get(uid,[[]]*99)[si] if m] if uid in G and si < len(G[uid]) else []
    for t,m in specs:
        for k,pp in enumerate(paras):
            i=-1
            for mo in re.finditer(re.escape(t), pp):
                if not inside(pp, mo.start()): i=mo.start(); break
            if i<0: continue
            j=i+len(t)
            if j<len(pp) and pp[j]=='《': j=pp.index('》',j)+1
            paras[k]=pp[:j]+GL_L+m+GL_R+pp[j:]; break
        else: raise SystemExit(f'not found {uid} {si} {t}')
    skip=SKIPC.get((uid,si),set())
    for name,m in COUNTRY.items():
        if name in skip: continue
        pat=re.compile(r'(?<![遣])'+name+r'(?![招風銭寇号年軍])(《[^》]*》)?')
        for k,pp in enumerate(paras):
            mo=next((m for m in pat.finditer(pp) if not inside(pp, m.start())), None)
            if mo:
                if pp[max(0,mo.start()-5):mo.start()].endswith(('中国の','朝鮮半島の')): break
                if pp[mo.end():mo.end()+1]==GL_L[0]: break
                paras[k]=pp[:mo.end()]+GL_L+m+GL_R+pp[mo.end():]; break
    return paras
def ruby(t):
    t=html.escape(t,quote=False)
    t=re.sub(r'｜([^《｜]+)《([^》]+)》', r'<ruby>\1<rt>\2</rt></ruby>', t)
    t=re.sub(r'([一-龥々〆ヶ]+)《([^》]+)》', r'<ruby>\1<rt>\2</rt></ruby>', t)
    assert '《' not in t, t
    t=t.replace(GL_L,'<span class="gl">（').replace(GL_R,'）</span>')
    return t
for uid,u in UNITS.items():
    sheets=[]
    for si,s in enumerate(u['sheets']):
        s=dict(s, p=gloss(uid, si, list(s['p'])))
        n=len(s['p'])
        for k,p,q,a in s['q']:
            assert 1<=p<=n, (s['t'],q)
            if k=='f': assert '＿＿' in q
        sheets.append(dict(t=s['t'], paras=[ruby(x) for x in s['p']], qs=[dict(k=k,p=p,q=q,a=a) for k,p,q,a in s['q']]))
    unit=dict(id=uid, subject='his', no='読む', title=u['title']+'（読んで解く）', lecture=[], sheets=[], yomu=dict(hint=u['hint'], sheets=sheets))
    open(f'units/{uid}.js','w').write(f"// 中1向け 読んで解くプリント（上半分：本文、下半分：問題）\nwindow.UNITS = window.UNITS || {{}};\nwindow.UNITS.{uid} = "+json.dumps(unit,ensure_ascii=False)+";\n")
    print(uid,len(sheets),[len(s['paras']) for s in sheets])
