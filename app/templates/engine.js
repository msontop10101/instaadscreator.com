// Block engine. A page is an ordered array of blocks; a theme is tokens only.
// Every block renders through the same functions, styled by theme tokens.
const crypto = require('crypto');
const { THEMES } = require('./themes');
const { esc, fmt, savePct, buyLink, waIcon, orderVerb, buyVerb, photoUrl } = require('./shared');
const { BRAND_NAME } = require('../lib/config');

const bid = () => 'b' + crypto.randomBytes(3).toString('hex');

// ---------- block metadata (drives the editor's add-section picker) ----------

const BLOCK_TYPES = {
  announcement: { label: 'Announcement bar', defaults: () => ({ text: 'Free delivery in Lagos · Pay on delivery nationwide' }) },
  countdown: { label: 'Countdown timer', defaults: () => ({ label: 'FLASH SALE ENDS IN' }) },
  hero: { label: 'Hero photo', defaults: () => ({ image: 0, badge: 'BEST SELLER' }) },
  offer: { label: 'Headline & price', defaults: () => ({ headline: 'Your headline here.', subhead: '', kicker: null, priceNote: null, trustLine: 'Pay on delivery' }) },
  tiles: { label: 'Trust badges', defaults: () => ({ items: [{ title: 'Pay on delivery', sub: '' }, { title: 'Fast delivery', sub: 'nationwide' }, { title: 'Quality', sub: 'guaranteed' }] }) },
  benefits: { label: 'Benefits', defaults: () => ({ title: 'Why buy from us', items: [{ strong: 'Quality you can trust.', text: 'Checked before every delivery.' }] }) },
  gallery: { label: 'Photo gallery', defaults: () => ({ images: null }) },
  variants: { label: 'Variant picker', defaults: () => ({ label: 'Pick your option', options: [{ name: 'Standard', note: '', price: null, popular: true }] }) },
  howToOrder: { label: 'How to order', defaults: () => ({ title: 'How to order', steps: ['Tap the green button', 'Send your details', 'Receive it and pay on delivery'] }) },
  reviews: { label: 'Reviews', defaults: () => ({ title: 'What customers say', items: [{ text: 'Exactly as advertised. Delivery was fast.', who: 'Verified buyer' }] }) },
  faq: { label: 'FAQ', defaults: () => ({ title: 'Questions', items: [{ q: 'Can I pay on delivery?', a: 'Yes, anywhere in Nigeria.' }] }) },
  urgency: { label: 'Urgency / promo block', defaults: () => ({ title: 'Limited stock at this price', sub: 'When it’s gone, it’s gone' }) },
  text: { label: 'Text block', defaults: () => ({ title: 'About us', body: 'Tell your customers something that builds trust.' }) },
  image: { label: 'Image block', defaults: () => ({ image: 0, caption: '' }) },
};

// ---------- build a default block stack from generated content ----------

function blocksFromContent(content, theme, photoCount) {
  const B = [];
  const push = (type, props) => B.push({ id: bid(), type, ...props });
  if (content.announcement) push('announcement', { text: content.announcement });
  // every page ships with a countdown — sellers can remove it in the editor
  push('countdown', { label: theme === 'tech' ? 'FLASH SALE ENDS IN' : 'OFFER ENDS IN' });
  push('hero', { image: 0, badge: theme === 'luxe' ? 'BEST SELLER' : null });
  push('offer', {
    kicker: content.kicker || null, headline: content.headline, subhead: content.subhead,
    priceNote: content.priceNote || null, trustLine: content.trustLine || null,
  });
  if ((content.tiles || []).length) push('tiles', { items: content.tiles });
  if ((content.benefits || []).length) push('benefits', { title: 'Why buy from us', items: content.benefits });
  if (photoCount > 1) push('gallery', { images: null });
  if (content.variants) push('variants', { label: content.variants.label, options: content.variants.options });
  if ((content.howToOrder || []).length) push('howToOrder', { title: 'How to order', steps: content.howToOrder });
  if ((content.reviews || []).length) push('reviews', { title: 'What customers say', items: content.reviews });
  if ((content.faq || []).length) push('faq', { title: 'Questions', items: content.faq });
  if (content.urgency) push('urgency', { title: content.urgency.title, sub: content.urgency.sub });
  return B;
}

// ---------- block renderers ----------

function emText(text, T) {
  return esc(text || '').replace(/\[\[em\]\]/g, T.emOpen).replace(/\[\[\/em\]\]/g, '</span>');
}
function h2(text, T) {
  return `<h2 style="margin: 0; font-family: ${T.headFont}; font-size: 26px; font-weight: 700; line-height: 1.15; ${T.upper ? 'text-transform: uppercase; letter-spacing: -0.01em' : ''}">${esc(text)}</h2>`;
}
function ctaBtn(page, label) {
  return `<a href="${buyLink(page)}" style="display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 56px; border-radius: var(--btn-r), 14px; border-radius: var(--btn-r); background: #25D366; color: #062B16; font-size: 17px; font-weight: 700; text-decoration: none">${waIcon()}${label}</a>`;
}

const RENDER = {
  announcement: (b, page, T) =>
    `<div style="background: ${T.dark}; color: ${T.darkInk}; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; letter-spacing: 0.02em">${esc(b.text)}</div>`,

  countdown: (b, page, T) =>
    `<div style="background: ${T.accent}; color: ${T.onAccent}; font-size: 12px; font-weight: 700; text-align: center; padding: 10px 16px; letter-spacing: 0.04em">${esc(b.label || 'ENDS IN')} <span class="cd-h">05</span> : <span class="cd-m">42</span> : <span class="cd-s">18</span></div>`,

  hero: (b, page, T) => {
    const src = photoUrl(page, b.image ?? 0);
    return `<div style="margin: 16px 20px 0; height: 400px; border-radius: ${T.radius}; background: ${T.soft}; overflow: hidden; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: ${T.faint}; font-size: 13px">
${src ? `<img src="${src}" alt="${esc(page.title)}">` : `<span>Add a hero photo in the editor</span>`}
${b.badge ? `<div style="position: absolute; top: 14px; left: 14px; background: ${T.dark}; color: ${T.darkInk}; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 999px; letter-spacing: 0.06em">${esc(b.badge)}</div>` : ''}
</div>`;
  },

  offer: (b, page, T) => {
    const save = savePct(page.price, page.oldPrice);
    return `<section style="padding: 24px 20px 8px; display: flex; flex-direction: column; gap: 14px">
${b.kicker ? `<div style="font-family: ${T.headFont}; font-size: 13px; font-weight: 600; color: ${T.accent}; letter-spacing: 0.08em">${esc(b.kicker.toUpperCase())}</div>` : ''}
<h1 style="margin: 0; font-family: ${T.headFont}; font-size: 36px; line-height: 1.06; font-weight: 700; ${T.upper ? 'text-transform: uppercase; letter-spacing: -0.02em' : ''}">${emText(b.headline, T)}</h1>
${b.subhead ? `<p style="margin: 0; font-size: 16px; line-height: 1.5; color: ${T.muted}">${esc(b.subhead)}</p>` : ''}
<div id="price-point" style="display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap">
<span style="font-family: ${T.headFont}; font-size: 32px; font-weight: 700">₦${fmt(page.price)}</span>
${page.oldPrice ? `<span style="font-size: 16px; color: ${T.faint}; text-decoration: line-through">₦${fmt(page.oldPrice)}</span>` : ''}
${save ? `<span style="font-size: 12px; font-weight: 700; color: ${T.onAccent}; background: ${T.accent}; padding: 4px 8px; border-radius: 6px">SAVE ${save}%</span>` : ''}
</div>
${b.priceNote ? `<div style="font-size: 13px; color: ${T.accent}; font-weight: 500">${esc(b.priceNote)}</div>` : ''}
${ctaBtn(page, orderVerb(page))}
${b.trustLine ? `<div style="text-align: center; font-size: 13px; color: ${T.faint}">${esc(b.trustLine)}</div>` : ''}
</section>`;
  },

  tiles: (b, page, T) => `<div style="margin: 16px 20px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
${(b.items || []).slice(0, 6).map(t => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: 12px; padding: 14px 8px; text-align: center; font-size: 12px; font-weight: 600">${esc(t.title)}${t.sub ? `<br><span style="color: ${T.faint}; font-weight: 400">${esc(t.sub)}</span>` : ''}</div>`).join('\n')}
</div>`,

  benefits: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 16px">
${h2(b.title || 'Why buy from us', T)}
<div style="display: flex; flex-direction: column; gap: 14px">
${(b.items || []).map((x, i) => T.benefitMarker === 'number'
    ? `<div style="display: flex; gap: 14px; align-items: flex-start"><div style="font-family: ${T.headFont}; font-size: 20px; font-weight: 700; color: ${T.accent}; width: 34px; flex-shrink: 0">${String(i + 1).padStart(2, '0')}</div><div><div style="font-weight: 700; font-size: 16px">${esc(x.strong)}</div><div style="font-size: 14px; color: ${T.muted}; line-height: 1.5; margin-top: 4px">${esc(x.text)}</div></div></div>`
    : `<div style="display: flex; gap: 12px; align-items: flex-start"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${T.accent}" stroke-width="2" aria-hidden="true" style="flex-shrink: 0"><path d="M5 12l5 5L20 7"></path></svg><div style="font-size: 15px; line-height: 1.5"><strong>${esc(x.strong)}</strong> ${esc(x.text)}</div></div>`).join('\n')}
</div>
</section>`,

  gallery: (b, page, T) => {
    const idxs = b.images || Array.from({ length: Math.max(0, (page.photos || []).length - 1) }, (_, i) => i + 1);
    const imgs = idxs.map(i => photoUrl(page, i)).filter(Boolean);
    if (!imgs.length) return '';
    return `<section style="padding: 28px 20px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
${imgs.map((src, i) => `<div style="height: 200px; border-radius: ${T.radius}; overflow: hidden; background: ${T.soft}"><img src="${src}" alt="Photo ${i + 1}"></div>`).join('\n')}
</section>`;
  },

  variants: (b, page, T) => `<section style="margin: 28px 20px 0; padding: 20px; background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; display: flex; flex-direction: column; gap: 12px">
<h2 style="margin: 0; font-size: 17px; font-weight: 700; font-family: ${T.headFont}">${esc(b.label || 'Pick your option')}</h2>
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
${(b.options || []).map(o => `<div style="border: ${o.popular ? `2px solid ${T.ink}` : `1.5px solid ${T.line}`}; border-radius: 12px; padding: 12px; font-size: 14px"><strong>${esc(o.name)}${o.popular ? ' · popular' : ''}</strong>${o.note ? `<br><span style="color: ${T.faint}; font-size: 13px">${esc(o.note)}</span>` : ''}${o.price ? `<br><span style="color: ${T.faint}">₦${fmt(o.price)}</span>` : ''}</div>`).join('\n')}
</div>
</section>`,

  howToOrder: (b, page, T) => `<section style="padding: 32px 20px 0; display: flex; flex-direction: column; gap: 16px">
${h2(b.title || 'How to order', T)}
${(b.steps || []).map((s, i) => `<div style="display: flex; gap: 14px; align-items: flex-start"><div style="width: 36px; height: 36px; border-radius: 999px; background: ${T.dark}; color: ${T.darkInk}; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0">${i + 1}</div><div style="font-size: 15px; line-height: 1.5; padding-top: 6px">${esc(s)}</div></div>`).join('\n')}
</section>`,

  reviews: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'What customers say', T)}
${(b.items || []).map(r => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; padding: 18px; display: flex; flex-direction: column; gap: 8px">
<div style="color: ${T.accent}; font-size: 14px; letter-spacing: 2px" aria-label="5 out of 5 stars">★★★★★</div>
<p style="margin: 0; font-size: 15px; line-height: 1.5">${esc(r.text)}</p>
<div style="font-size: 13px; color: ${T.faint}">${esc(r.who)}</div>
</div>`).join('\n')}
</section>`,

  faq: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column">
<div style="margin-bottom: 12px">${h2(b.title || 'Questions', T)}</div>
${(b.items || []).map((f, i, arr) => `<div style="border-top: 1px solid ${T.line}; ${i === arr.length - 1 ? `border-bottom: 1px solid ${T.line}; ` : ''}padding: 16px 0"><div style="font-weight: 700; font-size: 15px">${esc(f.q)}</div><div style="font-size: 14px; color: ${T.muted}; margin-top: 6px; line-height: 1.5">${esc(f.a)}</div></div>`).join('\n')}
</section>`,

  urgency: (b, page, T) => `<section style="margin: 32px 20px 0; padding: 28px 22px; background: ${T.dark}; color: ${T.darkInk}; border-radius: ${T.radius}; display: flex; flex-direction: column; gap: 14px; text-align: center">
<div style="font-family: ${T.headFont}; font-size: 26px; font-weight: 700; line-height: 1.15; ${T.upper ? 'text-transform: uppercase' : ''}">${esc(b.title)}</div>
${b.sub ? `<div style="font-size: 14px; color: ${T.darkMuted}">${esc(b.sub)}</div>` : ''}
${ctaBtn(page, orderVerb(page))}
</section>`,

  text: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 10px">
${b.title ? h2(b.title, T) : ''}
${String(b.body || '').split(/\n+/).filter(Boolean).map(p => `<p style="margin: 0; font-size: 15px; line-height: 1.6; color: ${T.muted}">${esc(p)}</p>`).join('\n')}
</section>`,

  image: (b, page, T) => {
    const src = photoUrl(page, b.image ?? 0);
    if (!src) return '';
    return `<section style="padding: 28px 20px 0">
<div style="border-radius: ${T.radius}; overflow: hidden; background: ${T.soft}"><img src="${src}" alt="${esc(b.caption || page.title)}" style="height: auto; max-height: 440px"></div>
${b.caption ? `<div style="margin-top: 8px; text-align: center; font-size: 12px; color: ${T.faint}">${esc(b.caption)}</div>` : ''}
</section>`;
  },
};

// ---------- page shell ----------

function renderPage(page) {
  const T = THEMES[page.template] || THEMES.street;
  const blocks = page.blocks || [];
  const hasCountdown = blocks.some(b => b.type === 'countdown');

  const bizWords = page.biz.trim().split(/\s+/);
  const logo = bizWords.length > 1
    ? `${esc(bizWords.slice(0, -1).join(' '))} <span style="color: ${T.accent}">${esc(bizWords[bizWords.length - 1])}</span>`
    : esc(page.biz);

  const body = blocks.map(b => (RENDER[b.type] ? RENDER[b.type](b, page, T) : '')).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(page.biz)} — ${esc(page.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${T.fontsHref}" rel="stylesheet">
<style>
:root { --btn-r: ${T.btnRadius}; }
body{margin:0;background:${T.bg}}
a{color:${T.accent}}
img{display:block;width:100%;height:100%;object-fit:cover}
.page{max-width:480px;margin:0 auto;min-height:100vh;position:relative;background:${T.bg};color:${T.ink};font-family:${T.bodyFont};display:flex;flex-direction:column;padding-bottom:96px}
</style>
</head>
<body>
<div class="page">

<header style="display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; ${page.template === 'tech' || page.template === 'noir' ? `border-bottom: 1px solid ${T.line}` : ''}">
<div style="font-family: ${T.headFont}; font-size: 21px; font-weight: 700; ${T.upper ? 'text-transform: uppercase; letter-spacing: -0.02em' : ''}">${logo}</div>
${page.location ? `<div style="font-size: 12px; color: ${T.faint}">${esc(page.location)}</div>` : ''}
</header>

${body}

<footer style="flex-grow: 1; padding: 32px 20px 24px; display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 12px; color: ${T.faint}">
<div>© ${esc(page.biz)}${page.location ? ` · ${esc(page.location)}` : ''}</div>
${page.pro ? '' : `<div style="border: 1px solid ${T.line}; border-radius: 999px; padding: 6px 12px; background: ${T.card}; color: ${T.muted}">Made with ${esc(BRAND_NAME)}</div>`}
</footer>

<div style="position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; max-width: 480px; margin: 0 auto; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: ${T.bg}; border-top: 1px solid ${T.line}; display: flex; align-items: center; gap: 12px; box-sizing: border-box">
<div style="flex-grow: 1"><div style="font-size: 12px; color: ${T.faint}">${esc(page.buyBarLabel || page.title)}</div><div style="font-family: ${T.headFont}; font-size: 17px; font-weight: 700">₦${fmt(page.price)}</div></div>
<a href="${buyLink(page)}" style="display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 18px; border-radius: var(--btn-r); background: #25D366; color: #062B16; font-size: 15px; font-weight: 700; text-decoration: none">${buyVerb(page)}</a>
</div>

</div>
<script>
(function(){
  if (/[?&]preview=1/.test(location.search)) return;
  var sent = false;
  var el = document.getElementById('price-point');
  if ('IntersectionObserver' in window && el) {
    new IntersectionObserver(function(entries, obs){
      if (entries[0].isIntersecting && !sent) {
        sent = true;
        navigator.sendBeacon('/api/track', JSON.stringify({ slug: '${page.slug}', type: 'price_seen' }));
        obs.disconnect();
      }
    }).observe(el);
  }
  var t0 = Date.now(), timeSent = false;
  addEventListener('pagehide', function(){
    if (timeSent) return;
    timeSent = true;
    navigator.sendBeacon('/api/track', JSON.stringify({ slug: '${page.slug}', type: 'time', secs: (Date.now() - t0) / 1000 }));
  });
})();
</script>
${hasCountdown ? `<script>
(function(){
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    var now = new Date(), end = new Date(now); end.setHours(23,59,59,999);
    var d = Math.max(0, end - now);
    document.querySelectorAll('.cd-h').forEach(function(e){ e.textContent = pad(Math.floor(d/3.6e6)); });
    document.querySelectorAll('.cd-m').forEach(function(e){ e.textContent = pad(Math.floor(d%3.6e6/6e4)); });
    document.querySelectorAll('.cd-s').forEach(function(e){ e.textContent = pad(Math.floor(d%6e4/1e3)); });
  }
  tick(); setInterval(tick, 1000);
})();
</script>` : ''}
</body>
</html>`;
}

module.exports = { renderPage, blocksFromContent, BLOCK_TYPES, THEMES, bid };
