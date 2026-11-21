// zod schemas for every write endpoint. validate(schema) → middleware that
// 400s with a readable message instead of letting junk reach the handlers.
const { z } = require('zod');

const price = z.string().trim().regex(/^[\d,.\s₦]{1,15}$/, 'invalid price').or(z.number());
const short = (max) => z.string().trim().max(max);

const schemas = {
  compose: z.object({ prompt: short(2000).min(3) }),

  createPage: z.object({
    desc: short(1000).min(3),
    price,
    biz: short(60).min(2),
    oldPrice: z.union([price, z.literal('')]).optional(),
    location: short(80).optional().or(z.literal('')),
    template: short(30).optional(),
  }),

  generate: z.object({
    method: z.enum(['whatsapp', 'call', 'dm']).optional(),
    whatsapp: short(20).optional().or(z.literal('')),
  }),

  patchPage: z.object({
    template: short(30).optional(),
    blocks: z.array(z.object({ type: short(30) }).passthrough()).max(40).optional(),
    content: z.object({}).passthrough().optional(),
    price: price.optional(),
    oldPrice: z.union([price, z.literal(''), z.null()]).optional(),
    buyBarLabel: short(60).nullable().optional(),
    buttonText: short(40).nullable().optional(),
    method: z.enum(['whatsapp', 'call', 'dm']).optional(),
    whatsapp: short(20).optional(),
    location: short(80).nullable().optional(),
    appStoreUrl: z.union([z.string().url().max(300).startsWith('https://'), z.literal(''), z.null()]).optional(),
    playStoreUrl: z.union([z.string().url().max(300).startsWith('https://'), z.literal(''), z.null()]).optional(),
  }).strict(),

  rewrite: z.object({ style: z.enum(['urgent', 'pidgin', 'shorter']).optional(), field: short(30).optional() }),

  chatMsg: z.object({ message: short(1500).optional().or(z.literal('')) }),

  fromTemplate: z.object({ template: short(30).min(1) }),

  me: z.object({ name: short(40).optional(), phone: short(20).optional(), biz: short(60).optional() }),

  track: z.object({
    slug: short(40).min(1),
    type: z.enum(['visit', 'price_seen', 'time']),
    src: short(10).optional(),
    secs: z.number().min(0).max(100000).optional(),
  }),
};

function validate(name) {
  return (req, res, next) => {
    const body = typeof req.body === 'string'
      ? (() => { try { return JSON.parse(req.body); } catch { return null; } })()
      : req.body;
    const out = schemas[name].safeParse(body || {});
    if (!out.success) {
      const msg = out.error.issues.map(i => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
      return res.status(400).json({ error: msg });
    }
    req.valid = out.data;
    next();
  };
}

module.exports = { validate, schemas };
