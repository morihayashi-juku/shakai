import json, re, html
lec=json.load(open('tmp/lec.json')); sets=json.load(open('tmp/sets.json'))
KANA='アイウエオカキク'
def segs_of(h):
    h=re.sub(r'\{\{fig:\w+\}\}','',h)
    h=re.sub(r'<rt>.*?</rt>','',h,flags=re.S)
    h=re.sub(r'<tr>(.*?)</tr>', lambda m: '<li>'+re.sub(r'</t[hd]>\s*<t[hd][^>]*>','：',m.group(1))+'</li>', h, flags=re.S)
    parts=re.split(r'</?(?:li|p|h2|h3|div|table|ul|section|br)[^>]*>', h)
    out=[]
    for p in parts:
        t=html.unescape(re.sub(r'<[^>]+>','',p)); t=re.sub(r'\s+','',t)
        if len(t)<6: continue
        for s in re.split(r'(?<=。)', t):
            if len(s)>=6: out.append(s)
    return out
IDX={}
for uid,u in lec.items():
    ss=[]
    for L in u['lecture']: ss+=segs_of(L)
    if u.get('flow'):
        for r in u['flow']['rows']:
            for y,yl,t,k in r['items']:
                if yl: ss.append(f'{yl}、{t}。')
    IDX[uid]=ss
byno={}
for uid,u in lec.items():
    byno[(u['subject'], f"第{u['no']}講")]=uid
def bigr(s): s=re.sub(r'[、。・（）「」『』〜\s?？]','',s); return {s[i:i+2] for i in range(len(s)-1)}
def terms(a):
    a=str(a); a=re.sub(r'\s','',a)
    main=re.split(r'[（(]',a)[0]
    alts=re.findall(r'[（(]([^）)]+)[）)]',a)
    out=[main]+alts
    more=[]
    for t in out:
        if '・' in t: more+=t.split('・')
    return [t for t in out+more if len(t)>=2]
def shorten(s, n=110):
    if len(s)<=n: return s
    return s[:n-1]+'…'
def best(uid, q, ans, need_term=True, extra=''):
    qt=q.get('q','')+extra
    cands=IDX.get(uid,[])
    T=terms(ans) if ans else []
    qb=bigr(qt)
    bestv=None;bs=-1
    for s in cands:
        has=[t for t in T if t in s]
        ov=len(qb & bigr(s))
        if need_term and not has: continue
        tl=len(max(has,key=len)) if has else 0
        if need_term and tl<=2 and ov<2 and len(qt)>3: continue
        sc=(20+tl if has else 0)+3*ov
        if sc>bs: bs=sc;bestv=s
    return bestv,bs
years_re=re.compile(r'(紀元前)?(\d{1,4})年')
def order_ex(uid, q):
    # 「ア 寛政の改革　イ …」
    items=re.findall(r'([ア-エ])\s*([^ア-エ　]+?)(?=　[ア-エ]\s|$)', q['q'].replace('　',' 　').strip()+'')
    items=re.findall(r'([アイウエオ])\s+(\S+)', q['q'])
    res=[]
    for k,t in items:
        y=None
        for src in [uid]+[x for x in IDX if x!=uid and lec[x]['subject']==lec[uid]['subject']]:
            for s in IDX[src]:
                if t in s:
                    m=years_re.search(s[max(0,s.find(t)-25):s.find(t)+len(t)+25])
                    if m: y=('紀元前' if m.group(1) else '')+m.group(2)+'年'; break
            if y: break
        res.append(f'{k} {t}' + (f'（{y}）' if y else ''))
    return '　'.join(res) if res else None
out={}; miss=[]; weak=set()
for sid,S in sets.items():
    subj=sid[:3]
    for si,st in enumerate(S):
        for sh in st['sheets']:
            for b in sh['blocks']:
                for q in b['qs']:
                    key=(q['src'], q['q'], str(q.get('a')))
                    if key in out: continue
                    uid=byno[(subj,q['src'])]
                    ex=None
                    if b.get('tf'):
                        s,sc=best(uid,q,None,need_term=False)
                        if s and sc>=4: ex=('正しい。' if q['a']=='○' else 'まちがい。')+s
                    elif 'c' in q:
                        s,sc=best(uid,q,q['c'][q['a']])
                        ex=s
                        if s and sc<30: weak.add(key)
                    elif '→' in str(q.get('a','')):
                        ex=order_ex(uid,q)
                    else:
                        s,sc=best(uid,q,q['a'])
                        ex=s
                        if s and (sc<30 or len(terms(q['a'])[0] if terms(q['a']) else '')<=2): weak.add(key)
                        if not s:
                            for u2 in IDX:
                                if lec[u2]['subject']!=subj or u2==uid: continue
                                s2,sc2=best(u2,q,q['a'])
                                if s2: ex=s2; weak.add(key); break
                        if q.get('w')=='xl' and not ex:
                            s,sc=best(uid,q,None,need_term=False); ex=s if sc>=4 else None
                    if not ex and not b.get('tf') and '→' not in str(q.get('a','')):
                        ansT = q['c'][q['a']] if 'c' in q else str(q.get('a',''))
                        s,sc=best(uid,q,None,need_term=False,extra=ansT)
                        if s and sc>=12: ex=s; weak.add(key)
                    if ex: out[key]=shorten(ex)
                    else: miss.append(key)
print('done',len(out),'miss',len(miss))
json.dump({'|'.join(k):v for k,v in out.items()},open('tmp/ex_auto.json','w'),ensure_ascii=False)
json.dump(['|'.join(k) for k in miss],open('tmp/ex_miss.json','w'),ensure_ascii=False)
json.dump(['|'.join(k) for k in weak],open('tmp/ex_weak.json','w'),ensure_ascii=False)
print('weak',len(weak))
import random
random.seed(1)
for k in random.sample(list(out),0): print(k[0],k[1][:30],'→',k[2],'::',out[k][:80])
