"""
Carrusel Instagram "Novedades GuessBet" — 7 slides 1080x1080
Uso: python scripts/build_ig_carrusel_novedades.py
"""
import os, subprocess

RESVG   = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'novedades')
os.makedirs(OUT_DIR, exist_ok=True)

W, H  = 1080, 1080
BLACK = '#0a0a0a'
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

# ─── BASE SVG ────────────────────────────────────────────────────────────────
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
        f'<linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0%" stop-color="#C9A227"/><stop offset="100%" stop-color="#e8c45a"/>'
        f'</linearGradient>'
        f'</defs>'
        f'<rect width="{W}" height="{H}" fill="url(#bg)"/>'
        f'<rect x="0" y="0" width="{W}" height="5" fill="{GOLD}"/>'
        f'<rect x="0" y="{H-5}" width="{W}" height="5" fill="{GOLD}"/>'
    )

def header_row(slide_idx, total=7):
    # logo izquierda + puntos derecha
    dots = ''.join(
        f'<circle cx="{W-44-(total-1-i)*20}" cy="50" r="5" fill="{"#C9A227" if i==slide_idx else "rgba(255,255,255,0.15)"}"/>'
        for i in range(total)
    )
    return (
        f'<circle cx="50" cy="50" r="19" fill="none" stroke="{GOLD}" stroke-width="1.5"/>'
        f'<text x="50" y="57" font-family="{FONT}" font-size="15" font-weight="700" fill="{GOLD}" text-anchor="middle">G</text>'
        f'<text x="82" y="57" font-family="{FONT}" font-size="19" font-weight="400" fill="{WHITE}" letter-spacing="1">guess_bet</text>'
        + dots +
        f'<line x1="36" y1="82" x2="{W-36}" y2="82" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>'
    )

def divider(y):
    return f'<line x1="60" y1="{y}" x2="{W-60}" y2="{y}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>'

def cta(y=990, label="Pruébalo → guessbet.vercel.app"):
    bw, bh = 820, 66
    bx = (W-bw)//2
    return (
        f'<rect x="{bx}" y="{y}" width="{bw}" height="{bh}" rx="33" fill="url(#gold)"/>'
        f'<text x="{W//2}" y="{y+bh//2+11}" font-family="{FONT}" font-size="26" font-weight="700" '
        f'fill="#0a0a0a" text-anchor="middle">{esc(label)}</text>'
    )

# ─── SLIDE 1: PORTADA ────────────────────────────────────────────────────────
def slide_cover():
    parts = [svg_open(), header_row(0)]

    # Badge fase arriba
    bw = 260
    parts.append(f'<rect x="{(W-bw)//2}" y="100" width="{bw}" height="38" rx="19" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.35)" stroke-width="1"/>')
    parts.append(f'<text x="{W//2}" y="125" font-family="{FONT}" font-size="17" font-weight="600" fill="{GOLD}" text-anchor="middle" letter-spacing="2">MUNDIAL 2026</text>')

    # Ícono grande
    ICY = 280
    for r,op in [(140,0.04),(110,0.06),(80,0.09)]:
        parts.append(f'<circle cx="{W//2}" cy="{ICY}" r="{r}" fill="none" stroke="rgba(201,162,39,{op})" stroke-width="1"/>')
    parts.append(f'<circle cx="{W//2}" cy="{ICY}" r="76" fill="rgba(201,162,39,0.10)" stroke="rgba(201,162,39,0.28)" stroke-width="2"/>')
    parts.append(f'<text x="{W//2}" y="{ICY+28}" font-family="Segoe UI Emoji,Arial" font-size="70" fill="{GOLD}" text-anchor="middle">⚡</text>')

    # Títulos
    parts.append(f'<text x="{W//2}" y="408" font-family="{FONT}" font-size="24" font-weight="400" fill="rgba(255,255,255,0.38)" text-anchor="middle" letter-spacing="8">NOVEDADES</text>')
    parts.append(f'<text x="{W//2}" y="498" font-family="{FONT}" font-size="88" font-weight="900" fill="{WHITE}" text-anchor="middle">GuessBet</text>')
    parts.append(f'<text x="{W//2}" y="558" font-family="{FONT}" font-size="36" font-weight="400" fill="{GOLD}" text-anchor="middle">se actualiza</text>')

    parts.append(divider(600))

    parts.append(f'<text x="{W//2}" y="654" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.50)" text-anchor="middle">5 mejoras que cambian la experiencia.</text>')
    parts.append(f'<text x="{W//2}" y="700" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.50)" text-anchor="middle">Desliza para verlas 👉</text>')

    parts.append(divider(748))

    # Pills con los 5 features
    features = ['Marcador exacto','Factor goleadores','Alineaciones -1h','Datos transparentes','Cuota justa']
    pill_w = 290
    for i, feat in enumerate(features):
        col = i % 2
        row = i // 2
        if i == 4:  # último centrado
            px = (W - pill_w) // 2
        else:
            px = 80 + col * (W - 80*2 - pill_w*2 + pill_w + 60) if col == 0 else W - 80 - pill_w
            # simplificado:
            px = 60 if col == 0 else W - 60 - pill_w
        py = 772 + row * 62
        parts.append(f'<rect x="{px}" y="{py}" width="{pill_w}" height="46" rx="23" fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.22)" stroke-width="1"/>')
        parts.append(f'<text x="{px+pill_w//2}" y="{py+30}" font-family="{FONT}" font-size="20" font-weight="500" fill="rgba(255,255,255,0.70)" text-anchor="middle">✦ {esc(feat)}</text>')

    parts.append('</svg>')
    return ''.join(parts)

# ─── SLIDE FEATURE (plantilla) ───────────────────────────────────────────────
def feature_slide(slide_idx, num_label, title1, title2, subtitle1, subtitle2, body_svg):
    parts = [svg_open(), header_row(slide_idx)]

    # Número
    parts.append(f'<text x="60" y="118" font-family="{FONT}" font-size="20" font-weight="700" fill="{GOLD}" letter-spacing="3">{esc(num_label)}</text>')

    # Título grande — subido para aprovechar espacio superior
    parts.append(f'<text x="{W//2}" y="210" font-family="{FONT}" font-size="66" font-weight="900" fill="{WHITE}" text-anchor="middle">{esc(title1)}</text>')
    parts.append(f'<text x="{W//2}" y="288" font-family="{FONT}" font-size="66" font-weight="900" fill="{GOLD}" text-anchor="middle">{esc(title2)}</text>')

    # Subtítulo — sin pasar por esc() para preservar UTF-8
    parts.append(f'<text x="{W//2}" y="344" font-family="{FONT}" font-size="26" fill="rgba(255,255,255,0.45)" text-anchor="middle">{subtitle1}</text>')
    if subtitle2:
        parts.append(f'<text x="{W//2}" y="378" font-family="{FONT}" font-size="26" fill="rgba(255,255,255,0.45)" text-anchor="middle">{subtitle2}</text>')

    sep_y = 414 if subtitle2 else 390
    parts.append(divider(sep_y))

    # Cuerpo (contenido visual específico de cada slide)
    parts.append(body_svg)

    parts.append(cta(y=962))
    parts.append('</svg>')
    return ''.join(parts)

# ─── CUERPOS DE CADA SLIDE ───────────────────────────────────────────────────

def body_marcador():
    # 4 filas marcador distribuidas entre y=450 y y=910
    rows = [('1 – 0','18.4%',True),('0 – 0','12.1%',False),('2 – 0','10.3%',False),('1 – 1','9.6%',False)]
    out = []
    for i,(score,pct,fav) in enumerate(rows):
        ry = 450 + i*116
        bg     = 'rgba(201,162,39,0.10)' if fav else 'rgba(255,255,255,0.03)'
        border = 'rgba(201,162,39,0.35)' if fav else 'rgba(255,255,255,0.06)'
        sc_col = GOLD if fav else WHITE
        out.append(f'<rect x="60" y="{ry}" width="{W-120}" height="96" rx="12" fill="{bg}" stroke="{border}" stroke-width="1"/>')
        out.append(f'<text x="106" y="{ry+58}" font-family="{FONT}" font-size="24" font-weight="700" fill="rgba(255,255,255,0.30)">#{i+1}</text>')
        out.append(f'<text x="{W//2}" y="{ry+58}" font-family="{FONT}" font-size="40" font-weight="700" fill="{sc_col}" text-anchor="middle">{esc(score)}</text>')
        out.append(f'<text x="{W-106}" y="{ry+58}" font-family="{FONT}" font-size="36" font-weight="700" fill="{sc_col}" text-anchor="end">{esc(pct)}</text>')
    out.append(f'<text x="{W//2}" y="920" font-family="{FONT}" font-size="22" fill="rgba(255,255,255,0.28)" text-anchor="middle">Disponible en la pestaña Calcular</text>')
    return ''.join(out)

def body_goleadores():
    out = []
    cases = [('Con el goleador titular','xG +12%',True),('Sin el goleador titular','xG -18%',False)]
    for i,(label,val,fav) in enumerate(cases):
        ry = 450 + i*230
        bg     = 'rgba(201,162,39,0.09)' if fav else 'rgba(255,255,255,0.03)'
        border = 'rgba(201,162,39,0.30)' if fav else 'rgba(255,255,255,0.06)'
        vc     = GOLD if fav else 'rgba(255,255,255,0.55)'
        out.append(f'<rect x="60" y="{ry}" width="{W-120}" height="200" rx="14" fill="{bg}" stroke="{border}" stroke-width="1"/>')
        out.append(f'<text x="104" y="{ry+58}" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.40)">{esc(label)}</text>')
        out.append(f'<text x="104" y="{ry+140}" font-family="{FONT}" font-size="72" font-weight="900" fill="{vc}">{esc(val)}</text>')
    out.append(f'<text x="{W//2}" y="930" font-family="{FONT}" font-size="22" fill="rgba(255,255,255,0.28)" text-anchor="middle">Datos de alineaciones del torneo en tiempo real.</text>')
    return ''.join(out)

def body_alineaciones():
    out = []
    steps = [
        ('-60 min', 'Alineaciones confirmadas', True),
        ('-30 min', 'Modelo actualiza el análisis', True),
        ('Kickoff',  'Partido en vivo',          False),
    ]
    LINE_X = 116
    for i,(time_lbl,desc,done) in enumerate(steps):
        sy = 450 + i*168
        if i < len(steps)-1:
            out.append(f'<line x1="{LINE_X}" y1="{sy+44}" x2="{LINE_X}" y2="{sy+168}" stroke="rgba(201,162,39,0.20)" stroke-width="2" stroke-dasharray="6 4"/>')
        fill = GOLD if done else 'rgba(255,255,255,0.08)'
        out.append(f'<circle cx="{LINE_X}" cy="{sy+22}" r="22" fill="{fill}" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>')
        if done:
            out.append(f'<text x="{LINE_X}" y="{sy+30}" font-family="{FONT}" font-size="20" fill="#0a0a0a" text-anchor="middle" font-weight="700">✓</text>')
        tc = GOLD if done else 'rgba(255,255,255,0.35)'
        out.append(f'<text x="{LINE_X+52}" y="{sy+20}" font-family="{FONT}" font-size="22" font-weight="700" fill="{tc}">{esc(time_lbl)}</text>')
        out.append(f'<text x="{LINE_X+52}" y="{sy+56}" font-family="{FONT}" font-size="36" font-weight="500" fill="{WHITE}">{esc(desc)}</text>')
    out.append(f'<text x="{W//2}" y="930" font-family="{FONT}" font-size="22" fill="rgba(255,255,255,0.28)" text-anchor="middle">Fuentes: FotMob · SofaScore · ESPN</text>')
    return ''.join(out)

def body_basado_en():
    out = []
    items = [
        ('ELO del equipo',           '1849 pts'),
        ('xG promedio del torneo',   '1.46 / partido'),
        ('Defensa real del Mundial', '0.72 xG en contra'),
    ]
    for i,(label,val) in enumerate(items):
        ry = 450 + i*168
        out.append(f'<rect x="60" y="{ry}" width="{W-120}" height="140" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(201,162,39,0.14)" stroke-width="1"/>')
        out.append(f'<rect x="60" y="{ry}" width="6" height="140" rx="3" fill="{GOLD}"/>')
        out.append(f'<text x="92" y="{ry+44}" font-family="{FONT}" font-size="22" fill="rgba(255,255,255,0.38)">{esc(label)}</text>')
        out.append(f'<text x="92" y="{ry+104}" font-family="{FONT}" font-size="44" font-weight="700" fill="{WHITE}">{esc(val)}</text>')
    out.append(f'<text x="{W//2}" y="930" font-family="{FONT}" font-size="22" fill="rgba(255,255,255,0.28)" text-anchor="middle">Sección "Basado en" · Cada análisis</text>')
    return ''.join(out)

def body_cuota_justa():
    out = []
    out.append(f'<rect x="60" y="450" width="{W-120}" height="460" rx="16" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>')
    out.append(f'<text x="230" y="500" font-family="{FONT}" font-size="22" font-weight="600" fill="rgba(255,255,255,0.38)" text-anchor="middle">Cuota Justa</text>')
    out.append(f'<text x="560" y="500" font-family="{FONT}" font-size="22" font-weight="600" fill="rgba(255,255,255,0.38)" text-anchor="middle">Tu bookie</text>')
    out.append(f'<text x="860" y="500" font-family="{FONT}" font-size="22" font-weight="600" fill="rgba(255,255,255,0.38)" text-anchor="middle">Ventaja</text>')
    out.append(f'<line x1="78" y1="516" x2="{W-78}" y2="516" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>')
    rows = [
        ('+2.5 goles','2.30','1.95','▲ Valor',GOLD,'rgba(201,162,39,0.09)','rgba(201,162,39,0.25)'),
        ('-2.5 goles','1.80','1.75','≈ Neutro','rgba(255,255,255,0.50)','rgba(255,255,255,0.02)','rgba(255,255,255,0.06)'),
    ]
    for i,(label,justa,bookie,ventaja,vc,bg,border) in enumerate(rows):
        ry = 538 + i*186
        out.append(f'<rect x="78" y="{ry}" width="{W-156}" height="158" rx="10" fill="{bg}" stroke="{border}" stroke-width="1"/>')
        out.append(f'<text x="110" y="{ry+48}" font-family="{FONT}" font-size="24" fill="rgba(255,255,255,0.45)">{esc(label)}</text>')
        out.append(f'<text x="230" y="{ry+120}" font-family="{FONT}" font-size="56" font-weight="900" fill="{GOLD}" text-anchor="middle">{esc(justa)}</text>')
        out.append(f'<text x="560" y="{ry+120}" font-family="{FONT}" font-size="56" font-weight="400" fill="rgba(255,255,255,0.38)" text-anchor="middle">{esc(bookie)}</text>')
        out.append(f'<text x="860" y="{ry+120}" font-family="{FONT}" font-size="34" font-weight="700" fill="{vc}" text-anchor="middle">{esc(ventaja)}</text>')
    out.append(f'<text x="{W//2}" y="930" font-family="{FONT}" font-size="22" fill="rgba(255,255,255,0.30)" text-anchor="middle">Si cuota justa &gt; bookie → hay valor real.</text>')
    return ''.join(out)

# ─── SLIDE 7: CTA FINAL ──────────────────────────────────────────────────────
def slide_cta():
    parts = [svg_open(), header_row(6)]

    cy = 430
    for r,op in [(290,0.04),(210,0.06),(130,0.09)]:
        parts.append(f'<circle cx="{W//2}" cy="{cy}" r="{r}" fill="none" stroke="rgba(201,162,39,{op})" stroke-width="1"/>')
    parts.append(f'<circle cx="{W//2}" cy="{cy}" r="76" fill="rgba(201,162,39,0.10)" stroke="rgba(201,162,39,0.28)" stroke-width="2"/>')
    parts.append(f'<text x="{W//2}" y="{cy+25}" font-family="{FONT}" font-size="64" font-weight="900" fill="{GOLD}" text-anchor="middle">✓</text>')

    parts.append(f'<text x="{W//2}" y="{cy+146}" font-family="{FONT}" font-size="52" font-weight="900" fill="{WHITE}" text-anchor="middle">5 mejoras.</text>')
    parts.append(f'<text x="{W//2}" y="{cy+212}" font-family="{FONT}" font-size="52" font-weight="900" fill="{GOLD}" text-anchor="middle">Un solo objetivo.</text>')
    parts.append(f'<text x="{W//2}" y="{cy+268}" font-family="{FONT}" font-size="28" fill="rgba(255,255,255,0.42)" text-anchor="middle">Que apuestes con datos, no con el corazón.</text>')

    parts.append(divider(cy+306))

    items = ['Marcador exacto','Factor goleadores','Alineaciones -1h','Datos transparentes','Cuota justa']
    for i,item in enumerate(items):
        col_x = [270,810,270,810,W//2][i]
        iy = cy+368 + (i//2)*64
        parts.append(f'<text x="{col_x}" y="{iy}" font-family="{FONT}" font-size="26" font-weight="500" fill="rgba(255,255,255,0.62)" text-anchor="middle">✦ {esc(item)}</text>')

    parts.append(cta(y=936, label="Entra gratis → guessbet.vercel.app"))
    parts.append(f'<text x="{W//2}" y="1042" font-family="{FONT}" font-size="20" fill="rgba(255,255,255,0.22)" text-anchor="middle">+14.000 partidos analizados · ELO + Poisson</text>')
    parts.append('</svg>')
    return ''.join(parts)

# ─── RENDER ──────────────────────────────────────────────────────────────────
def render(svg, slug):
    sp = os.path.join(OUT_DIR, f'{slug}.svg')
    pp = os.path.join(OUT_DIR, f'{slug}.png')
    with open(sp, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, sp, pp, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')

SLIDES = [
    ('slide1_cover',       lambda: slide_cover()),
    ('slide2_marcador',    lambda: feature_slide(1,'01 / 05','Marcador','exacto','El modelo predice el marcador más probable','usando distribución de Poisson.',body_marcador())),
    ('slide3_goleadores',  lambda: feature_slide(2,'02 / 05','Si el goleador','no juega, cambia.','El xG se ajusta según si los goleadores','del torneo están en el once titular.',body_goleadores())),
    ('slide4_alineaciones',lambda: feature_slide(3,'03 / 05','Alineaciones','1 hora antes.','La app muestra el once confirmado','~60 minutos antes del kickoff.',body_alineaciones())),
    ('slide5_basado_en',   lambda: feature_slide(4,'04 / 05','Transparencia','total.','Ves exactamente qué datos usó el modelo','para calcular tu análisis.',body_basado_en())),
    ('slide6_cuota_justa', lambda: feature_slide(5,'05 / 05','La cuota','que deberías pedir.','Para Over/Under 2.5, calculamos la cuota','justa y la comparas con tu bookie.',body_cuota_justa())),
    ('slide7_cta',         lambda: slide_cta()),
]

if __name__ == '__main__':
    for slug, fn in SLIDES:
        render(fn(), slug)
    print(f'\nListo. {len(SLIDES)} slides en public/marketing/ig-posts/novedades/')
