"""
Genera historias de Instagram "Análisis de partido" para GuessBet.
Produce tanto el ejemplo real (nl_vs_ma) como la plantilla con placeholders.

Uso:
  python scripts/build_ig_match_story.py
"""

import os, subprocess, urllib.request

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-stories', 'partidos')
os.makedirs(OUT_DIR, exist_ok=True)

W, H = 1080, 1920
BLACK = '#0a0a0a'
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

# ─── Flag image (embedded base64 vía data URI) ──────────────────────────────
FLAG_CACHE: dict[str, str] = {}

def flag_b64(code: str) -> str:
    if code in FLAG_CACHE:
        return FLAG_CACHE[code]
    import base64
    url = f'https://flagcdn.com/w80/{code}.png'
    try:
        with urllib.request.urlopen(url, timeout=8) as r:
            data = base64.b64encode(r.read()).decode()
        result = f'data:image/png;base64,{data}'
    except Exception:
        result = ''
    FLAG_CACHE[code] = result
    return result

# ─── SVG builder ─────────────────────────────────────────────────────────────

def build_svg(
    home_name: str,
    away_name: str,
    home_flag_code: str,   # iso alpha-2, e.g. 'nl'. '' → placeholder rect
    away_flag_code: str,
    group_label: str,      # e.g. "MUNDIAL 2026 · GRUPO A · 21:00 hs"
    prob_home: float | str,
    prob_draw: float | str,
    prob_away: float | str,
    summary_points: list[str],  # lista de strings; palabras entre ** se doran
    is_template: bool = False,
) -> str:
    """Devuelve el SVG completo como string."""

    lines: list[str] = []
    def add(*s): lines.extend(s)

    # ── cabecera SVG ──────────────────────────────────────────────────────────
    add(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')

    # fondo
    add(f'<rect width="{W}" height="{H}" fill="{BLACK}"/>')

    # ── barra de progreso (slide única → 100% activa) ─────────────────────────
    BAR_Y = 56
    add(f'<rect x="60" y="{BAR_Y}" width="{W-120}" height="6" rx="3" fill="{GOLD}"/>')

    # ── header: círculo + "guess_bet" ─────────────────────────────────────────
    HDR_Y = 130
    add(f'<circle cx="60" cy="{HDR_Y}" r="24" fill="none" stroke="{GOLD}" stroke-width="2"/>')
    add(f'<circle cx="60" cy="{HDR_Y}" r="18" fill="{GOLD}" fill-opacity="0.18"/>')
    # letras "G" dentro del círculo
    add(f'<text x="60" y="{HDR_Y+5}" font-family="{FONT}" font-size="18" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle">G</text>')
    add(f'<text x="104" y="{HDR_Y+6}" font-family="{FONT}" font-size="24" font-weight="500" '
        f'fill="{WHITE}" text-anchor="start" letter-spacing="1">guess_bet</text>')

    # ── label "ANÁLISIS DE PARTIDO" ───────────────────────────────────────────
    LBL_Y = 200
    add(f'<text x="{W//2}" y="{LBL_Y}" font-family="{FONT}" font-size="32" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle" letter-spacing="6">'
        f'{esc("ANÁLISIS DE PARTIDO")}</text>')

    # sublabel (grupo / horario)
    SUB_Y = LBL_Y + 44
    add(f'<text x="{W//2}" y="{SUB_Y}" font-family="{FONT}" font-size="26" font-weight="400" '
        f'fill="rgba(255,255,255,0.4)" text-anchor="middle" letter-spacing="1">'
        f'{esc(group_label)}</text>')

    # ── separador ──────────────────────────────────────────────────────────────
    SEP_Y = SUB_Y + 44
    add(f'<line x1="80" y1="{SEP_Y}" x2="{W-80}" y2="{SEP_Y}" '
        f'stroke="rgba(255,255,255,0.08)" stroke-width="1"/>')

    # ── bloque equipos ──────────────────────────────────────────────────────────
    TEAMS_CY = SEP_Y + 180
    FLAG_W, FLAG_H = 104, 70  # 52*2 × 35*2 (alta resolución)
    FLAG_R = 8

    # equipo local — centrado en x=270
    home_cx = 270
    away_cx = W - 270
    vs_cx   = W // 2

    # bandera local
    hf_x = home_cx - FLAG_W // 2
    hf_y = TEAMS_CY - FLAG_H // 2
    if home_flag_code:
        uri = flag_b64(home_flag_code)
        if uri:
            add(f'<rect x="{hf_x}" y="{hf_y}" width="{FLAG_W}" height="{FLAG_H}" '
                f'rx="{FLAG_R}" fill="rgba(255,255,255,0.05)" '
                f'stroke="rgba(255,255,255,0.15)" stroke-width="1"/>')
            add(f'<image href="{uri}" x="{hf_x}" y="{hf_y}" width="{FLAG_W}" height="{FLAG_H}" '
                f'preserveAspectRatio="xMidYMid slice" clip-path="url(#flagclip_h)"/>')
            add(f'<defs><clipPath id="flagclip_h">'
                f'<rect x="{hf_x}" y="{hf_y}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}"/>'
                f'</clipPath></defs>')
        else:
            add(f'<rect x="{hf_x}" y="{hf_y}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}" '
                f'fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>')
    else:
        add(f'<rect x="{hf_x}" y="{hf_y}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}" '
            f'fill="rgba(201,162,39,0.15)" stroke="{GOLD}" stroke-width="1" stroke-dasharray="4 3"/>')
        add(f'<text x="{home_cx}" y="{TEAMS_CY+8}" font-family="{FONT}" font-size="20" '
            f'fill="{GOLD}" text-anchor="middle">[BANDERA]</text>')

    # nombre equipo local
    NAME_Y = TEAMS_CY + FLAG_H // 2 + 44
    add(f'<text x="{home_cx}" y="{NAME_Y}" font-family="{FONT}" font-size="38" font-weight="600" '
        f'fill="{WHITE}" text-anchor="middle">{esc(home_name)}</text>')

    # "VS"
    add(f'<text x="{vs_cx}" y="{TEAMS_CY+14}" font-family="{FONT}" font-size="52" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle">VS</text>')

    # bandera visitante
    af_x = away_cx - FLAG_W // 2
    af_y = TEAMS_CY - FLAG_H // 2
    if away_flag_code:
        uri = flag_b64(away_flag_code)
        if uri:
            add(f'<rect x="{af_x}" y="{af_y}" width="{FLAG_W}" height="{FLAG_H}" '
                f'rx="{FLAG_R}" fill="rgba(255,255,255,0.05)" '
                f'stroke="rgba(255,255,255,0.15)" stroke-width="1"/>')
            add(f'<image href="{uri}" x="{af_x}" y="{af_y}" width="{FLAG_W}" height="{FLAG_H}" '
                f'preserveAspectRatio="xMidYMid slice" clip-path="url(#flagclip_a)"/>')
            add(f'<defs><clipPath id="flagclip_a">'
                f'<rect x="{af_x}" y="{af_y}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}"/>'
                f'</clipPath></defs>')
        else:
            add(f'<rect x="{af_x}" y="{af_y}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}" '
                f'fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>')
    else:
        add(f'<rect x="{af_x}" y="{af_y}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}" '
            f'fill="rgba(201,162,39,0.15)" stroke="{GOLD}" stroke-width="1" stroke-dasharray="4 3"/>')
        add(f'<text x="{away_cx}" y="{TEAMS_CY+8}" font-family="{FONT}" font-size="20" '
            f'fill="{GOLD}" text-anchor="middle">[BANDERA]</text>')

    add(f'<text x="{away_cx}" y="{NAME_Y}" font-family="{FONT}" font-size="38" font-weight="600" '
        f'fill="{WHITE}" text-anchor="middle">{esc(away_name)}</text>')

    # ── bloque PROBABILIDADES ──────────────────────────────────────────────────
    PROB_TOP = NAME_Y + 70
    PROB_PAD = 40
    PROB_INNER_W = W - 120
    ROW_H = 110
    PROB_H = ROW_H * 3 + PROB_PAD * 2

    add(f'<rect x="60" y="{PROB_TOP}" width="{PROB_INNER_W}" height="{PROB_H}" rx="14" '
        f'fill="rgba(255,255,255,0.05)"/>')

    # etiqueta sección
    add(f'<text x="{W//2}" y="{PROB_TOP - 20}" font-family="{FONT}" font-size="26" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle" letter-spacing="4">PROBABILIDADES</text>')

    rows = [
        (f'{home_name} gana', prob_home),
        ('Empate',            prob_draw),
        (f'{away_name} gana', prob_away),
    ]

    # determinar favorito (el de % más alto, si son floats)
    fav_idx = 0
    try:
        fav_idx = max(range(3), key=lambda i: float(rows[i][1]))
    except (ValueError, TypeError):
        fav_idx = 0

    BAR_TRACK_H = 5
    for ri, (row_label, row_prob) in enumerate(rows):
        ry = PROB_TOP + PROB_PAD + ri * ROW_H
        is_fav = (ri == fav_idx)
        txt_color = GOLD if is_fav else WHITE
        prob_color = GOLD if is_fav else 'rgba(255,255,255,0.55)'

        # texto etiqueta
        add(f'<text x="{60+PROB_PAD}" y="{ry+38}" font-family="{FONT}" font-size="34" '
            f'font-weight="{"600" if is_fav else "400"}" fill="{txt_color}">{esc(row_label)}</text>')

        # porcentaje
        if isinstance(row_prob, float) and row_prob != int(row_prob):
            prob_str = f'{row_prob:.1f}%'
        elif isinstance(row_prob, (int, float)):
            prob_str = f'{int(row_prob)}%'
        else:
            prob_str = str(row_prob)
        add(f'<text x="{60+PROB_INNER_W-PROB_PAD}" y="{ry+38}" font-family="{FONT}" font-size="38" '
            f'font-weight="700" fill="{prob_color}" text-anchor="end">{esc(prob_str)}</text>')

        # mini barra de progreso
        bar_x = 60 + PROB_PAD
        bar_y = ry + 56
        bar_w = PROB_INNER_W - PROB_PAD * 2
        try:
            fill_w = bar_w * float(row_prob) / 100
        except (ValueError, TypeError):
            fill_w = bar_w * 0.5  # placeholder
        track_color = GOLD if is_fav else 'rgba(255,255,255,0.3)'
        add(f'<rect x="{bar_x}" y="{bar_y}" width="{bar_w}" height="{BAR_TRACK_H}" rx="3" '
            f'fill="rgba(255,255,255,0.08)"/>')
        add(f'<rect x="{bar_x}" y="{bar_y}" width="{fill_w:.1f}" height="{BAR_TRACK_H}" rx="3" '
            f'fill="{track_color}"/>')

        # separador entre filas (no en la última)
        if ri < 2:
            sep_y = ry + ROW_H - 6
            add(f'<line x1="{60+PROB_PAD}" y1="{sep_y}" x2="{60+PROB_INNER_W-PROB_PAD}" y2="{sep_y}" '
                f'stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── bloque EN RESUMEN ──────────────────────────────────────────────────────
    SUM_TOP = PROB_TOP + PROB_H + 64
    SUM_PAD_X = 40
    SUM_PAD_Y = 36
    LINE_H = 70
    SUM_H = len(summary_points) * LINE_H + SUM_PAD_Y * 2

    add(f'<rect x="60" y="{SUM_TOP}" width="{PROB_INNER_W}" height="{SUM_H}" rx="14" '
        f'fill="rgba(201,162,39,0.08)" stroke="rgba(201,162,39,0.25)" stroke-width="1"/>')

    add(f'<text x="{W//2}" y="{SUM_TOP - 20}" font-family="{FONT}" font-size="26" font-weight="700" '
        f'fill="{GOLD}" text-anchor="middle" letter-spacing="4">EN RESUMEN</text>')

    for pi, point in enumerate(summary_points):
        py = SUM_TOP + SUM_PAD_Y + pi * LINE_H + 34
        # flecha dorada
        add(f'<text x="{60+SUM_PAD_X}" y="{py}" font-family="{FONT}" font-size="32" '
            f'font-weight="500" fill="{GOLD}">→</text>')
        # texto: palabras entre ** se doran
        TEXT_X = 60 + SUM_PAD_X + 48
        parts = _parse_bold(point)
        tspans = ''.join(f'<tspan fill="{GOLD if bold else "rgba(255,255,255,0.85)"}">{esc(t)}</tspan>'
                         for t, bold in parts)
        add(f'<text x="{TEXT_X}" y="{py}" font-family="{FONT}" font-size="30" font-weight="400">'
            f'{tspans}</text>')

    # ── CTA pill ──────────────────────────────────────────────────────────────
    CTA_Y = SUM_TOP + SUM_H + 72
    CTA_W = 780
    CTA_H = 80
    CTA_X = (W - CTA_W) // 2
    add(f'<rect x="{CTA_X}" y="{CTA_Y}" width="{CTA_W}" height="{CTA_H}" rx="40" fill="{GOLD}"/>')
    add(f'<text x="{W//2}" y="{CTA_Y + CTA_H//2 + 13}" font-family="{FONT}" font-size="34" '
        f'font-weight="600" fill="#0a0f1e" text-anchor="middle">'
        f'{esc("Analiza tú mismo → guessbet.vercel.app")}</text>')

    add('</svg>')
    return '\n'.join(lines)


def _parse_bold(text: str) -> list[tuple[str, bool]]:
    """Convierte **texto** en lista de (texto, es_dorado). Sin dependencias."""
    parts: list[tuple[str, bool]] = []
    i, bold = 0, False
    buf = ''
    while i < len(text):
        if text[i:i+2] == '**':
            if buf:
                parts.append((buf, bold))
                buf = ''
            bold = not bold
            i += 2
        else:
            buf += text[i]
            i += 1
    if buf:
        parts.append((buf, bold))
    return parts or [(text, False)]


def render(svg: str, out_path: str):
    svg_path = out_path.replace('.png', '.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, svg_path, out_path, '--width', '1080'], check=True)
    print(f'OK  {os.path.basename(out_path)}')


# ─── Casos ───────────────────────────────────────────────────────────────────

CASES = [
    dict(
        slug='nl_vs_ma',
        home_name='Países Bajos',
        away_name='Marruecos',
        home_flag_code='nl',
        away_flag_code='ma',
        group_label='MUNDIAL 2026 · 16AVOS DE FINAL · 21:00 hs',
        prob_home=36.3,
        prob_draw=27.9,
        prob_away=35.8,
        summary_points=[
            'Partido **muy parejo** según el modelo (36-28-36).',
            '**Marruecos** tiene ELO superior, defensa sólida.',
            'Alta chance de partido cerrado y de **pocos goles**.',
        ],
    ),
    dict(
        slug='template',
        home_name='[EQUIPO LOCAL]',
        away_name='[EQUIPO VISITANTE]',
        home_flag_code='',
        away_flag_code='',
        group_label='MUNDIAL 2026 · [GRUPO] · [HORA] hs',
        prob_home='[%]',
        prob_draw='[%]',
        prob_away='[%]',
        summary_points=[
            '**[Equipo]** [punto 1 del análisis].',
            '**[Equipo]** [punto 2 del análisis].',
            '[Punto 3 general del partido].',
        ],
        is_template=True,
    ),
]

if __name__ == '__main__':
    for c in CASES:
        svg = build_svg(**{k: v for k, v in c.items() if k != 'slug'})
        out = os.path.join(OUT_DIR, f'{c["slug"]}.png')
        render(svg, out)
    print('\nListo. Archivos en public/marketing/ig-stories/partidos/')
