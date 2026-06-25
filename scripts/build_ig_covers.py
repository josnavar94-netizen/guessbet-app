import re, os, subprocess

RESVG = r'C:\Users\Isabella\AppData\Local\Temp\resvg_bin\resvg.exe'

BLACK = '#0a0a0a'
GOLD = '#C9A227'
SIZE = 1080
RING = 2.5 / 84 * SIZE  # ring stroke proportional to the 84px circle mockup (2.5px border)
ICON_BOX = SIZE * (26 / 84)  # icon size proportional to the 84px circle mockup
RADIUS = SIZE / 2 - RING

covers = [
    ('que_es', 'ball-football'),
    ('la_data', 'chart-bar'),
    ('en_vivo', 'bolt'),
    ('como_usarla', 'square-rounded-plus'),
    ('premium', 'star'),
    ('faq', 'help'),
]

icons_dir = r'C:\Users\Isabella\AppData\Local\Temp\icons'
out_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'marketing', 'ig-covers')
os.makedirs(out_dir, exist_ok=True)

def load_icon_path(name):
    with open(os.path.join(icons_dir, f'{name}.svg'), encoding='utf-8') as f:
        src = f.read()
    paths = re.findall(r'<path[^>]*d="([^"]+)"[^>]*/?>', src)
    # el primer path de los iconos tabler es siempre el "stroke none" de relleno invisible, se ignora
    real_paths = []
    for m in re.finditer(r'<path([^>]*)/?>', src):
        attrs = m.group(1)
        d_match = re.search(r'd="([^"]+)"', attrs)
        if not d_match:
            continue
        if 'stroke="none"' in attrs:
            continue
        real_paths.append(d_match.group(1))
    if not real_paths:
        real_paths = paths
    return real_paths

ICON_VB = 24  # viewBox de los iconos tabler originales
scale = ICON_BOX / ICON_VB
offset = (SIZE - ICON_BOX) / 2

for label, icon_name in covers:
    paths = load_icon_path(icon_name)
    path_svg = ''.join(f'<path d="{d}"/>' for d in paths)
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="{SIZE}" height="{SIZE}" viewBox="0 0 {SIZE} {SIZE}">
  <rect width="{SIZE}" height="{SIZE}" fill="{BLACK}"/>
  <circle cx="{SIZE/2}" cy="{SIZE/2}" r="{RADIUS}" fill="{BLACK}" stroke="{GOLD}" stroke-width="{RING}"/>
  <g transform="translate({offset},{offset}) scale({scale})" fill="none" stroke="{GOLD}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    {path_svg}
  </g>
</svg>'''

    svg_path = os.path.join(out_dir, f'{label}.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg)

    png_path = os.path.join(out_dir, f'{label}.png')
    subprocess.run([RESVG, '-w', str(SIZE), '-h', str(SIZE), svg_path, png_path], check=True)
    print(f'{label}: {svg_path} + {png_path}')

print('Listo.')
