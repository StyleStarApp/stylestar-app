#!/usr/bin/env node
// unit-economics.js — what does a shopping question cost, and what might it earn?
//
// ⚠️⚠️ READ THIS FIRST. Almost every number below is an ASSUMPTION, not a
// measurement, and this file's whole culture is that those are different things.
// Style Star has ~0 users and $27 of lifetime commission, so there is no real
// conversion data to fit to. What IS measured is marked ✓; everything else is an
// industry-typical range and should be replaced the moment real numbers exist.
//
// ▶ The point of this script is NOT the headline number. It is which assumption
//   the answer is most sensitive to — because that names what to go and measure.
//
// Run: node scripts/unit-economics.js [--users 1000] [--search-price 0.015]

const arg = (k, d) => { const i = process.argv.indexOf('--' + k);
  return i >= 0 ? Number(process.argv[i + 1]) : d; };

const USERS = arg('users', 1000);
const SEARCH_PRICE = arg('search-price', NaN);   // $ per SerpApi call, if known

// ── MEASURED ✓ ───────────────────────────────────────────────────────────────
const SEARCHES_PER_Q = {low: 4, high: 10};   // ✓ 1 question = up to 4 queries + 6 look-ups

// ── ASSUMED (industry-typical; replace with real data when it exists) ────────
const SHOPPER_RATE   = {low: 0.20, high: 0.50};  // of registered users who shop in a month
const Q_PER_SHOPPER  = {low: 2,    high: 5};     // shopping questions each, per month
const CLICKS_PER_Q   = {low: 0.6,  high: 2.0};   // card taps per question
const CONVERSION     = {low: 0.01, high: 0.03};  // click -> purchase, fashion affiliate
const AOV            = {low: 80,   high: 150};   // $ order value, blended across her range
const COMMISSION     = {low: 0.04, high: 0.08};  // blended rate across her networks

const lo = o => o.low, hi = o => o.high;
// ⚠️ THE MIDDLE USES A GEOMETRIC MEAN, NOT AN ARITHMETIC ONE, AND ON PURPOSE.
//    These inputs MULTIPLY, so the honest centre of a 1%-3% conversion is ~1.7%,
//    not 2%. Averaging them the usual way quietly flatters the answer at every
//    step and the flattery compounds six times over.
const mid = o => Math.sqrt(o.low * o.high);
const scenario = (pick, label) => {
  const shoppers  = USERS * pick(SHOPPER_RATE);
  const questions = shoppers * pick(Q_PER_SHOPPER);
  const searches  = questions * pick(SEARCHES_PER_Q);
  const clicks    = questions * pick(CLICKS_PER_Q);
  const orders    = clicks * pick(CONVERSION);
  const gmv       = orders * pick(AOV);
  const revenue   = gmv * pick(COMMISSION);
  return {label, shoppers, questions, searches, clicks, orders, gmv, revenue,
          perQuestion: questions ? revenue / questions : 0};
};

const money = n => '$' + n.toLocaleString('en-US', {maximumFractionDigits: 0});
const row = (s) => {
  console.log(`\n  ${s.label}`);
  console.log(`    shoppers/month      ${Math.round(s.shoppers).toLocaleString()}`);
  console.log(`    shopping questions  ${Math.round(s.questions).toLocaleString()}`);
  console.log(`    SEARCHES NEEDED     ${Math.round(s.searches).toLocaleString()}  /month`);
  console.log(`    card taps           ${Math.round(s.clicks).toLocaleString()}`);
  console.log(`    orders              ${Math.round(s.orders).toLocaleString()}`);
  console.log(`    sales value         ${money(s.gmv)}`);
  console.log(`    HER COMMISSION      ${money(s.revenue)}  /month`);
  console.log(`    per question        $${s.perQuestion.toFixed(3)}`);
};

console.log(`\n${'═'.repeat(64)}\n  ${USERS.toLocaleString()} USERS — a model, not a forecast\n${'═'.repeat(64)}`);
const worst  = scenario(lo,  'CAUTIOUS  (every assumption at its low end)');
const middle = scenario(mid, 'MIDDLE    (geometric centre — the one to plan from)');
const best   = scenario(hi,  'HOPEFUL   (every assumption at its high end)');
row(worst); row(middle); row(best);

// ── THE BREAK-EVEN THAT ACTUALLY MATTERS ─────────────────────────────────────
console.log(`\n${'─'.repeat(64)}\n  WHAT A SEARCH MAY COST BEFORE IT EATS THE COMMISSION\n${'─'.repeat(64)}`);
for (const s of [worst, middle, best]) {
  const perQ = s.perQuestion;
  console.log(`\n  ${s.label.split(' ')[0]}: ${'$' + perQ.toFixed(3)} commission per question`);
  for (const k of ['low', 'high']) {
    const n = SEARCHES_PER_Q[k];
    console.log(`     at ${String(n).padStart(2)} searches/question -> break even at $${(perQ / n).toFixed(4)} per search`);
  }
}
if (Number.isFinite(SEARCH_PRICE)) {
  console.log(`\n  At your actual $${SEARCH_PRICE}/search:`);
  for (const s of [worst, middle, best]) {
    for (const k of ['low', 'high']) {
      const cost = s.searches ? SEARCH_PRICE * (s.questions * SEARCHES_PER_Q[k]) : 0;
      const net = s.revenue - cost;
      console.log(`     ${s.label.split(' ')[0].padEnd(9)} @${String(SEARCHES_PER_Q[k]).padStart(2)}/q  cost ${money(cost).padStart(8)}  commission ${money(s.revenue).padStart(8)}  net ${(net < 0 ? '-' : '') + money(Math.abs(net))}`);
    }
  }
}
console.log(`\n${'─'.repeat(64)}`);
console.log('  ▶ THE LEVER WITH THE MOST POWER IS SEARCHES-PER-QUESTION.');
console.log('    It is the only input above that is engineering rather than luck,');
console.log('    and it moves cost 2.5x on its own (4 vs 10). Caching repeats and');
console.log('    looking up fewer products per question is worth more to the P&L');
console.log('    than any assumption on this page.');
console.log(`${'─'.repeat(64)}\n`);
