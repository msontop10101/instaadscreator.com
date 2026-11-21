// Store with two backends behind one synchronous interface:
//   - DATABASE_URL set   → Postgres write-through: all data lives in Postgres,
//     mirrored in memory at boot for sync reads; every mutation persists.
//   - no DATABASE_URL    → JSON file (dev and tests), unchanged behavior.
// Callers never change. `store.ready` resolves when the backend is loaded.
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const PG_URL = process.env.DATABASE_URL || null;

let db = { pages: [], events: [], user: { name: 'Tolu', pro: false } };
let pool = null;

// ---------- JSON backend ----------

let saveTimer = null;
function saveJson() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }, 50);
}

// ---------- Postgres backend ----------

async function initPg() {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: PG_URL });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pages (id TEXT PRIMARY KEY, data JSONB NOT NULL);
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY, page_id TEXT NOT NULL, type TEXT NOT NULL,
      src TEXT, secs INT, ts BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS events_page_ts ON events (page_id, ts);
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value JSONB NOT NULL);
  `);
  const pages = await pool.query('SELECT data FROM pages');
  const events = await pool.query('SELECT page_id, type, src, secs, ts FROM events ORDER BY ts');
  const user = await pool.query(`SELECT value FROM kv WHERE key = 'user'`);
  db.pages = pages.rows.map(r => r.data);
  db.events = events.rows.map(r => ({ pageId: r.page_id, type: r.type, src: r.src || undefined, secs: r.secs || undefined, ts: Number(r.ts) }));
  if (user.rows[0]) db.user = user.rows[0].value;
  else await pool.query(`INSERT INTO kv (key, value) VALUES ('user', $1)`, [db.user]);
  // one-time migration: pull in an existing JSON db on first boot against an empty database
  if (!db.pages.length && fs.existsSync(DB_PATH)) {
    try {
      const old = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      for (const p of old.pages || []) { db.pages.push(p); await pgSavePage(p); }
      for (const e of old.events || []) { db.events.push(e); await pgAddEvent(e); }
      if (old.user) { db.user = old.user; await pgSaveUser(); }
      console.log(`[store] migrated ${db.pages.length} pages + ${db.events.length} events from db.json to Postgres`);
    } catch (err) { console.error('[store] json migration failed:', err.message); }
  }
  console.log(`[store] postgres ready — ${db.pages.length} pages, ${db.events.length} events`);
}

const logPgErr = (err) => console.error('[store:pg]', err.message);
function pgSavePage(p) {
  return pool.query(
    'INSERT INTO pages (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
    [p.id, p]
  ).catch(logPgErr);
}
function pgDeletePage(id) {
  return pool.query('DELETE FROM pages WHERE id = $1', [id]).catch(logPgErr);
}
function pgAddEvent(e) {
  return pool.query(
    'INSERT INTO events (page_id, type, src, secs, ts) VALUES ($1, $2, $3, $4, $5)',
    [e.pageId, e.type, e.src || null, e.secs || null, e.ts]
  ).catch(logPgErr);
}
function pgSaveUser() {
  return pool.query(`INSERT INTO kv (key, value) VALUES ('user', $1) ON CONFLICT (key) DO UPDATE SET value = $1`, [db.user]).catch(logPgErr);
}

// ---------- unified persistence hooks ----------

function persistPage(p) { if (pool) pgSavePage(p); else saveJson(); }
function persistUser() { if (pool) pgSaveUser(); else saveJson(); }

// ---------- boot ----------

const ready = (async () => {
  if (PG_URL) {
    await initPg();
  } else {
    try { db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); } catch { /* fresh */ }
  }
})();

module.exports = {
  ready,
  get user() { return db.user; },
  setUser(patch) { Object.assign(db.user, patch); persistUser(); },

  listPages() { return db.pages; },
  getPage(id) { return db.pages.find(p => p.id === id); },
  getPageBySlug(slug) { return db.pages.find(p => p.slug === slug); },
  addPage(page) { db.pages.unshift(page); persistPage(page); return page; },
  updatePage(id, patch) {
    const p = this.getPage(id);
    if (p) { Object.assign(p, patch); persistPage(p); }
    return p;
  },
  deletePage(id) {
    db.pages = db.pages.filter(p => p.id !== id);
    if (pool) pgDeletePage(id); else saveJson();
  },

  addEvent(ev) {
    const e = { ...ev, ts: Date.now() };
    db.events.push(e);
    if (pool) pgAddEvent(e); else saveJson();
  },
  events(pageId, sinceTs) {
    return db.events.filter(e => e.pageId === pageId && e.ts >= (sinceTs || 0));
  },
};
