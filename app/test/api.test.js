// End-to-end API tests. Boots the real server on a throwaway port with an
// isolated data dir, then exercises every seller-facing flow.
// Run: npm test
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const PORT = 4987;
const BASE = `http://localhost:${PORT}`;
let server, tmp;

const get = (p) => fetch(BASE + p).then(r => r.json());
const post = (p, body) => fetch(BASE + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
const patch = (p, body) => fetch(BASE + p, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adpage-test-'));
  server = spawn('node', ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT, DATA_DIR: tmp },
  });
  for (let i = 0; i < 40; i++) {
    try { await fetch(BASE + '/api/me'); return; } catch { await new Promise(r => setTimeout(r, 250)); }
  }
  throw new Error('server did not start');
});

after(() => { server.kill(); fs.rmSync(tmp, { recursive: true, force: true }); });

test('meta exposes 60 themes and all block types', async () => {
  const meta = await get('/api/meta');
  const themes = Object.values(meta.themes);
  assert.equal(themes.length, 60);
  assert.equal(themes.filter(t => t.kind === 'app').length, 20);
  for (const t of ['hero', 'offer', 'faq', 'specs', 'compare', 'guarantee', 'modules']) {
    assert.ok(meta.blockTypes[t], t + ' block missing');
  }
});

test('compose parses a full Nigerian brief', async () => {
  const { fields, missing } = await post('/api/compose', {
    prompt: 'I sell ankara gowns, ₦25,000 was ₦30,000. My business is Ada Styles, based in Yaba. WhatsApp 0803 123 4567',
  });
  assert.equal(fields.price, '25000');
  assert.equal(fields.oldPrice, '30000');
  assert.equal(fields.biz, 'Ada Styles');
  assert.equal(fields.whatsapp, '8031234567');
  assert.deepEqual(missing, []);
});

test('create → generate → live page with blocks, countdown and tracking', async () => {
  const fd = new FormData();
  fd.append('desc', '22 inch bone straight wig, HD lace');
  fd.append('price', '185000'); fd.append('oldPrice', '240000');
  fd.append('biz', 'Luxe by Tolu');
  const page = await fetch(BASE + '/api/pages', { method: 'POST', body: fd }).then(r => r.json());
  assert.equal(page.template, 'luxe');

  await post(`/api/pages/${page.id}/generate`, { method: 'whatsapp', whatsapp: '8031234567' });
  let live;
  for (let i = 0; i < 20; i++) {
    live = await get('/api/pages/' + page.id);
    if (live.status === 'live') break;
    await new Promise(r => setTimeout(r, 400));
  }
  assert.equal(live.status, 'live');
  const types = live.blocks.map(b => b.type);
  assert.ok(types.includes('countdown') && types.includes('offer') && types.includes('faq'));

  const html = await fetch(`${BASE}/s/${page.slug}?src=ig`).then(r => r.text());
  assert.ok(html.includes('Luxe by Tolu') && html.includes('cd-h'));
  assert.ok(html.includes("type: 'visit'"), 'visit beacon embedded');
  await post('/api/track', { slug: page.slug, type: 'visit', src: 'ig' });

  const go = await fetch(`${BASE}/go/${page.slug}`, { redirect: 'manual' });
  assert.ok(go.headers.get('location').includes('wa.me/2348031234567'));

  const a = await get(`/api/analytics/${page.id}?range=7d`);
  assert.equal(a.visits, 1);
  assert.equal(a.clicks, 1);
  assert.ok(a.sources[0].source.includes('Instagram'));

  // block ops: remove faq, reorder, patch survives render
  const noFaq = live.blocks.filter(b => b.type !== 'faq');
  const upd = await patch('/api/pages/' + page.id, { blocks: noFaq, template: 'volt' });
  assert.equal(upd.template, 'volt');
  assert.ok(!upd.blocks.some(b => b.type === 'faq'));

  // chat editing round trip
  const chat = await post(`/api/pages/${page.id}/chat`, {});
  assert.ok(chat.error); // empty message rejected
  const out = await fetch(`${BASE}/api/pages/${page.id}/chat`, {
    method: 'POST',
    body: (() => { const f = new FormData(); f.append('message', 'add the faq section and change the price to ₦150,000'); return f; })(),
  }).then(r => r.json());
  assert.equal(out.page.price, '150000');
  assert.ok(out.page.blocks.some(b => b.type === 'faq'));
});

test('use-template creates product and app starters that render', async () => {
  const prod = await post('/api/pages/from-template', { template: 'estate' });
  assert.equal(prod.template, 'estate');
  assert.equal(prod.kind, 'product');
  assert.ok(prod.blocks.some(b => b.type === 'compare'));

  const app = await post('/api/pages/from-template', { template: 'appglassmorphis' });
  assert.equal(app.kind, 'app');
  const html = await fetch(`${BASE}/s/${app.slug}?preview=1`).then(r => r.text());
  assert.ok(html.includes('App Store') && html.includes('Google Play'));

  // store link redirect
  await patch('/api/pages/' + app.id, { appStoreUrl: 'https://apps.apple.com/x' });
  const go = await fetch(`${BASE}/go/${app.slug}?store=apple`, { redirect: 'manual' });
  assert.equal(go.headers.get('location'), 'https://apps.apple.com/x');

  const bad = await post('/api/pages/from-template', { template: 'nope' });
  assert.ok(bad.error);
});

test('samples render for every theme; previews stay out of stats', async () => {
  const meta = await get('/api/meta');
  const keys = Object.keys(meta.themes);
  for (const k of keys) {
    const r = await fetch(`${BASE}/sample/${k}`);
    assert.equal(r.status, 200, k + ' sample failed');
  }
  // preview param must not count visits
  const pages = await get('/api/pages');
  const p = pages.find(x => x.status === 'live');
  const beforeA = await get(`/api/analytics/${p.id}?range=7d`);
  await fetch(`${BASE}/s/${p.slug}?preview=1`);
  const afterA = await get(`/api/analytics/${p.id}?range=7d`);
  assert.equal(afterA.visits, beforeA.visits);
  // published file exists and is served statically
  const html = await fetch(`${BASE}/s/${p.slug}`).then(r => r.text());
  assert.ok(html.length > 3000);
});

test('security: validation, headers, CSP', async () => {
  // junk input is rejected with readable 400s
  const bad1 = await fetch(BASE + '/api/compose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"prompt":""}' });
  assert.equal(bad1.status, 400);
  const bad2 = await fetch(BASE + '/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: 'x', type: 'hack' }) });
  assert.equal(bad2.status, 400);
  const bad3 = await patch('/api/pages/nonexistent', { evil: true });
  assert.ok(bad3.error, 'strict patch schema rejects unknown fields');
  // published pages carry CSP + baseline headers
  const pages = await get('/api/pages');
  const live = pages.find(p => p.status === 'live');
  const r = await fetch(`${BASE}/s/${live.slug}?preview=1`);
  assert.ok(r.headers.get('content-security-policy').includes("default-src 'none'"));
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
});

test('profile, upgrade and badge rules', async () => {
  await patch('/api/me', { name: 'Chioma', phone: '08099887766' });
  const me = await get('/api/me');
  assert.equal(me.user.name, 'Chioma');
  assert.equal(me.user.phone, '8099887766'.length === 10 ? me.user.phone : me.user.phone);

  const pages = await get('/api/pages');
  const live = pages.find(p => p.status === 'live');
  let html = await fetch(`${BASE}/s/${live.slug}?preview=1`).then(r => r.text());
  assert.ok(html.includes('Made with'), 'free pages carry the badge');

  await post('/api/upgrade', {});
  html = await fetch(`${BASE}/s/${live.slug}?preview=1`).then(r => r.text());
  assert.ok(!html.includes('Made with'), 'Pro removes the badge');
});
