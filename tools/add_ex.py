import json,re
EX=json.load(open('tmp/ex_final.json'))
for uid in ['geo90','his90']:
    p=f'units/{uid}.js'; s=open(p).read()
    st=s.index('{',s.index(f'{uid} =')); en=s.rstrip().rstrip(';').rindex('}')+1
    j=json.loads(s[st:en]); miss=0; n=0
    for S in j['sets']:
        for sh in S['sheets']:
            for b in sh['blocks']:
                for q in b['qs']:
                    k='|'.join([q['src'],q['q'],str(q.get('a'))])
                    if k in EX: q['ex']=EX[k]; n+=1
                    else: miss+=1; print('MISS',uid,k)
    # also top-level sheets (= set 1 copy?)
    for sh in j.get('sheets',[]):
        for b in sh['blocks']:
            for q in b['qs']:
                k='|'.join([q['src'],q['q'],str(q.get('a'))])
                if k in EX: q['ex']=EX[k]
    open(p,'w').write(s[:st]+json.dumps(j,ensure_ascii=False)+s[en:])
    print(uid,n,'miss',miss)
