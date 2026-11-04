import json, re, html, sys
sys.path.insert(0,'tmp')
from yomu2_data import UNITS2
def text(t):
    t=html.escape(t,quote=False)
    t=re.sub(r'｜([^《｜]+)《([^》]+)》', r'<ruby>\1<rt>\2</rt></ruby>', t)
    t=re.sub(r'([一-龥々〆ヶ]+)《([^》]+)》', r'<ruby>\1<rt>\2</rt></ruby>', t)
    t=re.sub(r'〔([^〕]+)〕', r'<span class="gl">（\1）</span>', t)
    assert '《' not in t and '〔' not in t, t
    return t
for uid,u in UNITS2.items():
    sheets=[]
    for s in u['sheets']:
        nf=len(s['front']['p']); nb=len(s['back']['p'])
        allq=s['front']['q']+s['back']['q']+s['last']
        for k,p,q,a in allq: assert 1<=p<=nf+nb, q
        Q=lambda L:[dict(k=k,p=p,q=q,a=a) for k,p,q,a in L]
        sheets.append(dict(t=s['t'], front=dict(paras=[text(x) for x in s['front']['p']], qs=Q(s['front']['q'])),
                           back=dict(paras=[text(x) for x in s['back']['p']], qs=Q(s['back']['q'])), last=Q(s['last'])))
        print(uid, s['t'], 'paras', nf, nb, 'qs', len(s['front']['q']), len(s['back']['q']), len(s['last']),
              'chars', sum(len(re.sub(r'《[^》]*》|〔[^〕]*〕','',x)) for x in s['front']['p']), sum(len(re.sub(r'《[^》]*》|〔[^〕]*〕','',x)) for x in s['back']['p']))
    unit=dict(id=uid, subject=u.get('subject','his'), no='中2', title=u['title']+'（読んで解く・中2）', lecture=[], sheets=[], yomu2=dict(hint=u['hint'], sheets=sheets))
    open(f'units/{uid}.js','w').write(f"// 中2向け 読んで解く宿題（A4両面1枚）\nwindow.UNITS = window.UNITS || {{}};\nwindow.UNITS.{uid} = "+json.dumps(unit,ensure_ascii=False)+";\n")
