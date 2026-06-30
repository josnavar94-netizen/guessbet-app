"""
Genera el carrusel de lanzamiento de Instagram para @guess_bet.
5 slides 1080x1080px, identidad visual de la marca.

Uso:
  python scripts/build_ig_carrusel.py
"""
import os, subprocess, urllib.request, base64

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'carrusel_lanzamiento')
os.makedirs(OUT_DIR, exist_ok=True)

W = H = 1080
BLACK = '#0a0a0a'
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"
CX    = W // 2
CY    = H // 2

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

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
    """Cabecera SVG + fondo."""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
            f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
            f'<rect width="{W}" height="{H}" fill="{BLACK}"/>'
            + extra + '</svg>')

def logo_gb(cx, cy, size=56):
    """Logo 'GB' estilizado en dorado."""
    r = size
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{GOLD}" stroke-width="3"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r-10}" fill="{GOLD}" fill-opacity="0.12"/>'
            f'<text x="{cx}" y="{cy+14}" font-family="{FONT}" font-size="{int(size*0.75)}" font-weight="700" '
            f'fill="{GOLD}" text-anchor="middle">GB</text>')

def flag_img(code, cx, cy, fw=104, fh=70, clip_id='fc'):
    uri = flag_b64(code)
    fx, fy = cx - fw//2, cy - fh//2
    r = 8
    clip = f'<clipPath id="{clip_id}"><rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" rx="{r}"/></clipPath>'
    border = f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" rx="{r}" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>'
    if uri:
        img = (f'<image href="{uri}" x="{fx}" y="{fy}" width="{fw}" height="{fh}" '
               f'preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_id})"/>')
    else:
        img = ''
    return f'<defs>{clip}</defs>{border}{img}'

def prediction_block(cx, top_y, label, pred_text, result_text='ACERTAMOS'):
    """Bloque prediccion + resultado."""
    BW, BH = 820, 190
    bx = cx - BW//2
    out = []
    out.append(f'<rect x="{bx}" y="{top_y}" width="{BW}" height="{BH}" rx="14" fill="rgba(255,255,255,0.05)"/>')
    out.append(f'<text x="{cx}" y="{top_y+48}" font-family="{FONT}" font-size="26" font-weight="600" '
               f'fill="{GOLD}" text-anchor="middle" letter-spacing="2">{esc(label)}</text>')
    out.append(f'<text x="{cx}" y="{top_y+110}" font-family="{FONT}" font-size="52" font-weight="600" '
               f'fill="{WHITE}" text-anchor="middle">{esc(pred_text)}</text>')
    # resultado pill
    RW, RH = 360, 64
    rx2 = cx - RW//2
    ry2 = top_y + BH + 32
    out.append(f'<rect x="{rx2}" y="{ry2}" width="{RW}" height="{RH}" rx="32" '
               f'fill="rgba(201,162,39,0.15)" stroke="{GOLD}" stroke-width="1.5"/>')
    out.append(f'<text x="{cx}" y="{ry2+RH//2+12}" font-family="{FONT}" font-size="30" font-weight="700" '
               f'fill="{GOLD}" text-anchor="middle" letter-spacing="3">{esc("✓  " + result_text)}</text>')
    return ''.join(out)

# ─── SLIDE 1: Portada ─────────────────────────────────────────────────────────
def slide1():
    parts = []
    # línea decorativa sutil arriba
    parts.append(f'<line x1="80" y1="90" x2="{W-80}" y2="90" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')
    parts.append(f'<line x1="80" y1="{H-90}" x2="{W-80}" y2="{H-90}" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')

    # texto principal — 3 líneas
    texts = [
        ('3 partidos.', WHITE),
        ('3 predicciones.', WHITE),
        ('Mira lo que pasó.', None),  # None = última línea mixta
    ]
    LINE_H = 110
    total_h = len(texts) * LINE_H
    start_y = CY - total_h // 2 - 40

    for i, (txt, color) in enumerate(texts):
        y = start_y + i * LINE_H
        if color:
            parts.append(f'<text x="{CX}" y="{y}" font-family="{FONT}" font-size="86" font-weight="600" '
                         f'fill="{color}" text-anchor="middle">{esc(txt)}</text>')
        else:
            # "Mira lo que " blanco + "pasó." dorado
            parts.append(
                f'<text x="{CX}" y="{y}" font-family="{FONT}" font-size="86" font-weight="600" text-anchor="middle">'
                f'<tspan fill="{WHITE}">Mira lo que </tspan>'
                f'<tspan fill="{GOLD}">pas&#243;.</tspan>'
                f'</text>'
            )

    # logo abajo
    parts.append(logo_gb(CX, H - 140, size=54))
    return base_svg(''.join(parts))

# ─── SLIDE genérico de partido ────────────────────────────────────────────────
def slide_match(code_h, code_a, team_h, team_a, pred_text, slide_num):
    parts = []
    # label "MUNDIAL 2026"
    parts.append(f'<text x="{CX}" y="110" font-family="{FONT}" font-size="28" font-weight="700" '
                 f'fill="{GOLD}" text-anchor="middle" letter-spacing="5">MUNDIAL 2026</text>')

    # número de slide (sutil)
    parts.append(f'<text x="{W-70}" y="70" font-family="{FONT}" font-size="24" font-weight="400" '
                 f'fill="rgba(255,255,255,0.2)" text-anchor="end">{slide_num}/5</text>')

    # banderas
    FLAG_CY = 280
    parts.append(flag_img(code_h, 310, FLAG_CY, clip_id='fch'))
    parts.append(flag_img(code_a, W-310, FLAG_CY, clip_id='fca'))

    # "VS"
    parts.append(f'<text x="{CX}" y="{FLAG_CY+18}" font-family="{FONT}" font-size="44" font-weight="700" '
                 f'fill="{GOLD}" text-anchor="middle">VS</text>')

    # nombres equipos
    NAME_Y = FLAG_CY + 90
    parts.append(f'<text x="310" y="{NAME_Y}" font-family="{FONT}" font-size="36" font-weight="600" '
                 f'fill="{WHITE}" text-anchor="middle">{esc(team_h)}</text>')
    parts.append(f'<text x="{W-310}" y="{NAME_Y}" font-family="{FONT}" font-size="36" font-weight="600" '
                 f'fill="{WHITE}" text-anchor="middle">{esc(team_a)}</text>')

    # separador
    parts.append(f'<line x1="80" y1="{NAME_Y+40}" x2="{W-80}" y2="{NAME_Y+40}" '
                 f'stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # bloque prediccion
    PRED_TOP = NAME_Y + 76
    parts.append(prediction_block(CX, PRED_TOP, 'NUESTRA PREDICCIÓN:', pred_text))

    return base_svg(''.join(parts))

# ─── SLIDE 5: CTA ─────────────────────────────────────────────────────────────
def slide5():
    parts = []
    parts.append(f'<line x1="80" y1="90" x2="{W-80}" y2="90" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')
    parts.append(f'<line x1="80" y1="{H-90}" x2="{W-80}" y2="{H-90}" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.3"/>')

    LINE_H = 100
    LINES = [
        [('Esto no es suerte.', WHITE)],
        [('Son +14.000 partidos de data.', WHITE)],
        [('Pruébalo antes del ', WHITE), ('próximo partido.', GOLD)],
    ]
    n = len(LINES)
    start_y = CY - (n * LINE_H) // 2 - 60

    for i, line in enumerate(LINES):
        y = start_y + i * LINE_H
        tspans = ''.join(f'<tspan fill="{c}">{esc(t)}</tspan>' for t, c in line)
        parts.append(f'<text x="{CX}" y="{y}" font-family="{FONT}" font-size="62" font-weight="600" '
                     f'text-anchor="middle">{tspans}</text>')

    # CTA pill
    CTA_W, CTA_H = 860, 80
    cta_x = CX - CTA_W // 2
    cta_y = start_y + n * LINE_H + 48
    parts.append(f'<rect x="{cta_x}" y="{cta_y}" width="{CTA_W}" height="{CTA_H}" rx="40" fill="{GOLD}"/>')
    parts.append(f'<text x="{CX}" y="{cta_y + CTA_H//2 + 13}" font-family="{FONT}" font-size="32" font-weight="600" '
                 f'fill="#0a0f1e" text-anchor="middle">{esc("Link en bio → guessbet.vercel.app")}</text>')

    # logo
    parts.append(logo_gb(CX, H - 130, size=50))
    return base_svg(''.join(parts))

# ─── Render ───────────────────────────────────────────────────────────────────
def render(svg: str, slug: str):
    svg_path = os.path.join(OUT_DIR, f'{slug}.svg')
    png_path = os.path.join(OUT_DIR, f'{slug}.png')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, svg_path, png_path, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')

if __name__ == '__main__':
    render(slide1(), 'slide1')
    render(slide_match('za', 'ca', 'Sudáfrica', 'Canadá',  'Gana Canadá',         '2'), 'slide2')
    render(slide_match('jo', 'ar', 'Jordania',  'Argentina','Más de 2.5 goles',    '3'), 'slide3')
    render(slide_match('uy', 'es', 'Uruguay',   'España',   'NO ambos anotan',     '4'), 'slide4')
    render(slide5(), 'slide5')
    print('\nListo. Archivos en public/marketing/ig-posts/carrusel_lanzamiento/')
