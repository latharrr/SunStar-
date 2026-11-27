# python3 make_pdf.py  -> catalog.pdf  (needs: pip install reportlab cairosvg pillow; run `node build.mjs` first is not required)
import json, io, subprocess, cairosvg
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader

D = json.loads(subprocess.check_output(['node', '-e', "import('./data.mjs').then(m=>console.log(JSON.stringify(m)))"]))
S, P = D['site'], D['products']
svg = open('assets/sunstar-logo.svg').read()
png = lambda col, w: Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.replace('currentColor', col).encode(), output_width=w)))
logo_w, logo_b = png('#FFFFFF', 900), png('#1E3A8A', 500)
def jpg(im, maxw=700):
    im = im.copy(); im.thumbnail((maxw, maxw)); b = io.BytesIO(); im.save(b, 'JPEG', quality=82); b.seek(0); return ImageReader(b), im.size
def fit(c, text, font, size, maxw):
    while c.stringWidth(text, font, size) > maxw and ' ' in text: text = text.rsplit(' ', 1)[0]
    return text

W, H = A4
c = canvas.Canvas('catalog.pdf', pagesize=A4); c.setTitle('Sunstar Product Catalog'); c.setAuthor(S['name'])
blue, ink, muted, line = HexColor('#1E3A8A'), HexColor('#0F172A'), HexColor('#64748B'), HexColor('#E2E8F0')
c.setFillColor(blue); c.rect(0, 0, W, H, stroke=0, fill=1)
tw = 380; c.drawImage(ImageReader(logo_w), (W - tw) / 2, H / 2 + 40, tw, tw * logo_w.size[1] / logo_w.size[0], mask='auto')
c.setFillColor(HexColor('#C9D5F5')); c.setFont('Helvetica', 11); c.drawCentredString(W / 2, H / 2 + 18, 'W E I G H I N G   S O L U T I O N S')
c.setFillColor(HexColor('#FFFFFF')); c.setFont('Times-Bold', 30); c.drawCentredString(W / 2, H / 2 - 40, 'Product Catalog')
c.setFont('Helvetica', 11); c.drawCentredString(W / 2, H / 2 - 64, 'Platform, floor, tabletop, price computing, precision, crane and livestock scales')
c.setFont('Helvetica', 10); c.setFillColor(HexColor('#C9D5F5'))
c.drawCentredString(W / 2, 70, S['address'])
c.drawCentredString(W / 2, 54, f"Phone / WhatsApp {S['phoneDisplay']}   |   GSTIN {S['gstin']}   |   {S['iso']}")
c.showPage()
cw, ch = (W - 3 * 36) / 2, (H - 3 * 36 - 40) / 2
for i, p in enumerate(P):
    if i % 4 == 0:
        if i: c.showPage()
        c.drawImage(ImageReader(logo_b), 36, H - 44, 110, 110 * logo_b.size[1] / logo_b.size[0], mask='auto')
        c.setFillColor(muted); c.setFont('Helvetica', 9); c.drawRightString(W - 36, H - 38, 'Prices on request: WhatsApp ' + S['phoneDisplay'])
    col, row = i % 2, (i % 4) // 2
    x = 36 + col * (cw + 36); y = H - 60 - 36 - (row + 1) * ch - row * 36 + 36
    c.setStrokeColor(line); c.setFillColor(HexColor('#FFFFFF')); c.roundRect(x, y, cw, ch, 10, stroke=1, fill=1)
    ih = ch * 0.46
    if p['img']:
        im = Image.open(f"assets/p/{p['img']}.webp").convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, (0, 0), im)
        rd, (iw, ihh) = jpg(bg); r = min((cw - 40) / iw, (ih - 20) / ihh); w_, h_ = iw * r, ihh * r
        c.drawImage(rd, x + (cw - w_) / 2, y + ch - 12 - h_ - (ih - 20 - h_) / 2, w_, h_)
    else:
        c.setFillColor(HexColor('#F3F6FD')); c.roundRect(x + 16, y + ch - ih, cw - 32, ih - 12, 8, stroke=0, fill=1)
        c.setFillColor(blue); c.setFont('Times-Bold', 16); c.drawCentredString(x + cw / 2, y + ch - ih / 2, p['model'] or p['name'])
        c.setFont('Helvetica', 9); c.setFillColor(muted); c.drawCentredString(x + cw / 2, y + ch - ih / 2 - 16, 'Photo on request')
    ty = y + ch - ih - 22
    c.setFillColor(muted); c.setFont('Helvetica-Bold', 8); c.drawString(x + 16, ty, (p['pill'] + ('  |  ' + p['model'] if p['model'] else '')).upper())
    c.setFillColor(ink); c.setFont('Times-Bold', 14); c.drawString(x + 16, ty - 18, fit(c, p['name'], 'Times-Bold', 14, cw - 32))
    c.setFont('Helvetica', 8.5); c.setFillColor(HexColor('#475569'))
    words, ln, yy, n = p['desc'].split(), '', ty - 34, 0
    for w in words:
        if c.stringWidth((ln + ' ' + w).strip(), 'Helvetica', 8.5) > cw - 32:
            c.drawString(x + 16, yy, ln.strip()); yy -= 11; ln = w; n += 1
            if n >= 3: ln = ''; break
        else: ln += ' ' + w
    if ln: c.drawString(x + 16, yy, ln.strip()); yy -= 11
    yy -= 8
    for k, lab in (('capacity', 'Capacity'), ('accuracy', 'Accuracy')):
        c.setFillColor(muted); c.setFont('Helvetica', 8); c.drawString(x + 16, yy, lab)
        c.setFillColor(ink); c.setFont('Helvetica-Bold', 9); c.drawString(x + 70, yy, p[k]); yy -= 13
    feats, out = p['features'], ''
    for f in feats:
        t = (out + '  ·  ' + f) if out else f
        if c.stringWidth(t, 'Helvetica', 8.5) > cw - 32: break
        out = t
    c.setFillColor(HexColor('#2554D6')); c.setFont('Helvetica', 8.5); c.drawString(x + 16, yy - 2, out)
c.showPage(); c.save(); print('catalog.pdf written')
