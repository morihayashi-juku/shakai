# 公民（civ01〜civ13）の図。説明用（Label）と問題用（Q）を作って figs_civ.json に書き出す
# 使い方：python3 tools/gen_figs_civ.py
import json

INK = '#1d2a33'; GRN = '#3b6a4c'; RED = '#c0392b'; BLU = '#2c5f86'; BRN = '#8f4a2f'; GRY = '#888'
PAL = ['#cfe3d2', '#f3dccc', '#dde6f2', '#f3ead0', '#e6dcef', '#e9e2d4']
HALO = 'paint-order="stroke" stroke="#fff" stroke-width="3.4" stroke-linejoin="round"'
def r1(x): return round(x, 1)
def svg(w, h, body): return f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" font-family="inherit"><rect width="{w}" height="{h}" fill="#fff"/>{body}</svg>'
def T(x, y, s, size=13, weight=700, anchor='middle', fill=INK, halo=False):
    return f'<text x="{r1(x)}" y="{r1(y)}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" dominant-baseline="middle" fill="{fill}" {HALO if halo else ""}>{s}</text>'
def TL(x, y, lines, size=13, weight=700, anchor='middle', fill=INK, lh=1.3):
    y0 = y - (len(lines) - 1) * size * lh / 2
    return ''.join(T(x, y0 + i * size * lh, s, size, weight, anchor, fill) for i, s in enumerate(lines))
def badge(x, y, s, r=12, size=15):
    return f'<rect x="{r1(x-r)}" y="{r1(y-r)}" width="{2*r}" height="{2*r}" rx="2" fill="#fff" stroke="{INK}" stroke-width="1.4"/>' + T(x, y + .5, s, size)
def box(x, y, w, h, fill='#fff', stroke=INK, rx=6, sw=1.4, dash=''):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<rect x="{r1(x)}" y="{r1(y)}" width="{r1(w)}" height="{r1(h)}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>'
_mk = [0]
def arrow(x1, y1, x2, y2, col=INK, sw=1.8, both=False):
    _mk[0] += 1; i = f'ar{_mk[0]}'
    m = f'<defs><marker id="{i}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill="{col}"/></marker></defs>'
    return m + f'<line x1="{r1(x1)}" y1="{r1(y1)}" x2="{r1(x2)}" y2="{r1(y2)}" stroke="{col}" stroke-width="{sw}" marker-end="url(#{i})"{f" marker-start=\"url(#{i})\"" if both else ""}/>'
def lab(x, y, label, q, mode, size=13, r=11, **k):
    """説明用は文字、問題用は記号の四角"""
    return T(x, y, label, size, **k) if mode == 'label' else badge(x, y, q, r, 14)

FIGS = {}
def both(name, fn):
    FIGS[name + 'Label'] = fn('label'); FIGS[name + 'Q'] = fn('q')

# ---------------- civ01 現代社会 ----------------
def pyramid(mode):
    w, h = 720, 250
    s = ''
    shapes = [('富士山型', '子どもが多い（昔の日本・発展途上国）', [100, 88, 76, 64, 52, 40, 29, 19, 10, 4], 'A'),
              ('つりがね型', '子どもと大人が同じくらい', [62, 62, 61, 60, 59, 57, 53, 45, 32, 14], 'B'),
              ('つぼ型', '子どもが少ない（今の日本）', [40, 44, 49, 55, 62, 66, 68, 66, 54, 30], 'C')]
    for k, (n, d, vals, q) in enumerate(shapes):
        cx = 120 + k * 240; base = 190; bh = 15
        for i, v in enumerate(vals):
            y = base - (i + 1) * bh
            s += box(cx - v, y, v, bh - 1.5, '#9cbad8', '#5f7f9c', 0, .8) + box(cx, y, v, bh - 1.5, '#e9a98b', '#a8705a', 0, .8)
        s += f'<line x1="{cx}" y1="{base - 10*bh}" x2="{cx}" y2="{base}" stroke="#555"/>'
        if mode == 'label':
            s += T(cx, 212, n, 15) + T(cx, 234, d, 11.5, 400)
        else:
            s += badge(cx, 218, q)
    s += T(14, 18, '男', 11, 400, 'start') + T(220, 18, '女', 11, 400, 'end') + T(706, 18, '下が子ども、上が高齢者', 10.5, 400, 'end', '#555')
    return svg(w, h, s)
both('civPyramid', pyramid)

def agepop(mode):
    w, h = 640, 300
    yrs = ['1950', '1970', '1990', '2010', '2023']
    data = [[35.4, 59.6, 5.0], [24.0, 68.9, 7.1], [18.2, 69.7, 12.1], [13.2, 63.8, 23.0], [11.4, 59.5, 29.1]]
    names = [('0〜14歳', 'X'), ('15〜64歳', 'Y'), ('65歳以上', 'Z')]
    cols = ['#a9cf90', '#dde6f2', '#e9a98b']
    L, R, top, bot = 70, 600, 30, 250
    s = T(w / 2, 14, '日本の年齢別人口の割合の変化', 14)
    bw = 62
    for i, (y, v) in enumerate(zip(yrs, data)):
        x = L + 20 + i * (R - L - 40) / 4 - bw / 2 + 10
        yy = bot
        for k, p in enumerate(v):
            hh = (bot - top) * p / 100; yy -= hh
            s += box(x, yy, bw, hh, cols[k], '#555', 0, .8)
            if hh > 16: s += T(x + bw / 2, yy + hh / 2, f'{p}%', 11.5, 700)
        s += T(x + bw / 2, bot + 16, y + '年', 12, 400)
    for k, (n, q) in enumerate(names):
        y = bot - 30 - k * 80 if k else bot - 22
        s += (T(R + 8, [bot - 18, bot - 120, top + 18][k], n, 11.5, 700, 'start') if mode == 'label' else badge(R + 22, [bot - 18, bot - 120, top + 18][k], q, 10, 13))
    s += T(w - 6, h - 8, '国勢調査・人口推計による', 10, 400, 'end', '#555')
    return svg(w + 40, h, s)
both('civAgePop', agepop)

# ---------------- civ02 きまり ----------------
def family(mode):
    w, h = 640, 200
    rows = [('1980年', [19.8, 60.3, 19.9]), ('2020年', [38.0, 54.2, 7.8])]
    names = [('単独世帯', 'ア'), ('核家族世帯', 'イ'), ('その他の世帯', 'ウ')]
    cols = ['#f3dccc', '#cfe3d2', '#e9e2d4']
    L, bw = 80, 520
    s = T(w / 2, 16, '家族の形（世帯）の割合の変化', 14)
    for r, (y, v) in enumerate(rows):
        yy = 46 + r * 62; x = L
        s += T(L - 10, yy + 20, y, 13, 700, 'end')
        for k, p in enumerate(v):
            ww = bw * p / 100
            s += box(x, yy, ww, 40, cols[k], '#555', 0, .8)
            t = (names[k][0] + f' {p}%' if mode == 'label' else f'{names[k][1]}  {p}%') if ww > 110 else f'{p}%'
            s += T(x + ww / 2, yy + 20, t, 12)
            x += ww
    s += T(w - 6, h - 12, '核家族＝夫婦だけ、夫婦と子ども、親1人と子ども　（国勢調査）', 10.5, 400, 'end', '#555')
    return svg(w, h, s)
both('civFamily', family)

# ---------------- civ03 人権と憲法 ----------------
def jinken_hist(mode):
    w, h = 760, 210
    ev = [(1215, 'マグナ・カルタ', 'イギリス', 'A'), (1689, '権利章典', 'イギリス', 'B'), (1776, '独立宣言', 'アメリカ', 'C'),
          (1789, '人権宣言', 'フランス', 'D'), (1919, 'ワイマール憲法', 'ドイツ', 'E'), (1948, '世界人権宣言', '国際連合', 'F')]
    xs = [60, 190, 320, 440, 570, 700]
    s = f'<line x1="30" y1="120" x2="735" y2="120" stroke="#333" stroke-width="2"/>'
    for (y, n, c, q), x in zip(ev, xs):
        s += f'<circle cx="{x}" cy="120" r="6" fill="{GRN}"/>' + T(x, 142, f'{y}年', 13)
        s += (TL(x, 72, [n, f'（{c}）'], 13.5) if mode == 'label' else badge(x, 78, q) + T(x, 46, f'（{c}）', 12, 400))
    notes = [(125, '王の力を制限'), (380, '自由権・平等権'), (570, '社会権を初めて'), (700, '人権を世界へ')]
    for x, t in notes: s += T(x, 178, t, 11.5, 400, 'middle', BRN)
    s += T(w - 6, h - 10, '17〜18世紀：ロック・モンテスキュー・ルソーの思想が革命を支えた', 10.5, 400, 'end', '#555')
    return svg(w, h, s)
both('civJinkenHist', jinken_hist)

def kaisei(mode):
    w, h = 760, 200
    steps = [('各議院の総議員の', '3分の2以上が賛成', 'A'), ('国会が', '憲法改正を発議', 'B'), ('国民投票で', '過半数が賛成', 'C'), ('天皇が国民の', '名で公布', 'D')]
    s = ''
    for i, (a, b, q) in enumerate(steps):
        x = 20 + i * 188
        s += box(x, 50, 160, 86, PAL[i], GRN, 8)
        s += (TL(x + 80, 93, [a, b], 14) if mode == 'label' else T(x + 80, 70, a if i != 1 else '国会が', 13, 400) + badge(x + 80, 106, q))
        if i < 3: s += arrow(x + 162, 93, x + 186, 93, GRN, 2.2)
    s += T(20 + 94, 160, '衆議院・参議院の両方で', 11.5, 400, 'middle', '#555') + T(20 + 2 * 188 + 80, 160, '18歳以上が投票', 11.5, 400, 'middle', '#555')
    s += T(w / 2, 22, '憲法改正の手続き', 15)
    return svg(w, h, s)
both('civKaisei', kaisei)

def houshihai(mode):
    w, h = 700, 230
    s = ''
    for k, (title, q, top, mid, bot) in enumerate([('人の支配', 'A', '王（権力者）', '法', '国民'), ('法の支配', 'B', '法（憲法）', '政府（権力者）', '国民')]):
        x = 30 + k * 350
        s += (T(x + 145, 20, title, 16) if mode == 'label' else badge(x + 145, 22, q))
        s += box(x + 60, 44, 170, 40, '#f3dccc' if k == 0 else '#cfe3d2', BRN if k == 0 else GRN) + T(x + 145, 64, top, 14)
        s += box(x + 60, 110, 170, 40, '#fff', GRY) + T(x + 145, 130, mid, 14)
        s += box(x + 60, 176, 170, 40, '#fff', GRY) + T(x + 145, 196, bot, 14)
        s += arrow(x + 145, 86, x + 145, 108) + arrow(x + 145, 152, x + 145, 174)
        s += T(x + 245, 97, 'つくる・使う' if k == 0 else 'しばる', 11.5, 400, 'start', '#555') + T(x + 245, 163, '支配' if k == 0 else '守られる', 11.5, 400, 'start', '#555')
    return svg(w, h, s)
both('civHoushihai', houshihai)

# ---------------- civ04 基本的人権 ----------------
def jinken_tree(mode):
    w, h = 760, 300
    s = box(250, 12, 260, 44, '#cfe3d2', GRN, 8) + T(380, 34, '個人の尊重（第13条）', 15)
    items = [('平等権', '差別されない', 'A'), ('自由権', '精神・身体・経済活動', 'B'), ('社会権', '人間らしい生活', 'C'),
             ('参政権', '政治に参加する', 'D'), ('請求権', '国に求める', 'E')]
    for i, (n, d, q) in enumerate(items):
        x = 20 + i * 148
        s += f'<line x1="380" y1="58" x2="{x + 64}" y2="96" stroke="{GRN}" stroke-width="1.6"/>'
        s += box(x, 98, 128, 70, PAL[i % 6], INK, 8)
        s += (T(x + 64, 120, n, 16) if mode == 'label' else badge(x + 64, 120, q)) + T(x + 64, 148, d, 11.5, 400)
    s += box(150, 196, 460, 46, '#fff', BRN, 8, 1.4, '5 4') + T(380, 212, '新しい人権（憲法に直接は書かれていない）', 13, 700, 'middle', BRN)
    s += T(380, 230, '環境権・自己決定権・知る権利・プライバシーの権利', 12, 400, 'middle', BRN)
    s += T(380, 270, '人権は「公共の福祉」によって制限されることがある', 12.5, 700, 'middle', RED)
    return svg(w, h, s)
both('civJinkenTree', jinken_tree)

# ---------------- civ05 選挙と政党 ----------------
def dhondt(mode):
    w, h = 640, 236
    parties = [('A党', 1200), ('B党', 900), ('C党', 480), ('D党', 300)]
    order = []
    for n, v in parties:
        for d in (1, 2, 3): order.append((v / d, n, d))
    order.sort(reverse=True); win = set((n, d) for _, n, d in order[:5])
    s = T(w / 2, 16, '比例代表制の議席の分け方（ドント式・定数5）', 14)
    cx = [150, 270, 390, 510]
    s += T(70, 50, '得票数', 12.5, 700)
    for (n, v), x in zip(parties, cx): s += T(x, 34, n, 14) + T(x, 50, f'{v}票', 12, 400)
    for d in (1, 2, 3):
        y = 50 + d * 34
        s += T(70, y, f'÷{d}', 14)
        for (n, v), x in zip(parties, cx):
            val = v / d; ok = (n, d) in win
            s += box(x - 48, y - 14, 96, 28, '#f3dccc' if ok and mode == 'label' else '#fff', RED if ok and mode == 'label' else '#bbb', 4, 1.2)
            s += T(x, y, f'{val:g}' if val == int(val) else f'{val:.0f}', 13, 700 if ok and mode == 'label' else 400)
    y = 50 + 4 * 34
    s += T(70, y, '議席', 14)
    seats = {n: sum(1 for p, d in win if p == n) for n, _ in parties}
    for (n, v), x in zip(parties, cx):
        s += (T(x, y, f'{seats[n]}議席', 14, 700, 'middle', RED) if mode == 'label' else badge(x, y, 'アイウエ'[cx.index(x)], 11, 13))
    s += T(w - 6, h - 10, '大きい数から順に、定数の数（5つ）まで議席を配る', 10.5, 400, 'end', '#555')
    return svg(w, h, s)
both('civDhondt', dhondt)

def turnout(mode):
    w, h = 640, 270
    ages = ['10代', '20代', '30代', '40代', '50代', '60代', '70代以上']
    v = [43.2, 36.5, 47.1, 55.6, 62.9, 71.4, 62.0]
    L, bot, top = 60, 220, 40
    s = T(w / 2, 16, '年代別の投票率（2021年の衆議院議員総選挙）', 14)
    for p in (0, 25, 50, 75):
        y = bot - (bot - top) * p / 80
        s += f'<line x1="{L}" y1="{r1(y)}" x2="{w - 20}" y2="{r1(y)}" stroke="#ddd"/>' + T(L - 6, y, f'{p}%', 11, 400, 'end')
    bw = 60
    for i, (a, p) in enumerate(zip(ages, v)):
        x = L + 18 + i * 80; hh = (bot - top) * p / 80
        s += box(x, bot - hh, bw, hh, '#9cbad8' if i > 1 else '#e9a98b', '#555', 0, .8)
        s += T(x + bw / 2, bot - hh - 10, f'{p}%' if mode == 'label' or i > 1 else '?', 12)
        s += T(x + bw / 2, bot + 14, a, 12, 400)
    s += T(w - 6, h - 10, '総務省の資料による（全体の投票率は55.9%）', 10.5, 400, 'end', '#555')
    return svg(w, h, s)
both('civTurnout', turnout)

# ---------------- civ06 国会・内閣 ----------------
def houritsu(mode):
    w, h = 820, 230
    s = T(w / 2, 16, '法律ができるまで（衆議院が先の場合）', 14)
    s += box(14, 78, 92, 60, '#f3ead0', BRN) + TL(60, 108, ['内閣', 'または議員'], 12.5)
    s += T(60, 154, '法律案を提出', 11, 400)
    y = 70
    for k, (house, q) in enumerate([('衆議院', 'A'), ('参議院', 'B')]):
        x0 = 140 + k * 300
        s += box(x0, 42, 270, 130, '#f6f8f6', GRN, 8) + T(x0 + 135, 58, house, 14, 700, 'middle', GRN)
        s += box(x0 + 12, 80, 90, 56, '#fff', INK) + (TL(x0 + 57, 108, ['委員会'], 14) if mode == 'label' else badge(x0 + 57, 108, q))
        s += box(x0 + 168, 80, 90, 56, '#fff', INK) + T(x0 + 213, 108, '本会議', 14)
        s += arrow(x0 + 104, 108, x0 + 166, 108)
        s += T(x0 + 57, 152, '公聴会を開くことも', 10.5, 400) + T(x0 + 213, 152, '多数決で可決', 10.5, 400)
    s += arrow(108, 108, 150, 108) + arrow(412, 108, 450, 108)
    s += box(738, 80, 72, 56, '#cfe3d2', GRN) + TL(774, 108, ['成立', '→公布'], 13)
    s += arrow(712, 108, 736, 108)
    s += T(w / 2, 200, '公布は天皇が行う（国事行為）', 11.5, 400, 'middle', '#555')
    return svg(w, h, s)
both('civHouritsu', houritsu)

def giin(mode):
    w, h = 700, 280
    s = box(30, 100, 200, 80, '#cfe3d2', GRN, 10) + (T(130, 140, '国会', 18) if mode == 'label' else badge(130, 140, 'A'))
    s += box(470, 100, 200, 80, '#f3ead0', BRN, 10) + (T(570, 140, '内閣', 18) if mode == 'label' else badge(570, 140, 'B'))
    s += box(250, 222, 200, 44, '#dde6f2', BLU, 10) + T(350, 244, '国民（選挙）', 15)
    s += arrow(232, 118, 468, 118, GRN, 2) + T(350, 92, '内閣総理大臣を指名', 12.5) + T(350, 106, '内閣不信任の決議（衆議院）', 12.5)
    s += arrow(468, 164, 232, 164, BRN, 2) + T(350, 178, '衆議院の解散', 12.5) + T(350, 192, '国会に対して連帯して責任', 11, 400)
    s += arrow(300, 222, 180, 182, BLU, 2)
    s += T(350, 30, '議院内閣制（内閣は国会の信任の上に成り立つ）', 15)
    s += T(350, 56, '総理大臣は国会議員から選ばれ、国務大臣の過半数も国会議員', 11.5, 400, 'middle', '#555')
    return svg(w, h, s)
both('civGiin', giin)

# ---------------- civ07 裁判所 ----------------
def sanshin(mode):
    w, h = 660, 270
    s = T(w / 2, 16, '三審制のしくみ', 14)
    lv = [('最高裁判所', 50, 'A'), ('高等裁判所', 120, 'B'), ('地方裁判所', 190, 'C')]
    for n, y, q in lv:
        s += box(220, y, 220, 44, '#cfe3d2' if y == 50 else '#fff', GRN, 8) + (T(330, y + 22, n, 15) if mode == 'label' else badge(330, y + 22, q))
    s += box(470, 190, 170, 44, '#fff', GRY, 8) + TL(555, 212, ['家庭裁判所', '簡易裁判所'], 12)
    s += arrow(330, 188, 330, 166, RED, 2.2) + arrow(330, 118, 330, 96, RED, 2.2)
    s += (T(340, 177, '控訴', 13, 700, 'start', RED) + T(340, 107, '上告', 13, 700, 'start', RED)) if mode == 'label' else (badge(360, 177, 'X', 10, 12) + badge(360, 107, 'Y', 10, 12))
    s += T(100, 72, '第三審', 13) + T(100, 142, '第二審', 13) + T(100, 212, '第一審', 13)
    s += T(w / 2, 254, '判決に不服なら、上の裁判所に訴えることができる（同じ事件で3回まで）', 11.5, 400, 'middle', '#555')
    return svg(w, h, s)
both('civSanshin', sanshin)

def sanken(mode):
    w, h = 700, 380
    P = {'kokkai': (350, 70), 'naikaku': (140, 280), 'saiban': (560, 280)}
    s = ''
    for k, (n, sub, q) in {'kokkai': ('国会', '立法権', 'A'), 'naikaku': ('内閣', '行政権', 'B'), 'saiban': ('裁判所', '司法権', 'C')}.items():
        x, y = P[k]
        s += f'<circle cx="{x}" cy="{y}" r="52" fill="{"#cfe3d2" if k == "kokkai" else "#f3ead0" if k == "naikaku" else "#dde6f2"}" stroke="{INK}" stroke-width="1.4"/>'
        s += (T(x, y - 8, n, 18) if mode == 'label' else badge(x, y - 8, q)) + T(x, y + 18, sub, 12.5, 400)
    lines = [((300, 104), (180, 240), '内閣不信任の決議', 205, 160, 'end'), ((176, 236), (296, 96), '衆議院の解散', 255, 196, 'start'),
             ((400, 104), (520, 240), '違憲立法審査', 470, 160, 'start'), ((516, 244), (396, 100), '弾劾裁判', 400, 196, 'end'),
             ((192, 270), (508, 270), '命令・処分の違憲審査', 350, 256, 'middle'), ((508, 294), (192, 294), '最高裁長官の指名・裁判官の任命', 350, 310, 'middle')]
    for (a, b, t, tx, ty, an) in lines:
        s += arrow(a[0], a[1], b[0], b[1], '#555', 1.6) + T(tx, ty, t, 11.5, 400, an, INK, True)
    s += box(250, 336, 200, 36, '#fff', BLU, 8) + T(350, 354, '国民', 15)
    s += arrow(350, 334, 350, 124, BLU, 1.6) + T(362, 150, '選挙', 11.5, 700, 'start', BLU, True)
    s += arrow(250, 350, 186, 322, BLU, 1.6) + T(212, 352, '世論', 11.5, 700, 'end', BLU, True)
    s += arrow(450, 350, 514, 322, BLU, 1.6) + T(488, 352, '国民審査', 11.5, 700, 'start', BLU, True)
    return svg(w, h, s)
both('civSanken', sanken)

# ---------------- civ08 地方自治 ----------------
def chiho_zai(mode):
    w, h = 660, 170
    v = [('地方税', 45, 'ア'), ('地方交付税', 19, 'イ'), ('国庫支出金', 16, 'ウ'), ('地方債', 7, 'エ'), ('その他', 13, '')]
    cols = ['#cfe3d2', '#f3dccc', '#dde6f2', '#f3ead0', '#eee']
    s = T(w / 2, 16, '地方公共団体の収入（歳入）の内わけ（全国・おおよそ）', 14)
    x = 30; bw = 600
    for (n, p, q), c in zip(v, cols):
        ww = bw * p / 100
        s += box(x, 40, ww, 56, c, '#555', 0, .8)
        if mode == 'label' or not q:
            s += TL(x + ww / 2, 68, [n, f'{p}%'] if ww > 70 else [f'{p}%'], 12.5)
            if ww <= 70: s += T(x + ww / 2, 30, n, 11, 700)
        else: s += badge(x + ww / 2, 60, q, 10, 13) + T(x + ww / 2, 84, f'{p}%', 12)
        x += ww
    s += f'<line x1="30" y1="112" x2="{30 + bw * .45}" y2="112" stroke="{GRN}" stroke-width="3"/>' + T(30 + bw * .225, 128, '自主財源（自分で集める）', 12, 700, 'middle', GRN)
    s += f'<line x1="{30 + bw * .45}" y1="112" x2="{30 + bw * .87}" y2="112" stroke="{BRN}" stroke-width="3"/>' + T(30 + bw * .66, 128, '依存財源（国などから）', 12, 700, 'middle', BRN)
    s += T(w - 6, h - 12, '地方財政計画（2024年度）をもとにしたおおよその割合', 10, 400, 'end', '#555')
    return svg(w, h, s)
both('civChihoZai', chiho_zai)

def nigen(mode):
    w, h = 680, 260
    s = box(30, 70, 190, 70, '#f3ead0', BRN, 10) + (TL(125, 105, ['首長', '（知事・市町村長）'], 14) if mode == 'label' else badge(125, 98, 'A') + T(125, 124, '（知事・市町村長）', 12, 400))
    s += box(460, 70, 190, 70, '#cfe3d2', GRN, 10) + (TL(555, 105, ['地方議会'], 16) if mode == 'label' else badge(555, 105, 'B'))
    s += arrow(222, 88, 458, 88, BRN) + T(340, 76, '議会の解散・議決のやり直し（拒否権）', 11.5)
    s += arrow(458, 124, 222, 124, GRN) + T(340, 140, '首長の不信任の議決', 11.5)
    s += box(250, 200, 180, 44, '#dde6f2', BLU, 10) + T(340, 222, '住民', 15)
    s += arrow(300, 198, 160, 144, BLU) + arrow(380, 198, 520, 144, BLU)
    s += T(200, 186, '選挙', 12, 700, 'end', BLU) + T(480, 186, '選挙', 12, 700, 'start', BLU)
    s += T(w / 2, 24, '首長と議員を、住民がそれぞれ直接選ぶ（二元代表制）', 14)
    return svg(w, h, s)
both('civNigen', nigen)

# ---------------- civ09 消費と市場 ----------------
def juyo(mode):
    w, h = 520, 380
    L, B, R, Tp = 70, 320, 470, 40
    s = f'<line x1="{L}" y1="{B}" x2="{R}" y2="{B}" stroke="{INK}" stroke-width="1.6"/><line x1="{L}" y1="{B}" x2="{L}" y2="{Tp}" stroke="{INK}" stroke-width="1.6"/>'
    s += T(L - 10, Tp + 4, '価格', 13, 700, 'end') + T(L - 10, Tp + 20, '（高い）', 10.5, 400, 'end') + T(R, B + 20, '数量（多い）', 13, 700, 'end')
    s += f'<line x1="110" y1="80" x2="430" y2="300" stroke="{BLU}" stroke-width="3"/>'
    s += f'<line x1="110" y1="300" x2="430" y2="80" stroke="{RED}" stroke-width="3"/>'
    s += f'<line x1="{L}" y1="190" x2="270" y2="190" stroke="#888" stroke-dasharray="4 4"/><circle cx="270" cy="190" r="6" fill="{INK}"/>'
    if mode == 'label':
        s += T(430, 312, '需要曲線', 13, 700, 'middle', BLU) + T(436, 68, '供給曲線', 13, 700, 'middle', RED)
        s += T(L - 8, 190, '均衡価格', 12, 700, 'end') + T(300, 178, '需要量＝供給量', 11.5, 400, 'start')
        s += T(150, 56, '価格が高いと…売れ残る', 11.5, 400, 'start', '#555')
    else:
        s += badge(452, 300, 'X') + badge(452, 80, 'Y') + badge(L - 26, 190, 'P', 11, 13)
    s += T(w / 2, 18, '需要と供給の関係', 14)
    return svg(w, h, s)
both('civJuyo', juyo)

def ryutsu(mode):
    w, h = 720, 160
    st = [('生産者', '農家・工場', 'A'), ('卸売業', '問屋・市場', 'B'), ('小売業', 'スーパー・商店', 'C'), ('消費者', 'わたしたち', 'D')]
    s = ''
    for i, (n, d, q) in enumerate(st):
        x = 20 + i * 178
        s += box(x, 40, 140, 70, PAL[i], INK, 8) + (T(x + 70, 64, n, 16) if mode == 'label' else badge(x + 70, 64, q)) + T(x + 70, 92, d, 12, 400)
        if i < 3: s += arrow(x + 142, 75, x + 176, 75, GRN, 2.2)
    s += f'<path d="M90 114 Q 360 160 630 114" fill="none" stroke="{BRN}" stroke-width="1.6" stroke-dasharray="5 4"/>'
    s += T(360, 150, '直接仕入れ・インターネット通販で、流通を短くする（流通の合理化）', 11.5, 400, 'middle', BRN)
    s += T(w / 2, 18, '商品が届くまで（流通）', 14)
    return svg(w, h + 10, s)
both('civRyutsu', ryutsu)

# ---------------- civ10 生産と労働 ----------------
def kabu(mode):
    w, h = 720, 280
    s = box(30, 90, 170, 80, '#dde6f2', BLU, 10) + (T(115, 130, '株主', 18) if mode == 'label' else badge(115, 130, 'A'))
    s += box(290, 70, 200, 120, '#f3ead0', BRN, 10) + T(390, 92, '株式会社', 16) + box(310, 110, 160, 36, '#fff', GRY) + (T(390, 128, '株主総会', 13) if mode == 'label' else badge(390, 128, 'B', 10, 13)) + T(390, 168, '取締役会・社長', 12, 400)
    s += box(580, 90, 120, 80, '#cfe3d2', GRN, 10) + TL(640, 130, ['仕事を', 'して利益'], 13)
    s += arrow(202, 112, 288, 112, BLU, 2) + T(245, 100, 'お金を出す', 11.5, 400) + T(245, 82, '（出資）', 11, 400)
    s += arrow(288, 152, 202, 152, BRN, 2) + (T(245, 168, '配当', 13, 700, 'middle', BRN) if mode == 'label' else badge(245, 172, 'C', 10, 13))
    s += arrow(492, 130, 578, 130, GRN, 2)
    s += T(115, 196, '株式を持つ人', 11.5, 400) + T(390, 222, '株主は、会社がつぶれても出したお金以上の責任は負わない（有限責任）', 11.5, 400)
    s += T(390, 250, '株式は証券取引所で売り買いされる', 11.5, 400)
    s += T(w / 2, 28, '株式会社のしくみ', 15)
    return svg(w, h, s)
both('civKabu', kabu)

def chusho(mode):
    w, h = 640, 200
    rows = [('企業の数', 99.7, 'ア'), ('働く人の数', 69.7, 'イ'), ('製造業の出荷額', 48.0, 'ウ')]
    L, bw = 150, 440
    s = T(w / 2, 16, '日本の経済にしめる中小企業の割合', 14)
    for i, (n, p, q) in enumerate(rows):
        y = 40 + i * 48
        s += (T(L - 10, y + 16, n, 13, 700, 'end') if mode == 'label' else badge(L - 24, y + 16, q, 11, 13))
        s += box(L, y, bw * p / 100, 32, '#cfe3d2', '#555', 0, .8) + box(L + bw * p / 100, y, bw * (100 - p) / 100, 32, '#f3dccc', '#555', 0, .8)
        s += T(L + bw * p / 200, y + 16, f'中小企業 {p}%', 12.5)
    s += T(L + bw - 4, 186, '右側（色ちがい）が大企業　　中小企業庁の資料による（おおよそ）', 10, 400, 'end', '#555')
    return svg(w, h, s)
both('civChusho', chusho)

def hiseiki(mode):
    w, h = 620, 250
    yrs = ['1990', '2000', '2010', '2020', '2023']
    v = [20.2, 26.0, 34.4, 37.2, 37.0]
    L, B, top = 60, 200, 40
    s = T(w / 2, 16, '働く人（役員をのぞく）にしめる非正規雇用の割合', 14)
    for p in (0, 10, 20, 30, 40):
        y = B - (B - top) * p / 40
        s += f'<line x1="{L}" y1="{r1(y)}" x2="{w - 20}" y2="{r1(y)}" stroke="#ddd"/>' + T(L - 6, y, f'{p}%', 11, 400, 'end')
    pts = [(L + 50 + i * 120, B - (B - top) * p / 40) for i, p in enumerate(v)]
    s += '<polyline points="' + ' '.join(f'{r1(x)},{r1(y)}' for x, y in pts) + f'" fill="none" stroke="{RED}" stroke-width="3"/>'
    for (x, y), p, yr in zip(pts, v, yrs):
        s += f'<circle cx="{r1(x)}" cy="{r1(y)}" r="5" fill="{RED}"/>' + T(x, y - 14, f'{p}%' if mode == 'label' or yr in ('1990', '2023') else '', 12) + T(x, B + 16, yr + '年', 12, 400)
    s += T(w - 6, h - 10, '非正規雇用＝パート・アルバイト・派遣社員・契約社員など（労働力調査）', 10, 400, 'end', '#555')
    return svg(w, h, s)
both('civHiseiki', hiseiki)

# ---------------- civ11 金融と財政 ----------------
def nichigin(mode):
    w, h = 720, 220
    s = box(270, 20, 180, 56, '#cfe3d2', GRN, 10) + T(360, 48, '日本銀行', 18)
    roles = [('発券銀行', '紙幣（日本銀行券）を発行', 'A'), ('銀行の銀行', '銀行にお金を貸す・預かる', 'B'), ('政府の銀行', '政府のお金を預かる', 'C')]
    for i, (n, d, q) in enumerate(roles):
        x = 20 + i * 236
        s += f'<line x1="360" y1="78" x2="{x + 106}" y2="118" stroke="{GRN}" stroke-width="1.6"/>'
        s += box(x, 120, 212, 80, PAL[i + 1], INK, 8) + (T(x + 106, 146, n, 16) if mode == 'label' else badge(x + 106, 146, q)) + T(x + 106, 176, d, 12, 400)
    return svg(w, h, s)
both('civNichigin', nichigin)

def keiki(mode):
    import math
    w, h = 700, 290
    pts = [(60 + i * 3, 150 - 70 * math.sin(i * 3 / 560 * 2 * math.pi * 1.5)) for i in range(0, 196)]
    s = '<polyline points="' + ' '.join(f'{r1(x)},{r1(y)}' for x, y in pts) + f'" fill="none" stroke="{BLU}" stroke-width="3"/>'
    s += f'<line x1="50" y1="150" x2="660" y2="150" stroke="#bbb" stroke-dasharray="4 4"/>'
    s += f'<line x1="50" y1="266" x2="660" y2="266" stroke="{INK}" stroke-width="1.4"/>' + T(660, 280, '時間', 12, 400, 'end')
    s += (T(153, 62, '好況（好景気）', 14) if mode == 'label' else badge(153, 60, 'A'))
    s += (T(340, 242, '不況（不景気）', 14) if mode == 'label' else badge(340, 242, 'B'))
    s += T(246, 120, '後退', 12.5, 700, 'middle', '#555', True) + T(433, 120, '回復', 12.5, 700, 'middle', '#555', True)
    s += T(560, 34, '好況：物価が上がりやすい（インフレーション）', 11.5, 400, 'middle', RED) + T(560, 52, '不況：物価が下がりやすい（デフレーション）', 11.5, 400, 'middle', BLU)
    s += T(w / 2, 14, '景気の変動（景気循環）', 14)
    return svg(w, h, s)
both('civKeiki', keiki)

def endaka(mode):
    w, h = 700, 220
    s = T(w / 2, 16, '円高・円安（1ドルを手に入れるのに何円いるか）', 14)
    s += box(250, 86, 200, 52, '#f3ead0', BRN, 10) + T(350, 112, '1ドル＝100円', 18)
    s += box(10, 86, 190, 52, '#dde6f2', BLU, 10) + T(105, 104, '1ドル＝80円', 15) + (T(105, 124, '円の価値が上がった', 11, 400) if mode == 'label' else '')
    s += box(500, 86, 190, 52, '#f3dccc', RED, 10) + T(595, 104, '1ドル＝120円', 15) + (T(595, 124, '円の価値が下がった', 11, 400) if mode == 'label' else '')
    s += arrow(248, 112, 202, 112, BLU, 2.2) + arrow(452, 112, 498, 112, RED, 2.2)
    s += (T(105, 60, '円高', 17, 700, 'middle', BLU) if mode == 'label' else badge(105, 60, 'X')) + (T(595, 60, '円安', 17, 700, 'middle', RED) if mode == 'label' else badge(595, 60, 'Y'))
    if mode == 'label':
        s += T(105, 166, '輸入に有利・海外旅行が安い', 11.5, 400, 'middle', BLU) + T(105, 184, '輸出には不利', 11.5, 400, 'middle', BLU)
        s += T(595, 166, '輸出に有利・外国人観光客が増える', 11.5, 400, 'middle', RED) + T(595, 184, '輸入品が高くなる', 11.5, 400, 'middle', RED)
    return svg(w, h, s)
both('civEndaka', endaka)

def saishutsu(mode):
    w, h = 680, 190
    v = [('社会保障関係費', 33, 'ア'), ('国債費', 24, 'イ'), ('地方交付税交付金など', 16, 'ウ'), ('防衛', 8, ''), ('公共事業', 5, ''), ('文教・科学', 5, ''), ('その他', 9, '')]
    cols = ['#f3dccc', '#dde6f2', '#cfe3d2', '#e6dcef', '#f3ead0', '#e9e2d4', '#eee']
    s = T(w / 2, 16, '国の歳出（2025年度予算　約115兆円・おおよその割合）', 14)
    x = 20; bw = 640
    for (n, p, q), c in zip(v, cols):
        ww = bw * p / 100
        s += box(x, 40, ww, 64, c, '#555', 0, .8)
        if q and mode == 'q': s += badge(x + ww / 2, 62, q, 10, 13) + T(x + ww / 2, 88, f'{p}%', 12)
        elif ww > 120: s += TL(x + ww / 2, 72, [n, f'{p}%'], 12.5)
        else: s += T(x + ww / 2, 72, f'{p}%', 11)
        if ww <= 120 and not q: s += T(x + ww / 2, 120 + (v.index((n, p, q)) % 2) * 16, n, 10.5, 400)
        x += ww
    s += T(w - 6, h - 10, '財務省の資料による', 10, 400, 'end', '#555')
    return svg(w, h, s)
both('civSaishutsu', saishutsu)

# ---------------- civ12 国際社会 ----------------
def ryoiki(mode):
    w, h = 720, 280
    s = T(w / 2, 16, '国の領域（領土・領海・領空）と排他的経済水域', 14)
    s += f'<path d="M20 200 L190 200 L190 230 L20 230 Z" fill="#e9dcc0" stroke="#8a7a5a"/>'
    s += f'<rect x="190" y="200" width="510" height="30" fill="#dbe9f3"/>'
    s += f'<path d="M20 200 Q 120 60 260 60 L260 200 Z" fill="#f3ead0" opacity=".0"/>'
    s += f'<rect x="20" y="70" width="240" height="128" fill="#fdf3e1" stroke="#c9a868" stroke-dasharray="5 4"/>'
    for x in (190, 260, 610): s += f'<line x1="{x}" y1="194" x2="{x}" y2="246" stroke="#555"/>'
    s += arrow(192, 252, 258, 252, INK, 1.4, True) + arrow(262, 252, 608, 252, INK, 1.4, True)
    s += T(225, 268, '12海里', 12) + T(435, 268, '200海里（約370km）', 12)
    s += (T(105, 215, '領土', 15) if mode == 'label' else badge(105, 215, 'A'))
    s += (T(225, 215, '領海', 14) if mode == 'label' else badge(225, 215, 'B'))
    s += (T(140, 120, '領空', 15) if mode == 'label' else badge(140, 120, 'C'))
    s += (T(435, 215, '排他的経済水域', 14) if mode == 'label' else badge(435, 215, 'D'))
    s += T(660, 215, '公海', 14)
    s += T(435, 170, '魚や海底の資源は沿岸国のもの', 11.5, 400, 'middle', BLU) + T(660, 170, 'どの国も自由に使える', 11, 400, 'middle', BLU)
    s += T(140, 90, '領土と領海の上空', 11, 400, 'middle', '#8a6a2a')
    return svg(w, h, s)
both('civRyoiki', ryoiki)

def kokuren(mode):
    w, h = 740, 300
    s = box(270, 20, 200, 60, '#cfe3d2', GRN, 10) + (T(370, 42, '総会', 18) if mode == 'label' else badge(370, 42, 'A')) + T(370, 66, '全加盟国（1国1票）', 11.5, 400)
    s += box(20, 140, 220, 80, '#f3dccc', RED, 10) + (T(130, 162, '安全保障理事会', 15) if mode == 'label' else badge(130, 162, 'B')) + TL(130, 196, ['常任理事国5か国（拒否権）', '非常任理事国10か国'], 11)
    s += box(260, 140, 220, 80, '#dde6f2', BLU, 10) + T(370, 166, '経済社会理事会', 15) + T(370, 196, '専門機関と協力', 11, 400)
    s += box(500, 140, 220, 80, '#f3ead0', BRN, 10) + T(610, 166, '国際司法裁判所', 15) + T(610, 196, '国と国の争いを裁く', 11, 400)
    for x in (130, 370, 610): s += f'<line x1="370" y1="82" x2="{x}" y2="138" stroke="{GRN}" stroke-width="1.6"/>'
    s += box(240, 240, 260, 50, '#fff', BLU, 8, 1.2, '5 4') + T(370, 256, '専門機関など', 12.5) + T(370, 276, 'ユネスコ・WHO・ユニセフ・UNHCR', 11, 400)
    s += f'<line x1="370" y1="222" x2="370" y2="238" stroke="{BLU}" stroke-width="1.6"/>'
    s += T(740 - 8, 34, '事務局（事務総長）', 11.5, 400, 'end', '#555')
    return svg(w, h, s)
both('civKokuren', kokuren)

# ---------------- civ13 地球規模の課題 ----------------
def co2(mode):
    w, h = 620, 240
    v = [('中国', 32, 'ア'), ('アメリカ', 14, 'イ'), ('インド', 7, 'ウ'), ('ロシア', 5, ''), ('日本', 3, 'エ'), ('その他', 39, '')]
    cols = ['#f3dccc', '#dde6f2', '#f3ead0', '#e6dcef', '#cfe3d2', '#eee']
    s = T(w / 2, 16, '二酸化炭素の国別排出量の割合（2021年・おおよそ）', 14)
    x = 20; bw = 580
    for k, ((n, p, q), c) in enumerate(zip(v, cols)):
        ww = bw * p / 100; cx = x + ww / 2
        s += box(x, 40, ww, 70, c, '#555', 0, .8)
        if ww > 60:
            s += (badge(cx, 64, q, 10, 13) + T(cx, 92, f'{p}%', 12)) if mode == 'q' and q else TL(cx, 75, [n, f'{p}%'], 12.5)
        else:
            s += T(cx, 75, f'{p}%', 10.5)
            ly = 128 + (k - 2) * 20
            s += f'<line x1="{r1(cx)}" y1="110" x2="{r1(cx)}" y2="{ly - 8}" stroke="#888"/>'
            s += badge(cx, ly, q, 9, 12) if (mode == 'q' and q) else T(cx, ly, n, 11, 700)
        x += ww
    s += T(w - 6, h - 34, '先進国と、経済が成長している新興国の両方で排出が多い', 11.5, 400, 'end', '#555')
    s += T(w - 6, h - 12, '全国地球温暖化防止活動推進センターの資料などによる', 10, 400, 'end', '#555')
    return svg(w, h, s)
both('civCo2', co2)

json.dump(FIGS, open('figs_civ.json', 'w'), ensure_ascii=False)
print(len(FIGS), 'figs', sum(len(v) for v in FIGS.values()) // 1024, 'KB')
