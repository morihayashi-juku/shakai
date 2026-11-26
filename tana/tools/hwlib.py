"""中2 社会 毎日の宿題プリント（No.1〜35）の共通部品。
1回分＝A4両面1枚。表も裏も「前半＝解説、後半＝問題」（先生の希望・11/17）。復習の日は解説なし（memo）。

  sheet(no, sub, [表, 裏], out)  各ページ {kai, kfig, figs, qa, memo}
    figs の q : [(記号, ヒント, 答え)] 図の下の書く欄。qa : [(問題, 答え)]（番号は表から通し）
  build([sheet, ...])  まとめて PDF（問題と _ans）にする
  mapsvg(spec) : figs/region.mjs で地図の SVG を作って返す
  uonzu(...) : 雨温図の SVG
"""
import json
import subprocess
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
PDF = HERE.parent / "pdf"
FIGS = HERE / "figs"

CSS = """
@page{size:A4;margin:10mm 13mm}
*{box-sizing:border-box}
body{font-family:'Noto Sans CJK JP',sans-serif;font-size:11pt;color:#111;margin:0}
.head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #222;padding-bottom:2.5mm;margin-bottom:4mm}
.head h1{font-size:16pt;margin:0}.head .sub{font-size:13pt;margin-left:10px}
.head .no{display:inline-block;background:#222;color:#fff;border-radius:2mm;padding:0 2.5mm;margin-left:2mm}
.name{font-size:10.5pt;white-space:nowrap}.name span{display:inline-block;border-bottom:1px solid #222;width:40mm;margin-left:2mm}
.pts{border:1.5px solid #333;border-radius:3mm;padding:3mm 4mm;margin-bottom:4mm;background:#f6f6f6}
.pts h2{font-size:10.5pt;margin:0 0 2mm}
.pts p{margin:0 0 2mm;font-size:10.5pt;line-height:1.6}.pts p b{background:#ffe9a8}
.pts .t{display:inline-block;background:#333;color:#fff;border-radius:1.5mm;padding:0 2mm;margin-right:2mm;font-size:9.5pt}
.memo{border:1.5px dashed #888;border-radius:3mm;padding:3mm 4mm;margin-bottom:4mm;font-size:10.5pt}
.fig{border:1px solid #bbb;border-radius:2mm;padding:2.5mm;page-break-inside:avoid;margin-bottom:3mm}
.figt{font-weight:bold;font-size:11pt;margin-bottom:2mm}.figt span{font-weight:normal;font-size:10pt}
.fig svg{display:block;width:100%;height:auto}
.fq{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm 5mm;margin-top:3mm}
.fq.c2{grid-template-columns:repeat(2,1fr)}.fq.c1{grid-template-columns:1fr}
.fq div{display:flex;align-items:flex-end;font-size:10.5pt;gap:1.5mm;min-height:9mm}
.fq b{flex:none}.fq small{flex:none;font-size:8.5pt;color:#444}
.fq .l{flex:1;border-bottom:1px solid #222;height:7mm;color:#c00;font-weight:bold;font-size:10.5pt;line-height:7mm;min-width:20mm}
.pb{page-break-before:always}
.head2{font-size:11pt;font-weight:bold;color:#444;border-bottom:1.5px solid #888;padding-bottom:1.5mm;margin-bottom:4mm}
.kfig{margin-top:2mm;background:#fff;border-radius:2mm;padding:1mm}.kfig svg{display:block;width:100%;height:auto}
.mon{border-top:2.5px solid #222;padding-top:2.5mm}
.mon .fig{border:none;padding:0 0 2mm;margin:0}
.rel{border-collapse:collapse;width:100%;font-size:10pt;margin-top:1mm;background:#fff}.rel th,.rel td{border:1px solid #888;padding:1.2mm 2mm;text-align:left}.rel th{background:#eee}
.h2{font-size:12pt;font-weight:bold;border-left:5px solid #222;padding-left:2mm;margin:0 0 3mm}
.h2 span{font-weight:normal;font-size:10pt}
.q{display:flex;gap:3mm;align-items:flex-end;border-bottom:1px dotted #aaa;padding:2.4mm 0}
.n{flex:none;width:7mm;height:7mm;border:1.3px solid #222;border-radius:50%;text-align:center;font-size:10pt;line-height:6mm;align-self:center}
.q .txt{flex:1;font-size:11pt;line-height:1.5;align-self:center}
.q .l{flex:none;width:58mm;border-bottom:1.2px solid #222;height:9mm;color:#c00;font-weight:bold;font-size:11pt;line-height:9mm;padding-left:1mm}
"""


def figq_html(figq, ans, cols=3):
    cls = {1: " c1", 2: " c2"}.get(cols, "")
    return f"<div class='fq{cls}'>" + "".join(
        f"<div><b>{k}</b>{f'<small>{h}</small>' if h else ''}<span class='l'>{a if ans else ''}</span></div>" for k, h, a in figq) + "</div>"


def wrap(f, ans):
    svg = f["svg"](ans) if callable(f["svg"]) else f["svg"]
    return f"<div style='width:{f['w']};margin:0 auto'>{svg}</div>" if f.get("w") else svg


def side(pg, ans, start, first):
    """1ページ分：前半＝解説（kai）、後半＝問題（図の書く欄＋ことばの問題）。"""
    top = ""
    if pg.get("kai"):
        top = ("<div class='pts'><h2>解説</h2>" + "".join(f"<p><span class='t'>{t}</span>{b}</p>" for t, b in pg["kai"])
               + "".join(f"<div class='kfig'>{k(ans) if callable(k) else k}</div>" for k in pg.get("kfig", [])) + "</div>")
    elif pg.get("memo"):
        top = f"<div class='memo'>{pg['memo']}</div>"
    figs = "".join(
        f"<div class='fig'><div class='figt'>{f['title']} <span>{f.get('hint', '')}</span></div>{wrap(f, ans)}"
        f"{figq_html(f['q'], ans, f.get('cols', 3)) if f.get('q') else ''}</div>" for f in pg.get("figs", []))
    rows = "".join(f"<div class='q'><div class='n'>{i}</div><div class='txt'>{q}</div><span class='l'>{a if ans else ''}</span></div>"
                   for i, (q, a) in enumerate(pg.get("qa", []), start))
    hint = "上の解説を見ながら解いてOK" if pg.get("kai") else "分からなかったら、前のプリントで確かめよう"
    return (top + f"<div class='mon'><div class='h2'>問題　<span>{hint}</span></div>{figs}{rows}</div>",
            start + len(pg.get("qa", [])))


def page(s, ans, zoom=1.0):
    name = "" if ans else "<div class='name'>名前<span></span></div>"
    p1, n = side(s["pages"][0], ans, 1, True)
    p2, _ = side(s["pages"][1], ans, n, False)
    z = f".fig{{zoom:{zoom}}}.pts p{{font-size:{10.5 if zoom >= 0.9 else 10}pt;line-height:{1.6 if zoom >= 0.9 else 1.5}}}"
    return f"""<html><head><meta charset='utf-8'><style>{CSS}{z}</style></head><body>
<div class='head'><h1>{s.get('grade', '')}社会 宿題<span class='no'>No.{s['no']}</span><span class='sub'>{s['sub']}{'【解答】' if ans else ''}</span></h1>{name}</div>
{p1}
<div class='pb'></div>
<div class='head2'>{s.get('grade', '')}No.{s['no']}　{s['sub']}（うら）</div>
{p2}
</body></html>"""


def sheet(no, sub, pages, out):
    """pages＝[表, 裏]。各ページ {kai:[(見出し, 本文)], kfig:[解説の中の図], figs:[問題の図], qa:[(問題, 答え)], memo}"""
    return {"no": no, "sub": sub, "pages": pages, "out": out}


def build(sheets):
    """2ページに入らないときは、図を少しずつ小さくする（解説が長い枚のため）。"""
    PDF.mkdir(exist_ok=True)
    res = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for s in sheets:
            for zoom in (1.0, 0.92, 0.85, 0.78, 0.72, 0.66, 0.6):
                got = {}
                for fn, ans in ((f"{s['out']}.pdf", False), (f"{s['out']}_ans.pdf", True)):
                    pg = b.new_page()
                    pg.set_content(page(s, ans, zoom))
                    pg.pdf(path=str(PDF / fn), format="A4", print_background=True)
                    pg.close()
                    n = subprocess.run(["pdfinfo", str(PDF / fn)], capture_output=True, text=True).stdout
                    got[fn] = int(n.split("Pages:")[1].split()[0])
                if all(v == 2 for v in got.values()):
                    break
            if zoom < 1.0:
                print(f"  No.{s['no']}: 図を {int(zoom*100)}% にして2ページに入れた")
            res.update(got)
        b.close()
    return res


def mapsvg(spec):
    with tempfile.TemporaryDirectory() as d:
        sp, out = Path(d) / "s.json", Path(d) / "o.svg"
        sp.write_text(json.dumps(spec, ensure_ascii=False))
        subprocess.run(["node", "region.mjs", str(sp), str(out)], cwd=FIGS, check=True)
        return out.read_text()


def uonzu(temp, rain, label, tmin=-30, tmax=30, rmax=500, W=200, H=170):
    """雨温図。折れ線＝気温（左の目盛り）、棒＝降水量（右の目盛り）。"""
    L, R, T, B = 30, 34, 22, 22
    pw, ph = W - L - R, H - T - B
    ty = lambda t: T + ph * (tmax - t) / (tmax - tmin)
    ry = lambda r: T + ph * (1 - r / rmax)
    bw = pw / 12
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="Noto Sans CJK JP">'
    s += f'<text x="{W/2}" y="14" text-anchor="middle" font-size="15" font-weight="bold">{label}</text>'
    for t in range(tmin, tmax + 1, 10):
        y = ty(t)
        s += f'<line x1="{L}" y1="{y}" x2="{L+pw}" y2="{y}" stroke="#ccc" stroke-width="0.6"/>'
        s += f'<text x="{L-3}" y="{y+3}" text-anchor="end" font-size="8" fill="#c00">{t}</text>'
    for r in range(0, rmax + 1, 100):
        s += f'<text x="{L+pw+3}" y="{ry(r)+3}" font-size="8" fill="#1a5fd0">{r}</text>'
    s += f'<text x="{L-3}" y="{T-6}" text-anchor="end" font-size="8" fill="#c00">℃</text>'
    s += f'<text x="{L+pw+3}" y="{T-6}" font-size="8" fill="#1a5fd0">mm</text>'
    for i, r in enumerate(rain):
        x = L + i * bw + bw * 0.15
        s += f'<rect x="{x}" y="{ry(r)}" width="{bw*0.7}" height="{T+ph-ry(r)}" fill="#7fb2ea"/>'
    s += f'<polyline points="{" ".join(f"{L+i*bw+bw/2},{ty(t)}" for i, t in enumerate(temp))}" fill="none" stroke="#d22" stroke-width="2"/>'
    for i, t in enumerate(temp):
        s += f'<circle cx="{L+i*bw+bw/2}" cy="{ty(t)}" r="1.8" fill="#d22"/>'
    if tmin < 0 < tmax:
        s += f'<line x1="{L}" y1="{ty(0)}" x2="{L+pw}" y2="{ty(0)}" stroke="#888" stroke-width="0.8"/>'
    s += f'<rect x="{L}" y="{T}" width="{pw}" height="{ph}" fill="none" stroke="#333" stroke-width="1"/>'
    for m in (1, 4, 7, 10, 12):
        s += f'<text x="{L+(m-1)*bw+bw/2}" y="{T+ph+11}" text-anchor="middle" font-size="8">{m}</text>'
    s += f'<text x="{L+pw}" y="{T+ph+20}" text-anchor="end" font-size="7.5" fill="#555">（月）</text>'
    return s + "</svg>"


def tbl(head, rows, widths=None):
    """解説や問題の中に置く表。rows の文字は HTML（<b> など）を使ってよい。"""
    cg = "".join(f"<col style='width:{w}'>" for w in widths) if widths else ""
    return ("<table class='rel'>" + (f"<colgroup>{cg}</colgroup>" if cg else "")
            + "<tr>" + "".join(f"<th>{h}</th>" for h in head) + "</tr>"
            + "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows) + "</table>")


def side_by_side(*parts, gap="5mm"):
    return f"<div style='display:flex;gap:{gap};align-items:flex-start'>" + "".join(f"<div style='flex:1'>{p}</div>" for p in parts) + "</div>"


def pyramid(widths, label, W=150, H=170):
    """人口ピラミッドの形だけ（widths＝上から下へ、各年齢層の横はば 0〜1）。"""
    n = len(widths); bh = (H - 30) / n; cx = W / 2
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="Noto Sans CJK JP">'
    s += f'<text x="{cx}" y="15" text-anchor="middle" font-size="15" font-weight="bold">{label}</text>'
    for i, w in enumerate(widths):
        y = 22 + i * bh; hw = w * (W / 2 - 8)
        s += f'<rect x="{cx-hw}" y="{y}" width="{hw}" height="{bh-1}" fill="#7fb2ea"/><rect x="{cx}" y="{y}" width="{hw}" height="{bh-1}" fill="#f3a5a5"/>'
    s += f'<line x1="{cx}" y1="20" x2="{cx}" y2="{H-6}" stroke="#333"/>'
    s += f'<text x="8" y="30" font-size="8" fill="#555">高齢</text><text x="8" y="{H-10}" font-size="8" fill="#555">子ども</text>'
    return s + "</svg>"


def jisa_line(points, W=700, H=120, lo=-90, hi=180):
    """経度の数直線（15度ごと）と都市。points＝[(経度, 名前)]（西経はマイナス）。"""
    x = lambda d: 30 + (W - 60) * (d - lo) / (hi - lo)
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" font-family="Noto Sans CJK JP">'
    s += f'<line x1="{x(lo)}" y1="60" x2="{x(hi)}" y2="60" stroke="#333" stroke-width="2"/>'
    for d in range(lo, hi + 1, 15):
        big = d % 45 == 0
        s += f'<line x1="{x(d)}" y1="{54 if big else 56}" x2="{x(d)}" y2="{66 if big else 64}" stroke="#333"/>'
        if big:
            t = "0°" if d == 0 else (f"東経{d}°" if d > 0 else f"西経{-d}°")
            s += f'<text x="{x(d)}" y="82" text-anchor="middle" font-size="11">{t}</text>'
    for d, nm in points:
        s += f'<circle cx="{x(d)}" cy="60" r="6" fill="#d22"/><text x="{x(d)}" y="42" text-anchor="middle" font-size="14" font-weight="bold">{nm}</text>'
    s += f'<text x="{x(hi)}" y="105" text-anchor="end" font-size="11" fill="#555">15度ごとに目もり（15度で1時間の時差）→ 東ほど時刻が早い</text>'
    return s + "</svg>"
