# 社会 教材棚（shakai/tana）— Claude への引き継ぎメモ

このフォルダは、塾の社会の宿題・授業プリントを見て・印刷して・こたえで丸つけするための **先生用ページ** です。
URL：https://morihayashi-juku.github.io/shakai/tana/ （shakai リポジトリの main ブランチ・`tana/` フォルダ）

- 画面（`index.html` `assets/` `lib/pdfjs/`）は **数学の教材棚（morihayashi-juku/sugaku）をそのまま流用** している。データの書き方・画面のしくみは sugaku の `CLAUDE.md` と同じ（組・回・教材ライブラリ・kind・day・checks・log）。
- 生徒向けの社会サイト（shakai の `index.html`・`anki/`）とは別。**`tana/` の外はさわらない**（作問チャットが shakai のトップを更新するため）。
- 端末に残る設定のキーは `shakai-tana-…`（数学の `sugaku-…` とまざらないように変えてある）。

## 今の中身（2026-11-17）
- 組は **中2** だけ（`data/chu2.json`、木曜に宿題）。宿題を出す曜日が増えたら `days` に `mon` を足し、グループに `"day": "mon"` を書く。
- 中2の宿題：**冬休み明けの実力テストに向けた基本の復習**（11/19〜冬休み前まで。範囲は地理全部＋歴史は近世まで）。
  - **1回分＝A4両面1枚（2ページ）**：表＝要点（短く）＋図の問題、裏＝ことばの問題（約20問）。こたえは同じ形に赤で答え（`_ans`）。
  - 先生の希望：**文字だけでなく図を入れる**（地図・地球儀・雨温図・白地図・年表など）。2ページ以上の解説を読ませる形はしない。
  - 予定（ステップ順）：①世界の姿 ②世界の気候 ③アジア ④ヨーロッパ ⑤アフリカ ⑥北アメリカ ⑦南アメリカ・オセアニア ⑧日本の姿・自然・人口 ⑨資源・産業・交通 ⑩日本の諸地域（九州〜中部）⑪（関東〜北海道）⑫古代まで ⑬中世 ⑭近世 ⑮まとめ。詳しい範囲が出たら合わせて直す。
- 中1など別の学年を足すときは、組の JSON（`grade` を書く）と `library-c1.json` を作り、`common.json` の `tracks` `libraries` `units` に足す。

## プリントを足す手順
1. `git pull --rebase`
2. `tools/c2_hwNN_*.py` で `pdf/` に出力（ファイル名は英数字だけ、`c2_hwNN_内容.pdf` と `_ans.pdf`）。①のスクリプト `tools/c2_hw01_sekai_sugata.py` を型として使う。
   図の地図は `tools/figs/maps.mjs`（Natural Earth の world-atlas ＋ d3-geo。`cd tools/figs && npm i world-atlas@2 topojson-client d3-geo && node maps.mjs`）。
3. `data/library-c2.json` の `items` に足す（`step` を必ず。ページ数も）
4. `data/chu2.json` の `sets` の最後に回を足し、前の `"cur": true` を消して新しいほうに。`now` と `log` も直す
5. 変えたファイルの `updated` を今日に
6. `python3 tools/check_site.py`（`tana/` で実行）で OK を確かめて commit・push
