import json, re, html, sys
sys.path.insert(0,'tmp')
from yomu_data import UNITS
def ruby(t):
    t=html.escape(t,quote=False)
    t=re.sub(r'｜([^《｜]+)《([^》]+)》', r'<ruby>\1<rt>\2</rt></ruby>', t)
    t=re.sub(r'([一-龥々〆ヶ]+)《([^》]+)》', r'<ruby>\1<rt>\2</rt></ruby>', t)
    assert '《' not in t, t
    return t
for uid,u in UNITS.items():
    sheets=[]
    for s in u['sheets']:
        n=len(s['p'])
        for k,p,q,a in s['q']:
            assert 1<=p<=n, (s['t'],q)
            if k=='f': assert '＿＿' in q
        sheets.append(dict(t=s['t'], paras=[ruby(x) for x in s['p']], qs=[dict(k=k,p=p,q=q,a=a) for k,p,q,a in s['q']]))
    unit=dict(id=uid, subject='his', no='読む', title=u['title']+'（読んで解く）', lecture=[], sheets=[], yomu=dict(hint=u['hint'], sheets=sheets))
    open(f'units/{uid}.js','w').write(f"// 中1向け 読んで解くプリント（上半分：本文、下半分：問題）\nwindow.UNITS = window.UNITS || {{}};\nwindow.UNITS.{uid} = "+json.dumps(unit,ensure_ascii=False)+";\n")
    print(uid,len(sheets),[len(s['paras']) for s in sheets])
