"""サイトのデータ（data/*.json）と pdf/ が合っているか確かめる。push の前に実行する。

  python3 tools/check_site.py

- JSON が読めるか、updated が YYYY-MM-DD の形か
- common.json の libraries（プリント一覧）の PDF が pdf/ にあるか、ファイル名が英数字だけか、ページ数が本当のページ数と同じか（pdfinfo）
- プリントの step が common.json にあるか、file が（ファイルをまたいでも）かぶっていないか
- 単元・ステップの id がかぶっていないか、単元に grade があるか
- 組（tracks）の JSON の items がプリント一覧にあるか、sets の id がかぶっていないか、cur（今ここ）が1つ以下か
- now.step・sets の steps が common.json にあるか、days が mon / tue / thu / fri か、kind と day が正しいか
- 今ここの回に、その組が来る曜日に出るグループがあるか（なければ警告だけ）
- pdf/ にあるのにどのプリント一覧にも書かれていない PDF（警告だけ）
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
err, warn = [], []

DAYS_OK = ("mon", "tue", "thu", "fri")
KINDS_OK = ("thu", "mon", "lesson", "study", "hw", "teacher")   # lesson＝授業の日、study＝自習の日（thu / mon と同じ）
DAY_LABEL = {"mon": "月曜", "tue": "火曜", "thu": "木曜", "fri": "金曜"}
# day を書かないグループが出る曜日（授業・宿題・先生用＝木・金、自習＝月・火）。画面の DAYS と同じ
DAY_BY_KIND = {"thu": ("thu", "fri"), "lesson": ("thu", "fri"), "hw": ("thu", "fri"), "teacher": ("thu", "fri"),
               "mon": ("mon", "tue"), "study": ("mon", "tue")}


def load(name):
    try:
        return json.loads((ROOT / "data" / f"{name}.json").read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001
        err.append(f"data/{name}.json が読めません: {e}")
        return None


def pages(f):
    try:
        out = subprocess.run(["pdfinfo", str(ROOT / "pdf" / f)], capture_output=True, text=True).stdout
        m = re.search(r"^Pages:\s+(\d+)", out, re.M)
        return int(m.group(1)) if m else None
    except FileNotFoundError:
        return None


def check_updated(name, d):
    u = d.get("updated")
    if u is not None and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(u)):
        err.append(f"data/{name}.json: updated は 2026-11-03 の形で書く（いま {u!r}）")


common = load("common") or {}
check_updated("common", common)
tracks = common.get("tracks") or common.get("students") or []
libnames = common.get("libraries") or ["library"]

# 単元とステップ
units = common.get("units", [])
jitsu_steps = (common.get("jitsu") or {}).get("steps", [])          # 実力テストのタブ（学年の単元とは別）
jitsu_tests = {t["id"] for t in (common.get("jitsu") or {}).get("tests", [])}   # 実力テストの回（年度・学年・月）
jitsu_step_ids = {st["id"] for st in jitsu_steps}
steps = {st["id"] for u in units for st in u["steps"]} | {st["id"] for st in jitsu_steps}
ids = [u["id"] for u in units] + [st["id"] for u in units for st in u["steps"]] + [st["id"] for st in jitsu_steps]
dup = sorted({i for i in ids if ids.count(i) > 1})
if dup:
    err.append(f"common.json: 単元・ステップの id がかぶっています {dup}")
for u in units:
    if not u.get("grade"):
        err.append(f"common.json: 単元 {u['id']} に grade（学年）がありません")

# プリント一覧（学年ごとに複数ファイル）
files = {}
for ln in libnames:
    lib = load(ln) or {"items": []}
    check_updated(ln, lib)
    for it in lib["items"]:
        f = it.get("file", "")
        if f in files:
            err.append(f"{ln}.json: {f} が2回書かれています（{files[f]['_lib']} にもあります）")
        files[f] = {**it, "_lib": ln}
        if it.get("step") not in steps:
            err.append(f"{ln}.json {f}: step {it.get('step')!r} が common.json にありません")
        if it.get("step") in jitsu_step_ids and it.get("test") not in jitsu_tests:
            err.append(f"{ln}.json {f}: 実力テストのプリントには test（common.json の jitsu.tests の id）を書く")
        if not re.fullmatch(r"[A-Za-z0-9_.\-]+\.pdf", f):
            err.append(f"{ln}.json: ファイル名は英数字だけにする: {f}")
        if not (ROOT / "pdf" / f).exists():
            err.append(f"{ln}.json: pdf/{f} がありません")
            continue
        n = pages(f)
        if n is not None and n != it.get("pages"):
            err.append(f"{ln}.json: {f} のページ数は {n} です（JSON は {it.get('pages')}）")

# 組（生徒）
for t in tracks:
    d = load(t)
    if not d:
        continue
    check_updated(t, d)
    for day in d.get("days", []):
        if day not in DAYS_OK:
            err.append(f"{t}.json: days に {day!r} は使えません（{' / '.join(DAYS_OK)}）")
    if d.get("now") and d["now"].get("step") not in steps:
        err.append(f"{t}.json: now.step {d['now'].get('step')!r} が common.json にありません")
    sids = [s["id"] for s in d["sets"]]
    if len(sids) != len(set(sids)):
        err.append(f"{t}.json: sets の id がかぶっています {sids}")
    curs = [s["id"] for s in d["sets"] if s.get("cur")]
    if len(curs) > 1:
        err.append(f"{t}.json: cur（今ここ）が2つ以上あります {curs}")
    for s in d["sets"]:
        for st in s.get("steps", []):
            if st not in steps:
                err.append(f"{t}.json {s['label']}: step {st!r} が common.json にありません")
        shown = set()
        for g in s["groups"]:
            if g["kind"] not in KINDS_OK:
                err.append(f"{t}.json {s['label']}: kind {g['kind']!r} は {' / '.join(KINDS_OK)} のどれか")
            gd = g.get("day")
            for day in ([gd] if isinstance(gd, str) else (gd or [])):
                if day not in DAYS_OK:
                    err.append(f"{t}.json {s['label']} {g['label']}: day {day!r} は使えません（{' / '.join(DAYS_OK)}）")
                elif day not in d.get("days", []):
                    err.append(f"{t}.json {s['label']} {g['label']}: day {day!r} はこの組の days（{d.get('days')}）にありません")
            shown |= set([gd] if isinstance(gd, str) else gd) if gd else set(DAY_BY_KIND.get(g["kind"], ()))
            for r in g["items"]:
                if r["file"] not in files:
                    err.append(f"{t}.json {s['label']} {g['label']}: {r['file']} がプリント一覧（{', '.join(libnames)}）にありません")
        miss = [x for x in d.get("days", []) if x not in shown]
        if s.get("cur") and miss:
            warn.append(f"{t}.json {s['label']}（今ここ）: {'・'.join(DAY_LABEL[x] for x in miss)}に出るグループがありません（月・木とも授業の組は group に day を書く）")

for p in sorted((ROOT / "pdf").glob("*.pdf")):
    if p.name not in files:
        warn.append(f"pdf/{p.name} はどのプリント一覧にも書かれていません")

for w in warn:
    print("注意:", w)
for e in err:
    print("エラー:", e)
print("OK" if not err else f"{len(err)} 件のエラー")
sys.exit(1 if err else 0)
