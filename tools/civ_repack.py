# 使い方: python3 tools/civ_repack.py civ02 3,3   → 講座の section を、前から 3つ・3つ のページに分け直す
import re, sys
uid, groups = sys.argv[1], [int(x) for x in sys.argv[2].split(',')]
p = f'units/{uid}.js'; s = open(p).read()
a = s.index('const lecture = ['); b = s.index('\n  ];', a)
body = s[a:b]
secs = re.findall(r'<section>.*?</section>', body, re.S)
assert sum(groups) == len(secs), (len(secs), groups)
out, k = [], 0
for i, g in enumerate(groups):
    out.append(f"    // ---------------- 講座 {i+1} ----------------\n    `\n" + '\n'.join(secs[k:k+g]) + '`,')
    k += g
s = s[:a] + 'const lecture = [\n' + '\n'.join(out) + s[b:]
open(p, 'w').write(s)
print(uid, len(secs), 'sections ->', groups)
