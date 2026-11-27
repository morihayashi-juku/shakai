/* 社会 教材棚 — 画面と印刷
   教材の中身は data/*.json に書く（このファイルは画面の仕組みだけ）。
   - data/common.json   … 組（生徒）の順番 tracks・プリント一覧のファイル名 libraries・単元とステップ（学年ごと）
   - data/library*.json … プリントの一覧（1回だけ書く。学年ごとにファイルを分ける）
   - data/{組}.json     … その組の回（sets）・今の位置（now）・記録（log） */
"use strict";
pdfjsLib.GlobalWorkerOptions.workerSrc = "lib/pdfjs/pdf.worker.min.js";

const PRINT_DPI = 200;
// 曜日ごとに出すグループ。中学は月・木、高校は火・金。
// 週の後ろの日（木・金）＝授業の日（授業・宿題・先生用のこたえ）、前の日（月・火）＝自習の日。
const DAYS = {
  mon: {label: "月曜", kinds: ["mon"]},
  tue: {label: "火曜", kinds: ["mon"]},
  thu: {label: "木曜", kinds: ["thu", "hw", "teacher"]},
  fri: {label: "金曜", kinds: ["thu", "hw", "teacher"]},
};
const PAIR = {mon: "thu", thu: "mon", tue: "fri", fri: "tue"};   // 同じ週の組み（月↔木、火↔金）
const KIND_ALIAS = {lesson: "thu", study: "mon"};                  // kind の別名（lesson＝授業、study＝自習。色は lesson＝緑、study＝青）
// グループをどの曜日に出すか：グループに day があればそれを優先（月・木とも授業の組は、グループごとに day を書く）。
// day がなければ kind で決まる（授業・宿題・先生用のこたえ＝木・金、自習＝月・火）。
const groupOn = (g, day) => g.day ? g.day.includes(day) : DAYS[day].kinds.includes(g.kind);
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const P = f => "pdf/" + f;
const ICON_PRINT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/></svg>';
const ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16"/></svg>';
const ICON_EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const ICON_CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

let D = null;                         // {common, library, s: {u: …, k: …}}
let TRACKS = [];
const ITEMS = new Map();              // file → ライブラリの項目
const STEPS = new Map();              // step id → {step, unit}
const USED = new Map();               // file → ["K①", …]

/* ------------------------------------------------------------ 保存（この端末だけ） */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
let checks = store.get("shakai-tana-shelf", {}) || {};
const ck = (track, set, k) => checks[`${track}/${set.id}-${k}`];
const isDone = (track, set) => D.s[track].checks.every(([k]) => ck(track, set, k));

/* ------------------------------------------------------------ データ */
async function loadData() {
  const get = n => fetch(`data/${n}.json`, {cache: "no-cache"}).then(r => {
    if (!r.ok) throw new Error(`data/${n}.json が読めません（${r.status}）`);
    return r.json();
  });
  const common = await get("common");
  TRACKS = common.tracks || common.students || [];          // 組（生徒）の順番。students は古い書き方
  const libNames = common.libraries || ["library"];
  const [libs, studs] = await Promise.all([Promise.all(libNames.map(get)), Promise.all(TRACKS.map(get))]);
  const library = {items: libs.flatMap(l => l.items || [])};
  D = {common, library, s: Object.fromEntries(TRACKS.map((t, i) => [t, studs[i]]))};
  for (const t of TRACKS) for (const s of D.s[t].sets) for (const g of s.groups) {
    g.kind = KIND_ALIAS[g.kind] || g.kind;
    if (g.day) g.day = [].concat(g.day);                    // day は "mon" でも ["mon","thu"] でもよい
  }
  // 回に from（YYYY-MM-DD）があれば、今日までに始まった最後の回を「今ここ」にする（社会：週ごとに自動で切りかえ）
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  for (const t of TRACKS) {
    const ss = D.s[t].sets.filter(s => s.from);
    if (!ss.length) continue;
    const now = ss.filter(s => s.from <= today).pop() || ss[0];
    for (const s of D.s[t].sets) s.cur = s === now;
  }
  for (const u of common.units) for (const st of u.steps) STEPS.set(st.id, {step: st, unit: u});
  if (common.jitsu) for (const st of common.jitsu.steps) STEPS.set(st.id, {step: st, unit: {name: common.jitsu.name}});   // 実力テストのタブ（学年の単元とは別）
  for (const it of library.items) ITEMS.set(it.file, it);
  for (const t of TRACKS) for (const s of D.s[t].sets) for (const g of s.groups) for (const r of g.items) {
    if (!USED.has(r.file)) USED.set(r.file, []);
    const tag = D.s[t].name + s.label;
    if (!USED.get(r.file).includes(tag)) USED.get(r.file).push(tag);
  }
  // 最終更新日は、いちばん新しい各ファイルの updated（チャットごとに別のファイルを書くので、日付で衝突しない）
  const dates = [common.updated, ...libs.map(l => l.updated), ...studs.map(s => s.updated)].filter(Boolean).sort();
  const upd = dates[dates.length - 1];
  $("#updated").textContent = upd ? `最終更新 ${upd.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, "$1年$2月$3日")}` : "";
  // 学年のタブ（中1〜高2）を「教材ライブラリ」の前に入れる
  const lib = $('#tabs a[data-tab="lib"]');
  for (const g of Object.keys(GRADE_ID)) if (gradeTracks(g).length) lib.insertAdjacentHTML("beforebegin", `<a href="#${GRADE_ID[g]}" data-tab="${GRADE_ID[g]}">${esc(g)}</a>`);
  // 実力テストのタブ（学年のタブのあと・教材ライブラリの前）
  if (common.jitsu) lib.insertAdjacentHTML("beforebegin", `<a href="#jitsu" data-tab="jitsu">${esc(common.jitsu.name)}</a>`);
}
const item = r => ({...(ITEMS.get(r.file) || {file: r.file, title: r.file + "（ライブラリにありません）", pages: "?"}), ...r});
const stepName = id => (STEPS.get(id) || {step: {name: id}}).step.name;
const stepFull = id => { const x = STEPS.get(id); return x ? `${x.unit.name}　${x.step.name}` : id; };
const curSet = t => D.s[t].sets.find(s => s.cur) || null;
const dayList = t => D.s[t].days || ["thu", "mon"];
const setAnswers = s => s.groups.flatMap(g => g.items.map(item).filter(it => it.ans).map(it => ({...it, kind: g.kind, day: g.day, glabel: g.label})));
// その曜日の画面に出す組：その日に来る組と、同じ週の組の日（月↔木、火↔金）に来る組。
// （N のように週1の組は、来ない日に「来ない日」と出る。まったく別の曜日の組は出さない）
const visibleOn = (t, day) => dayList(t).includes(day) || dayList(t).includes(PAIR[day]);
const nowName = T => T.now && T.now.step ? stepFull(T.now.step) : T.longName;   // 教材がまだない組は、組の名前を出す
const hasHw = T => T.sets.some(s => s.groups.some(g => g.kind === "hw"));
// 組のバッジ（丸い名札）。名前が長いときは badge に短い名前を書く
const who = t => { const b = D.s[t].badge || D.s[t].name; return `<a class="who" data-len="${[...b].length}" href="#${t}">${esc(b)}</a>`; };

/* ------------------------------------------------------------ 部品 */
function tile(it, {used = false} = {}) {
  const many = it.pages > 1 ? " stack" : "";
  const u = used && USED.get(it.file);
  return `<div class="tile${it.ans ? " ans" : ""}">
    <button type="button" class="open" data-act="view" data-file="${esc(it.file)}" aria-label="${esc(it.title)}を見る">
      <span class="thumb${many}" data-thumb="${esc(it.file)}"><span class="pg">${it.pages}p</span></span>
      <span class="t">${esc(it.title)}</span>${it.note ? `<span class="n">${esc(it.note)}</span>` : ""}
    </button>
    ${u && u.length ? `<span class="used">${u.map(x => `<span>${esc(x)}</span>`).join("")}</span>` : ""}
    <div class="tact">
      <button type="button" class="btn pr" data-act="print" data-file="${esc(it.file)}">${ICON_PRINT}印刷</button>
      <a class="btn pr" href="${P(it.file)}" download="${esc(it.file)}" data-dl="${esc(it.file)}" aria-label="${esc(it.title)}をPDFでダウンロード">${ICON_DL}PDF</a>
    </div>
  </div>`;
}
const stepChips = ids => (ids || []).map(id => `<a class="stepchip" href="#lib/${esc(id)}">${esc(stepName(id))}</a>`).join("");

function setCard(track, s, {open = false} = {}) {
  const T = D.s[track];
  const prog = T.checks.map(([k, l]) => `<i class="${ck(track, s, k) ? "on" : ""}" title="${esc(l)}"></i>`).join("");
  return `<details class="set${s.cur ? " cur" : ""}" id="${track}-${esc(s.id)}" data-track="${track}" data-set="${esc(s.id)}"${open ? " open" : ""}>
  <summary>
    <span class="sno">${esc(s.label)}</span>
    <span class="stitle">${esc(s.title)}</span>
    <span class="prog" aria-label="進み具合">${prog}${ICON_CHEV}</span>
    <span class="smeta">${s.cur ? '<span class="tag">今ここ</span>' : ""}${(s.steps || []).map(id => `<span>${esc(stepName(id))}</span>`).join("")}</span>
  </summary>
  <div class="sbody">
    ${s.note ? `<p class="note">${esc(s.note)}</p>` : ""}
    <div class="groups">${s.groups.map(g => `<section class="group ${esc(g.kind)}"><h3>${esc(g.label)}</h3><div class="tiles">${g.items.map(r => tile(item(r))).join("")}</div></section>`).join("")}</div>
    <div class="sfoot">
      <div class="chk">${T.checks.map(([k, l]) => `<label><input type="checkbox" data-act="check" data-key="${track}/${esc(s.id)}-${k}"${ck(track, s, k) ? " checked" : ""}>${esc(l)}</label>`).join("")}</div>
      ${setAnswers(s).length ? `<button type="button" class="btn" data-act="maruset" data-track="${track}" data-set="${esc(s.id)}">${ICON_EYE}こたえを画面で見る</button>` : ""}
      <button type="button" class="btn primary" data-act="printset" data-track="${track}" data-set="${esc(s.id)}">${ICON_PRINT}${esc(s.label)}をまとめて印刷</button>
    </div>
  </div>
</details>`;
}

const logList = T => T.log && T.log.length
  ? `<ul class="log">${T.log.map(l => `<li><time>${esc(String(l.date).replace(/^\d+-0?(\d+)-0?(\d+)$/, "$1/$2"))}</time><span>${esc(l.text)}</span></li>`).join("")}</ul>`
  : `<p class="muted">まだ記録はありません。チャットで「${esc(T.name)}が◯◯を終えた・16問中12問」のように伝えると、ここに書きこみます。</p>`;

/* ------------------------------------------------------------ 画面：学年（学年タブ → 曜日タブ）
   学年のページの中に曜日のタブがあり、その曜日に来る組の「今ここ」の回を並べる。
   まとめて印刷も、丸つけ（こたえを画面で見る）も、学年×曜日ごと。 */
const GRADE_ID = {"中1": "c1", "中2": "c2", "中3前": "c3a", "中3後": "c3b", "高1": "k1", "高2": "k2"};
const DOW = {mon: 1, tue: 2, thu: 4, fri: 5};
// 組がどの学年か：組の JSON に grade があればそれ。なければ id の頭で決める（chu2…＝中2、chu3…＝中3、kou1…＝高1、kou2…＝高2、ほかは中1）
const gradeOfTrack = t => D.s[t].grade || (/^chu2/.test(t) ? "中2" : /^chu3b/.test(t) ? "中3後" : /^chu3/.test(t) ? "中3前" : /^kou1/.test(t) ? "高1" : /^kou2/.test(t) ? "高2" : "中1");
const gradeTracks = g => TRACKS.filter(t => gradeOfTrack(t) === g);
const gradeDays = g => [...new Set(gradeTracks(g).flatMap(dayList))].sort((a, b) => DOW[a] - DOW[b]);
const gradeFromId = id => Object.keys(GRADE_ID).find(g => GRADE_ID[g] === id) || (id === "c3" ? "中3前" : undefined);   // 古い #c3 は中3前へ
const stepGrade = id => { const x = STEPS.get(id); return x ? gradeOf(x.unit) : null; };
// 今日か、次に来る授業の日（その学年の曜日のなかから）
function autoDay(g) {
  const ds = gradeDays(g), w = new Date().getDay(), n = w === 0 ? 1 : w === 6 ? 8 : w;
  return ds.find(d => DOW[d] >= n) || ds[0];
}
function prepRows(day, g) {
  // 組ごとに、今ここの回から、その曜日に使うものを集める
  return gradeTracks(g).filter(t => visibleOn(t, day)).map(t => {
    const s = curSet(t);
    if (!dayList(t).includes(day)) return {t, off: true};
    if (!s) return {t, none: true};
    return {t, s, groups: s.groups.filter(g => groupOn(g, day))};
  });
}
// 丸つけで最初にえらぶこたえ：その学年・その曜日に出るグループのこたえ
function dayAnswers(day, g) {
  const out = [];
  for (const t of gradeTracks(g)) {
    const s = curSet(t);
    if (!s || !dayList(t).includes(day)) continue;
    for (const a of setAnswers(s)) if (groupOn(a, day) && a.copies !== 0 && !out.includes(a.file)) out.push(a.file);
  }
  return out;
}
let maruSel = null, maruFor = null;         // えらんだこたえ（file の Set）と、その学年・曜日
function maruRow(a, sub) {
  const on = maruSel.has(a.file);
  return `<li><label><input type="checkbox" data-act="msel" data-file="${esc(a.file)}"${on ? " checked" : ""}>
    <span><b>${esc(a.title)}</b><small>${a.pages}ページ${sub ? "　" + esc(sub) : ""}</small></span></label>
    <button type="button" class="btn icon" data-act="view" data-file="${esc(a.file)}" aria-label="${esc(a.title)}だけを見る">${ICON_EYE}</button></li>`;
}
function renderGrade(g, sub) {
  const gid = GRADE_ID[g], days = gradeDays(g);
  const day = days.includes(sub) ? sub : autoDay(g);
  const rows = prepRows(day, g);
  const any = rows.some(r => r.groups && r.groups.some(x => x.items.length));
  const key = gid + "/" + day;
  if (!maruSel || maruFor !== key) { maruSel = new Set(dayAnswers(day, g)); maruFor = key; }
  const dl = DAYS[day].label;
  const cards = rows.map(r => {
    const T = D.s[r.t];
    const head = `<header>${who(r.t)}<div><b>${esc(nowName(T))}</b>${T.now && T.now.text ? `<small>${esc(T.now.text)}</small>` : ""}</div></header>`;
    if (r.off) return `<article class="stu off">${head}<p class="muted">${dl}は来ない日です${hasHw(T) ? "（宿題の日）" : ""}。</p></article>`;
    if (r.none) return `<article class="stu">${head}<p class="empty">まだ教材がありません。作ったらここに出ます。</p></article>`;
    return `<article class="stu">${head}
      <p class="cur"><span class="tag">今ここ</span> <a href="#${r.t}/${esc(r.s.id)}">${esc(r.s.label)}　${esc(r.s.title)}</a></p>
      ${r.groups.length ? `<div class="groups">${r.groups.map(x => `<section class="group ${esc(x.kind)}"><h3>${esc(x.label)}</h3><div class="tiles">${x.items.map(y => tile(item(y))).join("")}</div></section>`).join("")}</div>`
        : `<p class="empty">この回には${dl}の教材がありません。</p>`}
    </article>`;
  }).join("");
  // 丸つけ：こたえをえらぶ一覧（組ごと）
  const listed = new Set();
  const mcards = rows.map(r => {
    const T = D.s[r.t], s = curSet(r.t);
    const older = T.sets.filter(x => x !== s).reverse();
    const cur = s ? setAnswers(s) : [];
    cur.forEach(a => listed.add(a.file));
    const old = older.flatMap(x => setAnswers(x).map(a => ({...a, from: x.label})));
    if (!cur.length && !old.length) return "";
    return `<article class="stu maru">
      <header>${who(r.t)}<div><b>${s ? esc(s.label + "　" + s.title) : "まだ教材がありません"}</b>${r.off ? `<small>${dl}は来ない日</small>` : ""}</div></header>
      ${cur.length ? `<ul class="mlist">${cur.map(a => maruRow(a, a.glabel)).join("")}</ul>` : ""}
      ${old.length ? `<details class="mold"><summary>前の回のこたえ（${old.length}）</summary><ul class="mlist">${old.map(a => maruRow(a, a.from + "　" + a.glabel)).join("")}</ul></details>` : ""}
    </article>`;
  }).join("");
  const rest = D.library.items.filter(x => x.ans && !listed.has(x.file) && stepGrade(x.step) === g.replace(/[前後]$/, ""));
  return `
  <section class="prep-head">
    <div class="daysw" role="group" aria-label="${esc(g)}の曜日">
      ${days.map(d => `<button type="button" data-act="day" data-grade="${gid}" data-day="${d}" aria-pressed="${d === day}">${DAYS[d].label}</button>`).join("")}
    </div>
    <h1>${esc(g)}　${dl}</h1>
    <button type="button" class="btn" data-act="maruopen" id="maru-open"${maruSel.size ? "" : " disabled"}>${ICON_EYE}<span>こたえを画面で見る（${maruSel.size}）</span></button>
    ${sameLevel(g).length > 1 && levelAnswers(day, g).length ? `<button type="button" class="btn" data-act="maruall" data-grade="${gid}" data-day="${day}">${ICON_EYE}<span>${g.startsWith("高") ? "高校" : "中学"}全学年のこたえ（${levelAnswers(day, g).length}）</span></button>` : ""}
    <button type="button" class="btn key" data-act="printday" data-grade="${gid}" data-day="${day}"${any ? "" : " disabled"}>${ICON_PRINT}${dl}の分をまとめて印刷</button>
  </section>
  <div class="prep" data-n="${rows.length}">${cards}</div>
  ${mcards || rest.length ? `<details class="panel maru-det"><summary>丸つけ：見るこたえをえらぶ</summary>
    <p class="lead">上の「こたえを画面で見る」は、${dl}のこたえ（チェックの入ったもの）が続けて出ます。見たいものを変えるときはここでチェックを入れかえます。</p>
    <div class="prep" data-n="${rows.length}">${mcards}</div>
    ${rest.length ? `<details class="mold lib"><summary>ほかのこたえ（教材ライブラリ・${rest.length}）</summary><ul class="mlist">${rest.map(a => maruRow(a, stepFull(a.step))).join("")}</ul></details>` : ""}
  </details>` : ""}`;
}
// 同じ学校（中学／高校）の学年をまとめた、その曜日のこたえ（丸つけ用）
const sameLevel = g => Object.keys(GRADE_ID).filter(x => gradeTracks(x).length && x.startsWith("高") === g.startsWith("高"));
const levelAnswers = (day, g) => [...new Set(sameLevel(g).flatMap(x => gradeDays(x).includes(day) ? dayAnswers(day, x) : []))];
function maruCount() {
  const b = $("#maru-open"); if (!b) return;
  b.disabled = !maruSel.size; b.querySelector("span").textContent = `こたえを画面で見る（${maruSel.size}）`;
}
function maruOrder() {                       // 画面に出ている順にならべる
  const seen = [];
  document.querySelectorAll('input[data-act="msel"]').forEach(i => { if (maruSel.has(i.dataset.file) && !seen.includes(i.dataset.file)) seen.push(i.dataset.file); });
  return seen;
}

/* ------------------------------------------------------------ 画面：生徒 */
let filter = store.get("shakai-tana-filter", {});
function renderTrack(track) {
  const T = D.s[track];
  const sets = [...T.sets].reverse();
  const cur = curSet(track);
  const f = filter[track] || "all";
  const shown = sets.filter(s => f === "all" || !isDone(track, s));
  return `
  <section class="now" aria-label="今の位置">
    <span class="lab">今ここ　${esc(T.longName)}</span>
    <span class="no">${cur ? esc(cur.label) : "—"}</span>
    <div><h1>${cur ? esc(cur.title) : T.now && T.now.step ? esc(stepFull(T.now.step)) : "まだ教材がありません"}</h1>
      <div class="nu">${T.now ? `<a href="#lib/${esc(T.now.step)}">${esc(stepFull(T.now.step))}</a>${T.now.text ? "　" + esc(T.now.text) : ""}` : ""}</div></div>
    ${cur ? `<div class="acts">
      <button type="button" class="btn key" data-act="printset" data-track="${track}" data-set="${esc(cur.id)}">${ICON_PRINT}${esc(cur.label)}をまとめて印刷</button>
      <a class="btn" href="#${track}/${esc(cur.id)}">${esc(cur.label)}の教材を見る</a>
    </div>` : ""}
  </section>
  <div class="layout">
    <div>
      ${sets.length ? `<div class="filters" role="group" aria-label="しぼりこみ">
        ${[["all", "すべて"], ["todo", "まだ終わっていない"]].map(([k, l]) => `<button type="button" data-act="filter" data-track="${track}" data-f="${k}" aria-pressed="${f === k}">${l}</button>`).join("")}
      </div>` : ""}
      <div class="sets">${shown.map(s => setCard(track, s, {open: s === cur})).join("") || `<p class="empty">${sets.length ? "この条件の回はありません。" : "まだ教材がありません。作ったらここに①②…と並びます。"}</p>`}</div>
    </div>
    <aside class="side">
      ${T.about ? `<div class="panel"><h2>${esc(T.longName)}</h2>${T.about.map(p => `<p>${esc(p)}</p>`).join("")}</div>` : ""}
      <div class="panel"><h2>記録</h2>${logList(T)}</div>
    </aside>
  </div>`;
}

/* ------------------------------------------------------------ 画面：教材ライブラリ */
// 教材ライブラリは学年ごとに切りかえて見る（units の grade）。えらんだ学年はこの端末に残る
const gradeOf = u => u.grade || "中1";
let libGrade = store.get("shakai-tana-libgrade", null);
function setLibGrade(g) { libGrade = g; store.set("shakai-tana-libgrade", g); }
const unitCount = u => u.steps.reduce((a, st) => a + D.library.items.filter(i => i.step === st.id && !i.ans).length, 0);
function renderLib() {
  const grades = [...new Set(D.common.units.map(gradeOf))];
  if (!grades.includes(libGrade)) libGrade = grades[0];
  const units = D.common.units.filter(u => gradeOf(u) === libGrade);
  const here = id => TRACKS.filter(t => D.s[t].now && D.s[t].now.step === id).map(t => `<a class="here" href="#${t}">${esc(D.s[t].name)} 今ここ</a>`).join("");
  return `
  <div class="libbar">
  <div class="filters grades" role="group" aria-label="学年">${grades.map(g => {
    const n = D.common.units.filter(u => gradeOf(u) === g).reduce((a, u) => a + unitCount(u), 0);
    return `<button type="button" data-act="grade" data-grade="${esc(g)}" aria-pressed="${g === libGrade}">${esc(g)}${n ? `<small>${n}</small>` : ""}</button>`;
  }).join("")}</div>
  <nav class="unav" aria-label="単元">${units.map(u => {
    const n = unitCount(u);
    return `<a href="#lib/${esc(u.id)}">${esc(u.name)}${n ? `<small>${n}</small>` : ""}</a>`;
  }).join("")}</nav>
  </div>
  <p class="lead">プリントは単元・ステップごとに1回だけ置いてあります。どの組のどの回で使ったかはタイルの下に出ます。</p>
  ${units.map(u => `<section class="unit" id="lib-${esc(u.id)}">
    <h2>${esc(u.name)}</h2>
    <div class="steps">${u.steps.map((st, i) => {
      const its = D.library.items.filter(x => x.step === st.id).sort((a, b) => (a.ans ? 1 : 0) - (b.ans ? 1 : 0));
      return `<section class="stepsec${its.length ? "" : " none"}" id="lib-${esc(st.id)}">
        <h3><span class="sn">${i + 1}</span>${esc(st.name)}${here(st.id)}</h3>
        ${its.length ? `<div class="tiles">${its.map(x => tile(x, {used: true})).join("")}</div>` : `<p class="muted">まだプリントはありません。</p>`}
      </section>`;
    }).join("")}</div>
  </section>`).join("")}`;
}

/* ------------------------------------------------------------ 画面：実力テスト */
// 実力テストは学年の単元とは別のタブ。common.json の jitsu.steps（大問1・単元別）と jitsu.tests（年度・学年・月）を使う。
// プリントの一覧は学年のライブラリに書き、step（大問・単元）と test（どの回のテストか）を付ける。
// 並べかた（この端末に残る）：unit＝単元別、year＝年度別、month＝月別
let jitsuMode = store.get("shakai-tana-jitsu-mode", "unit");
const schoolMonth = m => (m + 8) % 12;                  // 4月＝0 … 3月＝11（学校の1年の順）
function renderJitsu() {
  const J = D.common.jitsu, steps = J.steps, tests = J.tests || [];
  const TST = new Map(tests.map(t => [t.id, t]));
  const SI = new Map(steps.map((st, i) => [st.id, i]));
  const tOf = x => TST.get(x.test) || {year: 0, grade: 0, month: 4, label: ""};
  const base = x => x.file.replace(/_ans\.pdf$/, ".pdf");
  const byTest = (a, b) => (b.year - a.year) || (a.grade - b.grade) || (schoolMonth(a.month) - schoolMonth(b.month));
  const all = D.library.items.filter(x => SI.has(x.step));
  // タイルの並び：単元別は回の順、年度別・月別は大問の順。問題とこたえを並べる
  const tilesU = its => its.sort((a, b) => byTest(tOf(a), tOf(b)) || base(a).localeCompare(base(b)) || (a.ans ? 1 : 0) - (b.ans ? 1 : 0));
  const tilesT = its => its.sort((a, b) => (SI.get(a.step) - SI.get(b.step)) || base(a).localeCompare(base(b)) || (a.ans ? 1 : 0) - (b.ans ? 1 : 0));
  const tilesHtml = its => its.length ? `<div class="tiles">${its.map(x => tile(x)).join("")}</div>` : `<p class="muted">まだプリントはありません。</p>`;
  const cnt = its => its.filter(i => !i.ans).length;
  const nav = (links) => `<nav class="unav" aria-label="見出し">${links.map(([id, name, n]) => `<a href="#jitsu/${esc(id)}">${esc(name)}${n ? `<small>${n}</small>` : ""}</a>`).join("")}</nav>`;
  const modes = [["unit", "単元別"], ["year", "年度別"], ["month", "月別"]];
  if (!modes.some(m => m[0] === jitsuMode)) jitsuMode = "unit";
  const bar = links => `<div class="libbar"><div class="filters grades" role="group" aria-label="並べかた">${modes.map(([m, l]) =>
    `<button type="button" data-act="jitsumode" data-mode="${m}" aria-pressed="${m === jitsuMode}">${l}</button>`).join("")}</div>${nav(links)}</div>`;
  const lead = `<p class="lead">${esc(J.lead || "")}</p>`;
  const testSec = (t, head) => {
    const its = tilesT(all.filter(x => x.test === t.id));
    return `<section class="stepsec" id="jitsu-${esc(t.id)}"><h3>${esc(head)}</h3>${tilesHtml(its)}</section>`;
  };
  if (jitsuMode === "unit") {
    return bar(steps.map(st => [st.id, st.name, cnt(all.filter(x => x.step === st.id))])) + lead
      + `<section class="unit"><div class="steps">${steps.map((st, i) => {
        const its = tilesU(all.filter(x => x.step === st.id));
        return `<section class="stepsec${its.length ? "" : " none"}" id="jitsu-${esc(st.id)}"><h3><span class="sn">${i + 1}</span>${esc(st.name)}</h3>${tilesHtml(its)}</section>`;
      }).join("")}</div></section>`;
  }
  const sorted = tests.slice().sort(byTest);
  const groups = [];
  for (const t of sorted) {
    const key = jitsuMode === "year" ? "y" + t.year : "m" + t.month;
    let g = groups.find(x => x.key === key);
    if (!g) groups.push(g = {key, name: jitsuMode === "year" ? `令和${t.year}年度` : `${t.month}月`, tests: []});
    g.tests.push(t);
  }
  if (jitsuMode === "month") groups.sort((a, b) => schoolMonth(a.tests[0].month) - schoolMonth(b.tests[0].month));
  return bar(groups.map(g => [g.key, g.name, g.tests.reduce((n, t) => n + cnt(all.filter(x => x.test === t.id)), 0)])) + lead
    + groups.map(g => `<section class="unit" id="jitsu-${esc(g.key)}"><h2>${esc(g.name)}</h2><div class="steps">${g.tests.map(t =>
      testSec(t, jitsuMode === "year" ? `${t.grade}年・${t.month}月` : `令和${t.year}年度　${t.grade}年`)).join("")}</div></section>`).join("");
}

/* ------------------------------------------------------------ 画面の切りかえ */
function route() {
  const [tab, sub] = (location.hash.replace(/^#/, "") || "junbi").split("/");
  const gr = gradeFromId(tab);
  // 古い #junbi・#maru や知らない名前は、前に見ていた学年（なければ最初の学年）のページへ
  const grades = Object.keys(GRADE_ID).filter(g => gradeTracks(g).length);
  const t = gr || tab === "lib" || (tab === "jitsu" && D.common.jitsu) || TRACKS.includes(tab) ? tab : null;
  const g = gr || (TRACKS.includes(tab) ? gradeOfTrack(tab) : tab === "lib" || t === "jitsu" ? null : (grades.includes(store.get("shakai-tana-grade")) ? store.get("shakai-tana-grade") : grades[0]));
  const tabId = t === "lib" || t === "jitsu" ? t : GRADE_ID[g];
  document.querySelectorAll(".tabs a").forEach(a => {
    if (a.dataset.tab === tabId) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  if (t === "lib" && sub) {                       // 別の学年の単元・ステップへのリンクなら、その学年に切りかえる
    const u = D.common.units.find(x => x.id === sub || x.steps.some(st => st.id === sub));
    if (u) setLibGrade(gradeOf(u));
  }
  if (g && !TRACKS.includes(tab)) store.set("shakai-tana-grade", g);
  const isTrack = TRACKS.includes(tab);
  $("#app").innerHTML = t === "lib" ? renderLib() : t === "jitsu" ? renderJitsu() : isTrack ? renderTrack(tab) : renderGrade(g, gr ? sub : null);
  document.title = (t === "lib" ? "教材ライブラリ" : t === "jitsu" ? D.common.jitsu.name : isTrack ? D.s[tab].name : g) + " | 社会 教材棚";
  if (sub && (t === "lib" || t === "jitsu" || isTrack)) {
    const el = t === "lib" ? $("#lib-" + CSS.escape(sub)) : t === "jitsu" ? $("#jitsu-" + CSS.escape(sub)) : $(`#${tab}-${CSS.escape(sub)}`);
    if (el) {
      if (el.tagName === "DETAILS") el.open = true;
      el.scrollIntoView({block: "start"}); window.scrollBy(0, -(64 + ((t === "lib" || t === "jitsu") && $(".libbar") ? $(".libbar").offsetHeight : 0)));
      if (el.classList.contains("stepsec")) { el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600); }
    }
  } else window.scrollTo(0, 0);
  observeThumbs();
  setTopH();
}
// 上の黒い帯の高さ（タブが2行になることがある）。学年・単元のバーがその下にくっつく
function setTopH() { document.documentElement.style.setProperty("--toph", $(".top").offsetHeight + "px"); }
window.addEventListener("resize", () => { if (D) setTopH(); });

/* ------------------------------------------------------------ PDF を読む・描く */
const docs = new Map();
function getDoc(file) {
  if (!docs.has(file)) {
    const p = pdfjsLib.getDocument({url: P(file)}).promise;
    p.catch(() => docs.delete(file));
    docs.set(file, p);
  }
  return docs.get(file);
}
async function drawPage(file, n, cssWidth, ratio) {
  const doc = await getDoc(file);
  const page = await doc.getPage(n);
  const base = page.getViewport({scale: 1});
  const vp = page.getViewport({scale: (cssWidth * ratio) / base.width});
  const c = document.createElement("canvas");
  c.width = Math.ceil(vp.width); c.height = Math.ceil(vp.height);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  await page.render({canvasContext: ctx, viewport: vp}).promise;
  return c;
}

const thumbQueue = []; let thumbBusy = 0;
const thumbIO = "IntersectionObserver" in window ? new IntersectionObserver(es => {
  for (const e of es) if (e.isIntersecting) { thumbIO.unobserve(e.target); thumbQueue.push(e.target); }
  pumpThumbs();
}, {rootMargin: "200px"}) : null;
function observeThumbs() {
  document.querySelectorAll(".thumb[data-thumb]:not([data-done])").forEach(el => thumbIO ? thumbIO.observe(el) : thumbQueue.push(el));
  if (!thumbIO) pumpThumbs();
}
function pumpThumbs() {
  while (thumbBusy < 2 && thumbQueue.length) {
    const el = thumbQueue.shift();
    if (el.dataset.done) continue;
    el.dataset.done = "1"; thumbBusy++;
    drawPage(el.dataset.thumb, 1, el.clientWidth || 118, Math.min(window.devicePixelRatio || 1, 2))
      .then(c => el.prepend(c)).catch(() => { el.insertAdjacentHTML("afterbegin", '<span class="muted" style="padding:6px;display:block">読めません</span>'); })
      .finally(() => { thumbBusy--; pumpThumbs(); });
  }
}
document.addEventListener("toggle", e => { if (e.target.matches && e.target.matches("details[open]")) observeThumbs(); }, true);

/* ------------------------------------------------------------ ビューア（1つ／いくつかのPDFを続けて見る）
   iPad で丸つけするときに使う。＋−で拡大、上のボタンでPDFを切りかえ。
   メモリを使いすぎないように、画面から遠いページの絵は消して、近づいたら描きなおす。 */
const viewer = $("#viewer");
const ZOOMS = [0.6, 0.8, 1, 1.25, 1.5, 1.75, 2];
let zoom = store.get("shakai-tana-zoom", 1);
if (!ZOOMS.includes(zoom)) zoom = 1;
let viewing = null, viewIO = null;
const vBody = $("#v-body");
const pageW = () => Math.floor(Math.min(820, Math.max(240, vBody.clientWidth - 32)) * zoom);
function drawInto(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const w = el.clientWidth, me = viewing;
  const ratio = Math.min(Math.min(window.devicePixelRatio || 1, 2) * 1.25, 2400 / w);
  drawPage(el.dataset.file, +el.dataset.n, w, ratio).then(c => {
    if (viewing !== me || !el.dataset.done) { c.width = c.height = 0; return; }
    el.querySelectorAll("canvas").forEach(x => { x.width = x.height = 0; x.remove(); });
    el.prepend(c);
  }).catch(() => {});
}
function dropFrom(el) {
  delete el.dataset.done;
  el.querySelectorAll("canvas").forEach(x => { x.width = x.height = 0; x.remove(); });
}
function setZoom(z) {
  const ratio = vBody.scrollHeight ? vBody.scrollTop / vBody.scrollHeight : 0;
  zoom = z; store.set("shakai-tana-zoom", z);
  $("#v-zl").textContent = Math.round(z * 100) + "%";
  $("#v-zout").disabled = z === ZOOMS[0]; $("#v-zin").disabled = z === ZOOMS[ZOOMS.length - 1];
  const w = pageW();
  vBody.classList.toggle("wide", w > vBody.clientWidth - 32);
  vBody.querySelectorAll(".v-page").forEach(p => { p.style.width = w + "px"; dropFrom(p); });
  vBody.scrollTop = ratio * vBody.scrollHeight;
  if (viewIO) { viewIO.disconnect(); vBody.querySelectorAll(".v-page").forEach(p => viewIO.observe(p)); }
}
async function openViewer(files, title) {
  if (typeof files === "string") files = [files];
  const list = files.map(f => ITEMS.get(f) || {file: f, title: f, pages: "?"});
  const me = viewing = {title: title || list[0].title, files: list, cur: 0};
  $("#v-title").textContent = me.title;
  $("#v-pages").textContent = "";
  $("#v-print").hidden = list.every(it => it.ans);          // こたえだけを見るときは、印刷ボタンは出さない
  const jump = $("#v-jump");
  jump.hidden = list.length < 2;
  jump.innerHTML = list.length < 2 ? "" : list.map((it, i) => `<button type="button" data-jump="${i}">${esc(it.title.replace(/\s*(の)?こたえ$/, ""))}</button>`).join("");
  if (!viewer.open) viewer.showModal();
  if (viewIO) viewIO.disconnect();
  viewIO = new IntersectionObserver(es => {
    for (const e of es) { if (e.isIntersecting) drawInto(e.target); else dropFrom(e.target); }
  }, {root: vBody, rootMargin: "900px 0px"});
  setZoom(zoom);
  showDoc(me, 0);
}
// 複数のPDFは、タブで1つずつ切りかえて見る
async function showDoc(me, i) {
  if (viewing !== me) return;
  me.cur = i;
  const it = me.files[i];
  vBody.innerHTML = ""; vBody.scrollTop = vBody.scrollLeft = 0;
  $("#v-open").href = P(it.file);
  $("#v-dl").href = P(it.file); $("#v-dl").setAttribute("download", it.file); $("#v-dl").dataset.dl = it.file;
  $("#v-jump").querySelectorAll("button").forEach((b, n) => b.setAttribute("aria-current", n === i ? "true" : "false"));
  try {
    const doc = await getDoc(it.file);
    if (viewing !== me || me.cur !== i) return;
    for (let n = 1; n <= doc.numPages; n++) {
      const d = document.createElement("div");
      d.className = "v-page"; d.dataset.file = it.file; d.dataset.n = n; d.style.width = pageW() + "px";
      d.setAttribute("aria-label", `${it.title} ${n}ページ目`);
      vBody.append(d); viewIO.observe(d);
    }
    $("#v-pages").textContent = `${doc.numPages}ページ`;
  } catch (e) {
    if (viewing === me && me.cur === i) vBody.innerHTML = `<p class="v-err">${esc(it.title)} を開けませんでした（pdf/${esc(it.file)}）。</p>`;
  }
}
$("#v-close").addEventListener("click", () => viewer.close());
$("#v-zin").addEventListener("click", () => { const i = ZOOMS.indexOf(zoom); if (i < ZOOMS.length - 1) setZoom(ZOOMS[i + 1]); });
$("#v-zout").addEventListener("click", () => { const i = ZOOMS.indexOf(zoom); if (i > 0) setZoom(ZOOMS[i - 1]); });
$("#v-jump").addEventListener("click", e => {
  const b = e.target.closest("[data-jump]"); if (b && viewing) showDoc(viewing, +b.dataset.jump);
});
let rsz = null;
window.addEventListener("resize", () => { if (!viewer.open) return; clearTimeout(rsz); rsz = setTimeout(() => setZoom(zoom), 250); });
$("#v-print").addEventListener("click", () => viewing && printJob(viewing.title, viewing.files.map(it => ({file: it.file, copies: 1}))));
viewer.addEventListener("close", () => { if (viewIO) viewIO.disconnect(); vBody.innerHTML = ""; viewing = null; });

/* ------------------------------------------------------------ まとめて印刷（1つの回／その曜日の全員分） */
const sp = $("#setprint");
let spRows = [];
let spPeople = 1;
/* 人数：宿題（こたえ以外）の部数をまとめて変える */
function setPeople(n) {
  spPeople = Math.min(30, Math.max(1, n));
  $("#sp-people").textContent = spPeople + "人";
  spRows.forEach((r, i) => { if (r.it.ans) return; r.copies = spPeople; const s = $("#spc" + i); if (s) s.textContent = r.copies + "部"; });
  spTotal();
}
$("#sp-pm").addEventListener("click", () => setPeople(spPeople - 1));
$("#sp-pp").addEventListener("click", () => setPeople(spPeople + 1));
function openPrintList(title, sections) {
  // sections: [{label, kind, items:[item]}]
  $("#sp-title").textContent = title;
  spRows = [];
  let html = "";
  for (const sec of sections) {
    html += `<li class="g ${esc(sec.kind || "")}">${esc(sec.label)}</li>`;
    for (const it of sec.items) {
      const on = (it.copies ?? 1) > 0 && !(it.ans && sec.kind !== "hw");   // こたえは画面で見られるので最初はチェックなし（宿題のこたえは家で使うのでチェック）
      const i = spRows.push({it, on, copies: Math.max(it.copies ?? 1, 1)}) - 1;
      html += `<li><input type="checkbox" id="sp${i}" data-i="${i}"${spRows[i].on ? " checked" : ""}>
        <label class="nm" for="sp${i}">${esc(it.title)}<small>${it.pages}ページ${it.note ? "　" + esc(it.note) : ""}</small></label>
        <span class="step"><button type="button" data-i="${i}" data-d="-1" aria-label="${esc(it.title)}の部数をへらす">−</button><span id="spc${i}">${spRows[i].copies}部</span><button type="button" data-i="${i}" data-d="1" aria-label="${esc(it.title)}の部数をふやす">＋</button></span></li>`;
    }
  }
  $("#sp-list").innerHTML = html;
  spPeople = Math.max(1, ...spRows.filter(r => r.it.ans !== true).map(r => r.copies), 1);
  $("#sp-people").textContent = spPeople + "人";
  $("#sp-sub").textContent = sections.some(x => x.items.some(it => it.ans && x.kind !== "hw"))
    ? "印刷するものと部数をえらんでください。こたえは「丸つけ」で画面に出せるので、最初はチェックを外しています。"
    : "印刷するものと部数をえらんでください。";
  spTotal();
  sp.dataset.title = title.replace(/をまとめて印刷$|を全員まとめて印刷$/, "");
  sp.showModal();
}
function openSetPrint(track, id) {
  const T = D.s[track], s = T.sets.find(x => x.id === id);
  if (!s) return;
  openPrintList(`${T.name} ${s.label}「${s.title}」をまとめて印刷`,
    s.groups.map(g => ({label: g.label, kind: g.kind, items: g.items.map(item)})));
}
function openDayPrint(day, g) {
  const secs = [];
  const seen = new Set();                 // 先生用（こたえ）は同じものなら1部だけ
  for (const r of prepRows(day, g)) if (r.groups) for (const g of r.groups) {
    const items = g.items.filter(x => g.kind !== "teacher" || !seen.has(x.file));
    if (g.kind === "teacher") items.forEach(x => seen.add(x.file));
    if (items.length) secs.push({label: `${D.s[r.t].name}　${g.label}`, kind: g.kind, items: items.map(item)});
  }
  if (secs.length) openPrintList(`${g}　${DAYS[day].label}の分をまとめて印刷`, secs);
}
function spTotal() {
  const dup = $("#sp-duplex") ? $("#sp-duplex").checked : false;
  const n = spRows.reduce((a, r) => a + (r.on ? (r.it.pages + (dup && r.it.pages % 2 ? 1 : 0)) * r.copies : 0), 0);
  $("#sp-total").textContent = `合計 ${n}ページ`;
  $("#sp-go").disabled = n === 0;
  $("#sp-go").textContent = n ? `${n}ページを印刷する` : "印刷する";
}
$("#sp-list").addEventListener("change", e => { const i = e.target.dataset.i; if (i != null) { spRows[i].on = e.target.checked; spTotal(); } });
$("#sp-list").addEventListener("click", e => {
  const b = e.target.closest("button[data-d]"); if (!b) return;
  const r = spRows[b.dataset.i];
  r.copies = Math.min(30, Math.max(1, r.copies + +b.dataset.d)); r.on = true;
  $("#spc" + b.dataset.i).textContent = r.copies + "部"; $("#sp" + b.dataset.i).checked = true; spTotal();
});
$("#sp-cancel").addEventListener("click", () => sp.close());
$("#sp-duplex").addEventListener("change", spTotal);
$("#sp-go").addEventListener("click", () => {
  const jobs = spRows.filter(r => r.on).map(r => ({file: r.it.file, copies: r.copies}));
  const opts = {order: (sp.querySelector("input[name=sp-order]:checked") || {}).value || "set", duplex: $("#sp-duplex").checked};
  sp.close();
  printJob(sp.dataset.title, jobs, opts);
});

/* ------------------------------------------------------------ 印刷のしくみ
   PDF をページごとに画像にして #print-root にならべ、ブラウザの印刷を呼ぶ。 */
const pageImg = new Map();
const progress = $("#progress");
let printing = false;
let lastJobs = [];
let lastOpts = {};
const TOUCH = navigator.maxTouchPoints > 1;
async function renderForPrint(file, n) {
  const k = file + "#" + n;
  if (pageImg.has(k)) return pageImg.get(k);
  const doc = await getDoc(file);
  const page = await doc.getPage(n);
  const base = page.getViewport({scale: 1});
  const c = await drawPage(file, n, base.width, PRINT_DPI / 72);
  const url = await new Promise(res => c.toBlob(b => res(URL.createObjectURL(b)), "image/png"));
  c.width = c.height = 0;
  pageImg.set(k, url);
  return url;
}
/* ならべ方（11/27 先生：3人分を印刷すると同じページが3枚ずつ出て不便）
   order "set"  ＝1人分ずつ：1回目に全部、2回目に部数が2以上のもの…（こたえ1部は1回目だけ）
   order "same" ＝同じものをまとめて（前のやり方）
   duplex ＝ページ数が奇数のもののあとに白紙を入れて、次のもののおもてがうらに来ないようにする */
function printOrder(jobs, order) {
  const seq = [];
  if (order === "same") jobs.forEach((j, i) => { for (let c = 0; c < j.copies; c++) seq.push(i); });
  else { const max = Math.max(...jobs.map(j => j.copies)); for (let c = 0; c < max; c++) jobs.forEach((j, i) => { if (j.copies > c) seq.push(i); }); }
  return seq;
}
async function printJob(title, jobs, opts = {}) {
  if (printing || !jobs.length) return;
  const order = opts.order || "set", duplex = opts.duplex ?? true;
  printing = true; lastJobs = jobs; lastOpts = {order, duplex};
  if (viewer.open) viewer.close();
  $("#pg-title").textContent = "印刷の準備をしています";
  $("#pg-btns").hidden = true; $("#pg-again").hidden = false; $("#pg-bar").style.width = "0"; $("#pg-text").textContent = "";
  progress.showModal();
  const root = $("#print-root");
  root.innerHTML = "";
  try {
    const docsN = await Promise.all(jobs.map(j => getDoc(j.file).then(d => d.numPages)));
    const total = docsN.reduce((a, n) => a + n, 0);
    const lists = [];
    let done = 0;
    for (let j = 0; j < jobs.length; j++) {
      const list = [];
      for (let n = 1; n <= docsN[j]; n++) {
        list.push(await renderForPrint(jobs[j].file, n));
        done++;
        $("#pg-bar").style.width = (100 * done / total) + "%";
        $("#pg-text").textContent = `${done} / ${total} ページ`;
      }
      if (duplex && list.length % 2) list.push(null);      // 白紙
      lists.push(list);
    }
    const urls = [];
    for (const i of printOrder(jobs, order)) urls.push(...lists[i]);
    const sheets = urls.length;
    const frag = document.createDocumentFragment();
    const imgs = urls.map(u => { const d = document.createElement("div"); d.className = u ? "sheet" : "sheet blank"; frag.append(d); if (!u) return null; const im = new Image(); im.src = u; im.alt = ""; d.append(im); return im; }).filter(Boolean);
    root.append(frag);
    await Promise.all(imgs.map(im => im.decode ? im.decode().catch(() => {}) : null));
    progress.close();
    doPrint(title);
    $("#pg-title").textContent = "印刷の用意ができました";
    $("#pg-text").textContent = `全部で ${sheets} ページ。印刷画面が出ないとき（iPad など）は、下の「PDFで印刷」を押して、出てきた画面の「プリント」を選んでください。部数は印刷画面ではなく、ここでえらんだ部数になっています（印刷画面の部数は1のまま）。${order === "set" ? "1人分ずつそろえて出てきます。" : ""}`;
    $("#pg-btns").hidden = false; $("#pg-share").hidden = !TOUCH;
    progress.showModal();
  } catch (e) {
    $("#pg-title").textContent = "印刷の準備ができませんでした";
    $("#pg-text").textContent = "PDF が読めませんでした。ページを読みこみなおして、もう一度ためしてください。";
    $("#pg-btns").hidden = false; $("#pg-again").hidden = true;
  } finally { printing = false; }
}
function doPrint(title) {
  const old = document.title;
  document.title = title || old;
  try { window.print(); } finally { setTimeout(() => { document.title = old; }, 500); }
}
$("#pg-again").addEventListener("click", () => { progress.close(); doPrint(); setTimeout(() => { if (!progress.open) progress.showModal(); }, 1500); });
/* iPad で window.print() が効かないとき：PDF そのものを共有画面に出し、そこから「プリント」を選ぶ */
$("#pg-share").addEventListener("click", async () => {
  const btn = $("#pg-share"), old = btn.textContent; btn.disabled = true; btn.textContent = "PDFを用意しています…";
  try {
    const files = [], blobs = [], k = new Map();
    for (const j of lastJobs) blobs.push(await (await fetch(P(j.file))).blob());
    for (const i of printOrder(lastJobs, lastOpts.order || "set")) {
      const c = k.get(i) || 0; k.set(i, c + 1);
      files.push(new File([blobs[i]], String(files.length + 1).padStart(2, "0") + "_" + lastJobs[i].file, {type: "application/pdf"}));
    }
    if (navigator.canShare && navigator.canShare({files})) await navigator.share({files});
    else if (lastJobs[0]) window.open(P(lastJobs[0].file), "_blank");
  } catch (e) { /* キャンセル */ }
  btn.disabled = false; btn.textContent = old;
});
$("#pg-close").addEventListener("click", () => { progress.close(); $("#pg-again").hidden = false; });
window.__shakaiPrintJob = printJob;          // 動作確認用

/* ------------------------------------------------------------ PDF の保存
   iPad・iPhone は、ふつうのダウンロードだと PDF を開くだけで保存されない。
   タッチ端末では「共有」の画面（ファイルに保存・AirDrop など）を出して、そこから保存できるようにする。 */
async function savePdf(file) {
  try {
    if (navigator.maxTouchPoints > 1 && navigator.canShare && navigator.share) {
      const blob = await (await fetch(P(file))).blob();
      const f = new File([blob], file, {type: "application/pdf"});
      if (navigator.canShare({files: [f]})) { await navigator.share({files: [f]}); return true; }
    }
  } catch (e) { if (e && e.name === "AbortError") return true; }   // 共有をやめたときは何もしない
  return false;                                                      // 使えなければふつうのダウンロード
}
document.addEventListener("click", async e => {
  const a = e.target.closest("a[data-dl]");
  if (!a) return;
  e.preventDefault();
  if (!(await savePdf(a.dataset.dl))) { const t = document.createElement("a"); t.href = a.href; t.download = a.dataset.dl; document.body.append(t); t.click(); t.remove(); }
});

/* ------------------------------------------------------------ 操作 */
document.addEventListener("click", e => {
  const b = e.target.closest("[data-act]");
  if (!b || b.tagName === "INPUT") return;
  const act = b.dataset.act;
  if (act === "view") openViewer(b.dataset.file);
  else if (act === "print") { const it = ITEMS.get(b.dataset.file); printJob(it ? it.title : b.dataset.file, [{file: b.dataset.file, copies: 1}]); }
  else if (act === "printset") { e.preventDefault(); openSetPrint(b.dataset.track, b.dataset.set); }
  else if (act === "printday") openDayPrint(b.dataset.day, gradeFromId(b.dataset.grade));
  else if (act === "day") location.hash = `#${b.dataset.grade}/${b.dataset.day}`;
  else if (act === "maruopen") { const f = maruOrder(); if (f.length) openViewer(f, "こたえ（丸つけ用）"); }
  else if (act === "maruall") {
    const g = gradeFromId(b.dataset.grade), f = levelAnswers(b.dataset.day, g);
    if (f.length) openViewer(f, `${g.startsWith("高") ? "高校" : "中学"} ${DAYS[b.dataset.day].label}のこたえ（全学年）`);
  }
  else if (act === "maruset") {
    const T = D.s[b.dataset.track], s = T.sets.find(x => x.id === b.dataset.set);
    if (s) openViewer(setAnswers(s).map(a => a.file), `${T.name} ${s.label} のこたえ`);
  }
  else if (act === "jitsumode") {
    jitsuMode = b.dataset.mode; store.set("shakai-tana-jitsu-mode", jitsuMode);
    $("#app").innerHTML = renderJitsu(); observeThumbs(); window.scrollTo(0, 0);
  }
  else if (act === "grade") {
    setLibGrade(b.dataset.grade);
    $("#app").innerHTML = renderLib(); observeThumbs(); window.scrollTo(0, 0);
  }
  else if (act === "filter") {
    filter[b.dataset.track] = b.dataset.f; store.set("shakai-tana-filter", filter);
    $("#app").innerHTML = renderTrack(b.dataset.track); observeThumbs();
  }
});
document.addEventListener("change", e => {
  if (e.target.dataset && e.target.dataset.act === "msel") {
    const f = e.target.dataset.file;
    if (e.target.checked) maruSel.add(f); else maruSel.delete(f);
    document.querySelectorAll('input[data-act="msel"]').forEach(i => { if (i.dataset.file === f) i.checked = e.target.checked; });
    maruCount();
    return;
  }
  const k = e.target.dataset && e.target.dataset.key;
  if (!k) return;
  checks[k] = e.target.checked; store.set("shakai-tana-shelf", checks);
  const card = e.target.closest("details.set");
  if (card) {
    const t = card.dataset.track, T = D.s[t];
    card.querySelectorAll(".prog i").forEach((i, n) => i.classList.toggle("on", !!checks[`${t}/${card.dataset.set}-${T.checks[n][0]}`]));
  }
});
window.addEventListener("hashchange", route);

loadData().then(route).catch(err => {
  $("#app").innerHTML = `<p class="v-err">教材の一覧を読みこめませんでした：${esc(err.message)}</p>`;
});
