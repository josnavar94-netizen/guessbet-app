"""
Genera el carrusel "Así se usa GuessBet" para @guess_bet.
6 slides 1080x1080px.

Uso:
  python scripts/build_ig_como_usar.py
"""
import os, re, subprocess, urllib.request, base64

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
ICONS_DIR = r'C:\Users\Isabella\AppData\Local\Temp\icons'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'como_usar_la_app')
os.makedirs(OUT_DIR, exist_ok=True)

W = H = 1080
BLACK = '#0a0a0a'
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"
CX, CY = W // 2, H // 2

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def icon_paths(name):
    with open(os.path.join(ICONS_DIR, f'{name}.svg'), encoding='utf-8') as f:
        src = f.read()
    paths = []
    for m in re.finditer(r'<path([^>]*)/?>', src):
        attrs = m.group(1)
        d = re.search(r'd="([^"]+)"', attrs)
        if not d or 'stroke="none"' in attrs:
            continue
        paths.append(d.group(1))
    return paths

def icon_svg(name, cx, cy, box, color=GOLD, stroke_w=2):
    scale = box / 24
    offset_x, offset_y = cx - box / 2, cy - box / 2
    paths = ''.join(f'<path d="{d}"/>' for d in icon_paths(name))
    return (f'<g transform="translate({offset_x},{offset_y}) scale({scale})" '
            f'fill="none" stroke="{color}" stroke-width="{stroke_w}" stroke-linecap="round" stroke-linejoin="round">{paths}</g>')

FLAG_CACHE: dict[str, str] = {}
def flag_b64(code: str) -> str:
    if code in FLAG_CACHE: return FLAG_CACHE[code]
    url = f'https://flagcdn.com/w80/{code}.png'
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            data = base64.b64encode(r.read()).decode()
        result = f'data:image/png;base64,{data}'
    except Exception:
        result = ''
    FLAG_CACHE[code] = result
    return result

def base_svg(extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{BLACK}"/>'
            + extra + '</svg>')

def logo_gb(cx, cy, size=54):
    r = size
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{GOLD}" stroke-width="3"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r-10}" fill="{GOLD}" fill-opacity="0.12"/>'
            f'<text x="{cx}" y="{cy+14}" font-family="{FONT}" font-size="{int(size*0.75)}" font-weight="700" '
            f'fill="{GOLD}" text-anchor="middle">GB</text>')

def rich_text_center(spans, cx, cy, size, line_height, weight=600):
    n = len(spans)
    start_y = cy - (n - 1) * line_height / 2
    out = []
    for i, line in enumerate(spans):
        y = start_y + i * line_height
        tspans = ''.join(f'<tspan fill="{color}">{esc(t)}</tspan>' for t, color in line)
        out.append(f'<text x="{cx}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{tspans}</text>')
    return ''.join(out)

def step_number(cx, cy, n, r=64):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{GOLD}" stroke-width="3"/>'
            f'<text x="{cx}" y="{cy+18}" font-family="{FONT}" font-size="58" font-weight="700" '
            f'fill="{GOLD}" text-anchor="middle">{n}</text>')

# ─── SLIDE 1: Portada ────────────────────────────────────────────────────────
def slide1():
    parts = []
    parts.append(f'<line x1="80" y1="90" x2="{W-80}" y2="90" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')
    parts.append(f'<line x1="80" y1="{H-90}" x2="{W-80}" y2="{H-90}" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')
    parts.append(rich_text_center(
        [[('Así se usa ', WHITE), ('GuessBet', GOLD)]],
        CX, CY - 80, 70, 90
    ))
    parts.append(f'<text x="{CX}" y="{CY+20}" font-family="{FONT}" font-size="34" font-weight="400" '
                 f'fill="rgba(255,255,255,0.45)" text-anchor="middle">Guía paso a paso</text>')
    parts.append(logo_gb(CX, H - 140, size=54))
    return base_svg(''.join(parts))

# ─── SLIDE de paso (2-5) ──────────────────────────────────────────────────────
def step_slide(n, text_spans, icon_name, extra_mockup=''):
    parts = []
    parts.append(f'<text x="{W-70}" y="70" font-family="{FONT}" font-size="24" font-weight="400" '
                 f'fill="rgba(255,255,255,0.2)" text-anchor="end">{n+1}/7</text>')
    parts.append(step_number(CX, 180, n))

    # texto principal
    TEXT_Y = 340
    parts.append(rich_text_center(text_spans, CX, TEXT_Y, 52, 68))

    if extra_mockup:
        parts.append(extra_mockup)
    else:
        # ícono grande centrado
        parts.append(icon_svg(icon_name, CX, 700, 160, color=GOLD, stroke_w=1.6))

    return base_svg(''.join(parts))

def mockup_vs(cy=700):
    """Mini mockup de selección de partido (Francia vs Suecia)."""
    parts = []
    FW, FH = 110, 74
    fr_x, sv_x = CX - 180, CX + 180
    for code, cx in [('fr', fr_x), ('se', sv_x)]:
        uri = flag_b64(code)
        fx, fy = cx - FW//2, cy - FH//2
        clip_id = f'clip_{code}'
        parts.append(f'<defs><clipPath id="{clip_id}"><rect x="{fx}" y="{fy}" width="{FW}" height="{FH}" rx="8"/></clipPath></defs>')
        parts.append(f'<rect x="{fx}" y="{fy}" width="{FW}" height="{FH}" rx="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>')
        if uri:
            parts.append(f'<image href="{uri}" x="{fx}" y="{fy}" width="{FW}" height="{FH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_id})"/>')
    parts.append(f'<text x="{CX}" y="{cy+16}" font-family="{FONT}" font-size="40" font-weight="700" '
                 f'fill="{GOLD}" text-anchor="middle">VS</text>')
    return ''.join(parts)

def mockup_bars(cy=660):
    """Mini mockup de barras de probabilidad."""
    parts = []
    BW = 640
    bx = CX - BW // 2
    rows = [('Local', 48, GOLD), ('Empate', 30, 'rgba(255,255,255,0.35)'), ('Visita', 22, 'rgba(255,255,255,0.35)')]
    ROW_H = 78
    for i, (label, pct, color) in enumerate(rows):
        ry = cy + i * ROW_H
        parts.append(f'<text x="{bx}" y="{ry}" font-family="{FONT}" font-size="28" fill="{WHITE}">{label}</text>')
        parts.append(f'<text x="{bx+BW}" y="{ry}" font-family="{FONT}" font-size="28" font-weight="700" '
                     f'fill="{color}" text-anchor="end">{pct}%</text>')
        bar_y = ry + 14
        parts.append(f'<rect x="{bx}" y="{bar_y}" width="{BW}" height="6" rx="3" fill="rgba(255,255,255,0.08)"/>')
        parts.append(f'<rect x="{bx}" y="{bar_y}" width="{BW*pct/100:.1f}" height="6" rx="3" fill="{color}"/>')
    return ''.join(parts)

# ─── SLIDE 5 (nueva): Instalar la app en el celular ──────────────────────────
def slide_install():
    parts = []
    parts.append(f'<text x="{W-70}" y="70" font-family="{FONT}" font-size="24" font-weight="400" '
                 f'fill="rgba(255,255,255,0.2)" text-anchor="end">5/7</text>')
    parts.append(step_number(CX, 170, 4))
    parts.append(rich_text_center(
        [[('Instálala en tu celular', WHITE)], [('en 10 segundos', GOLD)]],
        CX, 320, 50, 64
    ))

    # dos columnas: iPhone / Android
    COL_Y = 470
    col_w = 420
    ios_x = CX - col_w // 2 - 30
    android_x = CX + col_w // 2 + 30

    def col(cx, icon_name, brand, steps):
        out = []
        out.append(icon_svg(icon_name, cx, COL_Y, 70, color=GOLD, stroke_w=1.6))
        out.append(f'<text x="{cx}" y="{COL_Y+70}" font-family="{FONT}" font-size="30" font-weight="600" '
                   f'fill="{WHITE}" text-anchor="middle">{esc(brand)}</text>')
        sy = COL_Y + 130
        for i, s in enumerate(steps):
            ry = sy + i * 56
            out.append(f'<circle cx="{cx-150}" cy="{ry-8}" r="14" fill="rgba(201,162,39,0.15)" stroke="{GOLD}" stroke-width="1"/>')
            out.append(f'<text x="{cx-150}" y="{ry-2}" font-family="{FONT}" font-size="18" font-weight="700" '
                       f'fill="{GOLD}" text-anchor="middle">{i+1}</text>')
            out.append(f'<text x="{cx-120}" y="{ry}" font-family="{FONT}" font-size="22" font-weight="400" '
                       f'fill="rgba(255,255,255,0.8)" text-anchor="start">{esc(s)}</text>')
        return ''.join(out)

    parts.append(col(ios_x, 'brand-apple', 'iPhone', ['Toca Compartir', 'Agregar a inicio', 'Listo, ya está']))
    parts.append(col(android_x, 'brand-android', 'Android', ['Abre el menú ⋮', 'Instalar app', 'Listo, ya está']))

    # separador vertical
    parts.append(f'<line x1="{CX}" y1="{COL_Y-50}" x2="{CX}" y2="{COL_Y+260}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>')

    # nota: activar notificaciones (aplica a ambas plataformas, una vez instalada)
    NOTIF_Y = COL_Y + 330
    NOTIF_W, NOTIF_H = 760, 110
    nx = CX - NOTIF_W // 2
    parts.append(f'<rect x="{nx}" y="{NOTIF_Y}" width="{NOTIF_W}" height="{NOTIF_H}" rx="14" '
                 f'fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.25)" stroke-width="1"/>')
    parts.append(icon_svg('bell', nx + 70, NOTIF_Y + NOTIF_H // 2, 46, color=GOLD, stroke_w=1.8))
    parts.append(f'<text x="{nx+120}" y="{NOTIF_Y+44}" font-family="{FONT}" font-size="26" font-weight="600" '
                 f'fill="{GOLD}" text-anchor="start">Activa las notificaciones</text>')
    parts.append(f'<text x="{nx+120}" y="{NOTIF_Y+78}" font-family="{FONT}" font-size="22" font-weight="400" '
                 f'fill="rgba(255,255,255,0.6)" text-anchor="start">Y entérate ni bien se confirma la alineación</text>')

    return base_svg(''.join(parts))

# ─── SLIDE 6 (nueva): Ejemplo de comparación cuota vs modelo ─────────────────
def slide_compare_example():
    parts = []
    parts.append(f'<text x="{W-70}" y="70" font-family="{FONT}" font-size="24" font-weight="400" '
                 f'fill="rgba(255,255,255,0.2)" text-anchor="end">6/7</text>')
    parts.append(step_number(CX, 170, 5))
    parts.append(rich_text_center(
        [[('Compara la cuota y', WHITE)], [('decide con cabeza', GOLD)]],
        CX, 320, 50, 64
    ))

    # card de ejemplo: modelo vs cuota
    CARD_TOP = 440
    CARD_W = 760
    CARD_H = 360
    cx0 = CX - CARD_W // 2
    parts.append(f'<rect x="{cx0}" y="{CARD_TOP}" width="{CARD_W}" height="{CARD_H}" rx="16" fill="rgba(255,255,255,0.05)"/>')

    parts.append(f'<text x="{CX}" y="{CARD_TOP+56}" font-family="{FONT}" font-size="26" font-weight="600" '
                 f'fill="rgba(255,255,255,0.5)" text-anchor="middle">Francia gana</text>')

    # dos columnas dentro del card: modelo / casa de apuestas
    col_y = CARD_TOP + 130
    parts.append(f'<text x="{CX-190}" y="{col_y}" font-family="{FONT}" font-size="22" font-weight="400" '
                 f'fill="rgba(255,255,255,0.45)" text-anchor="middle">Modelo dice</text>')
    parts.append(f'<text x="{CX-190}" y="{col_y+60}" font-family="{FONT}" font-size="54" font-weight="700" '
                 f'fill="{WHITE}" text-anchor="middle">47.8%</text>')

    parts.append(f'<line x1="{CX}" y1="{col_y-40}" x2="{CX}" y2="{col_y+90}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>')

    parts.append(f'<text x="{CX+190}" y="{col_y}" font-family="{FONT}" font-size="22" font-weight="400" '
                 f'fill="rgba(255,255,255,0.45)" text-anchor="middle">Cuota implica</text>')
    parts.append(f'<text x="{CX+190}" y="{col_y+60}" font-family="{FONT}" font-size="54" font-weight="700" '
                 f'fill="{WHITE}" text-anchor="middle">40.0%</text>')

    # resultado: ventaja
    PILL_Y = CARD_TOP + 250
    PILL_W, PILL_H = 420, 76
    pill_x = CX - PILL_W // 2
    parts.append(f'<rect x="{pill_x}" y="{PILL_Y}" width="{PILL_W}" height="{PILL_H}" rx="38" '
                 f'fill="rgba(201,162,39,0.15)" stroke="{GOLD}" stroke-width="1.5"/>')
    parts.append(f'<text x="{CX}" y="{PILL_Y+PILL_H//2+12}" font-family="{FONT}" font-size="32" font-weight="700" '
                 f'fill="{GOLD}" text-anchor="middle">+7.8% de ventaja</text>')

    parts.append(f'<text x="{CX}" y="{CARD_TOP+CARD_H+50}" font-family="{FONT}" font-size="22" font-weight="400" '
                 f'fill="rgba(255,255,255,0.4)" text-anchor="middle">Así sabes si vale la pena apostar</text>')

    return base_svg(''.join(parts))

# ─── SLIDE 7: Cierre con datos ────────────────────────────────────────────────
def slide_close():
    parts = []
    parts.append(f'<line x1="80" y1="90" x2="{W-80}" y2="90" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')
    parts.append(f'<line x1="80" y1="{H-90}" x2="{W-80}" y2="{H-90}" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')
    parts.append(rich_text_center(
        [[('Así de simple.', WHITE)], [('Pruébalo ', WHITE), ('gratis', GOLD), (' hoy.', WHITE)]],
        CX, 360, 62, 88
    ))

    # badges de datos duros
    BADGE_Y = 560
    badges = ['+14.000 partidos', 'Modelo ELO', 'Mundial 2026']
    gap = 24
    sizes = [len(b) * 17 + 56 for b in badges]
    total_w = sum(sizes) + gap * (len(badges) - 1)
    start_x = CX - total_w // 2
    bx = start_x
    for b, w in zip(badges, sizes):
        parts.append(f'<rect x="{bx}" y="{BADGE_Y}" width="{w}" height="54" rx="27" '
                     f'fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>')
        parts.append(f'<text x="{bx+w//2}" y="{BADGE_Y+35}" font-family="{FONT}" font-size="22" font-weight="500" '
                     f'fill="rgba(255,255,255,0.75)" text-anchor="middle">{esc(b)}</text>')
        bx += w + gap

    CTA_W, CTA_H = 800, 80
    cta_x = CX - CTA_W // 2
    cta_y = BADGE_Y + 110
    parts.append(f'<rect x="{cta_x}" y="{cta_y}" width="{CTA_W}" height="{CTA_H}" rx="40" fill="{GOLD}"/>')
    parts.append(f'<text x="{CX}" y="{cta_y + CTA_H//2 + 13}" font-family="{FONT}" font-size="32" font-weight="600" '
                 f'fill="#0a0f1e" text-anchor="middle">{esc("Link en bio → guessbet.vercel.app")}</text>')
    parts.append(logo_gb(CX, H - 130, size=50))
    return base_svg(''.join(parts))

def render(svg: str, slug: str):
    svg_path = os.path.join(OUT_DIR, f'{slug}.svg')
    png_path = os.path.join(OUT_DIR, f'{slug}.png')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, svg_path, png_path, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')

if __name__ == '__main__':
    render(slide1(), 'slide1')
    render(step_slide(1, [[('Entra a guessbet.vercel.app y ', WHITE)], [('crea tu cuenta', GOLD)]], 'user-plus'), 'slide2')
    render(step_slide(2, [[('Elige el ', WHITE), ('partido', GOLD), (' que', WHITE)], [('quieres analizar', WHITE)]],
                       'ball-football', extra_mockup=mockup_vs()), 'slide3')
    render(step_slide(3, [[('El modelo te muestra la', WHITE)], [('probabilidad real', GOLD)]],
                       'chart-bar', extra_mockup=mockup_bars()), 'slide4')
    render(slide_install(), 'slide5')
    render(slide_compare_example(), 'slide6')
    render(slide_close(), 'slide7')
    print('\nListo. Archivos en public/marketing/ig-posts/como_usar_la_app/')
