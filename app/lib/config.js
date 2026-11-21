// Product-level config. [Brand] in the design handoff is still undecided —
// change BRAND_NAME / PAGE_DOMAIN here once and it flows everywhere.
module.exports = {
  BRAND_NAME: 'InstaAds',        // display name (full: Insta Ads Site Creator)
  PAGE_DOMAIN: 'instaadssitecreator.com', // generated sites: <slug>.instaadssitecreator.com
  // Free pages stay live forever — Pro sells analytics, custom domain, more pages.
  FREE_PAGE_LIMIT: 1,
  PRO_PAGE_LIMIT: 10,
  PRO_PRICE_NGN: 3500,           // ₦/month placeholder until pricing lands
  PORT: process.env.PORT || 4000,
};
