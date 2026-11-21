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

let cookie = '';
async function cfetch(url, opts = {}) {
  opts.headers = { ...(opts.headers || {}), ...(cookie ? { Cookie: cookie } : {}) };
  const r = await global.fetch(url, opts);
  const setc = r.headers.get('set-cookie');
  if (setc && setc.includes('sid=')) cookie = setc.split(';')[0];
  return r;
}
const fetch = cfetch; // all tests ride one anonymous session, like one device
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

  // free seller: analytics is gated to the visits teaser
  const teaser = await get(`/api/analytics/${page.id}?range=7d`);
  assert.equal(teaser.gated, true);
  assert.equal(teaser.visits, 1);
  assert.equal(teaser.clicks, null);
  assert.deepEqual(teaser.sources, []);

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

test('free limit → WhatsApp-OTP claim → upgrade → badge removed', async () => {
  // page #2 on free plan is blocked
  const fd = new FormData();
  fd.append('desc', 'another product'); fd.append('price', '5000'); fd.append('biz', 'Second Biz');
  const blocked = await fetch(BASE + '/api/pages', { method: 'POST', body: fd });
  assert.equal(blocked.status, 403);
  assert.ok((await blocked.json()).upgrade);

  // upgrade without a claimed number is refused
  const noClaim = await fetch(BASE + '/api/upgrade', { method: 'POST' });
  assert.equal(noClaim.status, 403);

  // badge present while free
  const pages = await get('/api/pages');
  const live = pages.find(p => p.status === 'live');
  let html = await fetch(`${BASE}/s/${live.slug}?preview=1`).then(r => r.text());
  assert.ok(html.includes('Made with'));

  // claim via dev-mode OTP, then upgrade
  const start = await post('/api/claim/start', { phone: '08031234567' });
  assert.ok(start.devMode && start.code);
  const bad = await fetch(BASE + '/api/claim/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: '000000' }) });
  assert.equal(bad.status, 400);
  const good = await post('/api/claim/verify', { code: start.code });
  assert.ok(good.ok);
  const up = await post('/api/upgrade', {});
  assert.ok(up.ok);
  const me = await get('/api/me');
  assert.equal(me.user.pro, true);
  assert.equal(me.pageLimit, 10);

  // badge gone after Pro republish
  html = await fetch(`${BASE}/s/${live.slug}?preview=1`).then(r => r.text());
  assert.ok(!html.includes('Made with'));
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

test('moderation: report, admin queue, block/unblock', async () => {
  const pages = await get('/api/pages');
  const live = pages.find(p => p.slug === 'luxebytolu');
  await fetch(`${BASE}/api/report/${live.slug}`, { method: 'POST' });

  // admin key required
  const noKey = await global.fetch(`${BASE}/api/admin/pages`);
  assert.equal(noKey.status, 401);
  const rows = await global.fetch(`${BASE}/api/admin/pages`, { headers: { 'x-admin-key': 'dev-admin' } }).then(r => r.json());
  const row = rows.find(r => r.slug === live.slug);
  assert.equal(row.reports, 1);

  // block → 410, unblock → 200 again
  await global.fetch(`${BASE}/api/admin/pages/${live.id}/block`, { method: 'POST', headers: { 'x-admin-key': 'dev-admin' } });
  assert.equal((await global.fetch(`${BASE}/s/${live.slug}`)).status, 410);
  await global.fetch(`${BASE}/api/admin/pages/${live.id}/block`, { method: 'POST', headers: { 'x-admin-key': 'dev-admin' } });
  assert.equal((await global.fetch(`${BASE}/s/${live.slug}?preview=1`)).status, 200);
});

test('profile updates and full analytics for Pro', async () => {
  await patch('/api/me', { name: 'Chioma' });
  const me = await get('/api/me');
  assert.equal(me.user.name, 'Chioma');

  const pages = await get('/api/pages');
  const live = pages.find(p => p.slug === 'luxebytolu');
  const a = await get(`/api/analytics/${live.id}?range=7d`);
  assert.ok(!a.gated, 'Pro sees everything');
  assert.equal(a.visits, 1);
  assert.equal(a.clicks, 1);
  assert.ok(a.sources[0].source.includes('Instagram'));
});
