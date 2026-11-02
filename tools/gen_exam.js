(cfg) => {
  // 受験用の総まとめセットをつくる（各単元の問題から選び、1枚に収まるように詰める）
  const U = cfg.ids.map(id => UNITS[id]);
  const src = u => `第${u.no}講`;
  const clone = o => JSON.parse(JSON.stringify(o));
  const tagQs = (qs, u) => qs.map(q => ({ ...clone(q), src: src(u) }));
  const host = document.createElement('div'); host.style.cssText = 'position:absolute;left:-99999px;top:0'; document.body.appendChild(host);
  const fits = sheet => {
    const fake = { id: 'tmp', subject: cfg.subject, no: '受験', title: 'tmp', lecture: [], sheets: [sheet], mixA: true };
    host.innerHTML = problemPage(fake, 0, 0);
    const g = host.querySelector('.pg'), i = host.querySelector('.pgi');
    return i.scrollHeight <= g.clientHeight - 4;
  };
  const isFig = b => !!(b.fig || b.figs || b.graphsQ || b.housesQ);
  const dependent = b => !b.note || /図|地図|グラフ|表|年表|上の|[A-ZＡ-Ｚ]/.test(b.note) || b.qs.some(q => /^[A-Zア-エＸ-Ｚ]$|^[A-Z][（(]/.test(q.q));
  // 図のブロックと、それに続く「図を見て答える」ブロックをひとまとまりにする
  const groupsOf = (u, si, opt = {}) => {
    const out = []; let cur = null;
    u.sheets[si].blocks.forEach(b => {
      if (opt.skipXl && b.qs.some(q => q.w === 'xl')) { cur = null; return; }
      const bb = { ...clone(b), qs: tagQs(b.qs, u) };
      if (isFig(b)) { cur = [bb]; out.push(cur); }
      else if (cur && (si === 1 || dependent(b))) cur.push(bb);
      else { cur = null; out.push([bb]); }
    });
    return out;
  };
  const N = cfg.N;
  // ---- 一問一答 ----
  const oneQ = {};
  U.forEach(u => { const a = u.sheets[0].blocks.flatMap(b => b.qs), c = u.sheets[3].blocks.flatMap(b => b.qs); const m = []; for (let i = 0; i < Math.max(a.length, c.length); i++) { if (a[i]) m.push(a[i]); if (c[i]) m.push(c[i]); } oneQ[u.id] = tagQs(m, u); });
  const ptr = {}; const take = (pool, key) => { const arr = pool[key]; if (!arr || !arr.length) return null; const i = (ptr[key + ':' + cfg.tag] = (ptr[key + ':' + cfg.tag] || 0)); ptr[key + ':' + cfg.tag] = i + 1; return arr[i % arr.length]; };
  const norm = s => String(s).replace(/[（(].*?[）)]/g, '').trim();
  const oneSheet = (ids, k, title) => {
    const qs = [], used = new Set();
    let r = k % ids.length, guard = 0;
    while (qs.length < 24 && guard < 400) {
      guard++;
      const id = ids[r % ids.length]; r++;
      cfg.tag = 'one';
      const q = take(oneQ, id); if (!q) continue;
      if (used.has(norm(q.a))) continue;
      used.add(norm(q.a)); qs.push(q);
    }
    // 単元の順にならべる
    qs.sort((a, b) => cfg.ids.indexOf(cfg.byNo[a.src]) - cfg.ids.indexOf(cfg.byNo[b.src]));
    let sheet = { title, mode: 'closed', lead: cfg.lead, blocks: [{ cols: 1, qs }] };
    while (!fits(sheet) && sheet.blocks[0].qs.length > 18) sheet.blocks[0].qs.pop();
    return sheet;
  };
  // ---- 記号・○× ----
  const choice = {}, tfq = {};
  U.forEach(u => { choice[u.id] = tagQs(u.sheets[2].blocks.filter(b => !b.tf).flatMap(b => b.qs), u); tfq[u.id] = tagQs(u.sheets[2].blocks.filter(b => b.tf).flatMap(b => b.qs), u); });
  const choiceSheet = k => {
    const qs = [], tf = [];
    for (let i = 0; qs.length < 20; i++) { cfg.tag = 'c'; const id = cfg.ids[(k * 7 + i) % cfg.ids.length]; const q = take(choice, id); if (q) qs.push(q); }
    for (let i = 0; tf.length < 4; i++) { cfg.tag = 't'; const id = cfg.ids[(k * 5 + i * 5) % cfg.ids.length]; const q = take(tfq, id); if (q) tf.push(q); }
    const ord = q => cfg.ids.indexOf(cfg.byNo[q.src]);
    qs.sort((a, b) => ord(a) - ord(b)); tf.sort((a, b) => ord(a) - ord(b));
    const sheet = { title: '記号で選ぶ・○×', mode: 'closed', lead: '正しいものを選んで、記号で答えよう。○×は、正しければ○、まちがいなら×。', blocks: [{ cols: 2, qs }, { cols: 2, tf: true, qs: tf }] };
    while (!fits(sheet) && sheet.blocks[0].qs.length > 14) sheet.blocks[0].qs.pop();
    // すき間があれば問題を足す（2問ずつ）
    for (let i = 0; sheet.blocks[0].qs.length < 30 && i < 40; i += 2) {
      cfg.tag = 'c';
      const add = [take(choice, cfg.ids[(k * 11 + i * 3) % cfg.ids.length]), take(choice, cfg.ids[(k * 11 + i * 3 + 9) % cfg.ids.length])].filter(Boolean);
      const trial = { ...sheet, blocks: [{ ...sheet.blocks[0], qs: [...sheet.blocks[0].qs, ...add].sort((a, b) => ord(a) - ord(b)) }, sheet.blocks[1]] };
      if (fits(trial)) sheet.blocks = trial.blocks; else break;
    }
    return sheet;
  };
  // ---- 図・資料（まとまりを詰める） ----
  const gpool = si => { const o = {}; U.forEach(u => o[u.id] = groupsOf(u, si, { skipXl: si === 5 })); return o; };
  const usage = new Map();
  const packSheet = (pool, k, title, lead, tail) => {
    const sheet = { title, mode: 'closed', lead, blocks: tail ? [tail] : [] };
    const start = (k * cfg.step) % cfg.ids.length;
    const orderIds = cfg.ids.map((_, i) => cfg.ids[(start + i * cfg.stride) % cfg.ids.length]);
    const cands = [];
    orderIds.forEach((id, oi) => pool[id].forEach((g, gi) => cands.push({ id, g, key: title + id + gi, oi })));
    const usedUnits = new Set(), usedKeys = new Set();
    for (const pass of [1, 2]) {
      cands.sort((x, y) => (usage.get(x.key) || 0) - (usage.get(y.key) || 0) || x.oi - y.oi);
      for (const c of cands) {
        if (usedKeys.has(c.key) || (pass === 1 && usedUnits.has(c.id))) continue;
        const trial = { ...sheet, blocks: tail ? [...sheet.blocks.slice(0, -1), ...c.g, tail] : [...sheet.blocks, ...c.g] };
        if (fits(trial)) { sheet.blocks = trial.blocks; usedKeys.add(c.key); usedUnits.add(c.id); usage.set(c.key, (usage.get(c.key) || 0) + 1); }
      }
    }
    // 単元の順にならべる（tail は最後のまま）
    return sheet;
  };
  const p1 = gpool(1), p4 = gpool(4), p5 = gpool(5);
  const xl = {}; U.forEach(u => xl[u.id] = tagQs(u.sheets[5].blocks.flatMap(b => b.qs).filter(q => q.w === 'xl'), u));
  const sets = [];
  for (let k = 0; k < N; k++) {
    const s1 = oneSheet(cfg.front, k, cfg.t1), s2 = oneSheet(cfg.back, k, cfg.t2), s3 = choiceSheet(k);
    const s4 = packSheet(p1, k, cfg.t4, '何も見ないで解こう。図や地図をよく見て答えよう。');
    const s5 = packSheet(p4, k + 3, cfg.t5, '何も見ないで解こう。');
    const xs = []; for (let i = 0; xs.length < cfg.nxl; i++) { cfg.tag = 'x'; const id = cfg.ids[(k * 3 + i * Math.max(1, Math.floor(cfg.ids.length / cfg.nxl))) % cfg.ids.length]; const q = take(xl, id); if (q && !xs.includes(q)) xs.push(q); }
    xs.sort((a, b) => cfg.ids.indexOf(cfg.byNo[a.src]) - cfg.ids.indexOf(cfg.byNo[b.src]));
    let s6 = packSheet(p5, k + 5, cfg.t6, '何も見ないで解こう。説明問題は「〜から。」で終わる短い文でOK。', { cols: 1, note: '理由を短く書こう', qs: xs });
    while (!fits(s6) && s6.blocks[s6.blocks.length - 1].qs.length > 3) s6.blocks[s6.blocks.length - 1].qs.pop();
    sets.push({ note: '全範囲', sheets: [s1, s2, s3, s4, s5, s6] });
  }
  host.remove();
  return sets;
}
