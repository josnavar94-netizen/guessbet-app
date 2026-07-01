"""
Genera posts de Instagram (1080x1080) con análisis de partido para GuessBet.
Uso: python scripts/build_ig_post_partidos.py
"""

import os, subprocess, urllib.request, base64

RESVG   = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
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
    url = f'https://flagcdn.com/w160/{code}.png'
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
    phase_label,
    prob_home, prob_draw, prob_away,
    xg_home, xg_away,
    over25, btts,
    summary_points,
) -> str:
    lines = []
    def add(*s): lines.extend(s)

    add(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')

    # ── fondo con gradiente sutil ─────────────────────────────────────────────
    add(f'<defs>'
        f'<linearGradient id="bggrad" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="#111116"/>'
        f'<stop offset="100%" stop-color="#0a0a0a"/>'
        f'</linearGradient>'
        f'<linearGradient id="bargrad" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0%" stop-color="#C9A227"/>'
        f'<stop offset="100%" stop-color="#e8c45a"/>'
        f'</linearGradient>'
        f'</defs>')
    add(f'<rect width="{W}" height="{H}" fill="url(#bggrad)"/>')

    # franja dorada superior (4px)
    add(f'<rect x="0" y="0" width="{W}" height="4" fill="{GOLD}"/>')

    # ── ZONA 1: HEADER (0–90px) ───────────────────────────────────────────────
    # Logo G
    add(f'<circle cx="56" cy="52" r="20" fill="none" stroke="{GOLD}" stroke-width="1.5"/>')
    add(f'<text x="56" y="59" font-family="{FONT}" font-size="16" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle">G</text>')
    add(f'<text x="88" y="59" font-family="{FONT}" font-size="20" font-weight="400" '
        f'fill="{WHITE}" letter-spacing="1">guess_bet</text>')

    # badge fase — derecha
    BADGE_W, BADGE_H = 340, 36
    BADGE_X = W - 40 - BADGE_W
    add(f'<rect x="{BADGE_X}" y="34" width="{BADGE_W}" height="{BADGE_H}" rx="18" '
        f'fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.4)" stroke-width="1"/>')
    add(f'<text x="{BADGE_X + BADGE_W//2}" y="57" font-family="{FONT}" font-size="17" '
        f'font-weight="600" fill="{GOLD}" text-anchor="middle" letter-spacing="1">'
        f'MUNDIAL 2026 · {esc(phase_label)}</text>')

    # separador
    add(f'<line x1="40" y1="88" x2="{W-40}" y2="88" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── ZONA 2: EQUIPOS (90–360px) ────────────────────────────────────────────
    # Banderas grandes
    FLAG_W, FLAG_H_px = 200, 130
    FLAG_R = 12
    home_cx, away_cx = 210, W-210

    # bandera home
    hfx, hfy = home_cx - FLAG_W//2, 108
    add(f'<defs><clipPath id="hflag"><rect x="{hfx}" y="{hfy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}"/></clipPath></defs>')
    add(f'<rect x="{hfx}" y="{hfy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}" '
        f'fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>')
    uri_h = flag_b64(home_flag_code)
    if uri_h:
        add(f'<image href="{uri_h}" x="{hfx}" y="{hfy}" width="{FLAG_W}" height="{FLAG_H_px}" '
            f'preserveAspectRatio="xMidYMid slice" clip-path="url(#hflag)"/>')

    # bandera away
    afx, afy = away_cx - FLAG_W//2, 108
    add(f'<defs><clipPath id="aflag"><rect x="{afx}" y="{afy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}"/></clipPath></defs>')
    add(f'<rect x="{afx}" y="{afy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}" '
        f'fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>')
    uri_a = flag_b64(away_flag_code)
    if uri_a:
        add(f'<image href="{uri_a}" x="{afx}" y="{afy}" width="{FLAG_W}" height="{FLAG_H_px}" '
            f'preserveAspectRatio="xMidYMid slice" clip-path="url(#aflag)"/>')

    # VS central
    add(f'<text x="{W//2}" y="188" font-family="{FONT}" font-size="64" font-weight="900" '
        f'fill="{GOLD}" text-anchor="middle">VS</text>')

    # nombres equipos
    add(f'<text x="{home_cx}" y="272" font-family="{FONT}" font-size="38" font-weight="700" '
        f'fill="{WHITE}" text-anchor="middle">{esc(home_name)}</text>')
    add(f'<text x="{away_cx}" y="272" font-family="{FONT}" font-size="38" font-weight="700" '
        f'fill="{WHITE}" text-anchor="middle">{esc(away_name)}</text>')

    # probabilidades debajo del nombre (grande, destacado)
    fav = prob_home if prob_home > prob_away else prob_away
    h_color = GOLD if prob_home >= prob_away else 'rgba(255,255,255,0.5)'
    a_color = GOLD if prob_away > prob_home else 'rgba(255,255,255,0.5)'
    add(f'<text x="{home_cx}" y="314" font-family="{FONT}" font-size="32" font-weight="700" '
        f'fill="{h_color}" text-anchor="middle">{prob_home:.1f}%</text>')
    add(f'<text x="{away_cx}" y="314" font-family="{FONT}" font-size="32" font-weight="700" '
        f'fill="{a_color}" text-anchor="middle">{prob_away:.1f}%</text>')

    # separador
    add(f'<line x1="40" y1="336" x2="{W-40}" y2="336" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── ZONA 3: PROBABILIDADES (340–590px) ───────────────────────────────────
    add(f'<text x="{W//2}" y="370" font-family="{FONT}" font-size="20" font-weight="700" '
        f'fill="rgba(255,255,255,0.35)" text-anchor="middle" letter-spacing="5">PROBABILIDADES</text>')

    rows = [
        (home_name + ' gana', prob_home),
        ('Empate',             prob_draw),
        (away_name + ' gana',  prob_away),
    ]
    fav_idx = max(range(3), key=lambda i: float(rows[i][1]))

    ROW_TOP = 390
    ROW_H   = 68
    BAR_H   = 6
    PAD_X   = 48

    for ri, (label, prob) in enumerate(rows):
        ry = ROW_TOP + ri * ROW_H
        is_fav = ri == fav_idx
        txt_col = GOLD if is_fav else WHITE
        bar_fill = 'url(#bargrad)' if is_fav else 'rgba(255,255,255,0.25)'
        weight = '700' if is_fav else '400'

        add(f'<text x="{PAD_X}" y="{ry+24}" font-family="{FONT}" font-size="28" '
            f'font-weight="{weight}" fill="{txt_col}">{esc(label)}</text>')
        add(f'<text x="{W-PAD_X}" y="{ry+24}" font-family="{FONT}" font-size="32" '
            f'font-weight="700" fill="{txt_col}" text-anchor="end">{float(prob):.1f}%</text>')

        bx, by = PAD_X, ry + 36
        bw = W - PAD_X*2
        fw = bw * float(prob) / 100
        add(f'<rect x="{bx}" y="{by}" width="{bw}" height="{BAR_H}" rx="3" fill="rgba(255,255,255,0.06)"/>')
        add(f'<rect x="{bx}" y="{by}" width="{fw:.1f}" height="{BAR_H}" rx="3" fill="{bar_fill}"/>')

    # separador
    add(f'<line x1="40" y1="604" x2="{W-40}" y2="604" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── ZONA 4: STATS SECUNDARIOS (608–690px) ────────────────────────────────
    stats = [
        ('xG esperados', f'{xg_home:.2f} – {xg_away:.2f}'),
        ('+2.5 goles',   f'{over25:.1f}%'),
        ('Ambos anotan',  f'{btts:.1f}%'),
    ]
    col_w = (W - 80) // 3
    for si, (slabel, sval) in enumerate(stats):
        sx = 40 + col_w * si + col_w // 2
        add(f'<text x="{sx}" y="638" font-family="{FONT}" font-size="19" font-weight="400" '
            f'fill="rgba(255,255,255,0.38)" text-anchor="middle" letter-spacing="1">{esc(slabel)}</text>')
        add(f'<text x="{sx}" y="672" font-family="{FONT}" font-size="30" font-weight="600" '
            f'fill="{WHITE}" text-anchor="middle">{esc(sval)}</text>')
        if si < 2:
            add(f'<line x1="{40+col_w*(si+1)}" y1="622" x2="{40+col_w*(si+1)}" y2="684" '
                f'stroke="rgba(255,255,255,0.09)" stroke-width="1"/>')

    # separador
    add(f'<line x1="40" y1="700" x2="{W-40}" y2="700" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── ZONA 5: EN RESUMEN (704–880px) ───────────────────────────────────────
    add(f'<text x="{W//2}" y="730" font-family="{FONT}" font-size="20" font-weight="700" '
        f'fill="rgba(255,255,255,0.35)" text-anchor="middle" letter-spacing="5">EN RESUMEN</text>')

    LINE_H = 56
    for pi, point in enumerate(summary_points):
        py = 760 + pi * LINE_H
        add(f'<text x="40" y="{py}" font-family="{FONT}" font-size="24" fill="{GOLD}">→</text>')
        TEXT_X = 80
        parts = _parse_bold(point)
        tspans = ''.join(
            f'<tspan fill="{GOLD if b else "rgba(255,255,255,0.80)"}">{esc(t)}</tspan>'
            for t, b in parts)
        add(f'<text x="{TEXT_X}" y="{py}" font-family="{FONT}" font-size="24" font-weight="400">'
            f'{tspans}</text>')

    # ── ZONA 6: CTA (900–980px) ──────────────────────────────────────────────
    CTA_Y, CTA_H, CTA_W = 912, 64, 800
    CTA_X = (W - CTA_W) // 2
    add(f'<defs><linearGradient id="ctaGrad" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0%" stop-color="#b8911f"/>'
        f'<stop offset="50%" stop-color="#C9A227"/>'
        f'<stop offset="100%" stop-color="#b8911f"/>'
        f'</linearGradient></defs>')
    add(f'<rect x="{CTA_X}" y="{CTA_Y}" width="{CTA_W}" height="{CTA_H}" rx="32" fill="url(#ctaGrad)"/>')
    add(f'<text x="{W//2}" y="{CTA_Y + CTA_H//2 + 10}" font-family="{FONT}" font-size="26" '
        f'font-weight="700" fill="#0a0a0a" text-anchor="middle" letter-spacing="0.5">'
        f'{esc("Analiza tú mismo → guessbet.vercel.app")}</text>')

    # franja dorada inferior (4px)
    add(f'<rect x="0" y="{H-4}" width="{W}" height="4" fill="{GOLD}"/>')

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
        phase_label='12:00 CL',
        prob_home=53.7, prob_draw=26.6, prob_away=19.7,
        xg_home=1.46, xg_away=0.72,
        over25=37.4, btts=39.6,
        summary_points=[
            '**Inglaterra** favorita con **53.7%** de probabilidad.',
            'Ventaja ELO de **160 puntos** para los ingleses.',
            'Partido cerrado en goles: xG proyectado **1.46 – 0.72**.',
        ],
    ),
    dict(
        slug='bel_vs_sen',
        home_name='Bélgica',
        away_name='Senegal',
        home_flag_code='be',
        away_flag_code='sn',
        phase_label='16:00 CL',
        prob_home=40.3, prob_draw=28.5, prob_away=31.2,
        xg_home=1.31, xg_away=0.84,
        over25=36.4, btts=41.6,
        summary_points=[
            '**Senegal** con ELO más alto (1800 vs 1776). Partido parejo.',
            'El **empate tiene 28.5%** — opción real a considerar.',
            '**Ambos anotan: 41.6%** — el cruce más abierto del día.',
        ],
    ),
    dict(
        slug='usa_vs_bih',
        home_name='USA',
        away_name='Bosnia',
        home_flag_code='us',
        away_flag_code='ba',
        phase_label='20:00 CL',
        prob_home=66.3, prob_draw=18.8, prob_away=14.9,
        xg_home=2.15, xg_away=0.77,
        over25=55.7, btts=47.3,
        summary_points=[
            '**USA aplastante**: 66.3%. Mayor ventaja ELO del día.',
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
