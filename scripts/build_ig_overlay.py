import os, subprocess

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-stories', 'en_vivo', 'overlay_slide2')

W, H = 1080, 1920
GOLD = '#C9A227'
WHITE = '#ffffff'
FONT = "Segoe UI, Arial, sans-serif"
CX = W / 2
WEIGHT = 500

def progress_bar(n, active_idx, y=70, h=15):
    margin, gap = 60, 12
    total_w = W - margin * 2
    seg_w = (total_w - gap * (n - 1)) / n
    parts = []
    for i in range(n):
        x = margin + i * (seg_w + gap)
        color = GOLD if i == active_idx else 'rgba(255,255,255,0.15)'
        parts.append(f'<rect x="{x}" y="{y}" width="{seg_w}" height="{h}" rx="{h/2}" fill="{color}"/>')
    return ''.join(parts)

content = progress_bar(3, 1)

# Texto editable de referencia: minuto izquierda/derecha, area central vacia (se ve el video)
content += f'<text x="100" y="220" font-family="{FONT}" font-size="56" font-weight="{WEIGHT}" fill="{GOLD}">⏱ Minuto 10</text>'
content += f'<text x="{W-100}" y="220" font-family="{FONT}" font-size="56" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="end">⏱ Minuto 70</text>'

# Texto secundario debajo del centro, sobre el area donde la app muestra el %
content += f'<text x="{CX}" y="{H/2 + 220}" font-family="{FONT}" font-size="38" font-weight="{WEIGHT}" fill="{WHITE}" text-anchor="middle">La probabilidad cambia con el partido</text>'

# Cierre abajo, con fondo semi-transparente para legibilidad
label = 'Esto es en tiempo real.'
pill_w = len(label) * 58 * 0.56 + 100
pill_h = 100
pill_y = H - 280
content += f'<rect x="{CX - pill_w/2}" y="{pill_y}" width="{pill_w}" height="{pill_h}" rx="{pill_h/2}" fill="rgba(0,0,0,0.4)"/>'
content += f'<text x="{CX}" y="{pill_y + pill_h/2 + 18}" font-family="{FONT}" font-size="46" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle">{label}</text>'

svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">{content}</svg>'

svg_path = OUT + '.svg'
png_path = OUT + '.png'
os.makedirs(os.path.dirname(svg_path), exist_ok=True)
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg)
subprocess.run([RESVG, '-w', str(W), '-h', str(H), svg_path, png_path], check=True)
print(png_path)
