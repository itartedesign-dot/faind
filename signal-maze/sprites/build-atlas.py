"""Ritaglia sheet-source.png (riferimento grafico di Faindo, robot, porte, scrivanie) in sprite a risoluzione nativa
di gioco (tile = 16 px) e scrive atlas.png + atlas.js. Uso: python3 build-atlas.py"""
from PIL import Image, ImageEnhance
import numpy as np, json

src = Image.open('sheet-source.png').convert('RGBA')

def crop(box):
    return src.crop(box)

def bbox(im):
    a = np.array(im)[:, :, 3] > 40
    ys, xs = np.where(a)
    return xs.min(), ys.min(), xs.max() + 1, ys.max() + 1

def shrink(im, size):
    # alpha premoltiplicata, poi riduzione e alpha netta (pixel senza sfumature sul bordo)
    arr = np.array(im).astype(float)
    al = arr[:, :, 3:4] / 255.0
    pm = np.concatenate([arr[:, :, :3] * al, arr[:, :, 3:4]], axis=2)
    big = Image.fromarray(pm.clip(0, 255).astype('uint8'), 'RGBA')
    sm = big.resize(size, Image.LANCZOS)
    a = np.array(sm).astype(float)
    alpha = a[:, :, 3:4]
    rgb = np.where(alpha > 0, a[:, :, :3] / np.maximum(alpha, 1) * 255, 0).clip(0, 255)
    out = np.concatenate([rgb, np.where(alpha > 110, 255, 0)], axis=2).astype('uint8')
    r = Image.fromarray(out, 'RGBA')
    r = ImageEnhance.Contrast(r).enhance(1.25)
    r = ImageEnhance.Color(r).enhance(1.25)
    # il contrasto tocca anche l'alpha: la rimettiamo netta
    o = np.array(r); o[:, :, 3] = np.where(out[:, :, 3] > 0, 255, 0); return Image.fromarray(o, 'RGBA')

def tight(im):
    return im.crop(bbox(im))

items = {}   # nome -> immagine
def add(name, box, scale=None, size=None, tightcrop=True):
    im = crop(box)
    if tightcrop: im = tight(im)
    if size is None: size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
    items[name] = shrink(im, size)

# chiavi e documenti
for n, b in zip(['key0', 'key1', 'key2'], [(228, 12, 332, 132), (336, 8, 440, 128), (440, 12, 544, 128)]): add(n, b, size=(13, 14))
for n, b in zip(['doc0', 'doc1', 'doc2'], [(568, 8, 664, 128), (676, 8, 768, 128), (776, 8, 868, 128)]): add(n, b, size=(11, 14))
# porte: righe = colori (arancio, giallo, ciano); colonne = chiusa orizzontale, aperta orizzontale, chiusa verticale, aperta verticale
cols = [(30, 195), (198, 365), (378, 518), (518, 660)]
rows = [(140, 268), (278, 402), (412, 542)]
for r in range(3):
    for c in range(4):
        add('door%d_%d' % (r, c), (cols[c][0], rows[r][0], cols[c][1], rows[r][1]), size=(16, 16))
add('exit_off', (668, 285, 832, 498), size=(16, 20)); add('exit_on', (838, 285, 1010, 498), size=(16, 20))
# Faindo: righe = giù, su, sinistra, destra; 3 fotogrammi ciascuna
fcols = [(300, 425), (445, 575), (590, 720)]
frows = [(548, 700), (698, 848), (848, 996), (996, 1146)]
raw = {}
for r in range(4):
    for c in range(3):
        raw[(r, c)] = tight(crop((fcols[c][0], frows[r][0], fcols[c][1], frows[r][1])))
ref_h = raw[(0, 0)].height
sc = 22.0 / ref_h
for (r, c), im in raw.items():
    w, h = max(1, round(im.width * sc)), max(1, round(im.height * sc))
    items['faindo%d_%d' % (r, c)] = shrink(im, (w, h))
# robot (4 viste) e scintille
rcols = [(25, 182), (192, 348), (352, 508), (508, 662)]
for i, b in enumerate(rcols): add('robot%d' % i, (b[0], 1160, b[1], 1330), scale=0.118)
for i, b in enumerate([(696, 1196, 824, 1290), (872, 1196, 966, 1294), (912, 1266, 1002, 1338), (696, 1282, 778, 1338)]):
    add('spark%d' % i, b, scale=0.085)
add('desk0', (238, 1350, 522, 1505), size=(25, 14)); add('desk1', (575, 1342, 768, 1512), size=(15, 14))

# atlante
names = list(items)
W = 256
x = y = rowh = 0; rects = {}
for n in names:
    im = items[n]
    if x + im.width > W: x = 0; y += rowh + 1; rowh = 0
    rects[n] = [x, y, im.width, im.height]
    x += im.width + 1; rowh = max(rowh, im.height)
H = y + rowh
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for n in names: atlas.paste(items[n], tuple(rects[n][:2]))
atlas.save('atlas.png', optimize=True)
open('atlas.js', 'w').write('/* generato da sprites/build-atlas.py: ritagli (x, y, larghezza, altezza) di atlas.png, tile = 16 px */\nexport const ATLAS = ' + json.dumps(rects) + ';\n')
# anteprima ingrandita per controllo a occhio
atlas.resize((W * 4, H * 4), Image.NEAREST).save('/tmp/atlas-preview.png')
print(W, H, len(names))
