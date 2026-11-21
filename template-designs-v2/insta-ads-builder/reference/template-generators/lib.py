import json

def _lum(h):
    h = h.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]

def cr(a, b):
    a, b = _lum(a), _lum(b)
    return (max(a, b) + .05) / (min(a, b) + .05)

WA = ('#25D366', '#062B16')

ICON_IMG = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M21 16l-5-5-9 9"></path></svg>'
ICON_CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="2.25" aria-hidden="true" style="flex-shrink: 0"><path d="M5 12l5 5L20 7"></path></svg>'
ICON_CHAT = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"></path></svg>'
ICON_PHONE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"></path></svg>'
ICON_DM = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"></path></svg>'
ICON_FORM = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="2"></rect><path d="M9 8h6M9 12h6M9 16h3"></path></svg>'
ICON_CARD = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M2 10h20"></path></svg>'
ICON_SHIELD = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"></path><path d="M8.5 12l2.5 2.5 4.5-5"></path></svg>'

METHOD_ICON = {'whatsapp': ICON_CHAT, 'call': ICON_PHONE, 'dm': ICON_DM, 'form': ICON_FORM, 'pay': ICON_CARD}


class Page:
    def __init__(self, t):
        self.t = t
        self.parts = []
        self.h = 0
        t.setdefault('dark', t['ink']); t.setdefault('dink', t['bg'])
        t.setdefault('atext', t['accent']); t.setdefault('line', t['soft'])
        t.setdefault('upper', False); t.setdefault('ls', '-0.01em'); t.setdefault('hw', 700)
        t.setdefault('r', 16); t.setdefault('br', 12); t.setdefault('px', 20)

    # ---------- helpers ----------
    def add(self, html, h):
        self.parts.append(html); self.h += h

    def acc(self):
        return '{{accent}}'

    def head(self, text, size=28, color=None, align='left', mb=0):
        t = self.t
        up = 'uppercase' if t['upper'] else 'none'
        return (f'<h2 style="margin: 0 0 {mb}px; font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: {size}px; '
                f'line-height: 1.08; letter-spacing: {t["ls"]}; text-transform: {up}; color: {color or t["ink"]}; text-align: {align}">{text}</h2>')

    def ph(self, label, h, radius=None, bg=None, extra=''):
        t = self.t; r = t['r'] if radius is None else radius
        bg = bg or t['soft']
        col = t['muted'] if cr(t['muted'], bg) >= 4.5 else t['ink']
        rs = f'{r}px' if isinstance(r, int) else r
        return (f'<div style="height: {h}px; border-radius: {rs}; background: {bg}; display: flex; flex-direction: column; '
                f'align-items: center; justify-content: center; gap: 6px; color: {col}; font-size: 12px; text-align: center; padding: 0 10px; {extra}">'
                f'{ICON_IMG}<span>{label}</span></div>')

    def btn_colors(self):
        m = self.t['method']
        if m['type'] == 'whatsapp':
            return WA
        return (self.acc(), self.t['aink'])

    def cta(self, label=None, full=True, size=17, h=56, on_dark=False):
        t = self.t; m = t['method']; bg, fg = self.btn_colors()
        label = label or m['label']
        w = 'display: flex; width: 100%;' if full else 'display: inline-flex;'
        return (f'<a href="#order" style="{w} box-sizing: border-box; align-items: center; justify-content: center; gap: 10px; min-height: {h}px; '
                f'padding: 0 20px; border-radius: {t["br"]}px; background: {bg}; color: {fg}; font-family: {t["bf"]}; font-size: {size}px; '
                f'font-weight: 700; text-decoration: none">{METHOD_ICON[m["type"]]}{label}</a>')

    def price(self, price, old=None, badge=None, size=30, color=None, align='flex-start'):
        t = self.t; c = color or t['ink']
        s = f'<div style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; justify-content: {align}"><span style="font-family: {t["pf"] if "pf" in t else t["hf"]}; font-size: {size}px; font-weight: 700; color: {c}">{price}</span>'
        if old:
            s += f'<span style="font-size: 16px; color: {t["muted"] if color is None else c}; text-decoration: line-through; opacity: {1 if color is None else 0.8}">{old}</span>'
        if badge:
            s += f'<span style="font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; background: {self.acc()}; color: {t["aink"]}">{badge}</span>'
        return s + '</div>'

    def sec(self, inner, gap=16, pad_top=32, pad_bottom=0, bg=None, extra=''):
        t = self.t
        b = f'background: {bg};' if bg else ''
        return (f'<section style="padding: {pad_top}px {t["px"]}px {pad_bottom}px; display: flex; flex-direction: column; gap: {gap}px; {b} {extra}">{inner}</section>')

    def p(self, text, size=15, color=None, align='left', mw=''):
        t = self.t
        return f'<p style="margin: 0; font-size: {size}px; line-height: 1.55; color: {color or t["muted"]}; text-align: {align}">{text}</p>'

    # ---------- sections ----------
    def announce(self, text, variant='ink'):
        t = self.t
        if variant == 'accent':
            bg, fg = self.acc(), t['aink']
        elif variant == 'soft':
            bg, fg = t['soft'], t['ink']
        else:
            bg, fg = t['dark'], t['dink']
        if variant == 'marquee':
            items = ''.join(f'<span>{x}</span><span aria-hidden="true">✦</span>' for x in text)
            self.add(f'<div style="background: {self.acc()}; color: {t["aink"]}; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; padding: 10px 0; display: flex; gap: 14px; white-space: nowrap; overflow: hidden; justify-content: center">{items}</div>', 40)
            return
        self.add(f'<div style="background: {bg}; color: {fg}; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; letter-spacing: 0.03em">{text}</div>', 40)

    def header(self, brand, right='', variant='left'):
        t = self.t
        logo = f'<div style="font-family: {t["lf"] if "lf" in t else t["hf"]}; font-size: 22px; font-weight: {t["hw"]}; letter-spacing: {t["ls"]}; color: {t["ink"]}">{brand}</div>'
        if variant == 'center':
            self.add(f'<header style="padding: 16px {t["px"]}px; display: flex; flex-direction: column; align-items: center; gap: 2px">{logo}<div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: {t["muted"]}">{right}</div></header>', 76)
        else:
            self.add(f'<header style="padding: 14px {t["px"]}px; display: flex; align-items: center; justify-content: space-between">{logo}<div style="font-size: 12px; color: {t["muted"]}">{right}</div></header>', 58)

    def hero(self, v, c):
        t = self.t; P = t['px']
        eyebrow = c.get('eyebrow')
        eb = ''
        if eyebrow:
            eb = f'<div style="font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: {t["atext"]}">{eyebrow}</div>'
        trust = f'<div style="font-size: 13px; color: {t["muted"]}; text-align: {"center" if v in ("centered",) else "left"}">{c["trust"]}</div>' if c.get('trust') else ''
        if v == 'stack':
            html = (f'<section style="padding: 8px {P}px 0; display: flex; flex-direction: column; gap: 14px">{eb}{self.head(c["h1"], c.get("hs", 34))}'
                    f'{self.p(c["sub"], 16)}{self.ph(c["img"], 340)}{self.price(c["price"], c.get("old"), c.get("badge"))}{self.cta()}{trust}</section>')
            self.add(html, 330 + 340 + 120 + len(c['h1']) * 0.9 + len(c['sub']) * 0.45)
        elif v == 'fullbleed':
            dark = t['dark']; dink = t['dink']
            html = (f'<section style="display: flex; flex-direction: column">{self.ph(c["img"], 420, 0)}'
                    f'<div style="margin: -90px {P - 6}px 0; background: {t["surface"]}; border-radius: {t["r"]}px; padding: 22px 20px; display: flex; flex-direction: column; gap: 14px; position: relative; border: 1px solid {t["line"]}">'
                    f'{eb}{self.head(c["h1"], c.get("hs", 32))}{self.p(c["sub"], 15)}{self.price(c["price"], c.get("old"), c.get("badge"), 28)}{self.cta()}{trust}</div></section>')
            self.add(html, 420 - 90 + 300 + len(c['h1']) * 0.9 + len(c['sub']) * 0.45 + 40)
        elif v == 'poster':
            up = c['h1']
            html = (f'<section style="display: flex; flex-direction: column">'
                    f'<div style="background: {self.acc()}; padding: 28px {P}px 120px; display: flex; flex-direction: column; gap: 12px">'
                    f'{("<div style=" + chr(34) + "font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: " + t["aink"] + chr(34) + ">" + eyebrow + "</div>") if eyebrow else ""}'
                    f'{self.head(up, c.get("hs", 52), t["aink"])}</div>'
                    f'<div style="margin: -96px {P}px 0">{self.ph(c["img"], 300, None, t["soft"])}</div>'
                    f'<div style="padding: 20px {P}px 0; display: flex; flex-direction: column; gap: 14px">{self.p(c["sub"], 16)}{self.price(c["price"], c.get("old"), c.get("badge"))}{self.cta()}{trust}</div></section>')
            self.add(html, 28 + 120 + len(up) * 1.6 + 300 - 96 + 260 + len(c['sub']) * 0.45)
        elif v == 'centered':
            arch = c.get('arch', True)
            rad = '180px 180px 18px 18px' if arch else f'{t["r"]}px'
            pill = f'<div style="align-self: center; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; background: {t["soft"]}; color: {t["ink"]}">{eyebrow}</div>' if eyebrow else ''
            html = (f'<section style="padding: 12px {P}px 0; display: flex; flex-direction: column; gap: 14px; align-items: stretch; text-align: center">{pill}'
                    f'{self.head(c["h1"], c.get("hs", 34), None, "center")}{self.p(c["sub"], 16, None, "center")}'
                    f'<div style="padding: 0 18px">{self.ph(c["img"], 340, rad)}</div>{self.price(c["price"], c.get("old"), c.get("badge"), 30, None, "center")}{self.cta()}{trust}</section>')
            self.add(html, 330 + 340 + 130 + len(c['h1']) * 0.9 + len(c['sub']) * 0.45)
        elif v == 'collage':
            html = (f'<section style="padding: 8px {P}px 0; display: flex; flex-direction: column; gap: 14px">{eb}{self.head(c["h1"], c.get("hs", 34))}'
                    f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">'
                    f'<div style="grid-row: span 2">{self.ph(c["img"], 328)}</div>{self.ph(c.get("img2", "Detail shot"), 160)}{self.ph(c.get("img3", "In use"), 160, None, t["line"])}</div>'
                    f'{self.p(c["sub"], 16)}{self.price(c["price"], c.get("old"), c.get("badge"))}{self.cta()}{trust}</section>')
            self.add(html, 330 + 330 + 120 + len(c['h1']) * 0.9 + len(c['sub']) * 0.45)

    def trust(self, items, v='row'):
        t = self.t; P = t['px']
        if v == 'row':
            cells = ''.join(f'<div style="background: {t["surface"]}; border: 1px solid {t["line"]}; border-radius: {max(t["r"] - 4, 0)}px; padding: 12px 6px; text-align: center; font-size: 12px; font-weight: 600; color: {t["ink"]}; line-height: 1.35">{a}<br><span style="font-weight: 400; color: {t["muted"]}">{b}</span></div>' for a, b in items)
            self.add(f'<div style="padding: 20px {P}px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{cells}</div>', 96)
        else:
            cells = ''.join(f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: {t["ink"]}; border: 1.5px solid {t["ink"]}; border-radius: 999px; padding: 6px 12px">{a}</span>' for a, b in items)
            self.add(f'<div style="padding: 20px {P}px 0; display: flex; flex-wrap: wrap; gap: 8px">{cells}</div>', 104)

    def benefits(self, title, items, v='checks'):
        t = self.t
        if v == 'checks':
            rows = ''.join(f'<div style="display: flex; gap: 12px; align-items: flex-start">{ICON_CHECK.format(c=t["atext"])}<div style="font-size: 15px; line-height: 1.5; color: {t["ink"]}"><strong>{a}</strong> <span style="color: {t["muted"]}">{b}</span></div></div>' for a, b in items)
            self.add(self.sec(self.head(title, 26) + f'<div style="display: flex; flex-direction: column; gap: 14px">{rows}</div>'), 32 + 70 + len(items) * 74)
        elif v == 'numbered':
            rows = ''.join(f'<div style="display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-top: 1px solid {t["line"]}"><div style="font-family: {t["hf"]}; font-size: 26px; font-weight: {t["hw"]}; color: {t["atext"]}; width: 40px; flex-shrink: 0; line-height: 1">{i + 1:02d}</div><div><div style="font-weight: 700; font-size: 16px; color: {t["ink"]}">{a}</div><div style="font-size: 14px; line-height: 1.5; color: {t["muted"]}; margin-top: 4px">{b}</div></div></div>' for i, (a, b) in enumerate(items))
            self.add(self.sec(self.head(title, 26) + f'<div style="display: flex; flex-direction: column">{rows}</div>', 8), 32 + 70 + len(items) * 96)
        elif v == 'cards':
            cells = ''.join(f'<div style="background: {t["soft"] if i % 3 == 0 else t["surface"]}; border: 1px solid {t["line"]}; border-radius: {t["r"]}px; padding: 16px; display: flex; flex-direction: column; gap: 6px"><div style="font-weight: 700; font-size: 15px; color: {t["ink"]}">{a}</div><div style="font-size: 13px; line-height: 1.45; color: {t["ink"] if i % 3 == 0 else t["muted"]}">{b}</div></div>' for i, (a, b) in enumerate(items))
            self.add(self.sec(self.head(title, 26) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">{cells}</div>'), 32 + 70 + ((len(items) + 1) // 2) * 140)
        elif v == 'statements':
            rows = ''.join(f'<div style="padding: 18px 0; border-bottom: 1px solid {t["line"]}"><div style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 24px; line-height: 1.15; color: {t["ink"]}; text-transform: {"uppercase" if t["upper"] else "none"}">{a}</div><div style="font-size: 14px; line-height: 1.5; color: {t["muted"]}; margin-top: 6px">{b}</div></div>' for a, b in items)
            self.add(self.sec(self.head(title, 14, t['atext']) + f'<div>{rows}</div>', 4), 32 + 40 + len(items) * 120)

    def problem(self, title, paras):
        body = ''.join(self.p(x, 16) for x in paras)
        self.add(self.sec(self.head(title, 26) + body, 12), 32 + 60 + sum(30 + len(x) * 0.55 for x in paras))

    def gallery(self, labels, v='grid'):
        t = self.t; P = t['px']
        if v == 'grid':
            cells = ''.join(self.ph(l, 190, None, t['soft'] if i in (0, 3) else t['line']) for i, l in enumerate(labels[:4]))
            self.add(f'<section style="padding: 28px {P}px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{cells}</section>', 28 + 390)
        else:
            cells = ''.join(f'<div style="width: 220px; flex-shrink: 0">{self.ph(l, 280)}</div>' for l in labels)
            self.add(f'<section style="padding: 28px 0 0 {P}px; display: flex; gap: 8px; overflow: hidden">{cells}</section>', 28 + 280)

    def offer(self, title, rows, v='grid', sel=1):
        t = self.t
        if v == 'grid':
            cells = ''.join(
                f'<div style="border: {"2px solid " + t["ink"] if i == sel else "1.5px solid " + t["line"]}; border-radius: {max(t["r"] - 4, 6)}px; padding: 12px; background: {t["surface"]}; font-size: 14px; color: {t["ink"]}"><strong>{a}</strong><br><span style="color: {t["muted"]}">{b}</span></div>'
                for i, (a, b) in enumerate(rows))
            self.add(self.sec(self.head(title, 22) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{cells}</div>', 12), 32 + 50 + ((len(rows) + 1) // 2) * 74)
        elif v == 'list':
            cells = ''
            for i, r in enumerate(rows):
                a, b, pr = r[0], r[1], r[2]
                tag = f'<div style="position: absolute; top: -11px; left: 14px; background: {self.acc()}; color: {t["aink"]}; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px">{r[3]}</div>' if len(r) > 3 else ''
                cells += (f'<div style="position: relative; background: {t["surface"]}; border: {"2px solid " + t["ink"] if i == sel else "1.5px solid " + t["line"]}; border-radius: {t["r"]}px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px">{tag}'
                          f'<div><div style="font-weight: 700; color: {t["ink"]}">{a}</div><div style="font-size: 13px; color: {t["muted"]}">{b}</div></div><div style="font-weight: 700; font-size: 18px; color: {t["ink"]}; white-space: nowrap">{pr}</div></div>')
            self.add(self.sec(self.head(title, 24) + cells, 14), 32 + 56 + len(rows) * 92)
        elif v == 'packages':
            cells = ''
            for i, (name, pr, feats) in enumerate(rows):
                hl = i == sel
                bg = t['dark'] if hl else t['surface']; fg = t['dink'] if hl else t['ink']
                fl = ''.join(f'<div style="display: flex; gap: 8px; font-size: 14px; line-height: 1.4">{ICON_CHECK.format(c=fg)}<span>{f}</span></div>' for f in feats)
                cells += (f'<div style="background: {bg}; color: {fg}; border: 1.5px solid {t["line"] if not hl else bg}; border-radius: {t["r"]}px; padding: 18px; display: flex; flex-direction: column; gap: 10px">'
                          f'<div style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-family: {t["hf"]}; font-weight: {t["hw"]}; font-size: 20px">{name}</span><span style="font-weight: 700; font-size: 18px">{pr}</span></div>{fl}</div>')
            self.add(self.sec(self.head(title, 26) + cells, 12), 32 + 60 + sum(70 + len(f) * 26 for _, _, f in rows))
        elif v == 'tiers':
            head = f'<div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 12px 16px; font-size: 12px; font-weight: 700; color: {t["dink"]}; background: {t["dark"]}"><span>Quantity</span><span>Price each</span><span>You save</span></div>'
            body = ''.join(f'<div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 14px 16px; font-size: 14px; color: {t["ink"]}; border-top: 1px solid {t["line"]}; background: {t["soft"] if i == sel else t["surface"]}"><span style="font-weight: 700">{a}</span><span>{b}</span><span style="font-weight: 700">{c}</span></div>' for i, (a, b, c) in enumerate(rows))
            self.add(self.sec(self.head(title, 24) + f'<div style="border-radius: {t["r"]}px; overflow: hidden; border: 1px solid {t["line"]}">{head}{body}</div>', 14), 32 + 56 + 44 + len(rows) * 50)

    def specs(self, title, rows):
        t = self.t
        body = ''.join(f'<div style="display: flex; justify-content: space-between; gap: 12px; padding: 13px 0; border-bottom: 1px solid {t["line"]}; font-size: 14px"><span style="color: {t["muted"]}">{a}</span><span style="font-weight: 700; color: {t["ink"]}; text-align: right">{b}</span></div>' for a, b in rows)
        self.add(self.sec(self.head(title, 24) + f'<div>{body}</div>', 6), 32 + 50 + len(rows) * 49)

    def modules(self, title, rows):
        t = self.t
        body = ''.join(f'<div style="display: flex; gap: 14px; align-items: center; padding: 14px; background: {t["surface"]}; border: 1px solid {t["line"]}; border-radius: {t["r"]}px"><div style="width: 40px; height: 40px; border-radius: 10px; background: {self.acc()}; color: {t["aink"]}; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0">{i + 1}</div><div style="flex-grow: 1"><div style="font-weight: 700; font-size: 15px; color: {t["ink"]}">{a}</div><div style="font-size: 13px; color: {t["muted"]}">{b}</div></div></div>' for i, (a, b) in enumerate(rows))
        self.add(self.sec(self.head(title, 26) + body, 10), 32 + 60 + len(rows) * 78)

    def steps(self, title, rows, v='circles'):
        t = self.t
        if v == 'circles':
            body = ''.join(f'<div style="display: flex; gap: 14px; align-items: flex-start"><div style="width: 36px; height: 36px; border-radius: 999px; background: {t["dark"]}; color: {t["dink"]}; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0">{i + 1}</div><div style="font-size: 15px; line-height: 1.5; padding-top: 6px; color: {t["ink"]}">{a}</div></div>' for i, a in enumerate(rows))
        else:
            body = ''.join(f'<div style="display: flex; gap: 14px"><div style="display: flex; flex-direction: column; align-items: center"><div style="width: 14px; height: 14px; border-radius: 7px; background: {self.acc()}; margin-top: 4px"></div>{"" if i == len(rows) - 1 else "<div style=" + chr(34) + "width: 2px; flex-grow: 1; background: " + t["line"] + chr(34) + "></div>"}</div><div style="padding-bottom: 18px"><div style="font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: {t["atext"]}">Step {i + 1}</div><div style="font-size: 15px; line-height: 1.5; color: {t["ink"]}">{a}</div></div></div>' for i, a in enumerate(rows))
        self.add(self.sec(self.head(title, 26) + f'<div style="display: flex; flex-direction: column; gap: {14 if v == "circles" else 0}px">{body}</div>'), 32 + 60 + len(rows) * 74)

    def proof(self, title, v='quotes', n=2, label='Customer photo'):
        t = self.t
        if v == 'quotes':
            cards = ''.join(f'<div style="background: {t["surface"]}; border: 1px solid {t["line"]}; border-radius: {t["r"]}px; padding: 18px; display: flex; flex-direction: column; gap: 8px"><div style="color: {t["atext"]}; letter-spacing: 2px" aria-label="5 out of 5 stars">★★★★★</div><p style="margin: 0; font-size: 15px; line-height: 1.5; color: {t["ink"]}">[Customer review from the seller\'s DMs]</p><div style="font-size: 13px; color: {t["muted"]}">[Name] · [City]</div></div>' for _ in range(n))
            self.add(self.sec(self.head(title, 26) + cards, 12), 32 + 60 + n * 150)
        elif v == 'shots':
            cells = ''.join(self.ph('WhatsApp screenshot', 230, None, t['soft'] if i % 2 == 0 else t['line']) for i in range(2))
            self.add(self.sec(self.head(title, 26) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{cells}</div>', 14), 32 + 60 + 230)
        elif v == 'rating':
            cells = ''.join(self.ph(label, 110, 10, t['soft']) for _ in range(3))
            self.add(self.sec(
                f'<div style="display: flex; align-items: center; gap: 16px"><div style="font-family: {t["hf"]}; font-size: 48px; font-weight: {t["hw"]}; color: {t["ink"]}; line-height: 1">[4.9]</div><div><div style="color: {t["atext"]}; letter-spacing: 2px; font-size: 18px" aria-label="Rated out of 5 stars">★★★★★</div><div style="font-size: 13px; color: {t["muted"]}">from [120] buyers</div></div></div>'
                + f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px">{cells}</div>'
                + f'<p style="margin: 0; font-size: 15px; line-height: 1.5; color: {t["ink"]}">[Short customer review]</p>', 14), 32 + 60 + 110 + 70)
        elif v == 'beforeafter':
            cells = self.ph('Before', 220, None, t['line']) + self.ph('After', 220, None, t['soft'])
            self.add(self.sec(self.head(title, 26) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{cells}</div>' + self.p('Real customer photos supplied by the seller.', 13), 12), 32 + 60 + 220 + 40)

    def compare(self, title, us, them, rows):
        t = self.t
        hd = f'<div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 12px 14px; font-size: 13px; font-weight: 700; border-bottom: 1px solid {t["line"]}"><span></span><span style="color: {t["atext"]}">{us}</span><span style="color: {t["muted"]}">{them}</span></div>'
        body = ''.join(f'<div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 12px 14px; font-size: 13px; color: {t["ink"]}; border-bottom: 1px solid {t["line"]}"><span>{a}</span><span style="font-weight: 700">{b}</span><span style="color: {t["muted"]}">{c}</span></div>' for a, b, c in rows)
        self.add(self.sec(self.head(title, 24) + f'<div style="background: {t["surface"]}; border-radius: {t["r"]}px; border: 1px solid {t["line"]}; overflow: hidden">{hd}{body}</div>', 14), 32 + 56 + 44 + len(rows) * 46)

    def guarantee(self, title, text):
        t = self.t; P = t['px']
        self.add(f'<section style="margin: 32px {P}px 0; padding: 20px; border: 2px dashed {t["atext"]}; border-radius: {t["r"]}px; display: flex; gap: 14px; align-items: flex-start; color: {t["atext"]}">{ICON_SHIELD}<div><div style="font-weight: 700; font-size: 16px; color: {t["ink"]}">{title}</div><div style="font-size: 14px; line-height: 1.5; color: {t["muted"]}; margin-top: 4px">{text}</div></div></section>', 32 + 40 + len(text) * 0.5 + 30)

    def countdown(self, title, vals=('02', '14', '37', '09'), labels=('Days', 'Hrs', 'Min', 'Sec')):
        t = self.t; P = t['px']
        cells = ''.join(f'<div style="background: {t["dark"]}; color: {t["dink"]}; border-radius: {max(t["r"] - 6, 6)}px; padding: 12px 0; text-align: center"><div style="font-family: {t["hf"]}; font-size: 28px; font-weight: {t["hw"]}; line-height: 1">{v}</div><div style="font-size: 11px; margin-top: 4px">{l}</div></div>' for v, l in zip(vals, labels))
        self.add(f'<section style="padding: 32px {P}px 0; display: flex; flex-direction: column; gap: 12px"><div style="font-size: 14px; font-weight: 700; text-align: center; color: {t["ink"]}">{title}</div><div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">{cells}</div></section>', 32 + 30 + 80)

    def faq(self, rows):
        t = self.t
        body = ''.join(f'<div style="border-top: 1px solid {t["line"]}; padding: 16px 0"><div style="font-weight: 700; font-size: 15px; color: {t["ink"]}">{q}</div><div style="font-size: 14px; color: {t["muted"]}; margin-top: 6px; line-height: 1.5">{a}</div></div>' for q, a in rows)
        self.add(self.sec(self.head('Questions', 26) + f'<div style="border-bottom: 1px solid {t["line"]}">{body}</div>', 8), 32 + 60 + len(rows) * 96)

    def final(self, title, sub, v='dark'):
        t = self.t; P = t['px']
        if v == 'accent':
            bg, fg = self.acc(), t['aink']; btn = self._inv_btn(t['aink'], self.acc())
        elif v == 'outline':
            bg, fg = t['surface'], t['ink']; btn = self.cta()
        else:
            bg, fg = t['dark'], t['dink']; btn = self.cta()
        bd = f'border: 2px solid {t["ink"]};' if v == 'outline' else ''
        self.add(f'<section id="order" style="margin: 36px {P}px 0; padding: 28px 22px; background: {bg}; color: {fg}; border-radius: {t["r"] + 4}px; {bd} display: flex; flex-direction: column; gap: 12px; text-align: center">'
                 f'{self.head(title, 26, fg, "center")}<div style="font-size: 14px; opacity: 0.9">{sub}</div>{btn}</section>', 36 + 60 + 160 + len(title) * 0.5)

    def _inv_btn(self, bg, fg):
        t = self.t; m = t['method']
        return (f'<a href="#order" style="display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 56px; border-radius: {t["br"]}px; background: {bg}; color: {fg}; font-size: 17px; font-weight: 700; text-decoration: none">{METHOD_ICON[m["type"]]}{m["label"]}</a>')

    def footer(self, brand, place):
        t = self.t
        self.add(f'<footer style="flex-grow: 1; padding: 28px 20px 120px; display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 12px; color: {t["muted"]}"><div>© {brand} · {place}</div><div style="border: 1px solid {t["line"]}; border-radius: 999px; padding: 6px 12px; background: {t["surface"]}; color: {t["muted"]}">Made with [Brand]</div></footer>', 190)

    def buybar(self, item, price, v='flat'):
        t = self.t; m = t['method']; bg, fg = self.btn_colors()
        btn = f'<a href="#order" style="display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 48px; padding: 0 16px; border-radius: {t["br"]}px; background: {bg}; color: {fg}; font-size: 15px; font-weight: 700; text-decoration: none; white-space: nowrap">{m["short"]}</a>'
        if v == 'pill':
            pbtn = btn.replace(f'border-radius: {t["br"]}px', 'border-radius: 999px')
            self.parts.append(f'<div style="position: absolute; left: 12px; right: 12px; bottom: 16px; padding: 8px 8px 8px 18px; background: {t["dark"]}; color: {t["dink"]}; border-radius: 999px; display: flex; align-items: center; gap: 10px"><div style="flex-grow: 1; min-width: 0"><div style="font-size: 11px; opacity: 0.85">{item}</div><div style="font-size: 16px; font-weight: 700">{price}</div></div>{pbtn}</div>')
        else:
            self.parts.append(f'<div style="position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px 20px; background: {t["bg"]}; border-top: 1px solid {t["line"]}; display: flex; align-items: center; gap: 12px"><div style="flex-grow: 1; min-width: 0"><div style="font-size: 12px; color: {t["muted"]}">{item}</div><div style="font-size: 17px; font-weight: 700; color: {t["ink"]}">{price}</div></div>{btn}</div>')

    # ---------- output ----------
    def render(self, title):
        t = self.t
        H = int((self.h * 1.2 + 160) // 20 * 20)
        body = '\n'.join(self.parts)
        props = {"accent": {"editor": "color", "default": t['accent'], "options": t.get('opts', [t['accent']])}, "$preview": {"width": 390, "height": H}}
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
<div style="width: 390px; height: {H}px; position: relative; overflow: hidden; background: {t['bg']}; color: {t['ink']}; font-family: {t['bf']}; display: flex; flex-direction: column">
{body}
</div>
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{json.dumps(props)}'>
class Component extends DCLogic {{
renderVals() {{
return {{ accent: this.props.accent ?? '{t['accent']}' }};
}}
}}
</script>
</body>
</html>
'''
        return html, H


def check(name, t):
    t = dict(t)
    t.setdefault('atext', t['accent']); t.setdefault('dark', t['ink']); t.setdefault('dink', t['bg']); t.setdefault('line', t['soft'])
    probs = []
    for a, b, need, lab in [(t['ink'], t['bg'], 7, 'ink/bg'), (t['muted'], t['bg'], 4.5, 'muted/bg'), (t['muted'], t['surface'], 4.5, 'muted/surface'),
                            (t['atext'], t['bg'], 4.5, 'atext/bg'), (t['atext'], t['surface'], 4.5, 'atext/surface'), (t['aink'], t['accent'], 4.5, 'aink/accent'),
                            (t['dink'], t['dark'], 4.5, 'dink/dark'), (t['ink'], t['soft'], 4.5, 'ink/soft')]:
        r = cr(a, b)
        if r < need:
            probs.append(f'{lab} {a} on {b} = {r:.2f}')
    if t['method']['type'] != 'whatsapp' and cr(t['aink'], t['accent']) < 4.5:
        probs.append('button')
    return probs
