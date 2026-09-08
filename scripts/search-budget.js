#!/usr/bin/env node
// search-budget.js — how many shopping searches are left this month?
//
// 🚨 WHY: on 2026-09-08 the allowance went from ~75 used to 216/250 in a single
// afternoon and nobody noticed until Cath opened the dashboard herself. Her ask,
// the same day: "I would like a Saturday check in on that. I don't want it to
// run out."
//
// ▶ IT COSTS NOTHING TO ASK. SerpApi's account endpoint is not a search, so this
//   never spends what it is counting. It reads the number through her own
//   product-find function (?budget=1), which already holds the key — so this
//   needs NO new secret in GitHub, which is the whole reason it can run
//   unattended on a Saturday.
//
// ⚠️ IT WARNS, IT NEVER BLOCKS. The app itself no longer refuses to search when
//   the number gets low — she said plainly her focus is "making the app as good
//   as it can be, not adding resistance", and on a fixed monthly allowance a
//   reserve saves no money, it only decides who goes without. So the ceiling
//   lives HERE, as a shout, rather than in the app as a gate.
//
// Run: node scripts/search-budget.js [--warn 150]
const WARN = Number((process.argv[process.argv.indexOf('--warn') + 1] || '') || 150);
const URL_ = process.env.STYLESTAR_ORIGIN || 'https://stylestar.app';

// ⚠️ ONE QUESTION IS NOT ONE SEARCH — up to 4 searches + 6 product look-ups, and
//    every call counts. This is why "1000 a month" is not 1000 questions.
const PER_QUESTION_MAX = 10, PER_QUESTION_TYPICAL = 4;

const r = await fetch(`${URL_}/.netlify/functions/product-find?budget=1`, {
  headers: {accept: 'application/json'}, signal: AbortSignal.timeout(20000),
}).catch(e => ({ok: false, statusText: String(e)}));

if (!r.ok) {
  console.log(`⚠️  Could not read the search budget (${r.status || ''} ${r.statusText || ''}).`);
  console.log('   Not treated as a failure: a broken check is not a broken app.');
  process.exit(0);
}
const d = await r.json();
const left = d.searchesLeft;

if (left == null) {
  console.log('⚠️  The budget is unreadable (' + (d.why || 'no number returned') + ').');
  console.log('   If this says no-key, SERPAPI_KEY is missing in Netlify and the');
  console.log('   chat is quietly giving advice with no product cards.');
  process.exit(d.why === 'no-key' ? 1 : 0);
}

const qMin = Math.floor(left / PER_QUESTION_MAX), qMax = Math.floor(left / PER_QUESTION_TYPICAL);
console.log(`Shopping searches left this month: ${left}`);
console.log(`That is roughly ${qMin}-${qMax} more shopping questions`);
console.log(`(one question costs ${PER_QUESTION_TYPICAL}-${PER_QUESTION_MAX} searches, not one).`);

if (left <= 0) {
  console.log('\n🚨 NONE LEFT. The stylist is giving advice with no product cards.');
  process.exit(1);
}
if (left < WARN) {
  console.log(`\n⚠️  Below ${WARN}. Worth topping up before it runs out mid-week.`);
  process.exit(1);
}
console.log('\n✅ Comfortable.');
