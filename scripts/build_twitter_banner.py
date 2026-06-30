"""
Genera el banner de Twitter/X para GuessBet (1500x500px).
Usa Pillow para compositar el logo PNG sobre el SVG renderizado.

Uso:
  python scripts/build_twitter_banner.py
"""

import os, subprocess, base64
from PIL import Image

RESVG   = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
LOGO    = os.path.join(os.path.dirname(__file__), '..', 'public', 'logo-guessbet.png')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'twitter')
os.makedirs(OUT_DIR, exist_ok=True)

W, H   = 1500, 500
BLACK  = '#0a0a0a'
GOLD   = '#C9A227'
WHITE  = '#ffffff'
FONT   = "Segoe UI, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def build_svg() -> str:
    lines: list[str] = []
    def add(*s): lines.extend(s)

    add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">')
    add(f'<rect width="{W}" height="{H}" fill="{BLACK}"/>')

    # ── espacio reservado para logo (izquierda): placeholder rect transparente
    # El logo real se compone con Pillow después del render.
    LOGO_SIZE = 340
    LOGO_X    = 80
    LOGO_CY   = H // 2
    LOGO_Y    = LOGO_CY - LOGO_SIZE // 2

    # línea decorativa vertical separadora
    SEP_X = LOGO_X + LOGO_SIZE + 60
    add(f'<line x1="{SEP_X}" y1="60" x2="{SEP_X}" y2="{H-60}" '
        f'stroke="{GOLD}" stroke-width="1.5" stroke-opacity="0.5"/>')

    # ── texto principal ────────────────────────────────────────────────────────
    TEXT_X   = SEP_X + 80
    TEXT_CY  = H // 2

    # "Apostamos con datos,"
    LINE1_Y = TEXT_CY - 52
    add(f'<text x="{TEXT_X}" y="{LINE1_Y}" font-family="{FONT}" '
        f'font-size="88" font-weight="500" fill="{WHITE}">'
        f'{esc("Apostamos con datos,")}</text>')

    # "no con el " + "corazón."
    LINE2_Y = LINE1_Y + 102
    add(f'<text x="{TEXT_X}" y="{LINE2_Y}" font-family="{FONT}" '
        f'font-size="88" font-weight="500">')
    add(f'  <tspan fill="{WHITE}">{esc("no con el ")}</tspan>'
        f'<tspan fill="{GOLD}">{esc("corazón.")}</tspan>')
    add(f'</text>')

    # texto secundario
    SUB_Y = LINE2_Y + 64
    add(f'<text x="{TEXT_X}" y="{SUB_Y}" font-family="{FONT}" '
        f'font-size="36" font-weight="400" fill="rgba(255,255,255,0.5)" letter-spacing="1">'
        f'{esc("Modelo ELO  ·  +14.000 partidos  ·  #Mundial2026")}</text>')

    add('</svg>')
    return '\n'.join(lines), LOGO_X, LOGO_Y, LOGO_SIZE


def render():
    svg_str, logo_x, logo_y, logo_size = build_svg()

    svg_path = os.path.join(OUT_DIR, 'banner.svg')
    tmp_png  = os.path.join(OUT_DIR, '_banner_nologo.png')
    out_png  = os.path.join(OUT_DIR, 'banner.png')

    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_str)

    subprocess.run([RESVG, svg_path, tmp_png, '--width', str(W)], check=True)

    # compositar logo con Pillow
    base   = Image.open(tmp_png).convert('RGBA')
    logo   = Image.open(LOGO).convert('RGBA')
    logo   = logo.resize((logo_size, logo_size), Image.LANCZOS)
    base.paste(logo, (logo_x, logo_y), logo)
    base.convert('RGB').save(out_png, 'PNG')

    os.remove(tmp_png)
    print(f'OK  banner.png  ({W}x{H})')
    print(f'OK  banner.svg')


if __name__ == '__main__':
    render()
    print('\nListo. Archivos en public/marketing/twitter/')
