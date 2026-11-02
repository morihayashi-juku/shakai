import json
from playwright.sync_api import sync_playwright
js=open('tmp/gen_exam.js').read()
geo=[f'geo{n:02d}' for n in range(1,22)]; his=[f'his{n:02d}' for n in range(1,19)]
cfgs={
 'geo90': dict(subject='geo', ids=geo, front=geo[:9], back=geo[9:], N=12, step=5, stride=8, nxl=6, lead='何も見ないで解こう。わからない問題はとばして、最後に講座で確かめよう。',
   t1='一問一答（世界の地理）', t2='一問一答（日本の地理）', t4='地図・図で答える', t5='地図・グラフ・資料で答える', t6='総まとめ（説明）', title='地理の全範囲 総まとめ'),
 'his90': dict(subject='his', ids=his, front=his[:9], back=his[9:], N=12, step=4, stride=5, nxl=6, lead='何も見ないで解こう。わからない問題はとばして、最後に講座で確かめよう。',
   t1='一問一答（原始〜安土桃山）', t2='一問一答（江戸〜現代）', t4='図・地図で答える', t5='資料で答える', t6='総まとめ（ならべかえ・説明）', title='歴史の全範囲 総まとめ'),
}
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1440,'height':1000})
    errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    for uid,c in cfgs.items():
        c['byNo']=pg.evaluate("(ids)=>Object.fromEntries(ids.map(id=>['第'+UNITS[id].no+'講',id]))", c['ids'])
        sets=pg.evaluate(js, c)
        stats=[[sum(len(b['qs']) for b in sh['blocks']) for sh in s['sheets']] for s in sets]
        print(uid, stats)
        unit=dict(id=uid, subject=c['subject'], no='受験', title=c['title'], lecture=[], sheets=sets[0]['sheets'], sets=sets, mixA=True)
        open(f'units/{uid}.js','w').write(f"// {c['title']}（受験用・各単元の問題からセットごとに選んで構成）\nwindow.UNITS = window.UNITS || {{}};\nwindow.UNITS.{uid} = "+json.dumps(unit,ensure_ascii=False)+";\n")
    print(errs)

# 解説をつける（tmp/ex_final.json）
import subprocess; subprocess.run(["python3","tmp/add_ex.py"],check=True)
