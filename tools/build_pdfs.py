# iPad・iPhone のホーム画面から開いたとき用の「できあがりPDF」を作る。
#   ホーム画面のアプリの形では window.print() が動かないので、
#   印刷ボタン → このPDFを共有メニューで開く →「プリント」で印刷する。
# 使い方（build.py のあと）：python3 tools/build_pdfs.py [単元ID ...]
#   → out/web/pdf/<単元>/<種類>.pdf と out/web/pdf/index.json
#   PDFの作成日時は消しているので、中身が同じなら毎回同じファイルになる（git に差分が出ない）。
import asyncio, hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML = os.path.join(ROOT, 'out', '中学社会プリント.html')
OUT = os.path.join(ROOT, 'out', 'web', 'pdf')

# 単元ごとに作るPDFの一覧を、ページの中で決める（state をいじる関数を返す）
PLAN_JS = r'''
() => {
  const plans = [];
  // 画面の一覧に出ている単元だけ
  const listed = new Set([...Object.values(HOMEWORK), ...Object.values(SUBJECTS)].flatMap(h => h.parts.flatMap(([, us]) => us.map(x => x[0]))));
  for (const [id, u] of Object.entries(UNITS)) {
    if (!listed.has(id)) continue;
    if (u.yomu) {
      const n = u.yomu.sheets.length;
      plans.push([id, 'all', `${n}日分ぜんぶ（答えはうら）`, {yans: 'back'}]);
      u.yomu.sheets.forEach((s, i) => plans.push([id, 'd' + (i + 1), `${i + 1}日目（答えはうら）`, {yans: 'back', only: 'Y' + i}]));
    } else if (u.yomu2) {
      plans.push([id, 'all', 'ぜんぶ（答えは最後に）', {}]);
      u.yomu2.sheets.forEach((s, i) => plans.push([id, 'n' + (i + 1), `No.${i + 1}　${s.t.replace(/^第\d+講　/, '')}（答えつき）`, {only: 'Y' + i}]));
    } else if (u.jugyo) {
      plans.push([id, 's', '生徒用（答えは最後に）', {jmode: 's'}]);
      plans.push([id, 't', '先生用（答えを赤で入れたもの）', {jmode: 't'}]);
      plans.push([id, 'k', '先生用カンペ', {jmode: 'k'}]);
    } else if (u.sheets.length || u.lecture.length) {
      if (u.lecture.length) plans.push([id, 'lec', `講座（${u.lecture.length}ページ）`, {only: 'L'}]);
      if (u.sheets.length) {
        // 並べかえパターンB〜Dは作らない（大きくなりすぎるため。Safariからなら印刷できる）
        const pats = u.sets ? u.sets.map((s, i) => [i, `セット${i + 1}`]) : [[0, 'パターンA']];
        pats.forEach(([i, nm]) => plans.push([id, 'q' + (u.sets ? i + 1 : PATTERNS[i]), `問題と解答　${nm}`, {pattern: i, only: 'QA'}]));
      }
    }
  }
  return plans;
}'''

APPLY_JS = r'''
([id, opt]) => {
  openUnit(id); state.view = 'print'; document.body.classList.remove('read');
  state.pattern = opt.pattern || 0; state.yans = opt.yans || state.yans || 'back';
  if (opt.jmode) { state.jmode = opt.jmode; state.jteach = opt.jmode === 't'; state.jans = 'end'; }
  state.sel = defaultSel(UNITS[id]);
  if (opt.only) for (const k of Object.keys(state.sel)) {
    state.sel[k] = opt.only === 'QA' ? (k[0] === 'Q' || k === 'A') : opt.only === 'L' ? k[0] === 'L' : k === opt.only;
  }
  renderAll();
  return document.querySelectorAll('#sheets .page').length;
}'''

def clean(b):
    # 作成日時の数字を 0 にして、同じ中身なら同じファイルにする（長さは変えない＝PDFの目次の位置がずれない）
    z = lambda m: re.sub(rb'[0-9]', b'0', m.group(0))
    return re.sub(rb'/(?:CreationDate|ModDate) \(D:[^)]*\)', z, b)

async def main():
    from playwright.async_api import async_playwright
    only = set(sys.argv[1:])
    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(OUT, 'index.json')
    index = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg0 = await b.new_page()
        await pg0.goto('file://' + HTML); await pg0.wait_for_timeout(1500)
        plans = await pg0.evaluate(PLAN_JS)
        await pg0.close()
        if only: plans = [x for x in plans if x[0] in only]
        units = sorted(set(x[0] for x in plans))
        for u in units: index[u] = []
        q = asyncio.Queue()
        for x in plans: q.put_nowait(x)
        done = [0]
        async def worker():
            pg = await b.new_page(viewport={'width': 1300, 'height': 900})
            await pg.goto('file://' + HTML); await pg.wait_for_timeout(1500)
            await pg.evaluate('document.fonts.ready')
            while not q.empty():
                uid, key, label, opt = q.get_nowait()
                n = await pg.evaluate(APPLY_JS, [uid, opt])
                await pg.wait_for_timeout(500)
                await pg.emulate_media(media='print')
                data = await pg.pdf(prefer_css_page_size=True, print_background=True)
                await pg.emulate_media(media='screen')
                os.makedirs(os.path.join(OUT, uid), exist_ok=True)
                path = os.path.join(OUT, uid, key + '.pdf')
                data = clean(data)
                old = open(path, 'rb').read() if os.path.exists(path) else None
                if old != data: open(path, 'wb').write(data)
                index[uid].append([key, label, n])
                done[0] += 1
                if done[0] % 20 == 0: print(done[0], '/', len(plans), flush=True)
            await pg.close()
        await asyncio.gather(*[worker() for _ in range(4)])
        await b.close()
    # 並びを計画どおりに
    order = {(x[0], x[1]): i for i, x in enumerate(plans)}
    for u in units: index[u].sort(key=lambda r: order[(u, r[0])])
    json.dump(index, open(idx_path, 'w'), ensure_ascii=False, separators=(',', ':'))
    tot = sum(os.path.getsize(os.path.join(dp, f)) for dp, _, fs in os.walk(OUT) for f in fs)
    print('PDF', len(plans), 'files', round(tot / 1e6, 1), 'MB')

asyncio.run(main())
