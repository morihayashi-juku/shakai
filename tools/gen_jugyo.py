import json, re, sys
sys.path.insert(0, 'tmp')
from jugyo_data import JUGYO, KANPE
for uid, u in JUGYO.items():
    sheets = []
    for s in u['sheets']:
        ans = []; n = [0]
        def wide(m):
            n[0] += 1; ans.append([n[0], m.group(1), 1])
            return f'<div class="jw"><i>{n[0]}</i><b>{m.group(1)}</b></div>'
        def blank(m):
            n[0] += 1; a = m.group(1); ans.append([n[0], a, 0])
            L = len(re.sub(r'<[^>]+>', '', a))
            return f'<span class="jb"><i>{n[0]}</i><b style="min-width:{min(16, max(2.6, L * 1.25 + .6)):.1f}em">{a}</b></span>'
        class _M:
            def __init__(self, t): self.t = t
            def group(self, i): return self.t
        conv = lambda h: re.sub(r'［［(.+?)］］|［([^［］]+)］', lambda m: wide(_M(m.group(1))) if m.group(1) is not None else blank(_M(m.group(2))), h)
        f = conv(s['front']); b = conv(s['back'])
        assert '［' not in f + b
        secs = []
        for side, h in (('表', f), ('うら', b)):
            for part in h.split('<div class="jsec">')[1:]:
                m = re.match(r'<h3>(.*?)<small>目安 (\d+)分</small></h3>', part)
                nums = [int(x) for x in re.findall(r'<i>(\d+)</i>', part)]
                secs.append(dict(side=side, t=m.group(1), min=int(m.group(2)), ans=[a for a in ans if a[0] in nums]))
        kp = KANPE[uid][len(sheets)]
        assert len(kp['steps']) == len(secs), (uid, s['t'], len(kp['steps']), len(secs))
        for sc, st in zip(secs, kp['steps']): sc['items'] = [list(x) for x in st]
        sheets.append(dict(t=s['t'], goal=s['goal'], front=f, back=b, ans=ans, kanpe=dict(prep=kp['prep'], secs=secs)))
        print('  minutes', sum(x['min'] for x in secs))
        print(uid, s['t'], 'blanks', len(ans))
    unit = dict(id=uid, subject=u['subject'], tab=u['tab'], no='中2', title=u['title'], lecture=[], sheets=[], jugyo=dict(name=u['name'], sheets=sheets))
    open(f'units/{uid}.js', 'w').write(f"// 授業用プリント（A4両面・40分）\nwindow.UNITS = window.UNITS || {{}};\nwindow.UNITS.{uid} = " + json.dumps(unit, ensure_ascii=False) + ";\n")
