# 中学社会 解いて覚えるプリント（元ファイル）

このブランチ（`source`）は、公開ページ（`main` ブランチ → https://morihayashi-juku.github.io/shakai/ ）を作るための元ファイル一式です。
公開ページそのものは `main` ブランチにあり、ここを変えてもサイトは変わりません。

## 新しいチャットで続きを作るとき（Claudeへのメモ）

1. このリポジトリを `source` ブランチで取得し、作業フォルダ（例：`/home/claude/shakai`）に置く。
2. `cp -r tools tmp` で作業用スクリプトを `tmp/` に戻す（スクリプトは `tmp/` にある前提で書かれている）。
3. 図を作り直すときだけ `npm install`（`node_modules` は保存していない）。
4. ビルド：`python3 build.py`（`pip install fonttools brotli` が必要）
   - `out/中学社会プリント.html` … 1ファイル版（パソコンでそのまま開ける）
   - `out/web/` … 公開用（図を4ファイルに分けて、1ファイル10MB未満）
5. 公開：`main` ブランチに `out/web/` の中身をコピーしてコミット・push。GitHub Pages が自動で更新する。
6. 元ファイルを変えたら、この `source` ブランチにもコミットしておく。

## ファイルの構成

| 場所 | 中身 |
|---|---|
| `template.html` | アプリ本体（画面・印刷レイアウト・スマホの読む画面）。`build.py` が単元・図・フォントを埋めこむ |
| `build.py` | ビルド。`FILES` に入れる単元の一覧がある |
| `units/*.js` | 単元データ。`geo01–21` 地理、`his01–19` 歴史（`his19` は年表）、`geo90`/`his90` 受験用総まとめ（12セット・解説つき）、`his04y–his07y` 中1向け「読んで解く」 |
| `figs*.json`, `gen_figs*.mjs`, `gen_climate*.py`, `data/` | 図（SVG）と、その作成スクリプト・地図データ |
| `flows/` | 歴史各講の「この講の流れ」年表データ |
| `fonts/` | BIZ UDPゴシック等（SIL Open Font License） |
| `tools/yomu_data.py` → `tools/gen_yomu.py` | 「読んで解く」の本文と問題 → `units/hisNNy.js` を作る |
| `tools/gen_exam.js`, `tools/run_exam.py` | 受験用総まとめ（geo90/his90）を作る。最後に `add_ex.py` で解説をつける |
| `tools/ex_final.json`, `tools/exfix/`, `tools/merge_ex.py` | 総まとめの解説（自動抽出＋手直し） |
| `tools/*check*.py`, `tools/readtest*.py` | 印刷のはみ出し・答えの一致・スマホ表示の確認用 |

## 決まりごと

- 単元一覧は `template.html` の `SUBJECTS`。タグつき（`'まとめ'`, `'受験'`, `'読む'`）は第N講の番号に数えない。
- 「読んで解く」：上半分に①②③の段落の本文、下半分に6問（穴うめ→一問一答→書こう→最後は紙を折って本文をかくして答える）。段落数は3→5へ増やし、段落ヒントは 飛鳥=全問 / 奈良=穴うめと書こう / 平安以降=書こうだけ。答えはうら（両面印刷）か最後にまとめて。
- スマホ（幅700px以下）や `#単元ID` 付きURLは「読む画面」（問題だけ・パターン/セットを選べる・答えはタップで表示）。
