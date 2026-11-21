// Chat editing engine. The AI (or the offline mock parser) never writes HTML —
// it emits structured ops that are applied to the page's block array, so a
// chat edit can never produce a broken page.
//
// Ops:
//   { op: 'set_theme', theme }
//   { op: 'set_price', price, oldPrice? }
//   { op: 'set_button_text', text }
//   { op: 'update_block', type|id, props }        (type targets first block of that type)
//   { op: 'add_block', type, props?, after? }     (after = block type or 'end')
//   { op: 'remove_block', type|id }
//   { op: 'move_block', type|id, dir: 'up'|'down' }
//   { op: 'set_hero_image', imageIndex }
//   { op: 'rewrite', style? }                     (handled by caller via ai.generateContent)

const { BLOCK_TYPES, THEMES, bid } = require('./render');

const THEME_WORDS = {
  luxe: ['luxe'], soft: ['soft'], tech: ['tech'], street: ['street'],
  food: ['food'], services: ['service', 'services', 'booking'],
  minimal: ['minimal', 'clean', 'simple theme', 'white theme'],
  noir: ['noir', 'dark', 'black theme', 'luxury theme'],
};

const BLOCK_WORDS = {
  announcement: ['announcement', 'top bar', 'banner'],
  countdown: ['countdown', 'timer', 'flash sale bar'],
  hero: ['hero', 'main photo', 'main image', 'cover photo'],
  offer: ['headline block', 'price block', 'offer'],
  tiles: ['trust badges', 'badges', 'tiles'],
  benefits: ['benefits', 'why buy'],
  gallery: ['gallery', 'photos section', 'photo grid'],
  variants: ['variants', 'sizes', 'options picker', 'bundles'],
  howToOrder: ['how to order', 'steps'],
  reviews: ['reviews', 'testimonials'],
  faq: ['faq', 'questions'],
  urgency: ['urgency', 'promo block', 'limited stock block'],
  text: ['text block', 'text section', 'about section', 'about us'],
  image: ['image block', 'picture block'],
};

function findBlockType(msg) {
  for (const [type, words] of Object.entries(BLOCK_WORDS)) {
    if (words.some(w => msg.includes(w))) return type;
  }
  return null;
}

// ---------- apply ops to a page (mutates a copy, returns {page, applied}) ----------

function applyOps(page, ops) {
  const p = { ...page, blocks: [...(page.blocks || [])] };
  const applied = [];
  const findIdx = (ref) => p.blocks.findIndex(b => b.id === ref || b.type === ref);

  for (const op of ops || []) {
    try {
      if (op.op === 'set_theme' && THEMES[op.theme]) {
        p.template = op.theme;
        applied.push(`switched to the ${THEMES[op.theme].label} theme`);
      } else if (op.op === 'set_price' && op.price) {
        p.price = String(op.price).replace(/[^\d]/g, '');
        if (op.oldPrice !== undefined) p.oldPrice = String(op.oldPrice || '').replace(/[^\d]/g, '') || null;
        applied.push(`set the price to ₦${Number(p.price).toLocaleString('en-NG')}`);
      } else if (op.op === 'set_button_text' && op.text) {
        p.buttonText = String(op.text).slice(0, 40);
        applied.push(`changed the button text to "${p.buttonText}"`);
      } else if (op.op === 'update_block') {
        const i = findIdx(op.id || op.type);
        if (i >= 0) {
          p.blocks[i] = { ...p.blocks[i], ...op.props };
          applied.push(`updated the ${BLOCK_TYPES[p.blocks[i].type]?.label || p.blocks[i].type}`);
        }
      } else if (op.op === 'add_block' && BLOCK_TYPES[op.type]) {
        const block = { id: bid(), type: op.type, ...BLOCK_TYPES[op.type].defaults(), ...(op.props || {}) };
        let at = p.blocks.length;
        if (op.after && op.after !== 'end') {
          const i = findIdx(op.after);
          if (i >= 0) at = i + 1;
        } else if (!op.after) {
          // sensible default position: before urgency/footer area
          const u = p.blocks.findIndex(b => b.type === 'urgency');
          at = u >= 0 ? u : p.blocks.length;
        }
        p.blocks.splice(at, 0, block);
        applied.push(`added a ${BLOCK_TYPES[op.type].label} section`);
      } else if (op.op === 'remove_block') {
        const i = findIdx(op.id || op.type);
        if (i >= 0) {
          const [gone] = p.blocks.splice(i, 1);
          applied.push(`removed the ${BLOCK_TYPES[gone.type]?.label || gone.type} section`);
        }
      } else if (op.op === 'move_block') {
        const i = findIdx(op.id || op.type);
        const j = op.dir === 'up' ? i - 1 : i + 1;
        if (i >= 0 && j >= 0 && j < p.blocks.length) {
          const [b] = p.blocks.splice(i, 1);
          p.blocks.splice(j, 0, b);
          applied.push(`moved the ${BLOCK_TYPES[b.type]?.label || b.type} ${op.dir}`);
        }
      } else if (op.op === 'set_hero_image' && op.imageIndex !== undefined) {
        const i = findIdx('hero');
        if (i >= 0) {
          p.blocks[i] = { ...p.blocks[i], image: op.imageIndex };
          applied.push('set your new photo as the hero image');
        }
      }
    } catch { /* skip bad op */ }
  }
  return { page: p, applied };
}

// ---------- offline mock parser (keyword-based) ----------

function mockParse(message, page, newImageIndexes) {
  const msg = message.toLowerCase();
  const ops = [];

  // attached images → hero + note
  if (newImageIndexes.length) {
    if (/hero|main (photo|image)|cover/.test(msg) || !/gallery/.test(msg)) {
      ops.push({ op: 'set_hero_image', imageIndex: newImageIndexes[0] });
    }
  }

  // theme switch
  if (/theme|template|look|design/.test(msg)) {
    for (const [theme, words] of Object.entries(THEME_WORDS)) {
      if (words.some(w => msg.includes(w))) { ops.push({ op: 'set_theme', theme }); break; }
    }
  }

  // price
  const priceM = msg.match(/price (?:to|is|=)?\s*₦?\s*([\d,]+)/);
  if (priceM) ops.push({ op: 'set_price', price: priceM[1] });

  // button text
  const btnM = message.match(/button (?:text )?(?:to|say|says)\s*["“]?([^"”.,]+)["”]?/i);
  if (btnM) ops.push({ op: 'set_button_text', text: btnM[1].trim() });

  // headline
  const headM = message.match(/headline (?:to|say|says)\s*["“]([^"”]+)["”]/i) || message.match(/headline (?:to|say|says)\s+(.+)$/i);
  if (headM) ops.push({ op: 'update_block', type: 'offer', props: { headline: headM[1].trim() } });

  // remove / add / move sections
  const blockType = findBlockType(msg);
  if (blockType) {
    if (/remove|delete|take (out|off)|hide/.test(msg)) ops.push({ op: 'remove_block', type: blockType });
    else if (/\badd\b|\bput\b|include/.test(msg) && !ops.some(o => o.op === 'set_hero_image')) ops.push({ op: 'add_block', type: blockType });
    else if (/move .*up|higher/.test(msg)) ops.push({ op: 'move_block', type: blockType, dir: 'up' });
    else if (/move .*down|lower/.test(msg)) ops.push({ op: 'move_block', type: blockType, dir: 'down' });
  }

  // tone rewrites
  if (/more urgent|urgency|scarcity/.test(msg) && !blockType) ops.push({ op: 'rewrite', style: 'urgent' });
  else if (/pidgin/.test(msg)) ops.push({ op: 'rewrite', style: 'pidgin' });
  else if (/shorter|more punchy|punchier/.test(msg)) ops.push({ op: 'rewrite', style: 'shorter' });
  else if (/rewrite|new copy|different angle/.test(msg) && !ops.length) ops.push({ op: 'rewrite' });

  return ops;
}

// ---------- live model (OpenAI-compatible) ----------

async function modelParse(message, page, newImageIndexes) {
  const base = process.env.AI_BASE_URL, key = process.env.AI_API_KEY, model = process.env.AI_MODEL;
  if (!base || !key || !model) return null;

  const sys = `You edit a mobile commerce landing page by emitting JSON ops. Reply ONLY with JSON: {"reply": string (short, friendly, Nigerian-seller tone), "ops": [...]}.
Allowed ops: {"op":"set_theme","theme":"${Object.keys(THEMES).join('|')}"}, {"op":"set_price","price":number}, {"op":"set_button_text","text":string}, {"op":"update_block","type":string,"props":object}, {"op":"add_block","type":"${Object.keys(BLOCK_TYPES).join('|')}","props":object,"after":string?}, {"op":"remove_block","type":string}, {"op":"move_block","type":string,"dir":"up"|"down"}, {"op":"set_hero_image","imageIndex":number}, {"op":"rewrite","style":"urgent"|"pidgin"|"shorter"?}.
Current page blocks (in order): ${JSON.stringify((page.blocks || []).map(b => ({ id: b.id, type: b.type })))}. Theme: ${page.template}. Price: ₦${page.price}.
${newImageIndexes.length ? `The user just attached ${newImageIndexes.length} image(s), available at photo indexes ${newImageIndexes.join(', ')}.` : ''}
Never invent fake reviews from named people. If the request is unclear, return empty ops and ask in the reply.`;

  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: message }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    }),
  });
  if (!res.ok) throw new Error(`chat model failed: ${res.status}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function chat(message, page, newImageIndexes) {
  let reply = null, ops = null;
  try {
    const out = await modelParse(message, page, newImageIndexes);
    if (out) { reply = out.reply; ops = out.ops || []; }
  } catch (err) {
    console.error('[chat] live model failed, using mock:', err.message);
  }
  if (!ops) ops = mockParse(message, page, newImageIndexes);
  return { reply, ops };
}

module.exports = { chat, applyOps };
