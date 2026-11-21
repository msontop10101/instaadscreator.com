// Billing behind a provider interface. Chosen provider: Bachs (adapter TBD —
// waiting on docs). Until it lands, provider "manual" approves upgrades
// directly so the product flow stays testable end to end.
//
// A real adapter implements: createCheckout(seller, plan) -> {url|reference}
// and verifyWebhook(req) -> {sellerSid, paid, reference} with idempotency.

const providers = {
  manual: {
    name: 'manual',
    async createCheckout() { return { approved: true }; },
  },
  // bachs: require('./billing-bachs')  ← next session, with their docs
};

function provider() {
  return providers[process.env.BILLING_PROVIDER || 'manual'] || providers.manual;
}

module.exports = { provider };
