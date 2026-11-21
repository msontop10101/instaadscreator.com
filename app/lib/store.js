// Tiny JSON-file store. Swap for Postgres/SQLite on the VPS without changing callers.
const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { pages: [], events: [], user: { name: 'Tolu', pro: false } };
  }
}

let db = load();
let saveTimer = null;

function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }, 50);
}

module.exports = {
  get user() { return db.user; },
  setUser(patch) { Object.assign(db.user, patch); save(); },

  listPages() { return db.pages; },
  getPage(id) { return db.pages.find(p => p.id === id); },
  getPageBySlug(slug) { return db.pages.find(p => p.slug === slug); },
  addPage(page) { db.pages.unshift(page); save(); return page; },
  updatePage(id, patch) {
    const p = this.getPage(id);
    if (p) { Object.assign(p, patch); save(); }
    return p;
  },
  deletePage(id) { db.pages = db.pages.filter(p => p.id !== id); save(); },

  addEvent(ev) { db.events.push({ ...ev, ts: Date.now() }); save(); },
  events(pageId, sinceTs) {
    return db.events.filter(e => e.pageId === pageId && e.ts >= (sinceTs || 0));
  },
};
