// Anonymous device sessions — the "no sign-up" model. A long-lived cookie is
// the seller's identity; claiming it with a WhatsApp OTP happens only at the
// pay moment (Phase C). No passwords anywhere, ever.
const crypto = require('crypto');
const store = require('./store');

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(kv => {
    const i = kv.indexOf('=');
    if (i > 0) out[kv.slice(0, i).trim()] = kv.slice(i + 1).trim();
  });
  return out;
}

function session(req, res, next) {
  let sid = parseCookies(req).sid;
  if (!sid || !/^[a-f0-9]{32}$/.test(sid)) {
    sid = crypto.randomBytes(16).toString('hex');
    res.append('Set-Cookie', `sid=${sid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`);
  }
  req.sid = sid;
  req.seller = store.getSeller(sid) || store.addSeller({
    sid, name: 'Seller', biz: null, phone: null, claimedPhone: null,
    pro: false, createdAt: Date.now(),
  });
  next();
}

// OTP codes: in-memory, 10-min expiry. Without an SMS provider configured the
// code is returned in the response (dev mode) and logged — swap in Termii /
// WhatsApp Cloud API later behind the same two endpoints.
const otps = new Map();
function startClaim(sid, phone) {
  const code = String(crypto.randomInt(100000, 999999));
  otps.set(sid, { code, phone, expires: Date.now() + 10 * 60 * 1000 });
  const devMode = !process.env.OTP_PROVIDER;
  if (devMode) console.log(`[otp] (dev) code for ${phone}: ${code}`);
  return { devMode, code: devMode ? code : undefined };
}
function verifyClaim(sid, code) {
  const o = otps.get(sid);
  if (!o || Date.now() > o.expires) return { ok: false, error: 'Code expired — request a new one.' };
  if (o.code !== String(code).trim()) return { ok: false, error: 'Wrong code — check and try again.' };
  otps.delete(sid);
  return { ok: true, phone: o.phone };
}

module.exports = { session, startClaim, verifyClaim };
