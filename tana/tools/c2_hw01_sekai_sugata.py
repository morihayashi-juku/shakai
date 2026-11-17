"""中2 社会 宿題プリント①（地理・世界の姿）。表＝要点＋図の問題、裏＝ことばの問題。
図は figs/maps.mjs で作る（cd figs && npm i world-atlas@2 topojson-client d3-geo && node maps.mjs）。
  python3 tools/c2_hw01_sekai_sugata.py
"""
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
PDF = HERE.parent / 'pdf'
from playwright.sync_api import sync_playwright

TITLE = "社会 宿題プリント ①"
SUB = "地理　世界の姿"

POINTS = [
    ("大陸と海洋", "六大陸＝ユーラシア・アフリカ・北アメリカ・南アメリカ・オーストラリア・南極。三大洋＝太平洋・大西洋・インド洋。地球の表面は<b>陸地3：海洋7</b>。最大の大陸はユーラシア大陸、最大の海洋は太平洋。"),
    ("緯度と経度", "<b>赤道</b>が緯度0度（北緯・南緯は各90度まで）。<b>本初子午線</b>（ロンドン）が経度0度（東経・西経は各180度まで）。地球一周は約4万km。"),
    ("世界の区分", "世界は6つの州（アジア・ヨーロッパ・アフリカ・北アメリカ・南アメリカ・オセアニア）に分けられ、国は約190か国。"),
    ("日本の位置", "ユーラシア大陸の東にある<b>島国（海洋国）</b>。北半球・東半球にあり、標準時子午線は<b>東経135度</b>。"),
    ("地図の種類", "<b>正距方位図法</b>＝中心からの距離と方位が正しい。<b>メルカトル図法</b>＝経線と緯線が直角に交わり、角度が正しい。"),
]

# (問題, 答え)
QA = [
    ("地球の表面の、陸地と海洋の割合は約何対何か。（陸地：海洋）", "3：7"),
    ("世界で最も大きい大陸はどこか。", "ユーラシア大陸"),
    ("ユーラシア・アフリカ・北アメリカ・南アメリカ・南極と、もう1つの大陸は何か。", "オーストラリア大陸"),
    ("世界で最も大きい海洋はどこか。", "太平洋"),
    ("太平洋・大西洋と、もう1つの大洋は何か。", "インド洋"),
    ("緯度0度の線を何というか。", "赤道"),
    ("赤道より北の緯度を何というか。", "北緯"),
    ("経度0度の線を何というか。", "本初子午線"),
    ("本初子午線は、イギリスのどの都市を通っているか。", "ロンドン"),
    ("緯度は、赤道を0度として南北それぞれ何度までか。", "90度"),
    ("経度は、本初子午線を0度として東西それぞれ何度までか。", "180度"),
    ("地球を一周すると、約何kmか。", "約4万km"),
    ("アジア・ヨーロッパ・アフリカ・北アメリカ・南アメリカと、もう1つの州は何か。", "オセアニア"),
    ("世界には国がおよそいくつあるか。", "約190か国"),
    ("日本はユーラシア大陸の東西南北のどちら側にあるか。", "東側"),
    ("日本の標準時子午線は、東経何度か。", "東経135度"),
    ("四方を海に囲まれた国を何というか。", "島国（海洋国）"),
    ("海に面していない国を何というか。", "内陸国"),
    ("中心からの距離と方位が正しい地図の図法は何か。", "正距方位図法"),
    ("経線と緯線が直角に交わる地図の図法は何か。", "メルカトル図法"),
]

FIGQ1 = [("A","大陸","ユーラシア大陸"),("B","大陸","アフリカ大陸"),("C","大陸","北アメリカ大陸"),
          ("D","大陸","南アメリカ大陸"),("E","大陸","オーストラリア大陸"),("F","大陸","南極大陸"),
          ("ア","海洋","太平洋"),("イ","海洋","大西洋"),("ウ","海洋","インド洋")]
FIGQ2 = [("線X","緯度0度の線","赤道"),("線Y","経度0度の線","本初子午線"),("点Z","いちばん北の点","北極点"),
          ("線Xより北","北と南のどちらの半球か","北半球"),("点P","緯度と経度","北緯30度・東経60度")]
MAP = open(HERE/'figs'/'worldmap.svg', encoding='utf-8').read()
GLOBE = open(HERE/'figs'/'globe.svg', encoding='utf-8').read()

CSS = """
@page{size:A4;margin:10mm 13mm}
*{box-sizing:border-box}
body{font-family:'Noto Sans CJK JP',sans-serif;font-size:11pt;color:#111;margin:0}
.head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #222;padding-bottom:3mm;margin-bottom:4mm}
.head h1{font-size:16pt;margin:0}.head .sub{font-size:12pt;margin-left:8px;font-weight:normal}
.name{font-size:10.5pt}.name span{display:inline-block;border-bottom:1px solid #222;width:42mm;margin-left:2mm}
.pts{border:1.5px solid #333;border-radius:3mm;padding:3mm 4mm;margin-bottom:3mm;background:#f6f6f6}
.pts h2{font-size:10.5pt;margin:0 0 1.5mm}
.pts p{margin:0 0 1.4mm;font-size:9.8pt;line-height:1.5}.pts p b{background:#ffe9a8}
.pts .t{display:inline-block;background:#333;color:#fff;border-radius:1.5mm;padding:0 1.8mm;margin-right:1.5mm;font-size:9pt}
.qs{display:grid;grid-template-columns:1fr 1fr;column-gap:7mm;row-gap:0}
.q{display:flex;gap:2mm;padding:1.2mm 0;border-bottom:1px dotted #999;min-height:22mm;align-items:flex-start;line-height:1.45}
.n{flex:none;width:6.5mm;height:6.5mm;border:1.2px solid #222;border-radius:50%;text-align:center;font-size:9pt;line-height:5.5mm;margin-top:.5mm}
.body{flex:1}.q .txt{font-size:10pt}
.ans{display:block;margin-top:1mm;border-bottom:1px solid #222;height:5mm}
.a{color:#c00;font-weight:bold;font-size:11pt;margin-top:2mm;display:block}
.fig{border:1px solid #bbb;border-radius:2mm;padding:2mm;margin-bottom:3mm}
.figt{font-weight:bold;font-size:10.5pt;margin-bottom:1mm}.figt span{font-weight:normal;font-size:9.5pt}
.fig svg{width:100%;height:auto;display:block}.fig>svg{width:155mm;margin:0 auto}.fig{page-break-inside:avoid}
.fq{display:grid;grid-template-columns:repeat(3,1fr);gap:1.6mm 4mm;margin-top:2mm}
.fq div{display:flex;align-items:flex-end;font-size:10pt;gap:1.5mm;height:8mm}
.fq b{flex:none;min-width:7mm}.fq .l{flex:1;border-bottom:1px solid #222;height:6mm;color:#c00;font-weight:bold;font-size:10pt;line-height:6mm}
.row2{display:flex;gap:4mm;align-items:center}.row2 .g{flex:none;width:54mm}
.fq2{flex:1;display:flex;flex-direction:column;gap:2.2mm}
.fq2 div{display:flex;align-items:flex-end;font-size:10pt;gap:2mm}
.fq2 b{flex:none;width:30mm}.fq2 .l{flex:1;border-bottom:1px solid #222;height:7mm;color:#c00;font-weight:bold;line-height:7mm}
.pb{page-break-before:always}
.h2{font-size:12pt;font-weight:bold;border-left:5px solid #222;padding-left:2mm;margin:0 0 2mm}
.foot{margin-top:1mm;font-size:9pt;text-align:right;color:#555}
"""

def page(with_ans):
    pts = "".join(f"<p><span class='t'>{t}</span>{b}</p>" for t, b in POINTS)
    A = lambda a: a if with_ans else ""
    f1 = "".join(f"<div><b>{k}</b><span class='l'>{A(a)}</span></div>" for k, _, a in FIGQ1)
    f2 = "".join(f"<div><b>{k}<span style='font-weight:normal;font-size:8.5pt'>（{h}）</span></b><span class='l'>{A(a)}</span></div>" for k, h, a in FIGQ2)
    qs = ""
    for i, (q, a) in enumerate(QA, 1):
        mark = f"<span class='a'>{a}</span>" if with_ans else "<span class='ans'></span>"
        qs += f"<div class='q'><div class='n'>{i}</div><div class='body'><div class='txt'>{q}</div>{mark}</div></div>"
    name = "" if with_ans else "<div class='name'>名前<span></span></div>"
    sub = "【解答】" if with_ans else ""
    return f"""<html><head><meta charset='utf-8'><style>{CSS}</style></head><body>
<div class='head'><h1>{TITLE}<span class='sub'>{SUB}{sub}</span></h1>{name}</div>
<div class='pts'><h2>要点（ここを見ながら解いてOK）</h2>{pts}</div>
<div class='fig'><div class='figt'>図1　世界地図 <span>（★は日本）　A〜Fの大陸名、ア〜ウの海洋名を書こう。</span></div>{MAP}
<div class='fq'>{f1}</div></div>
<div class='fig'><div class='figt'>図2　地球儀 <span>（線は30度ごと）　それぞれの名前を書こう。</span></div>
<div class='row2'><div class='g'>{GLOBE}</div><div class='fq2'>{f2}</div></div></div>
<div class='pb'></div>
<div class='h2'>ことばの問題　<span style='font-weight:normal;font-size:9.5pt'>全{len(QA)}問　表面の要点と図を見ながら解いてOK</span></div>
<div class='qs'>{qs}</div>
</body></html>"""

with sync_playwright() as p:
    b = p.chromium.launch()
    for name, ans in ((PDF/"c2_hw01_sekai_sugata.pdf", False), (PDF/"c2_hw01_sekai_sugata_ans.pdf", True)):
        pg = b.new_page()
        pg.set_content(page(ans))
        pg.pdf(path=str(name), format="A4", print_background=True)
        pg.close()
    b.close()
