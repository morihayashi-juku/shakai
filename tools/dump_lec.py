import json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page()
    pg.goto('file:///home/claude/shakai/out/中学社会プリント.html'); pg.wait_for_timeout(1500)
    d=pg.evaluate("""(()=>{const o={};Object.values(UNITS).forEach(u=>{o[u.id]={no:u.no,title:u.title,subject:u.subject,lecture:u.lecture.map(L=>typeof L==='object'?'':L), flow:u.flow||null}});return o})()""")
    sets={k:pg.evaluate(f"UNITS.{k}.sets") for k in ['geo90','his90']}
json.dump(d,open('tmp/lec.json','w'),ensure_ascii=False)
json.dump(sets,open('tmp/sets.json','w'),ensure_ascii=False)
print(len(d))
