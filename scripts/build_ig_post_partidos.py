"""
Genera posts de Instagram (1080x1080) con análisis de partido para GuessBet.
Uso: python scripts/build_ig_post_partidos.py
"""

import os, subprocess, urllib.request, base64

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'partidos')
os.makedirs(OUT_DIR, exist_ok=True)

W, H   = 1080, 1080
BLACK  = '#0a0a0a'
GOLD   = '#C9A227'
WHITE  = '#ffffff'
FONT   = "Segoe UI, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

FLAG_CACHE: dict = {}

def flag_b64(code: str) -> str:
    if code in FLAG_CACHE:
        return FLAG_CACHE[code]
    url = f'https://flagcdn.com/w80/{code}.png'
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            data = base64.b64encode(r.read()).decode()
        result = f'data:image/png;base64,{data}'
    except Exception:
        result = ''
    FLAG_CACHE[code] = result
    return result

def _parse_bold(text: str):
    parts, i, bold, buf = [], 0, False, ''
    while i < len(text):
        if text[i:i+2] == '**':
            if buf: parts.append((buf, bold))
            buf, bold, i = '', not bold, i+2
        else:
            buf += text[i]; i += 1
    if buf: parts.append((buf, bold))
    return parts or [(text, False)]


def build_svg(
    home_name, away_name,
    home_flag_code, away_flag_code,
    phase_label,      # e.g. "DIECISEISAVOS · 12:00 CL"
    prob_home, prob_draw, prob_away,
    xg_home, xg_away,
    over25, btts,
    summary_points,   # lista de strings, **palabra** en dorado
) -> str:
    lines = []
    def add(*s): lines.extend(s)

    add(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')

    # fondo
    add(f'<rect width="{W}" height="{H}" fill="{BLACK}"/>')

    # borde sutil dorado
    add(f'<rect x="1" y="1" width="{W-2}" height="{H-2}" rx="0" fill="none" '
        f'stroke="rgba(201,162,39,0.18)" stroke-width="2"/>')

    # ── header ────────────────────────────────────────────────────────────────
    HDR_Y = 52
    # Logo G
    add(f'<circle cx="60" cy="{HDR_Y}" r="22" fill="none" stroke="{GOLD}" stroke-width="2"/>')
    add(f'<text x="60" y="{HDR_Y+7}" font-family="{FONT}" font-size="18" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle">G</text>')
    add(f'<text x="96" y="{HDR_Y+7}" font-family="{FONT}" font-size="22" font-weight="500" '
        f'fill="{WHITE}" letter-spacing="1">guess_bet</text>')
    # Etiqueta derecha
    add(f'<text x="{W-40}" y="{HDR_Y+7}" font-family="{FONT}" font-size="20" font-weight="600" '
        f'fill="{GOLD}" text-anchor="end" letter-spacing="2">MUNDIAL 2026</text>')

    # línea separadora header
    add(f'<line x1="40" y1="{HDR_Y+26}" x2="{W-40}" y2="{HDR_Y+26}" '
        f'stroke="rgba(255,255,255,0.08)" stroke-width="1"/>')

    # ── fase label ────────────────────────────────────────────────────────────
    PHASE_Y = HDR_Y + 50
    add(f'<text x="{W//2}" y="{PHASE_Y}" font-family="{FONT}" font-size="24" font-weight="400" '
        f'fill="rgba(255,255,255,0.38)" text-anchor="middle" letter-spacing="3">'
        f'{esc(phase_label)}</text>')

    # ── bloque equipos ────────────────────────────────────────────────────────
    TEAMS_CY = PHASE_Y + 100
    FLAG_W, FLAG_H_px = 110, 72
    FLAG_R = 8
    home_cx, away_cx, vs_cx = 230, W-230, W//2

    def draw_flag(cx, code, clip_id):
        fx = cx - FLAG_W//2
        fy = TEAMS_CY - FLAG_H_px//2
        uri = flag_b64(code) if code else ''
        add(f'<defs><clipPath id="{clip_id}">'
            f'<rect x="{fx}" y="{fy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}"/>'
            f'</clipPath></defs>')
        add(f'<rect x="{fx}" y="{fy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}" '
            f'fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>')
        if uri:
            add(f'<image href="{uri}" x="{fx}" y="{fy}" width="{FLAG_W}" height="{FLAG_H_px}" '
                f'preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_id})"/>')

    draw_flag(home_cx, home_flag_code, 'hflag')
    draw_flag(away_cx, away_flag_code, 'aflag')

    NAME_Y = TEAMS_CY + FLAG_H_px//2 + 32
    add(f'<text x="{home_cx}" y="{NAME_Y}" font-family="{FONT}" font-size="34" font-weight="600" '
        f'fill="{WHITE}" text-anchor="middle">{esc(home_name)}</text>')
    add(f'<text x="{vs_cx}" y="{TEAMS_CY+10}" font-family="{FONT}" font-size="46" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle">VS</text>')
    add(f'<text x="{away_cx}" y="{NAME_Y}" font-family="{FONT}" font-size="34" font-weight="600" '
        f'fill="{WHITE}" text-anchor="middle">{esc(away_name)}</text>')

    # ── PROBABILIDADES ────────────────────────────────────────────────────────
    PROB_TOP = NAME_Y + 34
    PAD_X = 32
    INNER_W = W - 80
    ROW_H = 84
    PROB_H = ROW_H * 3 + PAD_X

    add(f'<rect x="40" y="{PROB_TOP}" width="{INNER_W}" height="{PROB_H}" rx="12" '
        f'fill="rgba(255,255,255,0.04)"/>')
    add(f'<text x="{W//2}" y="{PROB_TOP-18}" font-family="{FONT}" font-size="22" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle" letter-spacing="4">PROBABILIDADES</text>')

    rows = [
        (home_name + ' gana', prob_home),
        ('Empate',             prob_draw),
        (away_name + ' gana',  prob_away),
    ]
    try:
        fav_idx = max(range(3), key=lambda i: float(rows[i][1]))
    except Exception:
        fav_idx = 0

    BAR_H = 5
    for ri, (label, prob) in enumerate(rows):
        ry = PROB_TOP + PAD_X//2 + 10 + ri * ROW_H
        is_fav = ri == fav_idx
        txt_col = GOLD if is_fav else WHITE
        bar_col = GOLD if is_fav else 'rgba(255,255,255,0.3)'

        add(f'<text x="{40+PAD_X}" y="{ry+32}" font-family="{FONT}" font-size="30" '
            f'font-weight="{"600" if is_fav else "400"}" fill="{txt_col}">{esc(label)}</text>')

        prob_str = f'{float(prob):.1f}%'
        add(f'<text x="{40+INNER_W-PAD_X}" y="{ry+32}" font-family="{FONT}" font-size="34" '
            f'font-weight="700" fill="{bar_col}" text-anchor="end">{prob_str}</text>')

        bx = 40 + PAD_X
        by = ry + 46
        bw = INNER_W - PAD_X*2
        fw = bw * float(prob) / 100
        add(f'<rect x="{bx}" y="{by}" width="{bw}" height="{BAR_H}" rx="3" fill="rgba(255,255,255,0.07)"/>')
        add(f'<rect x="{bx}" y="{by}" width="{fw:.1f}" height="{BAR_H}" rx="3" fill="{bar_col}"/>')

        if ri < 2:
            add(f'<line x1="{40+PAD_X}" y1="{ry+ROW_H-6}" x2="{40+INNER_W-PAD_X}" y2="{ry+ROW_H-6}" '
                f'stroke="rgba(255,255,255,0.06)" stroke-width="1"/>')

    # ── stats secundarios ─────────────────────────────────────────────────────
    STATS_Y = PROB_TOP + PROB_H + 20
    stats = [
        ('xG', f'{xg_home:.2f} – {xg_away:.2f}'),
        ('+2.5 goles', f'{over25:.1f}%'),
        ('Ambos anotan', f'{btts:.1f}%'),
    ]
    col_w = INNER_W // 3
    for si, (slabel, sval) in enumerate(stats):
        sx = 40 + col_w*si + col_w//2
        add(f'<text x="{sx}" y="{STATS_Y}" font-family="{FONT}" font-size="21" font-weight="400" '
            f'fill="rgba(255,255,255,0.40)" text-anchor="middle">{esc(slabel)}</text>')
        add(f'<text x="{sx}" y="{STATS_Y+32}" font-family="{FONT}" font-size="28" font-weight="600" '
            f'fill="{WHITE}" text-anchor="middle">{esc(sval)}</text>')
        if si < 2:
            add(f'<line x1="{40+col_w*(si+1)}" y1="{STATS_Y-14}" x2="{40+col_w*(si+1)}" y2="{STATS_Y+42}" '
                f'stroke="rgba(255,255,255,0.1)" stroke-width="1"/>')

    # ── EN RESUMEN ────────────────────────────────────────────────────────────
    SUM_TOP = STATS_Y + 52
    LINE_H  = 48
    SUM_PAD = 22
    SUM_H   = len(summary_points)*LINE_H + SUM_PAD*2

    add(f'<rect x="40" y="{SUM_TOP}" width="{INNER_W}" height="{SUM_H}" rx="12" '
        f'fill="rgba(201,162,39,0.07)" stroke="rgba(201,162,39,0.22)" stroke-width="1"/>')
    add(f'<text x="{W//2}" y="{SUM_TOP-16}" font-family="{FONT}" font-size="22" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle" letter-spacing="4">EN RESUMEN</text>')

    for pi, point in enumerate(summary_points):
        py = SUM_TOP + SUM_PAD + pi*LINE_H + 30
        add(f'<text x="{40+SUM_PAD}" y="{py}" font-family="{FONT}" font-size="26" fill="{GOLD}">→</text>')
        TEXT_X = 40 + SUM_PAD + 40
        parts = _parse_bold(point)
        tspans = ''.join(f'<tspan fill="{GOLD if b else "rgba(255,255,255,0.82)"}">{esc(t)}</tspan>'
                         for t,b in parts)
        add(f'<text x="{TEXT_X}" y="{py}" font-family="{FONT}" font-size="26" font-weight="400">{tspans}</text>')

    # ── CTA footer ────────────────────────────────────────────────────────────
    CTA_Y = SUM_TOP + SUM_H + 20
    CTA_H = 60
    CTA_W = 760
    CTA_X = (W - CTA_W)//2
    add(f'<rect x="{CTA_X}" y="{CTA_Y}" width="{CTA_W}" height="{CTA_H}" rx="32" fill="{GOLD}"/>')
    add(f'<text x="{W//2}" y="{CTA_Y+CTA_H//2+11}" font-family="{FONT}" font-size="28" font-weight="600" '
        f'fill="#0a0f1e" text-anchor="middle">{esc("Analiza tú mismo → guessbet.vercel.app")}</text>')

    add('</svg>')
    return '\n'.join(lines)


def render(svg: str, slug: str):
    svg_path = os.path.join(OUT_DIR, f'{slug}.svg')
    png_path = os.path.join(OUT_DIR, f'{slug}.png')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, svg_path, png_path, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')


CASES = [
    dict(
        slug='eng_vs_cod',
        home_name='Inglaterra',
        away_name='RD Congo',
        home_flag_code='gb-eng',
        away_flag_code='cd',
        phase_label='DIECISEISAVOS DE FINAL · HOY 12:00 CL',
        prob_home=53.7,
        prob_draw=26.6,
        prob_away=19.7,
        xg_home=1.46,
        xg_away=0.72,
        over25=37.4,
        btts=39.6,
        summary_points=[
            '**Inglaterra** favorita clara con **53.7%** de probabilidad.',
            'Ventaja ELO de **160 puntos** a favor de los ingleses.',
            'Partido pronosticado **cerrado en goles** (xG 1.46 – 0.72).',
        ],
    ),
    dict(
        slug='bel_vs_sen',
        home_name='Bélgica',
        away_name='Senegal',
        home_flag_code='be',
        away_flag_code='sn',
        phase_label='DIECISEISAVOS DE FINAL · HOY 16:00 CL',
        prob_home=40.3,
        prob_draw=28.5,
        prob_away=31.2,
        xg_home=1.31,
        xg_away=0.84,
        over25=36.4,
        btts=41.6,
        summary_points=[
            '**Senegal** tiene ELO más alto (1800 vs 1776). Partido parejo.',
            'El empate tiene **28.5%** — opción real en este cruce.',
            '**Ambos anotan**: 41.6%. El más abierto de los 3 hoy.',
        ],
    ),
    dict(
        slug='usa_vs_bih',
        home_name='USA',
        away_name='Bosnia',
        home_flag_code='us',
        away_flag_code='ba',
        phase_label='DIECISEISAVOS DE FINAL · HOY 20:00 CL',
        prob_home=66.3,
        prob_draw=18.8,
        prob_away=14.9,
        xg_home=2.15,
        xg_away=0.77,
        over25=55.7,
        btts=47.3,
        summary_points=[
            '**USA** aplastante con **66.3%**. Mayor diferencia ELO del día.',
            'xG de **2.15** para USA — el más alto de los 3 partidos.',
            '+2.5 goles en **55.7%**: el partido con más goles proyectados.',
        ],
    ),
]


if __name__ == '__main__':
    for c in CASES:
        svg = build_svg(**{k: v for k, v in c.items() if k != 'slug'})
        render(svg, c['slug'])
    print(f'\nListo. Archivos en public/marketing/ig-posts/partidos/')
