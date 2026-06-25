import re, os, subprocess

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
ICONS_DIR = r'C:\Users\Isabella\AppData\Local\Temp\icons'
OUT_BASE = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-stories')

W, H = 1080, 1920
BLACK = '#0a0a0a'
GOLD = '#C9A227'
WHITE = '#ffffff'
GRAY = 'rgba(255,255,255,0.6)'
FONT = "Segoe UI, Arial, sans-serif"
CX = W / 2
WEIGHT = 500  # toda la tipografia usa el mismo peso, nunca 600/700, segun specs del agente de Marketing

# Tamanos exactos (escalados 1:1 desde la ficha tecnica del mockup aprobado)
BODY_SIZE, BODY_LH = 78, 104
BODY_SMALL_SIZE, BODY_SMALL_LH = 50, 70
LABEL_SIZE = 48
BIG_NUM_SIZE = 145
CTA_SIZE = 58
PROGRESS_H = 15

def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

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

def progress_bar(n, active_idx, y=70):
    margin = 60
    gap = 12
    total_w = W - margin * 2
    seg_w = (total_w - gap * (n - 1)) / n
    parts = []
    for i in range(n):
        x = margin + i * (seg_w + gap)
        color = GOLD if i == active_idx else 'rgba(255,255,255,0.15)'
        parts.append(f'<rect x="{x}" y="{y}" width="{seg_w}" height="{PROGRESS_H}" rx="{PROGRESS_H/2}" fill="{color}"/>')
    return ''.join(parts)

def rich_text_center(spans, cx, cy, size, line_height, weight=WEIGHT):
    """spans: lista de lineas, cada linea es lista de (texto, color).
    Usa text-anchor=middle nativo de SVG (un solo x en <text>, sin x en los
    tspans) para que el centrado sea exacto sin tener que estimar el ancho
    real de la fuente."""
    n = len(spans)
    start_y = cy - (n - 1) * line_height / 2
    out = []
    for i, line in enumerate(spans):
        y = start_y + i * line_height
        tspans = ''.join(f'<tspan fill="{color}">{esc(t)}</tspan>' for t, color in line)
        out.append(f'<text x="{cx}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" text-anchor="middle">{tspans}</text>')
    return ''.join(out)

def text_block_top(cy, n, line_height, size):
    """Y aproximado del borde superior (ascent) de un bloque de texto centrado en cy."""
    start_y = cy - (n - 1) * line_height / 2
    return start_y - size * 0.8

def icon_above_text(icon_cy_for_text_top, icon_box, gap=60):
    """Centro Y del icono para que quede a 'gap' px por encima del borde
    superior de un bloque de texto, sin solaparse nunca."""
    return icon_cy_for_text_top - gap - icon_box / 2

def cta_pill(text, cx, cy):
    w = len(text) * CTA_SIZE * 0.56 + 110
    h = 110
    x = cx - w / 2
    y = cy - h / 2
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="{GOLD}"/>'
            f'<text x="{cx}" y="{cy + CTA_SIZE*0.32}" font-family="{FONT}" font-size="{CTA_SIZE}" font-weight="{WEIGHT}" fill="{BLACK}" text-anchor="middle">{esc(text)}</text>')

def build_svg(content, total, idx0):
    bar = progress_bar(total, idx0)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="{BLACK}"/>{bar}{content}</svg>'

def render(svg, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    svg_path = out_path.replace('.png', '.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, '-w', str(W), '-h', str(H), svg_path, out_path], check=True)
    print(out_path)

def steps_slide(title, icon, steps):
    parts = icon_svg(icon, CX, 360, 110)
    parts += f'<text x="{CX}" y="520" font-family="{FONT}" font-size="{LABEL_SIZE+12}" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle">{esc(title)}</text>'
    y = 700
    for i, step in enumerate(steps, start=1):
        lines = step.split('\n')
        parts += f'<circle cx="170" cy="{y}" r="38" fill="none" stroke="{GOLD}" stroke-width="3"/>'
        parts += f'<text x="170" y="{y+13}" font-family="{FONT}" font-size="34" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle">{i}</text>'
        for li, line in enumerate(lines):
            parts += f'<text x="240" y="{y - 10 + li*46}" font-family="{FONT}" font-size="38" font-weight="{WEIGHT}" fill="{WHITE}">{esc(line)}</text>'
        y += 90 + 46 * len(lines)
    return parts

# Cada item: (story, idx (1-based), total, contenido_svg_sin_envoltorio)
slides = []

# ── QUE ES (4) ──
slides.append(('que_es', 1, 4, rich_text_center([[('Somos GuessBet.', WHITE)]], CX, H/2, BODY_SIZE, BODY_LH)))
slides.append(('que_es', 2, 4, rich_text_center([
    [('No somos otra', WHITE)],
    [('cuenta de', WHITE)],
    [('pronósticos a ojo.', WHITE)],
], CX, H/2, BODY_SIZE, BODY_LH)))
slides.append(('que_es', 3, 4, rich_text_center([
    [('Dejamos el corazón', WHITE)],
    [('de lado, usamos', WHITE)],
    [('datos.', GOLD)],
], CX, H/2, BODY_SIZE, BODY_LH)))
slides.append(('que_es', 4, 4,
    rich_text_center([
        [('Apostar con cabeza', WHITE)],
        [('> apostar con el', WHITE)],
        [('corazón.', WHITE)],
    ], CX, H/2 - 100, BODY_SIZE, BODY_LH)
    + cta_pill('Conócenos →', CX, H/2 + 260)
))

# ── LA DATA (3) ──
slides.append(('la_data', 1, 3,
    f'<text x="{CX}" y="{H/2 - 130}" font-family="{FONT}" font-size="{LABEL_SIZE}" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle" letter-spacing="2">DEJAMOS EL CORAZÓN DE LADO</text>'
    + rich_text_center([[('Usamos ', WHITE), ('datos.', GOLD)], [('No corazonadas.', WHITE)]], CX, H/2 + 30, BODY_SIZE, BODY_LH)
))
slides.append(('la_data', 2, 3,
    f'<text x="{CX}" y="{H/2 - 10}" font-family="{FONT}" font-size="{BIG_NUM_SIZE}" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle">+14.000</text>'
    + rich_text_center([[('partidos competitivos', WHITE)], [('analizados', WHITE)]], CX, H/2 + 170, BODY_SMALL_SIZE, BODY_SMALL_LH)
))
slides.append(('la_data', 3, 3,
    rich_text_center([
        [('Esa base de datos', WHITE)],
        [('alimenta el', WHITE)],
        [('analizador EN VIVO', GOLD)],
    ], CX, H/2 - 100, BODY_SIZE, BODY_LH)
    + cta_pill('Pruébalo gratis →', CX, H/2 + 260)
))

# ── EN VIVO (3, S2 placeholder de video real) ──
_en_vivo_1_lines = [
    [('¿Y si pudieras ver', WHITE)],
    [('cómo cambia la', WHITE)],
    [('probabilidad', WHITE)],
    [('durante el partido?', WHITE)],
]
_en_vivo_1_cy = H/2 + 60
_en_vivo_1_top = text_block_top(_en_vivo_1_cy, len(_en_vivo_1_lines), BODY_LH, BODY_SIZE)
slides.append(('en_vivo', 1, 3,
    icon_svg('bolt', CX, icon_above_text(_en_vivo_1_top, 130), 130)
    + rich_text_center(_en_vivo_1_lines, CX, _en_vivo_1_cy, BODY_SIZE, BODY_LH)
))
slides.append(('en_vivo', 2, 3,
    f'<rect x="60" y="60" width="{W-120}" height="{H-120}" rx="24" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3" stroke-dasharray="14,10"/>'
    + f'<text x="{CX}" y="{H/2 - 20}" font-family="{FONT}" font-size="42" font-weight="{WEIGHT}" fill="rgba(255,255,255,0.5)" text-anchor="middle">ESPACIO RESERVADO</text>'
    + f'<text x="{CX}" y="{H/2 + 50}" font-family="{FONT}" font-size="32" font-weight="{WEIGHT}" fill="rgba(255,255,255,0.5)" text-anchor="middle">Screen recording real de la app</text>'
    + f'<text x="{CX}" y="{H/2 + 100}" font-family="{FONT}" font-size="28" font-weight="{WEIGHT}" fill="rgba(255,255,255,0.4)" text-anchor="middle">(reemplazar con video — no usar este diseño)</text>'
))
slides.append(('en_vivo', 3, 3,
    rich_text_center([
        [('Mientras el partido', WHITE)],
        [('pasa, nuestros', WHITE)],
        [('datos también', WHITE)],
        [('se mueven.', WHITE)],
    ], CX, H/2 - 100, BODY_SIZE, BODY_LH)
    + cta_pill('Verlo en vivo →', CX, H/2 + 280)
))

# ── COMO USARLA (4) ──
_como_1_lines = [
    [('GuessBet no está', WHITE)],
    [('en tiendas.', WHITE)],
    [('Es ', WHITE), ('web app.', GOLD)],
    [('Funciona igual en', WHITE)],
    [('iPhone y Android.', WHITE)],
]
_como_1_cy = H/2 + 60
_como_1_top = text_block_top(_como_1_cy, len(_como_1_lines), BODY_LH, BODY_SIZE)
slides.append(('como_usarla', 1, 4,
    icon_svg('device-mobile', CX, icon_above_text(_como_1_top, 130), 130)
    + rich_text_center(_como_1_lines, CX, _como_1_cy, BODY_SIZE, BODY_LH)
))
slides.append(('como_usarla', 2, 4, steps_slide('iPhone', 'brand-apple', [
    'Abre guessbet.vercel.app\nen Safari',
    'Toca el ícono de compartir',
    'Agregar a pantalla de inicio',
])))
slides.append(('como_usarla', 3, 4, steps_slide('Android', 'brand-android', [
    'Abre guessbet.vercel.app\nen Chrome',
    'Toca el menú ⋮',
    'Instalar app',
])))
slides.append(('como_usarla', 4, 4,
    rich_text_center([
        [('Listo, ya tienes', WHITE)],
        [('GuessBet', GOLD)],
        [('como una app más', WHITE)],
        [('en tu celular', WHITE)],
    ], CX, H/2 - 120, BODY_SIZE, BODY_LH)
    + cta_pill('Entrar ahora →', CX, H/2 + 280)
))

# ── PREMIUM (3) ──
_premium_1_lines = [[('¿1 apuesta al día', WHITE)], [('te alcanza?', WHITE)]]
_premium_1_cy = H/2 + 40
_premium_1_top = text_block_top(_premium_1_cy, len(_premium_1_lines), BODY_LH, BODY_SIZE)
slides.append(('premium', 1, 3,
    icon_svg('star', CX, icon_above_text(_premium_1_top, 130), 130)
    + rich_text_center(_premium_1_lines, CX, _premium_1_cy, BODY_SIZE, BODY_LH)
))
slides.append(('premium', 2, 3,
    f'<text x="{CX}" y="{H/2 - 220}" font-family="{FONT}" font-size="{LABEL_SIZE}" font-weight="{WEIGHT}" fill="{GRAY}" text-anchor="middle" letter-spacing="3">FREE</text>'
    + rich_text_center([[('1 análisis de', WHITE)], [('apuesta al día', WHITE)]], CX, H/2 - 90, BODY_SIZE, BODY_LH)
    + f'<line x1="180" y1="{H/2 + 40}" x2="{W-180}" y2="{H/2 + 40}" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>'
    + f'<text x="{CX}" y="{H/2 + 150}" font-family="{FONT}" font-size="{LABEL_SIZE}" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle" letter-spacing="3">PREMIUM</text>'
    + rich_text_center([[('Acceso', WHITE)], [('libre e ilimitado', GOLD)]], CX, H/2 + 280, BODY_SIZE, BODY_LH)
))
slides.append(('premium', 3, 3,
    rich_text_center([
        [('Los que apuestan', WHITE)],
        [('en serio, analizan', WHITE)],
        [('todos', GOLD), (' sus partidos.', WHITE)],
    ], CX, H/2 - 100, BODY_SIZE, BODY_LH)
    + cta_pill('Ver planes →', CX, H/2 + 260)
))

# ── FAQ (5) ──
faqs = [
    (['¿Es gratis?'], ['Sí, la base es gratis.', 'Premium es opcional.']),
    (['¿Es legal?'], ['Sí, somos análisis de', 'datos, no una casa', 'de apuestas.']),
    (['¿Qué tan precisos', 'son los datos?'], ['Modelo ELO + 14.000', 'partidos respaldando', 'cada número.']),
    (['¿Tengo que bajarla', 'de una tienda?'], ['No, es web app.', 'Instalación en 3 pasos.']),
]
for i, (q_lines, a_lines) in enumerate(faqs, start=1):
    q_block = [[(l, GOLD)] for l in q_lines]
    a_block = [[(l, WHITE)] for l in a_lines]
    q_h = len(q_lines) * BODY_LH
    content = rich_text_center(q_block, CX, H/2 - 220 + q_h/2, BODY_SIZE, BODY_LH)
    content += rich_text_center(a_block, CX, H/2 + 60, BODY_SMALL_SIZE, BODY_SMALL_LH)
    slides.append(('faq', i, 5, content))
_faq_5_lines = [[('¿Más dudas?', WHITE)], [('Escríbenos al DM.', WHITE)]]
_faq_5_cy = H/2
_faq_5_top = text_block_top(_faq_5_cy, len(_faq_5_lines), BODY_LH, BODY_SIZE)
slides.append(('faq', 5, 5,
    icon_svg('ball-football', CX, icon_above_text(_faq_5_top, 120), 120)
    + rich_text_center(_faq_5_lines, CX, _faq_5_cy, BODY_SIZE, BODY_LH)
    + cta_pill('Pruébala ahora →', CX, H/2 + 280)
))

STORY_LABELS = {
    'que_es': 'QUÉ ES',
    'la_data': 'LA DATA',
    'en_vivo': 'EN VIVO',
    'como_usarla': 'CÓMO USARLA',
    'premium': 'PREMIUM',
    'faq': 'FAQ',
}

def top_label(text):
    return f'<text x="{CX}" y="220" font-family="{FONT}" font-size="{LABEL_SIZE}" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle" letter-spacing="3">{text}</text>'

for story, idx, total, content in slides:
    label = top_label(STORY_LABELS[story])
    svg = build_svg(label + content, total, idx - 1)
    out_path = os.path.join(OUT_BASE, story, f'slide{idx}.png')
    render(svg, out_path)

print('Listo.')
