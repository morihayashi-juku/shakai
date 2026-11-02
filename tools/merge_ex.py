import json,glob,re,sys
R=json.load(open('review.json'))
fix={}
for f in sorted(glob.glob('exfix/*.txt')):
    for ln in open(f):
        ln=ln.rstrip('\n')
        if not ln.strip(): continue
        i,t=ln.split('\t',1); fix[int(i)]=t.strip()
ex={}
bad=[]
for r in R:
    e=fix.get(r['id'], r.get('ex') or '')
    ex[r['key']]=e
    if r['id'] not in fix:
        if (not e) or re.match(r'^\d',e) or e.endswith('…') or len(e)<12:
            bad.append((r['id'],r['sid'],r['src'],r['q'],r['a'],e))
if '--bad' in sys.argv:
    for b in bad: print(*b,sep='｜')
    print(len(bad),'bad', len(fix),'fixes'); sys.exit()
TF=json.load(open('ex_textfix.json'))
ex={k:TF.get(v,v) for k,v in ex.items()}
STRIP=set('琉球 朝鮮 都市 政治の中心地 道具や生活 建築・彫刻 文学 茶の湯 芸能 鉱業 漁業 手工業 思想 暦 科学 女性運動 生活 政治 労働 経済 教育 南部 蝦夷地 殷・周 漢 秦'.split())
def strip_label(e):
    pre=''
    m=re.match(r'^(正しい。|まちがい。)',e)
    if m: pre=m.group(1); e=e[len(pre):]
    m=re.match(r'^([^：。、（）\d]{1,8})：(.+)$',e)
    if m and m.group(2).endswith('。') and len(m.group(2))>=15 and '：' not in m.group(2):
        L,body=m.group(1),m.group(2)
        if L in STRIP: e=body
        elif L.startswith('『'): e=L+'によると、'+body
        else: e=L+'は、'+body
    return pre+e
ex={k:strip_label(v) for k,v in ex.items()}
json.dump(ex,open('ex_final.json','w'),ensure_ascii=False)
print('ok',len(ex))
