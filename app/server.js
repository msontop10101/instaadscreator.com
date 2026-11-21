const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const QRCode = require('qrcode');

const store = require('./lib/store');
const { generateContent, pickTemplate, parseBrief } = require('./lib/ai');
const { renderPage, TEMPLATES, blocksFromContent, BLOCK_TYPES, THEMES } = require('./lib/render');
const { chat, applyOps } = require('./lib/chat');
const cfg = require('./lib/config');

const app = express();
app.use(express.json());
// sendBeacon posts text/plain
app.use(express.text({ type: 'text/plain' }));

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, 'data', 'uploads'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
      cb(null, crypto.randomBytes(8).toString('hex') + ext);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
});

app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- helpers ----------

function slugify(name) {
  const base = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24) || 'mypage';
  let slug = base, n = 1;
  while (store.getPageBySlug(slug)) slug = base + (++n);
  return slug;
}

const TITLE_STOPWORDS = new Set(['for', 'with', 'and', 'the', 'of', 'a', 'an', 'in', 'on', 'to', 'plus']);

function titleFrom(desc) {
  const words = desc.replace(/[,.]/g, ' ').split(/\s+/).filter(Boolean).slice(0, 4);
  while (words.length > 1 && TITLE_STOPWORDS.has(words[words.length - 1].toLowerCase())) words.pop();
  return words.join(' ').replace(/\b\w/g, c => c.toUpperCase());
}

// Migration: pages generated before the block model get blocks built from
// their content on first touch.
function ensureBlocks(p) {
  if (p && !p.blocks && p.content) {
    store.updatePage(p.id, { blocks: blocksFromContent(p.content, p.template, (p.photos || []).length) });
  }
  return p;
}

function pageDto(p) {
  ensureBlocks(p);
  return {
    blocks: p.blocks || null,
    id: p.id, slug: p.slug, title: p.title, biz: p.biz, status: p.status,
    template: p.template, price: p.price, oldPrice: p.oldPrice, desc: p.desc,
    whatsapp: p.whatsapp, method: p.method, photos: p.photos,
    content: p.content, buyBarLabel: p.buyBarLabel, buttonText: p.buttonText || null, location: p.location,
    pro: p.pro, createdAt: p.createdAt,
    liveUrl: `/s/${p.slug}`, displayDomain: `${p.slug}.${cfg.PAGE_DOMAIN}`,
  };
}

// ---------- pages API ----------

// Editor metadata: block types and themes
app.get('/api/meta', (req, res) => {
  res.json({
    blockTypes: Object.fromEntries(Object.entries(BLOCK_TYPES).map(([k, v]) => [k, { label: v.label }])),
    themes: Object.fromEntries(Object.entries(THEMES).map(([k, v]) => [k, { label: v.label, vertical: v.vertical, bg: v.bg, accent: v.accent, ink: v.ink }])),
  });
});

app.get('/api/me', (req, res) => {
  res.json({
    user: store.user, brand: cfg.BRAND_NAME, domain: cfg.PAGE_DOMAIN,
    proPrice: cfg.PRO_PRICE_NGN,
    pageLimit: store.user.pro ? cfg.PRO_PAGE_LIMIT : cfg.FREE_PAGE_LIMIT,
  });
});

app.patch('/api/me', (req, res) => {
  const patch = {};
  if (typeof req.body.name === 'string' && req.body.name.trim()) patch.name = req.body.name.trim().slice(0, 40);
  if (typeof req.body.phone === 'string') patch.phone = req.body.phone.replace(/[^\d]/g, '').slice(0, 15) || null;
  if (typeof req.body.biz === 'string') patch.biz = req.body.biz.trim().slice(0, 60) || null;
  store.setUser(patch);
  res.json({ ok: true, user: store.user });
});

app.get('/api/pages', (req, res) => {
  res.json(store.listPages().map(pageDto));
});

app.get('/api/pages/:id', (req, res) => {
  const p = store.getPage(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(pageDto(p));
});

// Compose: free-text brief → structured create fields (the chat-style create box)
app.post('/api/compose', async (req, res) => {
  const prompt = (req.body.prompt || '').trim();
  if (!prompt) return res.status(400).json({ error: 'empty prompt' });
  try {
    const fields = await parseBrief(prompt);
    const missing = [];
    if (!fields.price) missing.push('price');
    if (!fields.biz) missing.push('biz');
    if ((fields.method || 'whatsapp') !== 'dm' && !fields.whatsapp) missing.push('whatsapp');
    res.json({ fields, missing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Step 1: product details + photos → draft
app.post('/api/pages', upload.array('photos', 8), (req, res) => {
  const { desc, price, oldPrice, biz, template } = req.body;
  if (!desc || !price || !biz) return res.status(400).json({ error: 'desc, price and biz are required' });
  const userPicked = template && TEMPLATES.includes(template);
  const page = store.addPage({
    id: crypto.randomBytes(6).toString('hex'),
    slug: slugify(biz),
    status: 'draft',
    desc, biz,
    title: titleFrom(desc),
    price: String(price).replace(/[^\d]/g, ''),
    oldPrice: String(oldPrice || '').replace(/[^\d]/g, '') || null,
    photos: (req.files || []).map(f => f.filename),
    method: 'whatsapp', whatsapp: null, location: req.body.location || null,
    template: userPicked ? template : pickTemplate(desc),
    templateLocked: !!userPicked,
    content: null, blocks: null, buyBarLabel: null,
    pro: store.user.pro,
    createdAt: Date.now(),
  });
  res.json(pageDto(page));
});

// Step 2: order method → kick off generation
app.post('/api/pages/:id/generate', async (req, res) => {
  const p = store.getPage(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  const { method, whatsapp } = req.body;
  store.updatePage(p.id, {
    method: method || 'whatsapp',
    whatsapp: whatsapp ? String(whatsapp).replace(/[^\d]/g, '') : p.whatsapp,
    status: 'generating',
  });
  res.json({ ok: true });

  // async generation; Generating screen polls status
  try {
    const t0 = Date.now();
    const { template, content } = await generateContent({
      desc: p.desc, biz: p.biz, price: p.price, oldPrice: p.oldPrice,
      template: p.templateLocked ? p.template : null,
    });
    // keep the "building..." moment honest but snappy even on instant mock
    const minMs = 2500;
    if (Date.now() - t0 < minMs) await new Promise(r => setTimeout(r, minMs - (Date.now() - t0)));
    store.updatePage(p.id, {
      template, content, status: 'live', publishedAt: Date.now(),
      blocks: blocksFromContent(content, template, (p.photos || []).length),
    });
  } catch (err) {
    console.error('[generate]', err);
    store.updatePage(p.id, { status: 'error', error: err.message });
  }
});

// Editor updates: template, sections, content fields, buy bar, price
// Keep the quick-edit fields (headline/subhead/urgency) written through to the
// blocks, which are the render source of truth.
function syncContentIntoBlocks(blocks, content) {
  return (blocks || []).map(blk => {
    if (blk.type === 'offer') {
      const u = { ...blk };
      if (content.headline !== undefined) u.headline = content.headline;
      if (content.subhead !== undefined) u.subhead = content.subhead;
      if (content.kicker !== undefined) u.kicker = content.kicker;
      return u;
    }
    if (blk.type === 'urgency' && content.urgency) {
      return { ...blk, title: content.urgency.title ?? blk.title, sub: content.urgency.sub ?? blk.sub };
    }
    return blk;
  });
}

app.patch('/api/pages/:id', (req, res) => {
  const p = ensureBlocks(store.getPage(req.params.id));
  if (!p) return res.status(404).json({ error: 'not found' });
  const patch = {};
  const b = req.body;
  if (b.template && TEMPLATES.includes(b.template)) patch.template = b.template;
  if (Array.isArray(b.blocks)) {
    patch.blocks = b.blocks.filter(blk => blk && BLOCK_TYPES[blk.type]).map(blk => ({ ...blk, id: blk.id || crypto.randomBytes(3).toString('hex') }));
  }
  if (b.content) {
    patch.content = { ...p.content, ...b.content };
    patch.blocks = syncContentIntoBlocks(patch.blocks || p.blocks, b.content);
  }
  if (b.price) patch.price = String(b.price).replace(/[^\d]/g, '');
  if ('oldPrice' in b) patch.oldPrice = String(b.oldPrice || '').replace(/[^\d]/g, '') || null;
  if ('buyBarLabel' in b) patch.buyBarLabel = b.buyBarLabel || null;
  if ('buttonText' in b) patch.buttonText = b.buttonText || null;
  if (b.whatsapp) patch.whatsapp = String(b.whatsapp).replace(/[^\d]/g, '');
  if (b.method) patch.method = b.method;
  if ('location' in b) patch.location = b.location || null;
  store.updatePage(p.id, patch);
  res.json(pageDto(store.getPage(p.id)));
});

// AI rewrite of one field (headline/subhead) — regenerates copy, keeps the rest
app.post('/api/pages/:id/rewrite', async (req, res) => {
  const p = store.getPage(req.params.id);
  if (!p) return res.status(404).json({ error: 'not found' });
  try {
    const { content } = await generateContent({
      desc: p.desc + ' (rewrite ' + Date.now() % 7 + ')', biz: p.biz,
      price: p.price, oldPrice: p.oldPrice, template: p.template,
      style: req.body.style || null, currentHeadline: p.content && p.content.headline,
    });
    const field = req.body.field;
    const newContent = field && content[field] !== undefined
      ? { ...p.content, [field]: content[field] }
      : { ...p.content, ...content };
    ensureBlocks(p);
    store.updatePage(p.id, {
      content: newContent,
      blocks: syncContentIntoBlocks(p.blocks, { headline: newContent.headline, subhead: newContent.subhead, kicker: newContent.kicker, urgency: newContent.urgency }),
    });
    res.json(pageDto(store.getPage(p.id)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------- chat editing ----------

app.post('/api/pages/:id/chat', upload.array('images', 8), async (req, res) => {
  const p = ensureBlocks(store.getPage(req.params.id));
  if (!p) return res.status(404).json({ error: 'not found' });
  const message = (req.body.message || '').trim();
  if (!message && !(req.files || []).length) return res.status(400).json({ error: 'empty message' });

  // attached images join the page's photo library
  const newImageIndexes = [];
  if ((req.files || []).length) {
    const photos = [...(p.photos || [])];
    for (const f of req.files) { newImageIndexes.push(photos.length); photos.push(f.filename); }
    store.updatePage(p.id, { photos });
    p.photos = photos;
  }

  try {
    const { reply, ops } = await chat(message, p, newImageIndexes);

    // rewrite ops need the copywriter, then sync into blocks
    let working = store.getPage(p.id);
    const rewriteOp = (ops || []).find(o => o.op === 'rewrite');
    const applied = [];
    if (rewriteOp) {
      const { content } = await generateContent({
        desc: working.desc + ' (rewrite ' + Date.now() % 7 + ')', biz: working.biz,
        price: working.price, oldPrice: working.oldPrice, template: working.template,
        style: rewriteOp.style || null, currentHeadline: working.content && working.content.headline,
      });
      const newContent = { ...working.content, headline: content.headline, subhead: content.subhead, urgency: content.urgency };
      store.updatePage(working.id, {
        content: newContent,
        blocks: syncContentIntoBlocks(working.blocks, newContent),
      });
      working = store.getPage(working.id);
      applied.push(rewriteOp.style ? `rewrote the copy (${rewriteOp.style})` : 'rewrote the copy with a fresh angle');
    }

    const result = applyOps(working, (ops || []).filter(o => o.op !== 'rewrite'));
    store.updatePage(working.id, {
      blocks: result.page.blocks, template: result.page.template,
      price: result.page.price, oldPrice: result.page.oldPrice, buttonText: result.page.buttonText,
    });
    applied.push(...result.applied);
    if (newImageIndexes.length && !applied.some(a => a.includes('hero'))) {
      applied.push(`added ${newImageIndexes.length} photo${newImageIndexes.length === 1 ? '' : 's'} to your gallery`);
    }

    const replyText = reply || (applied.length
      ? `Done — I ${applied.join(', ')}. Check the preview.`
      : `I didn't catch an edit there. Try things like "remove the FAQ", "add a countdown", "change the price to ₦50,000", "make it more urgent", "switch to the Noir theme" — or attach a photo and say "use this as the hero".`);

    res.json({ reply: replyText, applied, page: pageDto(store.getPage(p.id)) });
  } catch (err) {
    console.error('[chat]', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/pages/:id', (req, res) => {
  store.deletePage(req.params.id);
  res.json({ ok: true });
});

// Pro upgrade (payment stubbed — Paystack comes later)
app.post('/api/upgrade', (req, res) => {
  store.setUser({ pro: true });
  store.listPages().forEach(p => store.updatePage(p.id, { pro: true }));
  res.json({ ok: true, user: store.user });
});

// ---------- template gallery sample pages ----------

const SAMPLE_BRIEFS = {
  luxe: { desc: '22 inch bone straight wig, double drawn, HD lace', biz: 'Luxe by Tolu', price: '185000', oldPrice: '240000', location: 'Lekki, Lagos' },
  soft: { desc: 'Shea glow serum for dark spots and uneven tone', biz: 'Glow Naturals', price: '14500', oldPrice: '19000', location: 'Ibadan' },
  tech: { desc: 'Wireless earbuds, 40 hours battery, noise cancelling', biz: 'Gadget Hub', price: '38500', oldPrice: '52000', location: 'Computer Village, Ikeja' },
  street: { desc: 'Triple white runner sneakers, sizes 39-46', biz: 'Kicks Lagos', price: '42000', oldPrice: '55000', location: 'Yaba' },
  food: { desc: 'Small chops platter, puff puff, samosa, spring rolls', biz: 'Mama T Kitchen', price: '25000', oldPrice: null, location: 'Surulere, Lagos' },
  services: { desc: 'Classic and volume lash extensions, 2-hour sessions', biz: 'Lashed by Amara', price: '20000', oldPrice: null, location: 'Wuse, Abuja' },
  minimal: { desc: 'Handmade leather wallets, full-grain leather', biz: 'Crafted & Co', price: '35000', oldPrice: null, location: 'Victoria Island' },
  noir: { desc: 'Oud perfume oils, long lasting luxury fragrance', biz: 'Scents Royale', price: '28000', oldPrice: '35000', location: 'Abuja' },
  kids: { desc: 'Baby clothing bundles, 0-24 months, soft cotton', biz: 'Tiny Tots NG', price: '18000', oldPrice: '24000', location: 'Ikeja' },
  fitness: { desc: 'Adjustable dumbbell set with home workout guide', biz: 'FitHub Lagos', price: '65000', oldPrice: '80000', location: 'Lekki' },
  bakery: { desc: 'Celebration cakes, cupcakes and dessert boxes', biz: 'Sugar & Slice', price: '30000', oldPrice: null, location: 'Gbagada' },
  ankara: { desc: 'Premium ankara fabric, 6 yards, asoebi bulk orders', biz: 'Ada Fabrics', price: '12000', oldPrice: '15000', location: 'Balogun Market' },
  thrift: { desc: 'UK-grade thrift jeans and jackets, first grade bale', biz: 'Okrika Deluxe', price: '8500', oldPrice: '12000', location: 'Yaba' },
  auto: { desc: 'Original car batteries with 12-month warranty', biz: 'AutoParts Direct', price: '95000', oldPrice: '110000', location: 'Ladipo Market' },
  shortlet: { desc: 'Luxury 2-bedroom shortlet apartment with pool and WiFi', biz: 'Stay Lagos', price: '85000', oldPrice: null, location: 'Oniru, VI' },
  events: { desc: 'Full event decor and planning, weddings and parties', biz: 'Eventful by Zara', price: '250000', oldPrice: null, location: 'Lagos & Abuja' },
  accessories: { desc: 'Shockproof phone cases and fast chargers, all models', biz: 'CaseWorld', price: '7500', oldPrice: '10000', location: 'Computer Village' },
  appliances: { desc: 'Solar inverter systems, full home installation', biz: 'PowerMax Solar', price: '450000', oldPrice: '520000', location: 'Nationwide' },
  salon: { desc: 'Knotless braids, wig installs and revamps', biz: 'The Hair Suite', price: '15000', oldPrice: null, location: 'Ajah' },
  bold: { desc: 'Clearance sale, everything must go, crazy deals', biz: 'Mega Deals NG', price: '5000', oldPrice: '9000', location: 'Trade Fair' },
};

const sampleCache = {};
app.get('/sample/:theme', async (req, res) => {
  const theme = req.params.theme;
  if (!THEMES[theme]) return res.status(404).send('No such template');
  // Query overrides power the create-page live preview (?desc=&biz=&price=&old=)
  const q = req.query;
  const hasOverrides = q.desc || q.biz || q.price;
  if (!hasOverrides && sampleCache[theme]) return res.send(sampleCache[theme]);

  const brief = { ...(SAMPLE_BRIEFS[theme] || SAMPLE_BRIEFS.street) };
  if (q.desc) brief.desc = String(q.desc).slice(0, 300);
  if (q.biz) brief.biz = String(q.biz).slice(0, 60);
  if (q.price) brief.price = String(q.price).replace(/[^\d]/g, '') || brief.price;
  if (q.old !== undefined) brief.oldPrice = String(q.old).replace(/[^\d]/g, '') || null;
  if (q.loc) brief.location = String(q.loc).slice(0, 60);

  // live-typed previews always use the instant mock, never the paid model
  const { content } = await generateContent({ ...brief, template: theme, mockOnly: hasOverrides });
  const page = {
    slug: 'demo-' + theme, title: brief.desc.split(',')[0].replace(/\b\w/g, c => c.toUpperCase()),
    biz: brief.biz, price: brief.price, oldPrice: brief.oldPrice, location: brief.location,
    template: theme, method: 'whatsapp', whatsapp: null, photos: [], pro: true,
    content, blocks: blocksFromContent(content, theme, 0),
  };
  const html = renderPage(page);
  if (!hasOverrides) sampleCache[theme] = html;
  res.send(html);
});

// ---------- generated sites ----------

const SRC_MAP = { ig: 'Instagram ads', tiktok: 'TikTok', wa: 'WhatsApp status', direct: 'Direct / bio link' };

app.get('/s/:slug', (req, res) => {
  const p = ensureBlocks(store.getPageBySlug(req.params.slug));
  if (!p || !p.blocks) return res.status(404).send('Page not found');
  const src = ['ig', 'tiktok', 'wa'].includes(req.query.src) ? req.query.src : 'direct';
  // one visit per page view (preview iframe sets ?preview=1 to stay out of stats)
  if (!req.query.preview) store.addEvent({ pageId: p.id, type: 'visit', src });
  res.send(renderPage(p));
});

// Order-click redirect: counts the click, then sends buyer to the seller
app.get('/go/:slug', (req, res) => {
  if (req.params.slug.startsWith('demo-')) return res.redirect('/templates');
  const p = store.getPageBySlug(req.params.slug);
  if (!p) return res.status(404).send('Not found');
  store.addEvent({ pageId: p.id, type: 'click' });
  const msg = encodeURIComponent(`Hi, I want to order the ${p.title} (₦${Number(p.price).toLocaleString('en-NG')})`);
  if (p.method === 'call' && p.whatsapp) return res.redirect(`tel:+234${p.whatsapp}`);
  if (p.method === 'dm' && p.handle) return res.redirect(`https://ig.me/m/${p.handle}`);
  const num = p.whatsapp ? `234${p.whatsapp.replace(/^0/, '')}` : '';
  res.redirect(`https://wa.me/${num}?text=${msg}`);
});

// funnel beacon (price_seen)
app.post('/api/track', (req, res) => {
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const p = store.getPageBySlug(b.slug);
    if (p && b.type === 'price_seen') store.addEvent({ pageId: p.id, type: 'price_seen' });
    if (p && b.type === 'time' && Number(b.secs) > 0) store.addEvent({ pageId: p.id, type: 'time', secs: Math.min(600, Math.round(Number(b.secs))) });
  } catch { /* ignore malformed beacons */ }
  res.json({ ok: true });
});

// ---------- analytics ----------

app.get('/api/analytics/:id', (req, res) => {
  const all = req.params.id === 'all';
  const pages = all ? store.listPages() : [store.getPage(req.params.id)].filter(Boolean);
  if (!pages.length) return res.status(404).json({ error: 'not found' });
  const ids = new Set(pages.map(p => p.id));
  const range = req.query.range || '7d';
  const days = range === 'today' ? 1 : range === '30d' ? 30 : 7;
  const since = Date.now() - days * 86400000;
  const prevSince = since - days * 86400000;

  const allEvents = pages.flatMap(p => store.events(p.id, prevSince));
  const evs = allEvents.filter(e => e.ts >= since);
  const prev = allEvents.filter(e => e.ts < since);

  const count = (list, type) => list.filter(e => e.type === type).length;
  const visits = count(evs, 'visit'), clicks = count(evs, 'click'), priceSeen = count(evs, 'price_seen');
  const pVisits = count(prev, 'visit'), pClicks = count(prev, 'click');
  const times = evs.filter(e => e.type === 'time' && e.secs > 0).map(e => e.secs);
  const avgTime = times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null;

  // per-page table rows
  const byPage = pages.map(p => {
    const pevs = evs.filter(e => e.pageId === p.id);
    const v = count(pevs, 'visit'), c = count(pevs, 'click');
    const srcCounts = {};
    pevs.filter(e => e.type === 'visit').forEach(e => { srcCounts[e.src || 'direct'] = (srcCounts[e.src || 'direct'] || 0) + 1; });
    const top = Object.entries(srcCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      id: p.id, title: p.title, status: p.status,
      visits: v, clicks: c, rate: v ? +(c / v * 100).toFixed(1) : 0,
      topSource: top ? (SRC_MAP[top[0]] || top[0]) : null,
    };
  });

  // visits + clicks per day for the bar charts (oldest → newest)
  const perDay = [];
  for (let i = days - 1; i >= 0; i--) {
    const d0 = new Date(); d0.setHours(0, 0, 0, 0); d0.setDate(d0.getDate() - i);
    const d1 = new Date(d0); d1.setDate(d1.getDate() + 1);
    perDay.push({
      day: d0.toLocaleDateString('en', { weekday: 'narrow' }),
      dayFull: d0.toLocaleDateString('en', { weekday: 'short' }),
      visits: evs.filter(e => e.type === 'visit' && e.ts >= d0 && e.ts < d1).length,
      clicks: evs.filter(e => e.type === 'click' && e.ts >= d0 && e.ts < d1).length,
    });
  }

  const bySrc = {};
  evs.filter(e => e.type === 'visit').forEach(e => { bySrc[e.src || 'direct'] = (bySrc[e.src || 'direct'] || 0) + 1; });
  const sources = Object.entries(bySrc)
    .map(([k, v]) => ({ source: SRC_MAP[k] || k, pct: visits ? Math.round(v / visits * 100) : 0, count: v }))
    .sort((a, b) => b.count - a.count);

  res.json({
    visits, clicks, priceSeen, avgTime,
    rate: visits ? +(clicks / visits * 100).toFixed(1) : 0,
    deltaVisits: pVisits ? Math.round((visits - pVisits) / pVisits * 100) : null,
    deltaClicks: pClicks ? Math.round((clicks - pClicks) / pClicks * 100) : null,
    perDay, sources, byPage,
  });
});

// QR code for the live page
app.get('/qr/:slug', async (req, res) => {
  const p = store.getPageBySlug(req.params.slug);
  if (!p) return res.status(404).send('Not found');
  const url = `${req.protocol}://${req.get('host')}/s/${p.slug}`;
  res.type('png').send(await QRCode.toBuffer(url, { width: 480, margin: 2 }));
});

// ---------- builder screens ----------

const screen = name => (req, res) => res.sendFile(path.join(__dirname, 'public', name));
app.get('/', screen('home.html'));
app.get('/create', screen('create.html'));
app.get('/order-method', screen('order-method.html'));
app.get('/generating', screen('generating.html'));
app.get('/live', screen('live.html'));
app.get('/editor', screen('editor.html'));
app.get('/analytics', screen('analytics.html'));
app.get('/upgrade', screen('upgrade.html'));
app.get('/account', screen('account.html'));
app.get('/templates', screen('templates.html'));

app.listen(cfg.PORT, () => {
  console.log(`${cfg.BRAND_NAME} builder running → http://localhost:${cfg.PORT}`);
});
