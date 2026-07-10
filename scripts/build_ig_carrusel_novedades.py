"""
Carrusel Instagram "Novedades GuessBet" — 7 slides 1080x1080. Enfoque narrativo.
Uso: python scripts/build_ig_carrusel_novedades.py
"""
import os, subprocess

RESVG   = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'novedades')
os.makedirs(OUT_DIR, exist_ok=True)

W, H  = 1080, 1080
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

def svg_open():
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
        f'<defs>'
        f'<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="#13131a"/><stop offset="100%" stop-color="#0a0a0a"/>'
        f'</linearGradient>'
        f'<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0%" stop-color="#b8911f"/><stop offset="50%" stop-color="#e8c45a"/><stop offset="100%" stop-color="#b8911f"/>'
        f'</linearGradient>'
        f'</defs>'
        f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
        f'<rect x="0" y="0" width="{W}" height="5" fill="{GOLD}"/>'
        f'<rect x="0" y="{H-5}" width="{W}" height="5" fill="{GOLD}"/>'
    )

def header_row(slide_idx, total=7):
    dots = ''.join(
        f'<circle cx="{W-44-(total-1-i)*20}" cy="50" r="5" fill="{"#C9A227" if i==slide_idx else "rgba(255,255,255,0.15)"}"/>'
        for i in range(total)
    )
    return (
        f'<circle cx="50" cy="50" r="19" fill="none" stroke="{GOLD}" stroke-width="1.5"/>'
        f'<text x="50" y="57" font-family="{FONT}" font-size="15" font-weight="700" fill="{GOLD}" text-anchor="middle">G</text>'
        f'<text x="82" y="57" font-family="{FONT}" font-size="19" fill="{WHITE}" letter-spacing="1">guess_bet</text>'
        + dots +
        f'<line x1="36" y1="82" x2="{W-36}" y2="82" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>'
    )

def divider(y):
    return f'<line x1="60" y1="{y}" x2="{W-60}" y2="{y}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>'

def cta(y=964):
    bw, bh = 820, 66
    bx = (W-bw)//2
    return (
        f'<rect x="{bx}" y="{y}" width="{bw}" height="{bh}" rx="33" fill="url(#gold)"/>'
        f'<text x="{W//2}" y="{y+bh//2+11}" font-family="{FONT}" font-size="26" font-weight="700" '
        f'fill="#0a0a0a" text-anchor="middle">Pruébalo → guessbet.vercel.app</text>'
    )

# ─── SLIDE 1: PORTADA ────────────────────────────────────────────────────────
def slide_cover():
    parts = [svg_open(), header_row(0)]

    bw = 260
    parts.append(f'<rect x="{(W-bw)//2}" y="100" width="{bw}" height="38" rx="19" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.35)" stroke-width="1"/>')
    parts.append(f'<text x="{W//2}" y="125" font-family="{FONT}" font-size="17" font-weight="600" fill="{GOLD}" text-anchor="middle" letter-spacing="2">MUNDIAL 2026</text>')

    ICY = 280
    for r, op in [(140,0.04),(110,0.06),(80,0.09)]:
        parts.append(f'<circle cx="{W//2}" cy="{ICY}" r="{r}" fill="none" stroke="rgba(201,162,39,{op})" stroke-width="1"/>')
    parts.append(f'<circle cx="{W//2}" cy="{ICY}" r="76" fill="rgba(201,162,39,0.10)" stroke="rgba(201,162,39,0.28)" stroke-width="2"/>')
    parts.append(f'<text x="{W//2}" y="{ICY+28}" font-family="Segoe UI Emoji,Arial" font-size="70" fill="{GOLD}" text-anchor="middle">⚡</text>')

    parts.append(f'<text x="{W//2}" y="408" font-family="{FONT}" font-size="24" font-weight="400" fill="rgba(255,255,255,0.38)" text-anchor="middle" letter-spacing="8">NOVEDADES</text>')
    parts.append(f'<text x="{W//2}" y="498" font-family="{FONT}" font-size="88" font-weight="900" fill="{WHITE}" text-anchor="middle">GuessBet</text>')
    parts.append(f'<text x="{W//2}" y="558" font-family="{FONT}" font-size="36" font-weight="400" fill="{GOLD}" text-anchor="middle">se actualiza</text>')

    parts.append(divider(600))

    parts.append(f'<text x="{W//2}" y="654" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.50)" text-anchor="middle">5 mejoras que cambian la experiencia.</text>')
    parts.append(f'<text x="{W//2}" y="700" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.50)" text-anchor="middle">Desliza para verlas 👉</text>')

    parts.append(divider(748))

    features = ['Marcador exacto','Factor goleadores','Alineaciones -1h','Datos transparentes','Cuota justa']
    pill_w = 290
    for i, feat in enumerate(features):
        px = 60 if i % 2 == 0 else W - 60 - pill_w
        if i == 4: px = (W - pill_w) // 2
        py = 772 + (i // 2) * 62
        parts.append(f'<rect x="{px}" y="{py}" width="{pill_w}" height="46" rx="23" fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.22)" stroke-width="1"/>')
        parts.append(f'<text x="{px+pill_w//2}" y="{py+30}" font-family="{FONT}" font-size="20" font-weight="500" fill="rgba(255,255,255,0.70)" text-anchor="middle">✦ {esc(feat)}</text>')

    parts.append('</svg>')
    return ''.join(parts)


# ─── SLIDE FEATURE ───────────────────────────────────────────────────────────
def feature_slide(slide_idx, num_label, emoji, title1, title2, hook, body_bullets):
    """
    hook: frase corta que engancha (máx 1 línea)
    body_bullets: lista de 3 strings narrativos
    """
    parts = [svg_open(), header_row(slide_idx)]

    parts.append(f'<text x="60" y="118" font-family="{FONT}" font-size="20" font-weight="700" fill="{GOLD}" letter-spacing="3">{esc(num_label)}</text>')

    # Ícono
    parts.append(f'<circle cx="{W//2}" cy="228" r="66" fill="rgba(201,162,39,0.09)" stroke="rgba(201,162,39,0.25)" stroke-width="1.5"/>')
    parts.append(f'<text x="{W//2}" y="256" font-family="Segoe UI Emoji,Arial" font-size="60" text-anchor="middle">{emoji}</text>')

    # Título
    parts.append(f'<text x="{W//2}" y="348" font-family="{FONT}" font-size="58" font-weight="900" fill="{WHITE}" text-anchor="middle">{esc(title1)}</text>')
    parts.append(f'<text x="{W//2}" y="418" font-family="{FONT}" font-size="58" font-weight="900" fill="{GOLD}" text-anchor="middle">{esc(title2)}</text>')

    # Hook
    parts.append(f'<text x="{W//2}" y="472" font-family="{FONT}" font-size="26" fill="rgba(255,255,255,0.45)" text-anchor="middle">{hook}</text>')

    parts.append(divider(510))

    # Bullets narrativos — sin datos técnicos
    BULLET_TOP = 544
    LINE_H = 128
    for i, bullet in enumerate(body_bullets):
        by = BULLET_TOP + i * LINE_H
        parts.append(f'<rect x="60" y="{by}" width="{W-120}" height="108" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(201,162,39,0.12)" stroke-width="1"/>')
        parts.append(f'<rect x="60" y="{by}" width="5" height="108" rx="2" fill="{GOLD}"/>')
        # título del bullet (parte antes de " | ")
        if ' | ' in bullet:
            title_b, desc_b = bullet.split(' | ', 1)
            parts.append(f'<text x="86" y="{by+42}" font-family="{FONT}" font-size="26" font-weight="700" fill="{WHITE}">{esc(title_b)}</text>')
            parts.append(f'<text x="86" y="{by+76}" font-family="{FONT}" font-size="23" fill="rgba(255,255,255,0.52)">{esc(desc_b)}</text>')
        else:
            parts.append(f'<text x="86" y="{by+58}" font-family="{FONT}" font-size="26" font-weight="500" fill="{WHITE}">{esc(bullet)}</text>')

    parts.append(cta())
    parts.append('</svg>')
    return ''.join(parts)


# ─── SLIDE 7: CTA FINAL ──────────────────────────────────────────────────────
def slide_cta():
    parts = [svg_open(), header_row(6)]

    cy = 300
    for r, op in [(200,0.04),(150,0.06),(100,0.09)]:
        parts.append(f'<circle cx="{W//2}" cy="{cy}" r="{r}" fill="none" stroke="rgba(201,162,39,{op})" stroke-width="1"/>')
    parts.append(f'<circle cx="{W//2}" cy="{cy}" r="72" fill="rgba(201,162,39,0.10)" stroke="rgba(201,162,39,0.28)" stroke-width="2"/>')
    parts.append(f'<text x="{W//2}" y="{cy+26}" font-family="{FONT}" font-size="60" font-weight="900" fill="{GOLD}" text-anchor="middle">✓</text>')

    parts.append(f'<text x="{W//2}" y="{cy+140}" font-family="{FONT}" font-size="52" font-weight="900" fill="{WHITE}" text-anchor="middle">5 mejoras.</text>')
    parts.append(f'<text x="{W//2}" y="{cy+206}" font-family="{FONT}" font-size="52" font-weight="900" fill="{GOLD}" text-anchor="middle">Un solo objetivo.</text>')
    parts.append(f'<text x="{W//2}" y="{cy+262}" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.42)" text-anchor="middle">Que apuestes con datos, no con el corazón.</text>')

    parts.append(divider(cy+302))

    items = ['Marcador exacto','Factor goleadores','Alineaciones -1h','Datos transparentes','Cuota justa']
    for i, item in enumerate(items):
        cx_list = [270, 810, 270, 810, W//2]
        iy = cy + 366 + (i // 2) * 64
        parts.append(f'<text x="{cx_list[i]}" y="{iy}" font-family="{FONT}" font-size="26" font-weight="500" fill="rgba(255,255,255,0.62)" text-anchor="middle">✦ {esc(item)}</text>')

    bw, bh = 860, 72
    bx = (W-bw)//2
    parts.append(f'<rect x="{bx}" y="936" width="{bw}" height="{bh}" rx="36" fill="url(#gold)"/>')
    parts.append(f'<text x="{W//2}" y="{936 + bh//2 + 12}" font-family="{FONT}" font-size="28" font-weight="700" fill="#0a0a0a" text-anchor="middle">Entra gratis → guessbet.vercel.app</text>')

    parts.append(f'<text x="{W//2}" y="1044" font-family="{FONT}" font-size="20" fill="rgba(255,255,255,0.22)" text-anchor="middle">Modelo ELO + Poisson · +14.000 partidos analizados</text>')
    parts.append('</svg>')
    return ''.join(parts)


# ─── RENDER ──────────────────────────────────────────────────────────────────
def render(svg, slug):
    sp = os.path.join(OUT_DIR, f'{slug}.svg')
    pp = os.path.join(OUT_DIR, f'{slug}.png')
    with open(sp, 'w', encoding='utf-8') as f: f.write(svg)
    subprocess.run([RESVG, sp, pp, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')


SLIDES = [
    ('slide1_cover', slide_cover),

    # 01 — Marcador exacto
    ('slide2_marcador', lambda: feature_slide(
        1, '01 / 05', '🎯', 'Marcador', 'exacto.',
        'Ahora sabes el resultado más probable, no solo el ganador.',
        [
            'El modelo calcula los 6 marcadores más probables | con su porcentaje y su cuota justa.',
            'El resultado más probable aparece destacado | para que no tengas que interpretar nada.',
            '1-0, 0-0, 2-1... | con probabilidad real, no intuición.',
        ]
    )),

    # 02 — Factor goleadores
    ('slide3_goleadores', lambda: feature_slide(
        2, '02 / 05', '⚽', 'Si el crack', 'no juega, cambia.',
        'El análisis se ajusta según quién está en el once.',
        [
            'Detectamos si el goleador del torneo juega o no | y ajustamos el peligro ofensivo.',
            'Cada gol que marcó en el torneo sube ligeramente el ataque de su equipo | hasta un tope razonable.',
            'Porque Mbappé en cancha no es lo mismo que Mbappé en la tribuna.',
        ]
    )),

    # 03 — Alineaciones -1h
    ('slide4_alineaciones', lambda: feature_slide(
        3, '03 / 05', '📋', 'El once,', '1 hora antes.',
        'La alineación confirmada aparece en la app antes del pitazo.',
        [
            'Usamos FotMob, que publica los onces cuando los equipos los anuncian oficialmente.',
            'Sin tener que buscar en Twitter ni en otro lado | está todo en un solo lugar.',
            'El análisis siempre parte del once real | no de suposiciones.',
        ]
    )),

    # 04 — Sección "Basado en" + stats reales
    ('slide5_basado_en', lambda: feature_slide(
        4, '04 / 05', '📊', 'Nada es', 'una caja negra.',
        'Ves exactamente qué datos respaldan cada predicción.',
        [
            'Mostramos el xG, el ELO y los stats reales del torneo por equipo | córners, tiros, amarillas.',
            'Los datos vienen de los partidos ya jugados en el Mundial | no de promedios históricos genéricos.',
            'Para que sepas si el modelo tiene base sólida | o está operando con poca información.',
        ]
    )),

    # 05 — Stats reales en Otras Opciones
    ('slide6_cuota_justa', lambda: feature_slide(
        5, '05 / 05', '💰','Otras opciones', 'con datos reales.',
        'Over/Under y BTTS calculados con stats del torneo.',
        [
            'Córners, goles, tiros: usamos los promedios reales del Mundial | no datos de temporada.',
            'Si el equipo jugó 2+ partidos, el modelo usa sus propios números | si no, usa el promedio del torneo.',
            'Y te mostramos la fuente: sabes si viene de datos propios | o del promedio general.',
        ]
    )),

    ('slide7_cta', slide_cta),
]

if __name__ == '__main__':
    for slug, fn in SLIDES:
        render(fn(), slug)
    print(f'\nListo. {len(SLIDES)} slides en public/marketing/ig-posts/novedades/')
