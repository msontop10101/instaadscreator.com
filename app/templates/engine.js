// Block engine. A page is an ordered array of blocks; a theme is tokens only.
// Every block renders through the same functions, styled by theme tokens.
const crypto = require('crypto');
const { THEMES: THEMES_V1 } = require('./themes');
const { THEMES_V2 } = require('./themes-v2');
const { esc, fmt, savePct, buyLink, waIcon, photoUrl } = require('./shared');
const { BRAND_NAME } = require('../lib/config');

const THEMES = { ...THEMES_V1, ...THEMES_V2 };

// CTA labels: explicit buttonText > theme's niche CTA ("Reserve my yards") > generic
function orderVerb(page, T) {
  if (page.buttonText) return esc(page.buttonText);
  if (T && T.ctaLabel) return esc(T.ctaLabel);
  return { whatsapp: 'Order on WhatsApp', call: 'Call to order', dm: 'DM to order' }[page.method] || 'Order on WhatsApp';
}
function buyVerb(page, T) {
  if (page.buttonText) return esc(page.buttonText);
  if (T && T.ctaShort) return esc(T.ctaShort);
  return { whatsapp: 'Buy on WhatsApp', call: 'Call to buy', dm: 'DM us' }[page.method] || 'Buy on WhatsApp';
}

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
  specs: { label: 'Specs / details', defaults: () => ({ title: 'The details', items: [{ label: 'Size', value: 'Standard' }, { label: 'Delivery', value: 'Nationwide' }] }) },
  compare: { label: 'Us vs others', defaults: () => ({ title: 'Why buy from us', us: 'Us', them: 'Others', rows: [{ label: 'Pay on delivery', us: 'Yes', them: 'Transfer first' }, { label: 'Verified quality', us: 'Yes', them: 'No promise' }, { label: 'Real support', us: 'WhatsApp anytime', them: 'Ghost mode' }] }) },
  guarantee: { label: 'Guarantee', defaults: () => ({ title: 'Our promise', text: 'Not satisfied? Tell us within 7 days and we make it right — exchange or your money back.' }) },
  modules: { label: 'What you get', defaults: () => ({ title: 'What you get', items: [{ title: 'The product', text: 'Exactly as shown.' }, { title: 'Support', text: 'We answer on WhatsApp.' }] }) },
};

// ---------- build a default block stack from generated content ----------

function blocksFromContent(content, theme, photoCount) {
  const T = THEMES[theme] || {};
  const B = [];
  const push = (type, props) => B.push({ id: bid(), type, ...props });

  // v2 themes carry their own section stack from the design manifest
  if (T.sections && T.sections.length) {
    let offerUsed = false;
    for (const s of T.sections) {
      const v = s.variant || null;
      switch (s.section) {
        case 'announce': if (content.announcement) push('announcement', { text: content.announcement }); break;
        case 'countdown': push('countdown', { label: 'OFFER ENDS IN' }); break;
        case 'hero':
          // in v2 layouts the headline lives inside the hero
          push('hero', {
            variant: v, image: 0, badge: null,
            kicker: content.kicker || null, headline: content.headline, subhead: content.subhead,
          });
          break;
        case 'offer':
          if (!offerUsed) {
            offerUsed = true;
            push('offer', { noHeadline: true, priceNote: content.priceNote || null, trustLine: content.trustLine || null });
          } else if (content.variants) {
            push('variants', { variant: v, label: content.variants.label, options: content.variants.options });
          }
          break;
        case 'trust': if ((content.tiles || []).length) push('tiles', { variant: v, items: content.tiles }); break;
        case 'benefits': if ((content.benefits || []).length) push('benefits', { variant: v, title: 'Why buy from us', items: content.benefits }); break;
        case 'gallery': if (photoCount > 1) push('gallery', { variant: v, images: null }); break;
        case 'specs': if ((content.tiles || []).length) push('specs', { title: 'The details', items: content.tiles.map(t => ({ label: t.title, value: t.sub || '✓' })) }); break;
        case 'compare': push('compare', { ...BLOCK_TYPES.compare.defaults() }); break;
        case 'guarantee': push('guarantee', { ...BLOCK_TYPES.guarantee.defaults() }); break;
        case 'modules': if ((content.benefits || []).length) push('modules', { title: 'What you get', items: content.benefits.map(b => ({ title: b.strong, text: b.text })) }); break;
        case 'steps': if ((content.howToOrder || []).length) push('howToOrder', { variant: v, title: 'How to order', steps: content.howToOrder }); break;
        case 'proof': if ((content.reviews || []).length) push('reviews', { variant: v, title: 'What customers say', items: content.reviews }); break;
        case 'faq': if ((content.faq || []).length) push('faq', { title: 'Questions', items: content.faq }); break;
        case 'final': if (content.urgency) push('urgency', { variant: v, title: content.urgency.title, sub: content.urgency.sub }); break;
        // app landing sections
        case 'strip': if ((content.tiles || []).length) push('tiles', { variant: 'row', items: content.tiles }); break;
        case 'features': if ((content.benefits || []).length) push('benefits', { variant: 'cards', title: 'Why you’ll love it', items: content.benefits }); break;
        case 'screens': if (photoCount > 1) push('gallery', { variant: v, images: null }); break;
        case 'pricing': if (content.variants) push('variants', { label: 'Plans', options: content.variants.options }); break;
        case 'reviews': if ((content.reviews || []).length) push('reviews', { variant: v, title: 'What users say', items: content.reviews }); break;
        // nav / header / footer / bar / buybar are page chrome, not blocks
      }
    }
    return B;
  }

  // v1 default stack
  if (content.announcement) push('announcement', { text: content.announcement });
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
function headCss(T, size) {
  return `font-family: ${T.headFont}; font-size: ${size}px; font-weight: ${T.headWeight || 700}; line-height: 1.1; letter-spacing: ${T.letterSpacing || '-0.01em'}; ${T.upper ? 'text-transform: uppercase;' : ''}`;
}
function h2(text, T) {
  return `<h2 style="margin: 0; ${headCss(T, 26)}">${esc(text)}</h2>`;
}
function heroText(b, T) {
  if (!b.headline) return '';
  return `${b.kicker ? `<div style="font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: ${T.accent}">${esc(b.kicker)}</div>` : ''}
<h1 style="margin: 0; ${headCss(T, 34)}">${emText(b.headline, T)}</h1>
${b.subhead ? `<p style="margin: 0; font-size: 16px; line-height: 1.55; color: ${T.muted}">${esc(b.subhead)}</p>` : ''}`;
}
function photoBox(src, T, height, label) {
  return `<div style="height: ${height}px; border-radius: ${T.radius}; background: ${T.soft}; overflow: hidden; display: flex; align-items: center; justify-content: center; color: ${T.faint}; font-size: 12px">${src ? `<img src="${src}" alt="">` : `<span>${label || 'Add a photo in the editor'}</span>`}</div>`;
}
function ctaBtn(page, label) {
  return `<a href="${buyLink(page)}" style="display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 56px; border-radius: var(--btn-r); background: #25D366; color: #062B16; font-size: 17px; font-weight: 700; text-decoration: none">${waIcon()}${label}</a>`;
}

const RENDER = {
  announcement: (b, page, T) =>
    `<div style="background: ${T.dark}; color: ${T.darkInk}; font-size: 12px; font-weight: 600; text-align: center; padding: 10px 16px; letter-spacing: 0.02em">${esc(b.text)}</div>`,

  countdown: (b, page, T) =>
    `<div style="background: ${T.accent}; color: ${T.onAccent}; font-size: 12px; font-weight: 700; text-align: center; padding: 10px 16px; letter-spacing: 0.04em">${esc(b.label || 'ENDS IN')} <span class="cd-h">05</span> : <span class="cd-m">42</span> : <span class="cd-s">18</span></div>`,

  hero: (b, page, T) => {
    const src = photoUrl(page, b.image ?? 0);
    const text = heroText(b, T);

    if (b.variant === 'poster') {
      // accent poster block with the image pulled up into it
      return `<section style="display: flex; flex-direction: column">
<div style="background: ${T.accent}; padding: 28px 20px 120px; display: flex; flex-direction: column; gap: 12px">
${b.kicker ? `<div style="font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${T.onAccent}">${esc(b.kicker)}</div>` : ''}
${b.headline ? `<h1 style="margin: 0; ${headCss(T, 40)} color: ${T.onAccent}">${esc(String(b.headline).replace(/\[\[\/?em\]\]/g, ''))}</h1>` : ''}
</div>
<div style="margin: -96px 20px 0">${photoBox(src, T, 300, 'Add a hero photo in the editor')}</div>
${b.subhead ? `<p style="margin: 14px 20px 0; font-size: 16px; line-height: 1.55; color: ${T.muted}">${esc(b.subhead)}</p>` : ''}
</section>`;
    }
    if (b.variant === 'collage') {
      const p2 = photoUrl(page, 1), p3 = photoUrl(page, 2);
      return `<section style="padding: 8px 20px 0; display: flex; flex-direction: column; gap: 14px">
${text}
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<div style="grid-row: span 2">${photoBox(src, T, 328, 'Hero photo')}</div>
${photoBox(p2, T, 160, 'Photo 2')}
${photoBox(p3, T, 160, 'Photo 3')}
</div>
</section>`;
    }
    if (b.variant === 'fullbleed') {
      return `<section style="display: flex; flex-direction: column; gap: 14px">
<div style="height: 420px; background: ${T.soft}; overflow: hidden; display: flex; align-items: center; justify-content: center; color: ${T.faint}; font-size: 12px">${src ? `<img src="${src}" alt="${esc(page.title)}">` : '<span>Add a hero photo in the editor</span>'}</div>
${text ? `<div style="padding: 4px 20px 0; display: flex; flex-direction: column; gap: 12px">${text}</div>` : ''}
</section>`;
    }
    if (T.kind === 'app') {
      return `<section style="padding: 18px 20px 0; display: flex; flex-direction: column; gap: 14px; text-align: center; align-items: center">
${heroText(b, T)}
<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap">
<a href="${buyLink(page)}?store=apple" style="${T.btnCss || `background: ${T.ink}; color: ${T.bg}`}; border-radius: 12px; padding: 12px 18px; font-size: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px"> App Store</a>
<a href="${buyLink(page)}?store=google" style="${T.btnCss || `background: ${T.ink}; color: ${T.bg}`}; border-radius: 12px; padding: 12px 18px; font-size: 14px; font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 8px">▶ Google Play</a>
</div>
<div style="width: 240px; border: 8px solid ${T.ink}; border-radius: 32px; overflow: hidden">${photoBox(photoUrl(page, b.image ?? 0), T, 420, 'App screenshot')}</div>
</section>`;
    }
    if (b.variant === 'centered') {
      return `<section style="padding: 8px 20px 0; display: flex; flex-direction: column; gap: 14px; text-align: center; align-items: center">
${text}
<div style="width: 100%">${photoBox(src, T, 340, 'Add a hero photo in the editor')}</div>
</section>`;
    }
    // 'stack' + v1 default: text above (when present), image below
    return `<section style="display: flex; flex-direction: column; gap: 14px; ${text ? 'padding: 8px 0 0' : ''}">
${text ? `<div style="padding: 0 20px; display: flex; flex-direction: column; gap: 12px">${text}</div>` : ''}
<div style="margin: ${text ? '4px' : '16px'} 20px 0; height: ${text ? 340 : 400}px; border-radius: ${T.radius}; background: ${T.soft}; overflow: hidden; position: relative; display: flex; align-items: center; justify-content: center; color: ${T.faint}; font-size: 13px">
${src ? `<img src="${src}" alt="${esc(page.title)}">` : `<span>Add a hero photo in the editor</span>`}
${b.badge ? `<div style="position: absolute; top: 14px; left: 14px; background: ${T.dark}; color: ${T.darkInk}; font-size: 11px; font-weight: 700; padding: 6px 10px; border-radius: 999px; letter-spacing: 0.06em">${esc(b.badge)}</div>` : ''}
</div>
</section>`;
  },

  offer: (b, page, T) => {
    const save = savePct(page.price, page.oldPrice);
    return `<section style="padding: ${b.noHeadline ? '20px' : '24px'} 20px 8px; display: flex; flex-direction: column; gap: 14px">
${!b.noHeadline && b.kicker ? `<div style="font-family: ${T.headFont}; font-size: 13px; font-weight: 600; color: ${T.accent}; letter-spacing: 0.08em">${esc(b.kicker.toUpperCase())}</div>` : ''}
${!b.noHeadline && b.headline ? `<h1 style="margin: 0; ${headCss(T, 36)}">${emText(b.headline, T)}</h1>` : ''}
${!b.noHeadline && b.subhead ? `<p style="margin: 0; font-size: 16px; line-height: 1.5; color: ${T.muted}">${esc(b.subhead)}</p>` : ''}
<div id="price-point" style="display: ${T.kind === 'app' ? 'none' : 'flex'}; align-items: baseline; gap: 10px; flex-wrap: wrap">
<span style="font-family: ${T.headFont}; font-size: 32px; font-weight: 700">₦${fmt(page.price)}</span>
${page.oldPrice ? `<span style="font-size: 16px; color: ${T.faint}; text-decoration: line-through">₦${fmt(page.oldPrice)}</span>` : ''}
${save ? `<span style="font-size: 12px; font-weight: 700; color: ${T.onAccent}; background: ${T.accent}; padding: 4px 8px; border-radius: 6px">SAVE ${save}%</span>` : ''}
</div>
${b.priceNote ? `<div style="font-size: 13px; color: ${T.accent}; font-weight: 500">${esc(b.priceNote)}</div>` : ''}
${ctaBtn(page, orderVerb(page, T))}
${b.trustLine ? `<div style="text-align: center; font-size: 13px; color: ${T.faint}">${esc(b.trustLine)}</div>` : ''}
</section>`;
  },

  specs: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'The details', T)}
<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; overflow: hidden">
${(b.items || []).map((s, i, arr) => `<div style="display: flex; justify-content: space-between; gap: 12px; padding: 13px 16px; font-size: 14px; ${i < arr.length - 1 ? `border-bottom: 1px solid ${T.line}` : ''}"><span style="color: ${T.muted}">${esc(s.label)}</span><span style="font-weight: 700; text-align: right">${esc(s.value)}</span></div>`).join('\n')}
</div>
</section>`,

  compare: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'Why buy from us', T)}
<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; overflow: hidden; font-size: 13px">
<div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 11px 14px; color: ${T.faint}; font-size: 12px; border-bottom: 1px solid ${T.line}"><span></span><span style="color: ${T.accent}; font-weight: 700">${esc(b.us || page.biz)}</span><span>${esc(b.them || 'Others')}</span></div>
${(b.rows || []).map((r, i, arr) => `<div style="display: grid; grid-template-columns: 1.3fr 1fr 1fr; padding: 11px 14px; ${i < arr.length - 1 ? `border-bottom: 1px solid ${T.line}` : ''}"><span>${esc(r.label)}</span><span style="font-weight: 700">${esc(r.us)}</span><span style="color: ${T.faint}">${esc(r.them)}</span></div>`).join('\n')}
</div>
</section>`,

  guarantee: (b, page, T) => `<section style="margin: 28px 20px 0; padding: 20px; background: ${T.card}; border: 1.5px solid ${T.accent}; border-radius: ${T.radius}; display: flex; gap: 14px; align-items: flex-start">
<div style="width: 44px; height: 44px; border-radius: 999px; background: ${T.accent}; color: ${T.onAccent}; display: flex; align-items: center; justify-content: center; flex-shrink: 0"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg></div>
<div><div style="font-weight: 800; font-size: 16px; font-family: ${T.headFont}">${esc(b.title || 'Our promise')}</div><div style="font-size: 14px; line-height: 1.55; color: ${T.muted}; margin-top: 4px">${esc(b.text)}</div></div>
</section>`,

  modules: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'What you get', T)}
${(b.items || []).map((m, i) => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; padding: 16px; display: flex; gap: 14px; align-items: flex-start"><div style="font-family: ${T.headFont}; font-size: 18px; font-weight: 800; color: ${T.accent}; flex-shrink: 0">${String(i + 1).padStart(2, '0')}</div><div><div style="font-weight: 700; font-size: 15px">${esc(m.title)}</div><div style="font-size: 13.5px; color: ${T.muted}; line-height: 1.5; margin-top: 3px">${esc(m.text)}</div></div></div>`).join('\n')}
</section>`,

  tiles: (b, page, T) => b.variant === 'row'
    ? `<div style="margin: 16px 20px 0; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center">
${(b.items || []).slice(0, 4).map(t => `<span style="border: 1px solid ${T.line}; background: ${T.card}; border-radius: 999px; padding: 8px 14px; font-size: 12px; font-weight: 700">${esc(t.title)}</span>`).join('\n')}
</div>`
    : `<div style="margin: 16px 20px 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
${(b.items || []).slice(0, 6).map(t => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: 12px; padding: 14px 8px; text-align: center; font-size: 12px; font-weight: 600">${esc(t.title)}${t.sub ? `<br><span style="color: ${T.faint}; font-weight: 400">${esc(t.sub)}</span>` : ''}</div>`).join('\n')}
</div>`,

  benefits: (b, page, T) => {
    if (b.variant === 'cards') {
      return `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'Why buy from us', T)}
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
${(b.items || []).map(x => `<div style="${T.cardCss || `background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}`}; padding: 16px"><div style="font-weight: 700; font-size: 14.5px">${esc(x.strong)}</div><div style="font-size: 13px; color: ${T.muted}; line-height: 1.5; margin-top: 4px">${esc(x.text)}</div></div>`).join('\n')}
</div>
</section>`;
    }
    if (b.variant === 'statements') {
      return `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 18px">
${(b.items || []).map(x => `<div><div style="${headCss(T, 24)} color: ${T.accent}">${esc(x.strong)}</div><div style="font-size: 14.5px; color: ${T.muted}; line-height: 1.5; margin-top: 6px">${esc(x.text)}</div></div>`).join('\n')}
</section>`;
    }
    return `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 16px">
${h2(b.title || 'Why buy from us', T)}
<div style="display: flex; flex-direction: column; gap: 14px">
${(b.items || []).map((x, i) => T.benefitMarker === 'number'
    ? `<div style="display: flex; gap: 14px; align-items: flex-start"><div style="font-family: ${T.headFont}; font-size: 20px; font-weight: 700; color: ${T.accent}; width: 34px; flex-shrink: 0">${String(i + 1).padStart(2, '0')}</div><div><div style="font-weight: 700; font-size: 16px">${esc(x.strong)}</div><div style="font-size: 14px; color: ${T.muted}; line-height: 1.5; margin-top: 4px">${esc(x.text)}</div></div></div>`
    : `<div style="display: flex; gap: 12px; align-items: flex-start"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${T.accent}" stroke-width="2" aria-hidden="true" style="flex-shrink: 0"><path d="M5 12l5 5L20 7"></path></svg><div style="font-size: 15px; line-height: 1.5"><strong>${esc(x.strong)}</strong> ${esc(x.text)}</div></div>`).join('\n')}
</div>
</section>`;
  },

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

  howToOrder: (b, page, T) => b.variant === 'timeline'
    ? `<section style="padding: 32px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'How to order', T)}
<div style="border-left: 2px solid ${T.accent}; margin-left: 8px; padding-left: 18px; display: flex; flex-direction: column; gap: 16px">
${(b.steps || []).map((s, i) => `<div style="position: relative"><span style="position: absolute; left: -25px; top: 4px; width: 12px; height: 12px; border-radius: 999px; background: ${T.accent}"></span><div style="font-size: 12px; font-weight: 700; color: ${T.accent}">STEP ${i + 1}</div><div style="font-size: 15px; line-height: 1.5">${esc(s)}</div></div>`).join('\n')}
</div>
</section>`
    : `<section style="padding: 32px 20px 0; display: flex; flex-direction: column; gap: 16px">
${h2(b.title || 'How to order', T)}
${(b.steps || []).map((s, i) => `<div style="display: flex; gap: 14px; align-items: flex-start"><div style="width: 36px; height: 36px; border-radius: 999px; background: ${T.dark}; color: ${T.darkInk}; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0">${i + 1}</div><div style="font-size: 15px; line-height: 1.5; padding-top: 6px">${esc(s)}</div></div>`).join('\n')}
</section>`,

  reviews: (b, page, T) => {
    if (b.variant === 'beforeafter') {
      const p1 = photoUrl(page, 1), p2 = photoUrl(page, 2);
      return `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'Real results', T)}
<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">
<div style="position: relative">${photoBox(p1, T, 220, 'Before photo')}<span style="position: absolute; bottom: 10px; left: 10px; background: ${T.card}; color: ${T.ink}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px">BEFORE</span></div>
<div style="position: relative">${photoBox(p2, T, 220, 'After photo')}<span style="position: absolute; bottom: 10px; left: 10px; background: ${T.accent}; color: ${T.onAccent}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px">AFTER</span></div>
</div>
${(b.items || []).slice(0, 1).map(r => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; padding: 16px"><div style="color: ${T.accent}; letter-spacing: 2px">★★★★★</div><p style="margin: 6px 0 4px; font-size: 14.5px; line-height: 1.5">${esc(r.text)}</p><div style="font-size: 12.5px; color: ${T.faint}">${esc(r.who)}</div></div>`).join('')}
</section>`;
    }
    if (b.variant === 'shots') {
      const shots = [1, 2, 3].map(i => photoUrl(page, i));
      return `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'What customers say', T)}
<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px">
${shots.map(s => photoBox(s, T, 140, 'Customer photo')).join('\n')}
</div>
${(b.items || []).slice(0, 1).map(r => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; padding: 16px"><div style="color: ${T.accent}; letter-spacing: 2px">★★★★★</div><p style="margin: 6px 0 4px; font-size: 14.5px; line-height: 1.5">${esc(r.text)}</p><div style="font-size: 12.5px; color: ${T.faint}">${esc(r.who)}</div></div>`).join('')}
</section>`;
    }
    return `<section style="padding: 28px 20px 0; display: flex; flex-direction: column; gap: 12px">
${h2(b.title || 'What customers say', T)}
${(b.items || []).map(r => `<div style="background: ${T.card}; border: 1px solid ${T.line}; border-radius: ${T.radius}; padding: 18px; display: flex; flex-direction: column; gap: 8px">
<div style="color: ${T.accent}; font-size: 14px; letter-spacing: 2px" aria-label="5 out of 5 stars">★★★★★</div>
<p style="margin: 0; font-size: 15px; line-height: 1.5">${esc(r.text)}</p>
<div style="font-size: 13px; color: ${T.faint}">${esc(r.who)}</div>
</div>`).join('\n')}
</section>`;
  },

  faq: (b, page, T) => `<section style="padding: 28px 20px 0; display: flex; flex-direction: column">
<div style="margin-bottom: 12px">${h2(b.title || 'Questions', T)}</div>
${(b.items || []).map((f, i, arr) => `<div style="border-top: 1px solid ${T.line}; ${i === arr.length - 1 ? `border-bottom: 1px solid ${T.line}; ` : ''}padding: 16px 0"><div style="font-weight: 700; font-size: 15px">${esc(f.q)}</div><div style="font-size: 14px; color: ${T.muted}; margin-top: 6px; line-height: 1.5">${esc(f.a)}</div></div>`).join('\n')}
</section>`,

  urgency: (b, page, T) => {
    const accent = b.variant === 'accent';
    const bg = accent ? T.accent : T.dark;
    const fg = accent ? T.onAccent : T.darkInk;
    const sub = accent ? T.onAccent : T.darkMuted;
    return `<section style="margin: 32px 20px 0; padding: 28px 22px; background: ${bg}; color: ${fg}; border-radius: ${T.radius}; display: flex; flex-direction: column; gap: 14px; text-align: center">
<div style="${headCss(T, 26)}">${esc(b.title)}</div>
${b.sub ? `<div style="font-size: 14px; color: ${sub}; opacity: 0.85">${esc(b.sub)}</div>` : ''}
${accent ? `<a href="${buyLink(page)}" style="display: flex; align-items: center; justify-content: center; min-height: 56px; border-radius: var(--btn-r); background: ${T.ink}; color: ${T.bg}; font-size: 17px; font-weight: 700; text-decoration: none">${orderVerb(page, T)}</a>` : ctaBtn(page, orderVerb(page, T))}
</section>`;
  },

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
<a href="#" onclick="navigator.sendBeacon('/api/report/${page.slug}'); this.textContent='Reported — thank you'; return false" style="font-size: 11px; color: ${T.faint}; text-decoration: underline">Report this page</a>
</footer>

${T.kind === 'app' ? `<div style="position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; max-width: 480px; margin: 0 auto; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: ${T.bg}; border-top: 1px solid ${T.line}; display: flex; align-items: center; gap: 10px; box-sizing: border-box">
<div style="flex-grow: 1"><div style="font-size: 12px; color: ${T.faint}">Free download</div><div style="font-family: ${T.headFont}; font-size: 16px; font-weight: 700">${esc(page.biz)}</div></div>
<a href="${buyLink(page)}?store=apple" style="${T.btnCss || `background: ${T.ink}; color: ${T.bg}`}; border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 700; text-decoration: none"></a>
<a href="${buyLink(page)}?store=google" style="${T.btnCss || `background: ${T.ink}; color: ${T.bg}`}; border-radius: 12px; padding: 12px 14px; font-size: 13px; font-weight: 700; text-decoration: none">▶</a>
</div>` : `<div style="${T.buyBarStyle === 'pill'
    ? `position: fixed; left: 12px; right: 12px; bottom: 14px; z-index: 10; max-width: 456px; margin: 0 auto; padding: 10px 10px 10px 18px; background: ${T.ink}; color: ${T.bg}; border-radius: 999px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 12px; box-sizing: border-box`
    : `position: fixed; left: 0; right: 0; bottom: 0; z-index: 10; max-width: 480px; margin: 0 auto; padding: 12px 16px calc(12px + env(safe-area-inset-bottom)); background: ${T.bg}; border-top: 1px solid ${T.line}; display: flex; align-items: center; gap: 12px; box-sizing: border-box`}">
<div style="flex-grow: 1"><div style="font-size: 12px; color: ${T.faint}">${esc(page.buyBarLabel || page.title)}</div><div style="font-family: ${T.headFont}; font-size: 17px; font-weight: 700">₦${fmt(page.price)}</div></div>
<a href="${buyLink(page)}" style="display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 0 18px; border-radius: var(--btn-r); background: #25D366; color: #062B16; font-size: 15px; font-weight: 700; text-decoration: none">${buyVerb(page, T)}</a>
</div>`}

</div>
<script>
(function(){
  if (/[?&]preview=1/.test(location.search)) return;
  var src = (location.search.match(/[?&]src=(ig|tiktok|wa)/) || [])[1] || 'direct';
  navigator.sendBeacon('/api/track', JSON.stringify({ slug: '${page.slug}', type: 'visit', src: src }));
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
