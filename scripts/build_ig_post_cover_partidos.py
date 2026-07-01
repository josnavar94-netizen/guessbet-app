"""
Genera cover 1080x1080 "Partidos de hoy" con los 3 cruces del día para Instagram.
Uso: python scripts/build_ig_post_cover_partidos.py
"""

import os, subprocess, urllib.request, base64

RESVG  = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'partidos')
os.makedirs(OUT_DIR, exist_ok=True)

W, H  = 1080, 1080
BLACK = '#0a0a0a'
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"

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


MATCHES = [
    dict(home='Inglaterra', away='RD Congo',  home_cc='gb-eng', away_cc='cd',  time='12:00 CL', prob_home=53.7, prob_away=19.7),
    dict(home='Bélgica',    away='Senegal',   home_cc='be',     away_cc='sn',  time='16:00 CL', prob_home=40.3, prob_away=31.2),
    dict(home='USA',        away='Bosnia',    home_cc='us',     away_cc='ba',  time='20:00 CL', prob_home=66.3, prob_away=14.9),
]

def build_svg() -> str:
    lines = []
    def add(*s): lines.extend(s)

    add(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')

    # fondo
    add(f'<rect width="{W}" height="{H}" fill="{BLACK}"/>')

    # grid sutil de puntos (decorativo)
    for gx in range(60, W, 60):
        for gy in range(60, H, 60):
            add(f'<circle cx="{gx}" cy="{gy}" r="1" fill="rgba(201,162,39,0.06)"/>')

    # franja dorada superior
    add(f'<rect x="0" y="0" width="{W}" height="6" fill="{GOLD}"/>')

    # ── header ────────────────────────────────────────────────────────────────
    HDR_Y = 72
    add(f'<circle cx="60" cy="{HDR_Y}" r="22" fill="none" stroke="{GOLD}" stroke-width="2"/>')
    add(f'<text x="60" y="{HDR_Y+7}" font-family="{FONT}" font-size="18" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle">G</text>')
    add(f'<text x="96" y="{HDR_Y+7}" font-family="{FONT}" font-size="22" font-weight="500" '
        f'fill="{WHITE}" letter-spacing="1">guess_bet</text>')
    add(f'<text x="{W-44}" y="{HDR_Y+7}" font-family="{FONT}" font-size="19" font-weight="600" '
        f'fill="{GOLD}" text-anchor="end" letter-spacing="2">MUNDIAL 2026</text>')

    # línea bajo header
    add(f'<line x1="40" y1="{HDR_Y+26}" x2="{W-40}" y2="{HDR_Y+26}" '
        f'stroke="rgba(255,255,255,0.08)" stroke-width="1"/>')

    # ── título principal ──────────────────────────────────────────────────────
    TITLE_Y = HDR_Y + 86
    add(f'<text x="{W//2}" y="{TITLE_Y}" font-family="{FONT}" font-size="62" font-weight="700" '
        f'fill="{WHITE}" text-anchor="middle" letter-spacing="2">PARTIDOS</text>')
    add(f'<text x="{W//2}" y="{TITLE_Y+54}" font-family="{FONT}" font-size="62" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle" letter-spacing="2">DE HOY</text>')

    # sub-etiqueta fase
    SUB_Y = TITLE_Y + 104
    add(f'<text x="{W//2}" y="{SUB_Y}" font-family="{FONT}" font-size="24" font-weight="400" '
        f'fill="rgba(255,255,255,0.36)" text-anchor="middle" letter-spacing="4">'
        f'DIECISEISAVOS DE FINAL</text>')

    # separador
    SEP_Y = SUB_Y + 36
    add(f'<line x1="80" y1="{SEP_Y}" x2="{W-80}" y2="{SEP_Y}" '
        f'stroke="rgba(201,162,39,0.25)" stroke-width="1"/>')

    # ── tarjetas de partido ───────────────────────────────────────────────────
    CARD_X      = 48
    CARD_W      = W - 96
    CARD_H      = 148
    CARD_GAP    = 20
    CARD_TOP    = SEP_Y + 36
    FLAG_W, FLAG_H_px = 70, 46
    FLAG_R = 6

    defs_done = set()

    for i, m in enumerate(MATCHES):
        cy = CARD_TOP + i * (CARD_H + CARD_GAP)

        # fondo tarjeta
        add(f'<rect x="{CARD_X}" y="{cy}" width="{CARD_W}" height="{CARD_H}" rx="14" '
            f'fill="rgba(255,255,255,0.04)" stroke="rgba(201,162,39,0.18)" stroke-width="1"/>')

        # hora — columna izquierda
        TIME_X = CARD_X + 28
        add(f'<text x="{TIME_X}" y="{cy+46}" font-family="{FONT}" font-size="28" font-weight="700" '
            f'fill="{GOLD}">{esc(m["time"])}</text>')
        add(f'<text x="{TIME_X}" y="{cy+76}" font-family="{FONT}" font-size="20" font-weight="400" '
            f'fill="rgba(255,255,255,0.35)">Chile</text>')

        # separador vertical
        SEP_VX = TIME_X + 110
        add(f'<line x1="{SEP_VX}" y1="{cy+20}" x2="{SEP_VX}" y2="{cy+CARD_H-20}" '
            f'stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

        # --- equipo local ---
        home_cx = SEP_VX + 180
        # bandera
        hfx = home_cx - FLAG_W//2
        hfy = cy + CARD_H//2 - FLAG_H_px//2 - 10
        clip_h = f'fc_h{i}'
        if clip_h not in defs_done:
            add(f'<defs><clipPath id="{clip_h}">'
                f'<rect x="{hfx}" y="{hfy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}"/>'
                f'</clipPath></defs>')
            defs_done.add(clip_h)
        add(f'<rect x="{hfx}" y="{hfy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}" '
            f'fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>')
        uri_h = flag_b64(m['home_cc'])
        if uri_h:
            add(f'<image href="{uri_h}" x="{hfx}" y="{hfy}" width="{FLAG_W}" height="{FLAG_H_px}" '
                f'preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_h})"/>')
        add(f'<text x="{home_cx}" y="{cy+CARD_H//2+44}" font-family="{FONT}" font-size="24" '
            f'font-weight="600" fill="{WHITE}" text-anchor="middle">{esc(m["home"])}</text>')
        add(f'<text x="{home_cx}" y="{cy+CARD_H//2+68}" font-family="{FONT}" font-size="20" '
            f'font-weight="400" fill="{GOLD}" text-anchor="middle">{m["prob_home"]:.1f}%</text>')

        # VS
        VS_X = CARD_X + CARD_W//2
        add(f'<text x="{VS_X}" y="{cy+CARD_H//2+10}" font-family="{FONT}" font-size="36" '
            f'font-weight="700" fill="{GOLD}" text-anchor="middle">VS</text>')

        # --- equipo visitante ---
        away_cx = CARD_X + CARD_W - 180
        afx = away_cx - FLAG_W//2
        afy = cy + CARD_H//2 - FLAG_H_px//2 - 10
        clip_a = f'fc_a{i}'
        if clip_a not in defs_done:
            add(f'<defs><clipPath id="{clip_a}">'
                f'<rect x="{afx}" y="{afy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}"/>'
                f'</clipPath></defs>')
            defs_done.add(clip_a)
        add(f'<rect x="{afx}" y="{afy}" width="{FLAG_W}" height="{FLAG_H_px}" rx="{FLAG_R}" '
            f'fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>')
        uri_a = flag_b64(m['away_cc'])
        if uri_a:
            add(f'<image href="{uri_a}" x="{afx}" y="{afy}" width="{FLAG_W}" height="{FLAG_H_px}" '
                f'preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_a})"/>')
        add(f'<text x="{away_cx}" y="{cy+CARD_H//2+44}" font-family="{FONT}" font-size="24" '
            f'font-weight="600" fill="{WHITE}" text-anchor="middle">{esc(m["away"])}</text>')
        add(f'<text x="{away_cx}" y="{cy+CARD_H//2+68}" font-family="{FONT}" font-size="20" '
            f'font-weight="400" fill="rgba(255,255,255,0.45)" text-anchor="middle">{m["prob_away"]:.1f}%</text>')

    # ── footer ────────────────────────────────────────────────────────────────
    FTR_Y = CARD_TOP + 3*(CARD_H + CARD_GAP) + 36
    add(f'<line x1="80" y1="{FTR_Y}" x2="{W-80}" y2="{FTR_Y}" '
        f'stroke="rgba(255,255,255,0.08)" stroke-width="1"/>')
    add(f'<text x="{W//2}" y="{FTR_Y+36}" font-family="{FONT}" font-size="22" font-weight="400" '
        f'fill="rgba(255,255,255,0.30)" text-anchor="middle">Modelo ELO + Poisson · +14.000 partidos</text>')
    add(f'<text x="{W//2}" y="{FTR_Y+64}" font-family="{FONT}" font-size="24" font-weight="600" '
        f'fill="{GOLD}" text-anchor="middle">guessbet.vercel.app</text>')

    add('</svg>')
    return '\n'.join(lines)


def render(svg: str, slug: str):
    svg_path = os.path.join(OUT_DIR, f'{slug}.svg')
    png_path = os.path.join(OUT_DIR, f'{slug}.png')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, svg_path, png_path, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')


if __name__ == '__main__':
    svg = build_svg()
    render(svg, 'cover_01jul')
    print('Listo. Archivo en public/marketing/ig-posts/partidos/')
