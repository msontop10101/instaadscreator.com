// AI copywriting layer.
//
// generateContent(input) -> PageContent JSON (canonical shape below).
// If AI_BASE_URL / AI_API_KEY / AI_MODEL env vars are set, calls an
// OpenAI-compatible chat-completions endpoint (Groq, OpenRouter, Gemini
// compat, etc. — provider decision is parked, this is the one-line swap).
// Otherwise falls back to a deterministic mock copywriter so the whole
// product works offline today.
//
// PageContent shape (all templates read from this):
// {
//   template: 'luxe'|'soft'|'tech'|'street',
//   announcement, kicker,
//   headline,            // may contain [[em]]...[[/em]] emphasis markers
//   subhead,
//   priceNote, trustLine,
//   benefits:   [{strong, text}] x3-4,
//   tiles:      [{title, sub}]  x3-4   (feature/spec/ingredient tiles)
//   variants:   {label, options: [{name, note, price, popular}]} | null,
//   howToOrder: [step, step, step],
//   reviews:    [{text, who}],
//   faq:        [{q, a}],
//   urgency:    {title, sub},
// }

const CATEGORY_RULES = [
  { template: 'luxe',   words: ['wig', 'hair', 'lace', 'frontal', 'closure', 'bundle', 'braid', 'extension', 'luxury', 'bag', 'jewelry', 'jewellery'] },
  { template: 'soft',   words: ['skin', 'serum', 'cream', 'glow', 'soap', 'butter', 'lotion', 'oil', 'facial', 'beauty', 'organic', 'natural', 'herbal', 'tea', 'supplement'] },
  { template: 'tech',   words: ['phone', 'iphone', 'samsung', 'laptop', 'earbud', 'headphone', 'watch', 'gadget', 'charger', 'console', 'ps5', 'camera', 'drone', 'speaker', 'airpod', 'macbook', 'tech'] },
  { template: 'street', words: ['sneaker', 'shoe', 'kick', 'jersey', 'cap', 'tee', 'shirt', 'hoodie', 'jean', 'cargo', 'streetwear', 'thrift', 'crep', 'slide', 'boot'] },
  { template: 'food',   words: ['food', 'chops', 'small chops', 'cake', 'pastry', 'meal', 'jollof', 'catering', 'kitchen', 'soup', 'snack', 'grill', 'suya', 'shawarma', 'pizza', 'chin chin', 'zobo', 'smoothie', 'parfait'] },
  { template: 'services', words: ['lash', 'barber', 'makeup', 'braiding service', 'nails', 'manicure', 'pedicure', 'cleaning', 'laundry', 'event', 'photography', 'photographer', 'dj', 'mc ', 'makeover', 'spa', 'massage', 'booking', 'session', 'training', 'class', 'lessons', 'repair'] },
  { template: 'noir',   words: ['perfume', 'oud', 'cologne', 'fragrance', 'watch collection', 'premium', 'exclusive', 'vip'] },
  { template: 'kids',   words: ['baby', 'kids', 'children', 'toy', 'diaper', 'stroller', 'toddler'] },
  { template: 'fitness', words: ['gym', 'fitness', 'waist trainer', 'protein', 'workout', 'dumbbell', 'weight loss', 'yoga'] },
  { template: 'bakery', words: ['cake', 'cupcake', 'pastries', 'dessert', 'doughnut', 'donut', 'banana bread', 'cookies'] },
  { template: 'ankara', words: ['ankara', 'fabric', 'asoebi', 'aso ebi', 'tailor', 'lace fabric', 'adire', 'kampala'] },
  { template: 'thrift', words: ['thrift', 'okrika', 'second hand', 'secondhand', 'uk used clothes', 'bale'] },
  { template: 'auto',   words: ['car', 'tyre', 'tire', 'spare part', 'engine oil', 'battery', 'mechanic', 'brake'] },
  { template: 'shortlet', words: ['shortlet', 'apartment', 'airbnb', 'rent', 'accommodation', 'lodge'] },
  { template: 'events', words: ['event planning', 'decor', 'party planner', 'wedding', 'mc', 'rentals', 'souvenir'] },
  { template: 'appliances', words: ['blender', 'freezer', 'generator', 'solar', 'inverter', 'air fryer', 'microwave', 'washing machine', 'fan', 'ac '] },
  { template: 'salon',  words: ['salon', 'spa', 'nail tech', 'pedicure', 'manicure', 'braiding'] },
];

// Themes without their own mock voice borrow the closest one.
const MOCK_FALLBACK = {
  kids: 'street', fitness: 'tech', bakery: 'food', ankara: 'luxe', thrift: 'street',
  auto: 'tech', shortlet: 'luxe', events: 'services', accessories: 'tech',
  appliances: 'tech', salon: 'services', bold: 'street',
};

function pickTemplate(desc) {
  const d = desc.toLowerCase();
  let best = null, bestHits = 0;
  for (const rule of CATEGORY_RULES) {
    const hits = rule.words.filter(w => d.includes(w)).length;
    if (hits > bestHits) { best = rule.template; bestHits = hits; }
  }
  return best || 'street';
}

const STOPWORDS = new Set(['for', 'with', 'and', 'the', 'of', 'a', 'an', 'in', 'on', 'to', 'plus']);

function firstWords(desc, n) {
  const words = desc.replace(/[,.]/g, ' ').split(/\s+/).filter(Boolean).slice(0, n);
  // don't end a name on a connector word or a dangling number
  while (words.length > 1 && (STOPWORDS.has(words[words.length - 1].toLowerCase()) || /^\d+$/.test(words[words.length - 1]))) {
    words.pop();
  }
  return words.join(' ').replace(/\b\w/g, c => c.toUpperCase());
}

function productName(desc) { return firstWords(desc, 5); }
function shortName(desc) { return firstWords(desc, 4); }

// ---------- mock copywriter ----------

const MOCKS = {
  luxe: (i) => ({
    announcement: 'Free delivery in Lagos · Pay on delivery nationwide',
    kicker: null,
    headline: `${shortName(i.desc)} that [[em]]actually delivers[[/em]].`,
    subhead: `${capitalize(i.desc)}. Exactly what you see is what arrives at your door.`,
    priceNote: null,
    trustLine: 'Pay on delivery · 7-day exchange',
    benefits: [
      { strong: 'Premium quality, verified.', text: 'Inspected before every delivery — no surprises.' },
      { strong: 'What you see is what you get.', text: 'Real photos, no "what I ordered vs what I got".' },
      { strong: 'Pay when it arrives.', text: 'Inspect first, pay after. Zero risk to you.' },
      { strong: 'Fast delivery.', text: 'Lagos in 24 hrs, nationwide in 2–4 days.' },
    ],
    tiles: [
      { title: 'Top grade', sub: 'quality you can feel' },
      { title: 'Verified', sub: 'inspected pre-delivery' },
      { title: 'Durable', sub: 'built to last' },
    ],
    variants: null,
    howToOrder: [
      'Tap the green WhatsApp button',
      'Send your choice and delivery address',
      'Receive it in 24–72 hrs and pay on delivery',
    ],
    reviews: [{ text: 'Exactly as advertised. Quality is top notch and delivery was fast.', who: 'Verified buyer · Lagos' }],
    faq: [
      { q: 'Can I pay on delivery?', a: 'Yes, anywhere in Nigeria. Lagos orders arrive within 24 hours.' },
      { q: 'What if I want to return it?', a: 'Exchange within 7 days, unused.' },
      { q: 'Is it original?', a: '100% authentic. Check it before you pay.' },
    ],
    urgency: { title: 'Limited stock at this price', sub: 'Promo ends Sunday, 11:59pm' },
  }),

  soft: (i) => ({
    announcement: 'Buy 2, get 1 free · Limited time',
    kicker: 'MADE FOR YOU',
    headline: `Real results in 21 days. [[em]]Or your money back.[[/em]]`,
    subhead: `${capitalize(i.desc)}. Made in Nigeria, gentle and effective.`,
    priceNote: 'One pack lasts about 6 weeks',
    trustLine: 'Pay on delivery',
    benefits: [
      { strong: 'Gentle on your skin.', text: 'No harsh chemicals, safe for daily use.' },
      { strong: 'Visible results.', text: 'Most customers see a difference in 2–3 weeks.' },
      { strong: 'Money-back promise.', text: 'Not happy after 21 days? Full refund.' },
    ],
    tiles: [
      { title: 'Natural ingredients', sub: 'carefully sourced' },
      { title: 'Deep nourishment', sub: 'no harsh after-feel' },
      { title: 'Daily-use safe', sub: 'dermatologist friendly' },
      { title: 'Made in Nigeria', sub: 'for our climate & skin' },
    ],
    variants: {
      label: 'Choose your bundle',
      options: [
        { name: '1 pack', note: '6-week supply', price: i.price, popular: false },
        { name: '3 packs (pay for 2)', note: 'Best value', price: Math.round(i.price * 2), popular: true },
      ],
    },
    howToOrder: [
      'Tap the green WhatsApp button',
      'Tell us your bundle and address',
      'Pay on delivery, start your routine',
    ],
    reviews: [{ text: 'I was skeptical but it actually works. Ordering my second one.', who: 'Verified buyer' }],
    faq: [
      { q: 'Is it safe for sensitive skin?', a: 'Yes — no harsh chemicals, gentle enough for daily use.' },
      { q: 'How long before I see results?', a: 'Most people notice a difference within 2–3 weeks of consistent use.' },
      { q: 'What if it doesn’t work for me?', a: 'Message us after 21 days and we refund you.' },
    ],
    urgency: { title: 'Start your 21 days today', sub: 'Free Lagos delivery on bundles' },
  }),

  tech: (i) => ({
    announcement: 'FLASH SALE — TODAY ONLY',
    kicker: productName(i.desc).toUpperCase(),
    headline: `${shortName(i.desc)}. [[em]]Original. Tested. Guaranteed.[[/em]]`,
    subhead: `${capitalize(i.desc)}. Test it before you pay — our rider waits.`,
    priceNote: null,
    trustLine: null,
    benefits: [
      { strong: '100% original.', text: 'Sealed or clean UK-used, clearly labelled.' },
      { strong: 'Test before you pay.', text: 'Our rider waits while you check everything.' },
      { strong: 'Warranty included.', text: '6-month warranty on every purchase.' },
    ],
    tiles: [
      { title: '6-month', sub: 'warranty' },
      { title: 'Tested', sub: 'before you pay' },
      { title: 'Same-day', sub: 'Lagos delivery' },
      { title: 'Original', sub: 'verified authentic' },
    ],
    variants: null,
    howToOrder: [
      'Tap the green WhatsApp button',
      'Confirm availability and your address',
      'Test it when it arrives, then pay',
    ],
    reviews: [{ text: 'Legit plug. Tested everything before paying. Will buy again.', who: 'Verified buyer · Ikeja' }],
    faq: [
      { q: 'Is it original?', a: 'Yes — verified authentic. Test it before you pay.' },
      { q: 'Can I test before paying?', a: 'Yes. Our rider waits while you check it.' },
      { q: 'Outside Lagos?', a: 'We ship nationwide in 2–4 days via GIG.' },
    ],
    urgency: { title: 'Sale price ends tonight', sub: `₦${fmt(i.price)} today · ₦${fmt(i.oldPrice || Math.round(i.price * 1.3))} from tomorrow` },
  }),

  street: (i) => ({
    announcement: null,
    kicker: 'IN STOCK',
    headline: `${shortName(i.desc)}. [[em]]No stories.[[/em]]`,
    subhead: `${capitalize(i.desc)}. True to size, exactly as pictured.`,
    priceNote: null,
    trustLine: null,
    benefits: [
      { strong: 'Quality you can feel', text: 'Premium materials, solid build.' },
      { strong: 'True to size', text: 'What you order is what fits.' },
      { strong: 'Easy swap', text: 'Wrong size? Swap free within 5 days.' },
    ],
    tiles: [
      { title: 'Pay on delivery', sub: '' },
      { title: 'Free Lagos delivery', sub: '' },
      { title: 'Easy swap', sub: '' },
    ],
    variants: null,
    howToOrder: [
      'Tap the green WhatsApp button',
      'Send your size and address',
      'Same-day delivery in Lagos',
    ],
    reviews: [{ text: 'Clean. Exactly as pictured, fits perfectly.', who: 'Verified buyer' }],
    faq: [
      { q: 'Wrong size?', a: 'Swap it free within 5 days, unworn.' },
      { q: 'How fast is delivery?', a: 'Same day in Lagos if you order before 2pm.' },
      { q: 'Other options?', a: 'More colours and styles available. Ask on WhatsApp.' },
    ],
    urgency: { title: 'Your size won’t last long', sub: 'Restocks take 3–4 weeks' },
  }),
};

// New-theme mocks lean on the closest existing voice with vertical tweaks.
MOCKS.food = (i) => ({
  ...MOCKS.soft(i),
  announcement: 'Order before 2pm for same-day delivery',
  kicker: 'FRESH & HOT',
  headline: `${shortName(i.desc)} wey [[em]]dey hit different[[/em]].`,
  subhead: `${capitalize(i.desc)}. Made fresh when you order — never sitting around.`,
  priceNote: null,
  trustLine: 'Same-day delivery in Lagos',
  tiles: [
    { title: 'Made fresh', sub: 'on order' },
    { title: 'Hygienic kitchen', sub: 'NAFDAC aware' },
    { title: 'Same-day', sub: 'Lagos delivery' },
  ],
  howToOrder: ['Tap the green button', 'Send your order and address', 'We prep it fresh and deliver hot'],
  urgency: { title: 'Weekend orders close Friday 6pm', sub: 'Book your slot now' },
});
MOCKS.services = (i) => ({
  ...MOCKS.luxe(i),
  announcement: 'Slots fill fast — book early',
  kicker: 'NOW BOOKING',
  headline: `${shortName(i.desc)}, done [[em]]properly[[/em]].`,
  subhead: `${capitalize(i.desc)}. Professional, punctual, and your results speak.`,
  trustLine: 'Flexible scheduling · Pay after service',
  tiles: [
    { title: 'Certified', sub: 'trained & experienced' },
    { title: 'On time', sub: 'every time' },
    { title: 'Aftercare', sub: 'support included' },
  ],
  howToOrder: ['Tap the green button', 'Pick a date and time', 'Show up — or we come to you'],
  urgency: { title: 'This week’s slots are almost full', sub: 'Book yours before they go' },
});
MOCKS.minimal = (i) => ({
  ...MOCKS.street(i),
  announcement: null,
  kicker: null,
  headline: `${shortName(i.desc)}. [[em]]That’s it.[[/em]]`,
  subhead: `${capitalize(i.desc)}. No gimmicks — just a product that does what it says.`,
  urgency: { title: 'Ready when you are', sub: 'Order today, delivered this week' },
});
MOCKS.noir = (i) => ({
  ...MOCKS.luxe(i),
  announcement: 'Limited pieces · While they last',
  kicker: 'THE COLLECTION',
  headline: `${shortName(i.desc)}. [[em]]For the few.[[/em]]`,
  subhead: `${capitalize(i.desc)}. Quiet luxury — the people who know, know.`,
  trustLine: 'Discreet packaging · Pay on delivery',
  urgency: { title: 'When this batch is gone, it’s gone', sub: 'No restocks on limited pieces' },
});

MOCKS.appkind = (i) => ({
  announcement: null, kicker: 'FREE DOWNLOAD',
  headline: `${shortName(i.desc)}. [[em]]Right on your phone.[[/em]]`,
  subhead: `${capitalize(i.desc)}. Fast, simple, and built for Nigeria.`,
  priceNote: null, trustLine: null,
  benefits: [
    { strong: 'Easy to use.', text: 'Set up in under two minutes.' },
    { strong: 'Works on any phone.', text: 'Light on data and storage.' },
    { strong: 'Safe and secure.', text: 'Your data stays yours.' },
  ],
  tiles: [{ title: '4.8★ rating', sub: '' }, { title: 'Free', sub: 'no hidden fees' }, { title: '10k+ downloads', sub: '' }],
  variants: null,
  howToOrder: ['Tap App Store or Google Play', 'Install free', 'Open and get started'],
  reviews: [{ text: 'Downloaded it last week and I use it every day now. Very smooth.', who: 'App Store review' }],
  faq: [
    { q: 'Is it free?', a: 'Yes — download and core features are free.' },
    { q: 'Does it work offline?', a: 'Key features work even with poor network.' },
    { q: 'Which phones are supported?', a: 'Android 8+ and iPhone (iOS 14+).' },
  ],
  urgency: { title: 'Join thousands already using it', sub: 'Free on App Store and Google Play' },
});

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmt(n) { return Number(n || 0).toLocaleString('en-NG'); }

// ---------- live model (OpenAI-compatible) ----------

async function callModel(input, template) {
  const base = process.env.AI_BASE_URL;
  const key = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  if (!base || !key || !model) return null;

  const sys = `You write direct-response copy for Nigerian social-commerce landing pages. Reply ONLY with JSON matching this exact shape (no markdown): {"announcement":string|null,"kicker":string|null,"headline":string (one short punchy line, mark 1-3 emphasised words by wrapping them in [[em]] and [[/em]]),"subhead":string,"priceNote":string|null,"trustLine":string|null,"benefits":[{"strong":string,"text":string}] (3-4),"tiles":[{"title":string,"sub":string}] (3-4 short feature tiles),"variants":{"label":string,"options":[{"name":string,"note":string,"price":number,"popular":boolean}]}|null,"howToOrder":[string,string,string],"reviews":[{"text":string,"who":string}],"faq":[{"q":string,"a":string}] (3),"urgency":{"title":string,"sub":string}}. Tone: confident, concrete, Nigerian market (pay on delivery, WhatsApp ordering, Lagos delivery). Never invent fake statistics or fake named customers.`;
  const STYLE_HINTS = {
    urgent: 'Make the copy noticeably more urgent (deadline, scarcity).',
    pidgin: 'Write the headline and subhead in Nigerian Pidgin.',
    shorter: 'Make the headline and all copy significantly shorter and punchier.',
  };
  const user = `Product: ${input.desc}\nBusiness: ${input.biz}\nPrice: ₦${input.price}${input.oldPrice ? ` (was ₦${input.oldPrice})` : ''}\nPage style: ${template}${input.style && STYLE_HINTS[input.style] ? `\nTone instruction: ${STYLE_HINTS[input.style]}` : ''}`;

  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`AI call failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

// Rewrite tone styles (desktop editor chips). The live model gets these in its
// prompt; the mock applies simple transforms to the headline.
function applyStyle(content, input) {
  const base = (input.currentHeadline || content.headline).replace(/\[\[\/?em\]\]/g, '');
  if (input.style === 'urgent') {
    content.headline = `${base.replace(/\.$/, '')} — [[em]]today only[[/em]].`;
    content.urgency = { title: 'This price disappears at midnight', sub: 'When it’s gone, it’s gone' };
  } else if (input.style === 'pidgin') {
    content.headline = `${firstWords(input.desc, 3)} wey [[em]]dey deliver[[/em]]. No long talk.`;
    content.subhead = `${capitalize(input.desc)}. Wetin you see na wetin you go collect.`;
  } else if (input.style === 'shorter') {
    const words = base.split(/\s+/).slice(0, 4).join(' ');
    content.headline = `${words.replace(/[.,]$/, '')}. [[em]]Simple.[[/em]]`;
  }
  return content;
}

async function generateContent(input) {
  const template = input.template || pickTemplate(input.desc);
  let content = null;
  try {
    if (!input.mockOnly) content = await callModel(input, template);
  } catch (err) {
    console.error('[ai] live model failed, using mock:', err.message);
  }
  if (!content) {
    const mock = input.kind === 'app' ? MOCKS.appkind : (MOCKS[template] || MOCKS[MOCK_FALLBACK[template]] || MOCKS.street);
    content = mock(input);
    if (input.style) content = applyStyle(content, input);
  }
  return { template, content };
}

// ---------- brief parser: free-text prompt → structured create fields ----------

const NG_CITIES = ['lekki', 'ikeja', 'yaba', 'surulere', 'ajah', 'ikoyi', 'victoria island', 'festac', 'lagos', 'abuja', 'ibadan', 'port harcourt', 'ile-ife', 'ife', 'osun', 'kano', 'enugu', 'benin', 'abeokuta', 'ilorin', 'jos', 'owerri', 'calabar', 'uyo', 'warri', 'asaba', 'onitsha', 'aba'];

function mockParseBrief(prompt) {
  const out = {};
  let text = prompt;

  // phone number (0803 123 4567, +2348031234567, 234-803...), any spacing
  const phoneM = text.match(/(?:\+?234|0)(?:[\s-]?\d){10}/);
  if (phoneM) {
    const digits = phoneM[0].replace(/\D/g, '');
    if (digits.length >= 11) {
      out.whatsapp = digits.slice(-10);
      text = text.replace(phoneM[0], ' ');
    }
  }

  // prices: first ₦/number with 3+ digits = price, second = old price
  const prices = [...text.matchAll(/(?:₦|ngn|naira|n)?\s?(\d{1,3}(?:,\d{3})+|\d{4,})\b/gi)].map(m => m[1].replace(/,/g, ''));
  if (prices.length) out.price = prices[0];
  if (prices.length > 1 && Number(prices[1]) > Number(prices[0])) out.oldPrice = prices[1];

  // business name: "my business is X" / "we are X" / "I'm X" / "brand: X" / "by X"
  const bizM = prompt.match(/(?:business(?: name)? (?:is|:)|brand (?:is|name is|:)|we(?:'re| are) called|i(?:'m| am) called|store (?:is|called)|shop (?:is|called)|call(?:ed)? us|by)\s+["“]?([A-Z][\w&'’. ]{2,34}?)["”]?(?=[,.\n]|$| and | in | at | based)/im);
  if (bizM) out.biz = bizM[1].trim();

  // location: known Nigerian areas
  const low = prompt.toLowerCase();
  for (const city of NG_CITIES) {
    if (low.includes(city)) { out.location = city.replace(/\b\w/g, c => c.toUpperCase()); break; }
  }

  // order method
  if (/instagram dm|dm (?:me|us)|order (?:via|by|through) dm/i.test(prompt)) out.method = 'dm';
  else if (/call (?:me|us|to order)|phone call/i.test(prompt)) out.method = 'call';
  else out.method = 'whatsapp';

  // button text
  const btnM = prompt.match(/button (?:text )?(?:should (?:be|say)|says?|:)\s*["“]?([^"”.,\n]{3,30})["”]?/i);
  if (btnM) out.buttonText = btnM[1].trim();

  // description: the prompt itself, lightly cleaned of the extracted phone
  out.desc = text.replace(/\s{2,}/g, ' ').trim();
  return out;
}

async function modelParseBrief(prompt) {
  const base = process.env.AI_BASE_URL, key = process.env.AI_API_KEY, model = process.env.AI_MODEL;
  if (!base || !key || !model) return null;
  const sys = `Extract structured fields from a Nigerian seller's free-text brief for an ad page. Reply ONLY with JSON: {"desc": string (what they're selling, cleaned), "price": string|null (digits only), "oldPrice": string|null, "biz": string|null (business name), "location": string|null, "whatsapp": string|null (10 digits, no leading 0 or country code), "method": "whatsapp"|"call"|"dm", "buttonText": string|null}. Do not invent values that are not in the brief.`;
  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }], temperature: 0, response_format: { type: 'json_object' } }),
  });
  if (!res.ok) throw new Error(`brief model failed: ${res.status}`);
  return JSON.parse((await res.json()).choices[0].message.content);
}

async function parseBrief(prompt) {
  try {
    const out = await modelParseBrief(prompt);
    if (out) return out;
  } catch (err) {
    console.error('[ai] brief model failed, using mock:', err.message);
  }
  return mockParseBrief(prompt);
}

module.exports = { generateContent, pickTemplate, parseBrief };
