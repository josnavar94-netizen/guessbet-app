"""
Genera posts cuadrados de análisis de partido para Instagram (1080x1080px).
Uso:
  python scripts/build_ig_posts_partidos.py
"""
import os, subprocess, urllib.request, base64

RESVG   = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'partidos')
os.makedirs(OUT_DIR, exist_ok=True)

W = H = 1080
BLACK = '#0a0a0a'
GOLD  = '#C9A227'
WHITE = '#ffffff'
GRAY  = '#888888'
FONT  = "Segoe UI, Arial, sans-serif"
CX    = W // 2

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

def flag_img(code, cx, cy, fw=110, fh=74, clip_id='fc'):
    uri = flag_b64(code)
    fx, fy = cx - fw//2, cy - fh//2
    r = 8
    clip   = f'<clipPath id="{clip_id}"><rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" rx="{r}"/></clipPath>'
    border = (f'<rect x="{fx}" y="{fy}" width="{fw}" height="{fh}" rx="{r}" '
              f'fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>')
    img = (f'<image href="{uri}" x="{fx}" y="{fy}" width="{fw}" height="{fh}" '
           f'preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_id})"/>') if uri else ''
    return f'<defs>{clip}</defs>{border}{img}'

def logo_gb(cx, cy, size=40):
    r = size
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{GOLD}" stroke-width="2.5"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r-8}" fill="{GOLD}" fill-opacity="0.12"/>'
            f'<text x="{cx}" y="{cy+11}" font-family="{FONT}" font-size="{int(size*0.72)}" font-weight="700" '
            f'fill="{GOLD}" text-anchor="middle">GB</text>')

def prob_bar(cx, top_y, label, pct, color, bar_width=860, bar_h=54, is_fav=False):
    bx = cx - bar_width // 2
    filled = int(bar_width * pct / 100)
    parts = []
    # fondo barra
    parts.append(f'<rect x="{bx}" y="{top_y}" width="{bar_width}" height="{bar_h}" rx="6" fill="rgba(255,255,255,0.05)"/>')
    # relleno
    fill_color = GOLD if is_fav else 'rgba(201,162,39,0.35)'
    parts.append(f'<rect x="{bx}" y="{top_y}" width="{filled}" height="{bar_h}" rx="6" fill="{fill_color}"/>')
    # label izquierda
    label_color = BLACK if is_fav else WHITE
    parts.append(f'<text x="{bx+18}" y="{top_y+bar_h//2+6}" font-family="{FONT}" font-size="24" font-weight="600" '
                 f'fill="{label_color}" text-anchor="start">{esc(label)}</text>')
    # porcentaje derecha — siempre sobre fondo oscuro (el fill no llega al borde derecho)
    pct_str = f'{pct:.1f}%' if pct != int(pct) else f'{int(pct)}%'
    pct_color = GOLD if is_fav else WHITE
    parts.append(f'<text x="{bx+bar_width-18}" y="{top_y+bar_h//2+6}" font-family="{FONT}" font-size="26" font-weight="700" '
                 f'fill="{pct_color}" text-anchor="end">{esc(pct_str)}</text>')
    return ''.join(parts)

def build_svg(slug, team_h, team_a, code_h, code_a,
              prob_home, prob_draw, prob_away,
              xg_h, xg_a, over25, btts,
              hora_cl, summary_points=None, fase='DIECISEISAVOS DE FINAL'):

    parts = []

    # ── fondo ──────────────────────────────────────────────────────────────────
    parts.append(f'<rect width="{W}" height="{H}" fill="{BLACK}"/>')

    # líneas decorativas laterales
    parts.append(f'<line x1="48" y1="0" x2="48" y2="{H}" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.15"/>')
    parts.append(f'<line x1="{W-48}" y1="0" x2="{W-48}" y2="{H}" stroke="{GOLD}" stroke-width="1" stroke-opacity="0.15"/>')

    # ── franja superior ────────────────────────────────────────────────────────
    parts.append(f'<text x="{CX}" y="68" font-family="{FONT}" font-size="22" font-weight="500" '
                 f'fill="{GRAY}" text-anchor="middle" letter-spacing="3">AN&#193;LISIS · MUNDIAL 2026 · {esc(fase.upper())}</text>')
    parts.append(f'<line x1="80" y1="80" x2="{W-80}" y2="80" stroke="{GOLD}" stroke-width="0.8" stroke-opacity="0.3"/>')

    # ── banderas + VS + nombres ────────────────────────────────────────────────
    FLAG_CY = 210
    FLAG_X_H = 290
    FLAG_X_A = W - 290

    parts.append(flag_img(code_h, FLAG_X_H, FLAG_CY, fw=120, fh=80, clip_id='fch'))
    parts.append(flag_img(code_a, FLAG_X_A, FLAG_CY, fw=120, fh=80, clip_id='fca'))

    # VS
    parts.append(f'<text x="{CX}" y="{FLAG_CY+14}" font-family="{FONT}" font-size="40" font-weight="800" '
                 f'fill="{GOLD}" text-anchor="middle">VS</text>')

    # nombres
    NAME_Y = FLAG_CY + 66
    parts.append(f'<text x="{FLAG_X_H}" y="{NAME_Y}" font-family="{FONT}" font-size="30" font-weight="600" '
                 f'fill="{WHITE}" text-anchor="middle">{esc(team_h)}</text>')
    parts.append(f'<text x="{FLAG_X_A}" y="{NAME_Y}" font-family="{FONT}" font-size="30" font-weight="600" '
                 f'fill="{WHITE}" text-anchor="middle">{esc(team_a)}</text>')

    # hora
    HORA_Y = NAME_Y + 38
    parts.append(f'<text x="{CX}" y="{HORA_Y}" font-family="{FONT}" font-size="22" font-weight="600" '
                 f'fill="{GOLD}" text-anchor="middle">HOY · {esc(hora_cl)} CL</text>')

    # separador
    SEP_Y = HORA_Y + 24
    parts.append(f'<line x1="80" y1="{SEP_Y}" x2="{W-80}" y2="{SEP_Y}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── barras de probabilidad ─────────────────────────────────────────────────
    BAR_START = SEP_Y + 28
    GAP = 14
    BAR_H = 54
    probs = [
        (team_h, prob_home),
        ('Empate',  prob_draw),
        (team_a, prob_away),
    ]
    max_prob = max(p for _, p in probs)

    for i, (label, pct) in enumerate(probs):
        y = BAR_START + i * (BAR_H + GAP)
        is_fav = (pct == max_prob)
        parts.append(prob_bar(CX, y, label, pct, GOLD, is_fav=is_fav))

    # ── stats secundarios ──────────────────────────────────────────────────────
    STATS_Y = BAR_START + 3 * (BAR_H + GAP) + 20

    # caja stats
    BOX_W, BOX_H = 860, 76
    bx = CX - BOX_W // 2
    parts.append(f'<rect x="{bx}" y="{STATS_Y}" width="{BOX_W}" height="{BOX_H}" rx="10" fill="rgba(255,255,255,0.04)"/>')

    # 3 columnas de stats
    stat_cols = [
        (f'xG  {xg_h:.2f} – {xg_a:.2f}', 'Goles esperados'),
        (f'+2.5  {over25:.1f}%',           'Más de 2.5 goles'),
        (f'BTTS  {btts:.1f}%',             'Ambos anotan'),
    ]
    col_w = BOX_W // 3
    for i, (val, lbl) in enumerate(stat_cols):
        cx_col = bx + col_w * i + col_w // 2
        # separador vertical
        if i > 0:
            parts.append(f'<line x1="{bx + col_w*i}" y1="{STATS_Y+12}" x2="{bx + col_w*i}" y2="{STATS_Y+BOX_H-12}" '
                         f'stroke="rgba(255,255,255,0.1)" stroke-width="1"/>')
        parts.append(f'<text x="{cx_col}" y="{STATS_Y+30}" font-family="{FONT}" font-size="20" font-weight="700" '
                     f'fill="{WHITE}" text-anchor="middle">{esc(val)}</text>')
        parts.append(f'<text x="{cx_col}" y="{STATS_Y+56}" font-family="{FONT}" font-size="17" font-weight="400" '
                     f'fill="{GRAY}" text-anchor="middle">{esc(lbl)}</text>')

    # ── resumen analítico ──────────────────────────────────────────────────────
    SUMM_Y = STATS_Y + BOX_H + 24
    if summary_points:
        SBW, SBH = 860, 30 + len(summary_points) * 38
        sbx = CX - SBW // 2
        parts.append(f'<rect x="{sbx}" y="{SUMM_Y}" width="{SBW}" height="{SBH}" rx="10" '
                     f'fill="rgba(201,162,39,0.06)" stroke="rgba(201,162,39,0.2)" stroke-width="1"/>')
        for j, point in enumerate(summary_points):
            ty = SUMM_Y + 16 + (j + 1) * 38
            parts.append(f'<text x="{sbx+24}" y="{ty}" font-family="{FONT}" font-size="22" font-weight="400" '
                         f'fill="rgba(255,255,255,0.75)" text-anchor="start">&#8226; {esc(point)}</text>')
        FOOTER_Y = SUMM_Y + SBH + 24
    else:
        FOOTER_Y = SUMM_Y + 24

    # ── footer ─────────────────────────────────────────────────────────────────
    parts.append(f'<line x1="80" y1="{FOOTER_Y}" x2="{W-80}" y2="{FOOTER_Y}" stroke="{GOLD}" stroke-width="0.8" stroke-opacity="0.3"/>')

    # logo GB + texto
    LOGO_CX = 80 + 44
    LOGO_CY = FOOTER_Y + 52
    parts.append(logo_gb(LOGO_CX, LOGO_CY, size=36))

    parts.append(f'<text x="{LOGO_CX + 56}" y="{FOOTER_Y + 44}" font-family="{FONT}" font-size="22" font-weight="700" '
                 f'fill="{WHITE}" text-anchor="start">guessbet.vercel.app</text>')
    parts.append(f'<text x="{LOGO_CX + 56}" y="{FOOTER_Y + 68}" font-family="{FONT}" font-size="18" font-weight="400" '
                 f'fill="{GRAY}" text-anchor="start">Modelo ELO + Poisson</text>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
           f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
           + ''.join(parts) + '</svg>')
    return svg


def render(svg: str, slug: str):
    svg_path = os.path.join(OUT_DIR, f'{slug}.svg')
    png_path = os.path.join(OUT_DIR, f'{slug}.png')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)
    subprocess.run([RESVG, svg_path, png_path, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')


if __name__ == '__main__':
    render(build_svg(
        'arg_vs_egy',
        'Argentina', 'Egipto', 'ar', 'eg',
        prob_home=62.8, prob_draw=17.7, prob_away=19.5,
        xg_h=2.4, xg_a=1.0, over25=76.9, btts=70.8,
        hora_cl='12:00',
        fase='OCTAVOS DE FINAL',
        summary_points=[
            'Argentina gran favorita: Messi y Lautaro elevan el xG a 2.4',
            'Partido muy goleador esperado: 76.9% de +2.5 goles',
            'Egipto con Salah: 19.5% de chances y ambos anotan en 70.8%',
        ],
    ), 'arg_vs_egy')

    render(build_svg(
        'sui_vs_col',
        'Suiza', 'Colombia', 'ch', 'co',
        prob_home=26.5, prob_draw=37.8, prob_away=35.7,
        xg_h=0.65, xg_a=0.60, over25=17.3, btts=25.9,
        hora_cl='16:00',
        fase='OCTAVOS DE FINAL',
        summary_points=[
            'Partido defensivo: solo 17.3% de +2.5 goles esperados',
            'Colombia ligera favorita (35.7%) — el empate tiene 37.8%',
            'James Rodríguez y Díaz dan ventaja atacante a Colombia',
        ],
    ), 'sui_vs_col')

    print('\nListo. Archivos en public/marketing/ig-posts/partidos/')
