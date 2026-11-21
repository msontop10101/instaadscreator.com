import json
from lib import cr

I_DL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path></svg>'
I_APPLE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="3"></rect><path d="M11 18h2"></path></svg>'
I_PLAY = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3l14 9-14 9z"></path></svg>'
I_CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2.25" aria-hidden="true" style="flex-shrink: 0"><path d="M5 12l5 5L20 7"></path></svg>'
I_STAR = '★'


class App:
    """t keys: bg, ink, muted, accent, aink, card (css), btn (css primary), btn2 (css secondary), hf, bf, hw, h1, h2, body,
    upper, ls, decor (html), phone (frame color), screen (screen bg), sink (screen ink), soft, line, hx (heading extra css)"""
    def __init__(self, t):
        t.setdefault('upper', False); t.setdefault('ls', '-0.02em'); t.setdefault('hw', 700); t.setdefault('hx', '')
        t.setdefault('decor', ''); t.setdefault('px', 20); t.setdefault('line', t['soft']); t.setdefault('atext', t['accent'])
        t.setdefault('lh', 1.05); t.setdefault('label', f'font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: {t["atext"]}')
        self.t = t; self.parts = []; self.h = 0

    def add(self, s, h):
        self.parts.append(s); self.h += h

    def H(self, text, size=None, align='left', color=None, tag='h2'):
        t = self.t; size = size or t['h2']
        up = 'uppercase' if t['upper'] else 'none'
        return (f'<{tag} style="margin: 0; font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: {size}px; line-height: {t["lh"]}; '
                f'letter-spacing: {t["ls"]}; text-transform: {up}; color: {color or t["ink"]}; text-align: {align}; {t["hx"]}">{text}</{tag}>')

    def P(self, text, size=None, align='left', color=None):
        t = self.t
        return f'<p style="margin: 0; font-size: {size or t["body"]}px; line-height: 1.55; color: {color or t["muted"]}; text-align: {align}">{text}</p>'

    def label(self, text, align='left'):
        return f'<div style="{self.t["label"]}; text-align: {align}">{text}</div>'

    def stores(self, align='flex-start', stack=False):
        t = self.t
        b1 = f'<a href="#get" style="{t["btn"]}; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 18px; font-size: 15px; font-weight: 700; text-decoration: none; flex: 1 1 150px">{I_APPLE}App Store</a>'
        b2 = f'<a href="#get" style="{t["btn2"]}; display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 52px; padding: 0 18px; font-size: 15px; font-weight: 700; text-decoration: none; flex: 1 1 150px">{I_PLAY}Google Play</a>'
        return f'<div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: {align}">{b1}{b2}</div>'

    def rating(self, align='flex-start'):
        t = self.t
        return f'<div style="display: flex; align-items: center; gap: 8px; justify-content: {align}; font-size: 13px; color: {t["muted"]}"><span style="color: {t["atext"]}; letter-spacing: 1px" aria-label="Rating">★★★★★</span><span>[4.8] rating · [50k]+ downloads</span></div>'

    def phone(self, label, w=220, h=450, rot=0, extra=''):
        t = self.t
        tf = f'transform: rotate({rot}deg);' if rot else ''
        rows = ''.join(f'<div style="height: {hh}px; border-radius: 10px; background: {t["screen2"]}; {"width: " + ww + ";" if ww else ""}"></div>' for hh, ww in [(14, '55%'), (90, ''), (40, ''), (40, ''), (40, '80%')])
        return (f'<div style="width: {w}px; height: {h}px; flex-shrink: 0; box-sizing: border-box; border-radius: 38px; border: 8px solid {t["phone"]}; background: {t["screen"]}; '
                f'padding: 26px 14px 14px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; {tf} {extra}">'
                f'<div style="font-size: 11px; font-weight: 700; color: {t["sink"]}">{label}</div>{rows}</div>')

    # ---------- sections ----------
    def nav(self, name):
        t = self.t
        icon = f'<span style="width: 34px; height: 34px; border-radius: 10px; background: {t["accent"]}; color: {t["aink"]}; display: inline-flex; align-items: center; justify-content: center; font-family: {t["hf"]}; font-weight: 700; font-size: 16px">{name[0]}</span>'
        self.add(f'<header style="position: relative; padding: 16px {t["px"]}px; display: flex; align-items: center; justify-content: space-between"><div style="display: flex; align-items: center; gap: 10px; font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 19px; color: {t["ink"]}">{icon}{name}</div><a href="#get" style="{t["btn"]}; min-height: 40px; padding: 0 14px; display: inline-flex; align-items: center; font-size: 13px; font-weight: 700; text-decoration: none">Get app</a></header>', 72)

    def hero(self, v, c):
        t = self.t; P = t['px']
        lab = self.label(c['label'], 'center' if v in ('center', 'floating') else 'left') if c.get('label') else ''
        h1 = self.H(c['h1'], t['h1'], 'center' if v in ('center', 'floating') else 'left', tag='h1')
        est_txt = len(c['h1']) * t['h1'] * 0.028 + len(c['sub']) * 0.5
        if v == 'center':
            s = (f'<section style="position: relative; padding: 18px {P}px 0; display: flex; flex-direction: column; gap: 16px; align-items: stretch">{lab}{h1}{self.P(c["sub"], t["body"] + 1, "center")}'
                 f'{self.stores("center")}{self.rating("center")}<div style="display: flex; justify-content: center; padding-top: 8px">{self.phone(c["screen"])}</div></section>')
            self.add(s, 18 + 60 + est_txt + 120 + 40 + 470)
        elif v == 'tilt':
            s = (f'<section style="position: relative; padding: 18px {P}px 0; display: flex; flex-direction: column; gap: 16px">{lab}{h1}{self.P(c["sub"], t["body"] + 1)}{self.stores()}{self.rating()}'
                 f'<div style="display: flex; justify-content: flex-end; padding: 20px 10px 10px 0">{self.phone(c["screen"], 230, 460, -7)}</div></section>')
            self.add(s, 18 + 60 + est_txt + 120 + 40 + 500)
        elif v == 'duo':
            s = (f'<section style="position: relative; padding: 18px {P}px 0; display: flex; flex-direction: column; gap: 16px">{lab}{h1}{self.P(c["sub"], t["body"] + 1)}{self.stores()}{self.rating()}'
                 f'<div style="position: relative; height: 470px; margin-top: 8px">'
                 f'<div style="position: absolute; left: 0; top: 40px">{self.phone(c["screen"], 200, 420)}</div>'
                 f'<div style="position: absolute; right: 0; top: 0">{self.phone(c.get("screen2", "Second screen"), 200, 420)}</div></div></section>')
            self.add(s, 18 + 60 + est_txt + 120 + 40 + 490)
        elif v == 'floating':
            chips = ''.join(f'<div style="position: absolute; {pos}; {t["card"]}; padding: 10px 14px; font-size: 13px; font-weight: 700; color: {t["ink"]}; white-space: nowrap">{txt}</div>' for txt, pos in c['chips'])
            s = (f'<section style="position: relative; padding: 18px {P}px 0; display: flex; flex-direction: column; gap: 16px">{lab}{h1}{self.P(c["sub"], t["body"] + 1, "center")}{self.stores("center")}{self.rating("center")}'
                 f'<div style="position: relative; height: 500px; display: flex; justify-content: center; padding-top: 20px">{self.phone(c["screen"])}{chips}</div></section>')
            self.add(s, 18 + 60 + est_txt + 120 + 40 + 520)
        elif v == 'bigtype':
            s = (f'<section style="position: relative; padding: 18px {P}px 0; display: flex; flex-direction: column; gap: 18px">{lab}{h1}'
                 f'<div style="display: flex; gap: 14px; align-items: flex-end">{self.phone(c["screen"], 170, 350)}<div style="display: flex; flex-direction: column; gap: 12px">{self.P(c["sub"])}</div></div>'
                 f'{self.stores()}{self.rating()}</section>')
            self.add(s, 18 + 60 + est_txt * 1.2 + 360 + 120 + 40)

    def strip(self, items):
        t = self.t
        cells = ''.join(f'<div style="{t["card"]}; padding: 14px 8px; text-align: center"><div style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 22px; color: {t["ink"]}">{a}</div><div style="font-size: 12px; color: {t["muted"]}; margin-top: 2px">{b}</div></div>' for a, b in items)
        self.add(f'<section style="position: relative; padding: 32px {t["px"]}px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px">{cells}</section>', 32 + 90)

    def features(self, title, items, v='list'):
        t = self.t; P = t['px']
        head = self.H(title)
        if v == 'list':
            rows = ''.join(f'<div style="{t["card"]}; padding: 18px; display: flex; gap: 14px; align-items: flex-start"><div style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; background: {t["accent"]}; color: {t["aink"]}; display: flex; align-items: center; justify-content: center; font-weight: 700">{i + 1}</div><div><div style="font-weight: 700; font-size: {t["body"] + 1}px; color: {t["ink"]}">{a}</div><div style="font-size: {t["body"] - 1}px; line-height: 1.5; color: {t["muted"]}; margin-top: 4px">{b}</div></div></div>' for i, (a, b) in enumerate(items))
            self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 12px">{head}{rows}</section>', 40 + t['h2'] * 2.4 + len(items) * 104)
        elif v == 'bento':
            spans = ['grid-column: span 2', '', '', 'grid-column: span 2', '', '']
            fills = [t['accent'], t['soft'], '', '', t['soft'], '']
            cells = ''
            for i, (a, b) in enumerate(items):
                f = fills[i % 6]; ink = t['aink'] if f == t['accent'] else t['ink']; mu = t['aink'] if f == t['accent'] else t['muted']
                bg = f'background: {f};' if f else ''
                cells += (f'<div style="{t["card"]}; {bg} {spans[i % 6]}; padding: 18px; min-height: {150 if spans[i % 6] else 160}px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: flex-end; gap: 6px">'
                          f'<div style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 20px; line-height: 1.1; color: {ink}">{a}</div><div style="font-size: 13px; line-height: 1.45; color: {mu}">{b}</div></div>')
            rows = 0; col = 0
            for i in range(len(items)):
                w = 2 if spans[i % 6] else 1
                if col + w > 2: rows += 1; col = 0
                col += w
                if col == 2: rows += 1; col = 0
            if col: rows += 1
            self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 14px">{head}<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">{cells}</div></section>', 40 + t['h2'] * 2.4 + rows * 172)
        elif v == 'alt':
            rows = ''
            for i, (a, b) in enumerate(items):
                ph = self.phone(f'Screen · {a}', 150, 300)
                txt = f'<div style="display: flex; flex-direction: column; gap: 8px; justify-content: center"><div style="{t["label"]}">0{i + 1}</div><div style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 22px; line-height: 1.1; color: {t["ink"]}">{a}</div><div style="font-size: {t["body"] - 1}px; line-height: 1.5; color: {t["muted"]}">{b}</div></div>'
                rows += f'<div style="display: flex; gap: 16px; align-items: center; flex-direction: {"row" if i % 2 == 0 else "row-reverse"}">{ph}{txt}</div>'
            self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 22px">{head}{rows}</section>', 40 + t['h2'] * 2.4 + len(items) * 322)
        elif v == 'checks':
            rows = ''.join(f'<div style="display: flex; gap: 12px; align-items: flex-start; padding: 14px 0; border-top: 1px solid {t["line"]}">{I_CHECK.format(c=t["atext"])}<div style="font-size: {t["body"]}px; line-height: 1.5; color: {t["ink"]}"><strong>{a}</strong> <span style="color: {t["muted"]}">{b}</span></div></div>' for a, b in items)
            self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 6px">{head}<div>{rows}</div></section>', 40 + t['h2'] * 2.4 + len(items) * 80)

    def screens(self, title, labels):
        t = self.t; P = t['px']
        ph = ''.join(self.phone(l, 180, 370) for l in labels)
        self.add(f'<section style="position: relative; padding: 40px 0 0 {P}px; display: flex; flex-direction: column; gap: 16px"><div style="padding-right: {P}px">{self.H(title)}</div><div style="display: flex; gap: 12px; overflow: hidden">{ph}</div></section>', 40 + t['h2'] * 2.4 + 380)

    def steps(self, title, items):
        t = self.t; P = t['px']
        rows = ''.join(f'<div style="display: flex; gap: 14px; align-items: flex-start"><div style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 34px; line-height: 1; color: {t["atext"]}; width: 44px; flex-shrink: 0">{i + 1}</div><div style="font-size: {t["body"]}px; line-height: 1.5; color: {t["ink"]}; padding-top: 4px">{a}</div></div>' for i, a in enumerate(items))
        self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 16px">{self.H(title)}{rows}</section>', 40 + t['h2'] * 2.4 + len(items) * 62)

    def reviews(self, title, n=2):
        t = self.t; P = t['px']
        cards = ''.join(f'<div style="{t["card"]}; padding: 18px; display: flex; flex-direction: column; gap: 8px"><div style="color: {t["atext"]}; letter-spacing: 2px" aria-label="5 out of 5 stars">★★★★★</div><p style="margin: 0; font-size: {t["body"]}px; line-height: 1.5; color: {t["ink"]}">[App Store review]</p><div style="font-size: 13px; color: {t["muted"]}">[Name] · [Date]</div></div>' for _ in range(n))
        self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 12px">{self.H(title)}{cards}</section>', 40 + t['h2'] * 2.4 + n * 140)

    def pricing(self, title, plans, sel=1):
        t = self.t; P = t['px']
        cards = ''
        for i, (name, price, feats) in enumerate(plans):
            hl = i == sel
            bg = f'background: {t["accent"]};' if hl else ''
            ink = t['aink'] if hl else t['ink']
            fl = ''.join(f'<div style="display: flex; gap: 8px; font-size: 14px; line-height: 1.4; color: {ink}">{I_CHECK.format(c=ink)}<span>{f}</span></div>' for f in feats)
            cards += (f'<div style="{t["card"]}; {bg} padding: 20px; display: flex; flex-direction: column; gap: 10px"><div style="display: flex; justify-content: space-between; align-items: baseline">'
                      f'<span style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 20px; color: {ink}">{name}</span><span style="font-weight: 700; font-size: 18px; color: {ink}">{price}</span></div>{fl}</div>')
        self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 12px">{self.H(title)}{cards}</section>', 40 + t['h2'] * 2.4 + sum(80 + len(f) * 26 for _, _, f in plans))

    def faq(self, rows):
        t = self.t; P = t['px']
        body = ''.join(f'<div style="border-top: 1px solid {t["line"]}; padding: 16px 0"><div style="font-weight: 700; font-size: {t["body"]}px; color: {t["ink"]}">{q}</div><div style="font-size: {t["body"] - 1}px; color: {t["muted"]}; margin-top: 6px; line-height: 1.5">{a}</div></div>' for q, a in rows)
        self.add(f'<section style="position: relative; padding: 40px {P}px 0; display: flex; flex-direction: column; gap: 8px">{self.H("Questions")}<div style="border-bottom: 1px solid {t["line"]}">{body}</div></section>', 40 + t['h2'] * 2.4 + len(rows) * 98)

    def final(self, title, sub):
        t = self.t; P = t['px']
        qr = f'<div style="width: 96px; height: 96px; margin: 0 auto; border-radius: 12px; background: {t["screen"]}; border: 2px dashed {t["muted"]}; display: flex; align-items: center; justify-content: center; font-size: 11px; color: {t["sink"]}">QR code</div>'
        self.add(f'<section id="get" style="position: relative; margin: 44px {P}px 0; {t["card"]}; padding: 28px 20px; display: flex; flex-direction: column; gap: 14px; text-align: center">{self.H(title, t["h2"], "center")}{self.P(sub, None, "center")}{self.stores("center")}{qr}</section>', 44 + t['h2'] * 2.4 + 80 + 120 + 110)

    def footer(self, name):
        t = self.t
        self.add(f'<footer style="position: relative; flex-grow: 1; padding: 28px 20px 120px; display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 12px; color: {t["muted"]}"><div>© {name} · Privacy · Terms</div><div style="border: 1px solid {t["line"]}; border-radius: 999px; padding: 6px 12px">Made with [Brand]</div></footer>', 190)

    def bar(self, name, tagline):
        t = self.t
        icon = f'<span style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 11px; background: {t["accent"]}; color: {t["aink"]}; display: inline-flex; align-items: center; justify-content: center; font-family: {t["hf"]}; font-weight: 700; font-size: 18px">{name[0]}</span>'
        self.parts.append(f'<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px 20px; background: {t["barbg"]}; border-top: 1px solid {t["line"]}; display: flex; align-items: center; gap: 12px; z-index: 2">{icon}'
                          f'<div style="flex-grow: 1; min-width: 0"><div style="font-size: 15px; font-weight: 700; color: {t["barink"]}">{name}</div><div style="font-size: 12px; color: {t["barmuted"]}">{tagline}</div></div>'
                          f'<a href="#get" style="{t["btn"]}; display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 0 16px; font-size: 14px; font-weight: 700; text-decoration: none; white-space: nowrap">{I_DL}Get the app</a></div>')

    def render(self, title):
        t = self.t
        Hh = int((self.h * 1.15 + 160) // 20 * 20)
        props = {"$preview": {"width": 390, "height": Hh}}
        body = '\n'.join(self.parts)
        html = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?{t['furl']}&amp;display=swap" rel="stylesheet">
<style>
body{{margin:0}}
a{{color:{t['atext']}}}a:hover{{color:{t['ink']}}}
</style>
</helmet>
<div style="width: 390px; height: {Hh}px; position: relative; overflow: hidden; background: {t['bg']}; color: {t['ink']}; font-family: {t['bf']}; display: flex; flex-direction: column">
{t['decor']}
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{json.dumps(props)}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''
        return html, Hh


def check2(t, solid_bg=None):
    bg = solid_bg or t['bg']
    out = []
    for a, b, need, lab in [(t['ink'], bg, 7, 'ink'), (t['muted'], bg, 4.5, 'muted'), (t['atext'], bg, 4.5, 'atext'), (t['aink'], t['accent'], 4.5, 'aink'),
                            (t['barink'], t['barbg'], 7, 'barink'), (t['barmuted'], t['barbg'], 4.5, 'barmuted'), (t['sink'], t['screen'], 4.5, 'sink')]:
        if a.startswith('#') and b.startswith('#'):
            r = cr(a, b)
            if r < need: out.append(f'{lab} {a}/{b}={r:.2f}')
    return out
