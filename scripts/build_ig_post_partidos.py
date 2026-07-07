"""
Posts Instagram 1080x1080 — análisis de partido. Enfoque narrativo, sin datos técnicos.
Uso: python scripts/build_ig_post_partidos.py
"""
import os, subprocess, urllib.request, base64

RESVG   = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-posts', 'partidos')
os.makedirs(OUT_DIR, exist_ok=True)

W, H  = 1080, 1080
GOLD  = '#C9A227'
WHITE = '#ffffff'
FONT  = "Segoe UI, Arial, sans-serif"

def esc(s): return str(s).replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')

FLAG_CACHE: dict = {}
def flag_b64(code):
    if code in FLAG_CACHE: return FLAG_CACHE[code]
    try:
        with urllib.request.urlopen(f'https://flagcdn.com/w160/{code}.png', timeout=8) as r:
            result = f'data:image/png;base64,{base64.b64encode(r.read()).decode()}'
    except: result = ''
    FLAG_CACHE[code] = result
    return result


def build_svg(
    home_name, away_name,
    home_flag_code, away_flag_code,
    time_label,          # "HOY · 12:00 CL"
    verdict,             # "Inglaterra parte como favorita clara"
    fav_name,            # nombre del favorito
    fav_pct,             # float, % del favorito
    bullets,             # lista de 3 frases narrativas (sin números técnicos)
    cta_label="Analiza este partido → guessbet.vercel.app",
) -> str:
    parts = []
    def add(s): parts.append(s)

    add(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
        f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">')

    # gradiente fondo
    add(f'<defs>'
        f'<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0%" stop-color="#13131a"/><stop offset="100%" stop-color="#0a0a0a"/>'
        f'</linearGradient>'
        f'<linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">'
        f'<stop offset="0%" stop-color="#b8911f"/><stop offset="50%" stop-color="#e8c45a"/><stop offset="100%" stop-color="#b8911f"/>'
        f'</linearGradient>'
        f'</defs>')
    add(f'<rect width="{W}" height="{H}" fill="url(#bg)"/>')
    add(f'<rect x="0" y="0" width="{W}" height="5" fill="{GOLD}"/>')
    add(f'<rect x="0" y="{H-5}" width="{W}" height="5" fill="{GOLD}"/>')

    # ── Header ────────────────────────────────────────────────────────────────
    add(f'<circle cx="50" cy="50" r="19" fill="none" stroke="{GOLD}" stroke-width="1.5"/>')
    add(f'<text x="50" y="57" font-family="{FONT}" font-size="15" font-weight="700" fill="{GOLD}" text-anchor="middle">G</text>')
    add(f'<text x="82" y="57" font-family="{FONT}" font-size="19" fill="{WHITE}" letter-spacing="1">guess_bet</text>')
    # badge horario
    add(f'<rect x="760" y="30" width="280" height="38" rx="19" fill="rgba(201,162,39,0.12)" stroke="rgba(201,162,39,0.35)" stroke-width="1"/>')
    add(f'<text x="900" y="54" font-family="{FONT}" font-size="17" font-weight="600" fill="{GOLD}" text-anchor="middle">{esc(time_label)}</text>')
    add(f'<line x1="36" y1="82" x2="{W-36}" y2="82" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── Banderas + VS (zona grande) ───────────────────────────────────────────
    FLAG_W, FLAG_H = 220, 144
    FLAG_R = 14
    home_cx, away_cx = 220, W-220

    def flag_block(cx, code, name, clip_id):
        fx, fy = cx - FLAG_W//2, 110
        add(f'<defs><clipPath id="{clip_id}"><rect x="{fx}" y="{fy}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}"/></clipPath></defs>')
        add(f'<rect x="{fx}" y="{fy}" width="{FLAG_W}" height="{FLAG_H}" rx="{FLAG_R}" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>')
        uri = flag_b64(code)
        if uri:
            add(f'<image href="{uri}" x="{fx}" y="{fy}" width="{FLAG_W}" height="{FLAG_H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#{clip_id})"/>')
        add(f'<text x="{cx}" y="288" font-family="{FONT}" font-size="36" font-weight="700" fill="{WHITE}" text-anchor="middle">{esc(name)}</text>')

    flag_block(home_cx, home_flag_code, home_name, 'hf')
    flag_block(away_cx, away_flag_code, away_name, 'af')

    # VS central
    add(f'<text x="{W//2}" y="202" font-family="{FONT}" font-size="72" font-weight="900" fill="{GOLD}" text-anchor="middle">VS</text>')

    # ── Separador ─────────────────────────────────────────────────────────────
    add(f'<line x1="60" y1="316" x2="{W-60}" y2="316" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── VEREDICTO — frase principal ───────────────────────────────────────────
    add(f'<text x="{W//2}" y="372" font-family="{FONT}" font-size="32" font-weight="700" fill="{WHITE}" text-anchor="middle">{esc(verdict)}</text>')

    # ── % del favorito — EL único número destacado ────────────────────────────
    add(f'<text x="{W//2}" y="448" font-family="{FONT}" font-size="96" font-weight="900" fill="{GOLD}" text-anchor="middle">{fav_pct:.0f}%</text>')
    add(f'<text x="{W//2}" y="494" font-family="{FONT}" font-size="24" fill="rgba(255,255,255,0.40)" text-anchor="middle">de probabilidad para {esc(fav_name)}</text>')

    # ── Separador ─────────────────────────────────────────────────────────────
    add(f'<line x1="60" y1="524" x2="{W-60}" y2="524" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>')

    # ── Bullets narrativos ────────────────────────────────────────────────────
    BULLET_TOP = 556
    LINE_H = 108
    for i, bullet in enumerate(bullets):
        by = BULLET_TOP + i * LINE_H
        # línea dorada lateral
        add(f'<rect x="60" y="{by}" width="4" height="72" rx="2" fill="{GOLD}"/>')
        # texto (puede ser largo — dos líneas)
        words = bullet.split(' | ')
        if len(words) == 2:
            add(f'<text x="84" y="{by+30}" font-family="{FONT}" font-size="26" font-weight="600" fill="{WHITE}">{esc(words[0])}</text>')
            add(f'<text x="84" y="{by+60}" font-family="{FONT}" font-size="24" fill="rgba(255,255,255,0.55)">{esc(words[1])}</text>')
        else:
            add(f'<text x="84" y="{by+42}" font-family="{FONT}" font-size="26" font-weight="500" fill="{WHITE}">{esc(bullet)}</text>')

    # ── CTA ───────────────────────────────────────────────────────────────────
    CTA_Y, CTA_H_px, CTA_W = 964, 64, 820
    CTA_X = (W - CTA_W) // 2
    add(f'<rect x="{CTA_X}" y="{CTA_Y}" width="{CTA_W}" height="{CTA_H_px}" rx="32" fill="url(#gold)"/>')
    add(f'<text x="{W//2}" y="{CTA_Y+CTA_H_px//2+11}" font-family="{FONT}" font-size="25" font-weight="700" fill="#0a0a0a" text-anchor="middle">{esc(cta_label)}</text>')

    add('</svg>')
    return ''.join(parts)


def render(svg, slug):
    sp = os.path.join(OUT_DIR, f'{slug}.svg')
    pp = os.path.join(OUT_DIR, f'{slug}.png')
    with open(sp, 'w', encoding='utf-8') as f: f.write(svg)
    subprocess.run([RESVG, sp, pp, '--width', '1080'], check=True)
    print(f'OK  {slug}.png')


CASES = [
    dict(
        slug='eng_vs_cod',
        home_name='Inglaterra', away_name='RD Congo',
        home_flag_code='gb-eng', away_flag_code='cd',
        time_label='MUNDIAL 2026 · 12:00 CL',
        verdict='El modelo ve a Inglaterra dominando.',
        fav_name='Inglaterra',
        fav_pct=53.7,
        bullets=[
            'Una diferencia ELO importante | los ingleses tienen más nivel histórico acumulado.',
            'Partido que debería ser cerrado | Congo apuesta a la defensa y el contragolpe.',
            'El modelo espera que Inglaterra lleve el control | pero no será un paseo.',
        ],
    ),
    dict(
        slug='bel_vs_sen',
        home_name='Bélgica', away_name='Senegal',
        home_flag_code='be', away_flag_code='sn',
        time_label='MUNDIAL 2026 · 16:00 CL',
        verdict='El partido más parejo del día.',
        fav_name='Bélgica',
        fav_pct=40.3,
        bullets=[
            'Senegal tiene mejor ELO que Bélgica | el modelo los ve prácticamente iguales.',
            'Cualquier resultado es posible | incluyendo el empate con alta probabilidad.',
            'El cruce con más incertidumbre de la jornada | ideal para quien busca sorpresas.',
        ],
    ),
    dict(
        slug='usa_vs_bih',
        home_name='USA', away_name='Bosnia',
        home_flag_code='us', away_flag_code='ba',
        time_label='MUNDIAL 2026 · 20:00 CL',
        verdict='USA, el más claro favorito del día.',
        fav_name='USA',
        fav_pct=66.3,
        bullets=[
            'La mayor diferencia de nivel entre los 3 partidos de hoy | USA muy por encima.',
            'El modelo proyecta un partido con goles | Bosnia tiene que arriesgar para ganar.',
            'Si buscas al favorito con más margen hoy | este es el partido.',
        ],
    ),
]

if __name__ == '__main__':
    for c in CASES:
        render(build_svg(**{k: v for k, v in c.items() if k != 'slug'}), c['slug'])
    print('Listo. Archivos en public/marketing/ig-posts/partidos/')
