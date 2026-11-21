// Product-level config. [Brand] in the design handoff is still undecided —
// change BRAND_NAME / PAGE_DOMAIN here once and it flows everywhere.
module.exports = {
  BRAND_NAME: 'AdPage',          // working name, placeholder until branding lands
  PAGE_DOMAIN: 'adpage.ng',      // generated sites: <slug>.adpage.ng (local: /s/<slug>)
  // Free pages stay live forever — Pro sells analytics, custom domain, more pages.
  FREE_PAGE_LIMIT: 1,
  PRO_PAGE_LIMIT: 10,
  PRO_PRICE_NGN: 3500,           // ₦/month placeholder until pricing lands
  PORT: process.env.PORT || 4000,
};
