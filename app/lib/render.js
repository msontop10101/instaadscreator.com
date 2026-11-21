const { renderPage, blocksFromContent, BLOCK_TYPES, THEMES, bid } = require('../templates/engine');

module.exports = { renderPage, blocksFromContent, BLOCK_TYPES, THEMES, bid, TEMPLATES: Object.keys(THEMES) };
