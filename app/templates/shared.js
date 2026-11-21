const { BRAND_NAME } = require('../lib/config');

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmt(n) {
  const num = Number(String(n).replace(/[^\d.]/g, ''));
  return isNaN(num) ? String(n) : num.toLocaleString('en-NG');
}

// Convert [[em]]...[[/em]] markers to a template-specific span.
function em(text, open, close) {
  return esc(text).replace(/\[\[em\]\]/g, open).replace(/\[\[\/em\]\]/g, close);
}

function savePct(price, oldPrice) {
  const p = Number(String(price).replace(/[^\d.]/g, ''));
  const o = Number(String(oldPrice).replace(/[^\d.]/g, ''));
  if (!p || !o || o <= p) return null;
  return Math.round((1 - p / o) * 100);
}

// Buy link goes through the click-tracking redirect.
function buyLink(page) { return `/go/${page.slug}`; }

function waIcon(size = 22) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.1A8.5 8.5 0 1 1 21 11.5z"></path></svg>`;
}

function orderVerb(page) {
  if (page.buttonText) return esc(page.buttonText);
  return { whatsapp: 'Order on WhatsApp', call: 'Call to order', dm: 'DM to order', form: 'Order now' }[page.method] || 'Order on WhatsApp';
}
function buyVerb(page) {
  if (page.buttonText) return esc(page.buttonText);
  return { whatsapp: 'Buy on WhatsApp', call: 'Call to buy', dm: 'DM us', form: 'Order now' }[page.method] || 'Buy on WhatsApp';
}

function photoUrl(page, i) {
  return page.photos && page.photos[i] ? `/uploads/${page.photos[i]}` : null;
}

// "Made with" badge (free plan only) + funnel tracking script.
function pageFoot(page, { badgeStyle = '', footColor = '#777' } = {}) {
  const badge = page.pro ? '' :
    `<div style="border: 1px solid currentColor; border-radius: 999px; padding: 6px 12px; ${badgeStyle}">Made with ${esc(BRAND_NAME)}</div>`;
  return `${badge}
<script>
(function(){
  if (/[?&]preview=1/.test(location.search)) return; // previews stay out of stats
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
</script>`;
}

// Countdown to next local midnight; fills elements with class cd-h / cd-m / cd-s.
function countdownScript() {
  return `<script>
(function(){
  function pad(n){ return String(n).padStart(2,'0'); }
  function tick(){
    var now = new Date(), end = new Date(now); end.setHours(23,59,59,999);
    var d = Math.max(0, end - now);
    var h = Math.floor(d/3.6e6), m = Math.floor(d%3.6e6/6e4), s = Math.floor(d%6e4/1e3);
    document.querySelectorAll('.cd-h').forEach(function(e){ e.textContent = pad(h); });
    document.querySelectorAll('.cd-m').forEach(function(e){ e.textContent = pad(m); });
    document.querySelectorAll('.cd-s').forEach(function(e){ e.textContent = pad(s); });
  }
  tick(); setInterval(tick, 1000);
})();
</script>`;
}

module.exports = { esc, fmt, em, savePct, buyLink, waIcon, orderVerb, buyVerb, photoUrl, pageFoot, countdownScript };
