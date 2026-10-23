"""Ritaglia sheet-source.png (tavola di Lost Signal: Faindo, zolle, giornali, icone; palazzina e rocce dalla tavola sheet-newsroom.png) in sprite a risoluzione
nativa di gioco e scrive atlas.png + atlas.js (coordinate esplicite). Uso: py build-atlas.py"""
from PIL import Image, ImageEnhance
import numpy as np, json

src = Image.open('sheet-source.png').convert('RGBA')
TILE = 32                       # lato nativo di una zolla (faccia superiore quadrata)
TW, TH = 32, 40                 # zolla con lo spessore del terreno
ARR = np.array(src)

def hard(im, thr=110):
    a = np.array(im)
    a[:, :, 3] = np.where(a[:, :, 3] > thr, 255, 0)
    a[a[:, :, 3] == 0] = 0
    return Image.fromarray(a, 'RGBA')

def shrink(im, size, contrast=1.22, color=1.2):
    arr = np.array(im).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = np.concatenate([arr[:, :, :3] * al, arr[:, :, 3:4]], axis=2)
    big = Image.fromarray(pm.clip(0, 255).astype('uint8'), 'RGBA')
    sm = big.resize(size, Image.LANCZOS)
    a = np.array(sm).astype(float)
    alpha = a[:, :, 3:4]
    rgb = np.where(alpha > 0, a[:, :, :3] / np.maximum(alpha, 1) * 255, 0).clip(0, 255)
    out = np.concatenate([rgb, alpha], axis=2).astype('uint8')
    r = Image.fromarray(out, 'RGBA')
    r = ImageEnhance.Contrast(r).enhance(contrast)
    r = ImageEnhance.Color(r).enhance(color)
    o = np.array(r); o[:, :, 3] = np.where(out[:, :, 3] > 110, 255, 0)
    o[o[:, :, 3] == 0] = 0
    return Image.fromarray(o, 'RGBA')

def bbox(im, thr=60):
    a = np.array(im)[:, :, 3] > thr
    ys, xs = np.where(a)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def clean(im):
    """Toglie gli aloni quasi trasparenti attorno agli sprite."""
    a = np.array(im); a[:, :, 3] = np.where(a[:, :, 3] > 90, 255, 0); a[a[:, :, 3] == 0] = 0
    return Image.fromarray(a, 'RGBA')

items = {}        # nome -> immagine nativa

# ---------- palazzina FAIND Newsroom (tavola sheet-newsroom.png): chiusa e con le porte aperte, con la zolla d'ingresso che fa da zolla del portone ----------
news = Image.open('sheet-newsroom.png').convert('RGBA')
SC_B = 0.19
FACE_Y = 472                    # bordo alto della zolla d'ingresso nella tavola
GAPC, FACEY = {}, {}
for name, (bx0, bx1) in (('bldg_closed', (100, 890)), ('bldg_open', (890, 1680))):
    b = clean(news.crop((bx0, 10, bx1, 648)))
    a = np.array(b)[:, :, 3]
    row = np.where(a[600 - 10] > 60)[0]                  # larghezza della zolla d'ingresso a metà della sua altezza
    cx = (row.min() + row.max()) / 2.0
    bb = bbox(b); b = b.crop((bb[0], 0, bb[2], b.height)); cx -= bb[0]
    w, h = round(b.width * SC_B), round(b.height * SC_B)
    items[name] = shrink(b, (w, h), 1.1, 1.12)
    GAPC[name] = round(cx * SC_B, 1)
    FACEY[name] = round((FACE_Y - 10) * SC_B, 1)

# ---------- rocce (quattro varianti, fotogrammi del rotolamento) ----------
for i, (rx0, rx1) in enumerate(((302, 515), (616, 829), (928, 1140), (1240, 1455))):
    r = clean(news.crop((rx0 - 4, 646, rx1 + 4, 866))); r = r.crop(bbox(r))
    items['rock%d' % i] = shrink(r, (28, 28), 1.1, 1.12)

# ---------- zolle ----------
TILE_BOXES = [(69, 1013, 211, 1164), (227, 1013, 363, 1164), (385, 1013, 520, 1164), (540, 1013, 676, 1164)]
def tile_crop(i):
    x0, y0, x1, y1 = TILE_BOXES[i]
    cx = (x0 + x1) // 2
    return clean(src.crop((cx - 70, 1010, cx + 70, 1166)))
tiles = [tile_crop(i) for i in range(4)]

def all_dirt(t):
    a = np.array(t).copy(); h, w = a.shape[:2]
    inner = a[48:112, 52:90 + 50, :3]                       # un pezzo di terra della zolla 3
    ih, iw = inner.shape[:2]
    r, g, b = a[:, :, 0].astype(int), a[:, :, 1].astype(int), a[:, :, 2].astype(int)
    green = (g > r + 12) & (g > b + 20) & (a[:, :, 3] > 0)
    green[118:] = False
    ys, xs = np.where(green)
    for y, x in zip(ys, xs):
        a[y, x, :3] = inner[y % ih, x % iw]
    return Image.fromarray(a, 'RGBA')
variants = [tiles[0], tiles[1], tiles[2], tiles[3]]
TSC_X, TSC_Y = TW / 134.0, TH / 151.0
for i, t in enumerate(variants):
    items['tile%d' % i] = shrink(t.crop((3, 0, 137, 151)), (TW, TH), 1.1, 1.1)

def native_dirt(t):
    a = np.array(t).copy(); h, w = a.shape[:2]
    pal = [(176, 92, 42), (162, 82, 38), (190, 104, 52), (170, 88, 40)]
    for y in range(h):
        for x in range(w):
            r, g, b, al = a[y, x]
            if al and y < 36 and int(g) > int(r) + 6:
                if y < 3 or x < 1 or x > w - 2: a[y, x] = (30, 18, 12, 255); continue
                a[y, x, :3] = pal[(x * 7 + y * 13 + (x * y) % 5) % 4]
    return Image.fromarray(a, 'RGBA')
items['tile2'] = native_dirt(items['tile0'])

# ---------- giornale ----------
sc = clean(src.crop((722, 1034, 836, 1134)))
bx = bbox(sc); sc = sc.crop(bx)
items['scroll'] = shrink(sc, (round(sc.width * 0.24), round(sc.height * 0.24)), 1.15, 1.2)
items['scroll_s'] = shrink(sc, (round(sc.width * 0.15), round(sc.height * 0.15)), 1.15, 1.2)

# ---------- Faindo: 4 orientamenti x 3 fotogrammi ----------
ROWS = {'front': (392, 548), 'back': (552, 704), 'left': (708, 860), 'right': (862, 1012)}
COLS = [(318, 455), (498, 640), (693, 840)]
FS = 0.2
CELL_W, CELL_H = 30, 34
def frames(row):
    y0, y1 = ROWS[row]; out = []
    for (x0, x1) in COLS:
        cell = clean(src.crop((x0, y0, x1, y1)))
        bb = bbox(cell); sp = cell.crop(bb)
        a = np.array(sp)[:, :, 3] > 60
        h = a.shape[0]
        head = a[int(h * .08):int(h * .42)]
        xs = np.where(head.any(axis=0))[0]
        cx = (xs.min() + xs.max()) / 2.0
        out.append((sp, cx))
    return out
def place(sp, cx):
    w, h = round(sp.width * FS), round(sp.height * FS)
    small = shrink(sp, (w, h), 1.2, 1.25)
    cell = Image.new('RGBA', (CELL_W, CELL_H), (0, 0, 0, 0))
    ox = round(CELL_W / 2 - cx * FS); oy = CELL_H - h - 1
    cell.alpha_composite(small, (max(0, ox), max(0, oy)))
    # centro della testa sempre sulla colonna centrale: nessuno scatto laterale fra i fotogrammi
    a = np.array(cell)[:, :, 3] > 0; ys = np.where(a.any(axis=1))[0]; top = ys.min(); hh = ys.max() - top + 1
    hx = np.where(a[top:top + int(hh * .4)].any(axis=0))[0]; shift = CELL_W // 2 - int(round((hx.min() + hx.max()) / 2.0))
    if shift:
        arr = np.array(cell); arr = np.roll(arr, shift, axis=1)
        if shift > 0: arr[:, :shift] = 0
        else: arr[:, shift:] = 0
        cell = Image.fromarray(arr, 'RGBA')
    return cell
for row in ROWS:
    fr = frames(row)
    if row == 'back':           # sulla tavola l'antenna sta a sinistra anche di spalle: di spalle deve stare a destra (lato destro di Faindo)
        fr = [(sp.transpose(Image.FLIP_LEFT_RIGHT), sp.width - cx) for sp, cx in fr]
    for i, (sp, cx) in enumerate(fr):
        items['f_%s_%d' % (row, i)] = place(sp, cx)

# ---------- icone ----------
def icon(box, name, scale):
    im = clean(src.crop(box)); bb = bbox(im); im = im.crop(bb)
    items[name] = shrink(im, (round(im.width * scale), round(im.height * scale)), 1.1, 1.15)
icon((436, 1314, 544, 1398), 'ico_flash', 0.30)
icon((582, 1314, 694, 1398), 'ico_jump', 0.30)
# testa per le vite: parte alta del fotogramma frontale fermo
fr0 = frames('front')[0][0]
head = fr0.crop((0, 0, fr0.width, int(fr0.height * 0.62)))
items['life'] = shrink(head, (round(head.width * 0.13), round(head.height * 0.13)), 1.2, 1.25)

# ---------- impacchettamento a scaffali ----------
order = list(items.keys())
sheetw = 512; x = y = rowh = 0; pos = {}
for n in order:
    im = items[n]
    if x + im.width + 1 > sheetw: x = 0; y += rowh + 1; rowh = 0
    pos[n] = [x, y, im.width, im.height]; x += im.width + 1; rowh = max(rowh, im.height)
atlas = Image.new('RGBA', (sheetw, y + rowh + 1), (0, 0, 0, 0))
for n in order: atlas.alpha_composite(items[n], tuple(pos[n][:2]))
atlas.save('atlas.png', optimize=True)
for n in ('ico_flash', 'ico_jump', 'life', 'scroll_s'): items[n].save(n.replace('_', '-') + '.png', optimize=True)   # icone sciolte per la barra HTML
open('atlas.js', 'w', encoding='utf-8').write(
    '/* Generato da sprites/build-atlas.py: coordinate [x, y, larghezza, altezza] degli sprite in atlas.png. */\n'
    'export const ATLAS = ' + json.dumps(pos, separators=(',', ':')) + ';\n'
    'export const TILE_W = %d, TILE_H = %d;\n' % (TW, TH) + 'export const BLDG_GAP = ' + json.dumps(GAPC) + ';   // centro orizzontale della zolla d\'ingresso\n'
    'export const BLDG_FACE = ' + json.dumps(FACEY) + ';   // altezza del bordo alto della zolla d\'ingresso\n')
print(atlas.size, {k: v[2:] for k, v in pos.items()})
