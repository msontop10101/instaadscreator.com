// Rate limiting (in-memory token buckets per IP) + security headers.
// Buckets reset on restart — fine for abuse control, not billing.

const buckets = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (now > b.resetAt) buckets.delete(k);
}, 60_000).unref();

// rateLimit(name, max, windowMs) → express middleware
function rateLimit(name, max, windowMs) {
  return (req, res, next) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '?').split(',')[0].trim();
    const key = `${name}:${ip}`;
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now > b.resetAt) { b = { n: 0, resetAt: now + windowMs }; buckets.set(key, b); }
    if (++b.n > max) {
      res.set('Retry-After', Math.ceil((b.resetAt - now) / 1000));
      return res.status(429).json({ error: 'Too many requests — slow down and try again shortly.' });
    }
    next();
  };
}

// Baseline headers for everything
function baseHeaders(req, res, next) {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
}

// CSP for published seller pages: inline styles/scripts are ours (rendered
// server-side from escaped data); external script sources are blocked entirely.
const PAGE_CSP = [
  "default-src 'none'",
  "img-src 'self' data:",
  "style-src 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "script-src 'unsafe-inline'",
  "connect-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'none'",
  "form-action 'self'",
].join('; ');

function pageCsp(req, res, next) {
  res.set('Content-Security-Policy', PAGE_CSP);
  next();
}

module.exports = { rateLimit, baseHeaders, pageCsp };
