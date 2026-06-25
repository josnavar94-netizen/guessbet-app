import os, subprocess
from PIL import Image

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'
LOGO_PATH = os.path.join(os.path.dirname(__file__), '..', 'public', 'logo-guessbet.png')
OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-stories', 'proximamente')

W, H = 1080, 1920
BLACK = '#0a0a0a'
GOLD = '#C9A227'
WHITE = '#ffffff'
FONT = "Segoe UI, Arial, sans-serif"
CX = W / 2
WEIGHT = 500

def progress_bar():
    margin = 60
    w = W - margin * 2
    return f'<rect x="{margin}" y="70" width="{w}" height="15" rx="7.5" fill="{GOLD}"/>'

content = progress_bar()
content += f'<text x="{CX}" y="220" font-family="{FONT}" font-size="48" font-weight="{WEIGHT}" fill="{GOLD}" text-anchor="middle" letter-spacing="3">PRÓXIMAMENTE</text>'

lines = [
    [('El fútbol dejó de ser', WHITE)],
    [('solo cuestión de', WHITE)],
    [('suerte', GOLD), ('...', WHITE)],
]
size, lh = 78, 104
cy = H/2 - 120
start_y = cy - (len(lines)-1)*lh/2
for i, line in enumerate(lines):
    y = start_y + i*lh
    tspans = ''.join(f'<tspan fill="{color}">{t}</tspan>' for t, color in line)
    content += f'<text x="{CX}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{WEIGHT}" text-anchor="middle">{tspans}</text>'

svg = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="{W}" height="{H}" fill="{BLACK}"/>{content}</svg>'

os.makedirs(OUT_DIR, exist_ok=True)
svg_path = os.path.join(OUT_DIR, 'slide1.svg')
png_path = os.path.join(OUT_DIR, 'slide1.png')
with open(svg_path, 'w', encoding='utf-8') as f:
    f.write(svg)
subprocess.run([RESVG, '-w', str(W), '-h', str(H), svg_path, png_path], check=True)

# Pega el isotipo GB real (PNG transparente) debajo del texto
base = Image.open(png_path).convert('RGBA')
logo = Image.open(LOGO_PATH).convert('RGBA')
logo_w = 240
logo_h = int(logo.height * logo_w / logo.width)
logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
logo_x = (W - logo_w) // 2
logo_y = int(H/2 + 160)
base.alpha_composite(logo, (logo_x, logo_y))
base.save(png_path)

print(png_path)
