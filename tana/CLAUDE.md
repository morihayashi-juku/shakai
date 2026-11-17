# 社会 教材棚（shakai/tana）— Claude への引き継ぎメモ

このフォルダは、塾の社会の宿題・授業プリントを見て・印刷して・こたえで丸つけするための **先生用ページ** です。
URL：https://morihayashi-juku.github.io/shakai/tana/ （shakai リポジトリの main ブランチ・`tana/` フォルダ）

- 画面（`index.html` `assets/` `lib/pdfjs/`）は **数学の教材棚（morihayashi-juku/sugaku）をそのまま流用** している。データの書き方・画面のしくみは sugaku の `CLAUDE.md` と同じ（組・回・教材ライブラリ・kind・day・checks・log）。
- 生徒向けの社会サイト（shakai の `index.html`・`anki/`）とは別。**`tana/` の外はさわらない**（作問チャットが shakai のトップを更新するため）。
- 端末に残る設定のキーは `shakai-tana-…`（数学の `sugaku-…` とまざらないように変えてある）。

## 今の中身（2026-11-17）
- 組は **中2** だけ（`data/chu2.json`、`days` は木曜だけ）。宿題は **毎週木曜に1週間分（7枚・木〜水）をまとめて渡し、次の木曜に回収**（11/17 先生の決定）。
- 中2の宿題：**冬休み明けの実力テストに向けた基本の復習を、1日1枚・週7回**（11/19〜12/23 の5週間、No.1〜35。範囲は地理全部＋歴史は近世まで）。
  - **1枚＝A4両面。表も裏も「前半＝解説、後半＝問題」**（11/17 先生の希望）。解説は2〜3項目の短い文、問題は図の書く欄＋ことばの問題（表裏で計12問前後、番号は通し）。図は1枚に1〜2つ（地図・雨温図・地球儀・表など、解説の中か問題の中に置く）。1日10〜15分。こたえは同じ形に赤で（`_ans`）。
  - 先生の希望：**文字だけでなく図を入れる**。1枚に詰めこみすぎない（週3回案はきつすぎて、毎日1枚に変えた）。
  - **各週の7枚目（水曜）は復習の日**：解説なし、その週の No. から図と問題を出す。
  - 回（sets）は **1週＝1回**。グループは2つ：木曜に渡す7枚（hw・day thu）と、そのこたえ（teacher・day thu。次の木曜に回収して丸つけ）。
  - 予定：第1週 大陸と海洋／緯度経度と地図／気候帯と雨温図／暮らしと宗教／東アジア／東南・南・西アジア／復習1
    第2週 ヨーロッパ2枚／アフリカ／北アメリカ2枚／南アメリカ・オセアニア／復習2
    第3週 日本の位置・時差／自然と災害／人口・資源／産業・交通／九州・中国四国／近畿・中部／復習3
    第4週 関東／東北・北海道／文明〜古墳／飛鳥〜平安／鎌倉／室町／復習4
    第5週 戦国・安土桃山／江戸幕府の成立／江戸の改革と文化／地理のまとめ／歴史のまとめ／全範囲ミニテスト／復習5
- スクリプトは週ごと：`tools/c2_week1.py`（No.1〜7）。共通部品は `tools/hwlib.py`（`sheet` `build` `mapsvg` `uonzu` `figq_html`）。
  地図は `tools/figs/region.mjs`（world-atlas の国境＋d3-geo。国の色ぬり・記号・川の線）。地球儀は `figs/globe.svg`（`figs/maps.mjs`）。
- 中1など別の学年を足すときは、組の JSON（`grade` を書く）と `library-c1.json` を作り、`common.json` の `tracks` `libraries` `units` に足す。

## プリントを足す手順
1. `git pull --rebase`
2. `tools/c2_weekN.py` で `pdf/` に出力（ファイル名は英数字だけ、`c2_hwNN_内容.pdf` と `_ans.pdf`）。`tools/c2_week1.py` を型にする。最初に `cd tools/figs && npm i world-atlas@2 topojson-client d3-geo`。
   どの PDF も2ページになっているか確かめる（スクリプトの出力に「2ページではない」が出たら詰める）。
3. `data/library-c2.json` の `items` に足す（`step` を必ず。ページ数も）
4. `data/chu2.json` の `sets` の最後に回を足し、前の `"cur": true` を消して新しいほうに。`now` と `log` も直す
5. 変えたファイルの `updated` を今日に
6. `python3 tools/check_site.py`（`tana/` で実行）で OK を確かめて commit・push
