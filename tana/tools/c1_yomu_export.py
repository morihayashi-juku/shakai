"""中1の宿題：生徒向け社会サイト（shakai の index.html）の「読んで解く宿題」を、そのままPDFにして教材棚に入れる。
（11/26 先生：中1の宿題の形式は「中学社会の学習教材の読んで解く宿題」。中身はサイトのものを使う。ここでは作り直さない）
  - 1日分＝A4両面1枚：表＝本文（上）と問題（下）、うら＝答え（サイトの「答えはうらに」と同じ）→ c1_yomu_XXXX_dN.pdf
  - 先生がiPadで丸つけするための答えだけのPDF → c1_yomu_XXXX_dN_ans.pdf
サイトの中身が直されたら、このスクリプトをもう一度動かせば教材棚のPDFも新しくなる。
  cd shakai && python3 -m http.server 8770 &   （shakai のフォルダで）
  python3 tana/tools/c1_yomu_export.py
"""
import subprocess
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter

PDF = Path(__file__).resolve().parent.parent / "pdf"
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8770/index.html"
UNITS = [("his04y", "asuka"), ("his05y", "nara"), ("his06y", "heian")]


def main():
    out = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1100, "height": 1400})
        pg.goto(URL)
        pg.wait_for_timeout(2500)
        for uid, key in UNITS:
            n = pg.evaluate(f"() => UNITS['{uid}'].yomu.sheets.length")
            for i in range(n):
                pg.evaluate(f"() => {{ state.mode = modeOf('{uid}'); state.unit = '{uid}'; state.sel = {{Y{i}: true}}; state.yans = 'back'; renderSheets(); }}")
                pg.wait_for_timeout(700)
                pg.emulate_media(media="print")
                f = PDF / f"c1_yomu_{key}_d{i+1}.pdf"
                pg.pdf(path=str(f), prefer_css_page_size=True, print_background=True)
                pg.emulate_media(media="screen")
                r = PdfReader(str(f))
                w = PdfWriter(); w.add_page(r.pages[1]); w.write(str(PDF / f"c1_yomu_{key}_d{i+1}_ans.pdf"))
                t = pg.evaluate(f"() => UNITS['{uid}'].yomu.sheets[{i}].t")
                era = pg.evaluate(f"() => yomuEra(UNITS['{uid}'])")
                out.append((uid, key, i + 1, era, t, len(r.pages)))
                print(f.name, len(r.pages), era, t)
        b.close()
    return out


if __name__ == "__main__":
    main()
