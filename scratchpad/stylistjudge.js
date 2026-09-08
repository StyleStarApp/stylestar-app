// stylistjudge.js — THE STYLIST MAY JUDGE, BUT SHE MAY NOT INVENT.
//
// 🚨 WHAT THIS GUARDS. On 2026-09-08 judging moved from an 8-word lookup table to
// the stylist reading the products. That is the right shape — a list can only
// know the words someone typed into it — but it moves a JUDGEMENT to a model, so
// every honesty rule Cath has given must now be enforced on the OUTPUT rather
// than assumed from the mechanism.
// ▶ HER RULE, VERBATIM 2026-09-06: "never imply that a specific size, width,
//   colour, material or other requirement is confirmed unless we can actually
//   verify it." ▶ So: a CONFIRMED must quote the product's own words, and this
//   suite proves an invented quote is thrown away.
// ⚠️ NO NETWORK. Model replies are fixtures; the products are real captures.
//
// Run: node scratchpad/stylistjudge.js
import {parseJudgement, buildJudgePrompt, productText, statedKeys}
  from '../netlify/functions/lib/judge-products.js';

let pass = 0; const fails = [];
const ok = (l, c, d) => { if (c) { pass++; console.log('  ✓ ' + l); }
  else { fails.push(l); console.log('  ✗ ' + l + (d ? '  → ' + d : '')); } };
const reply = (o) => JSON.stringify(o);

// ── REAL PRODUCTS, as the live shopping service returned them ────────────────
const KENSIE = {title: 'Kensie Blouson Wrap Dress',
  offerTitle: "Dillard's Kensie Self-Tie Waist Faux Wrap Blouson Dress",
  description: '95% polyester, 5% spandex', colourway: 'Black', sizes: ['S','M','L']};
const DVF = {title: 'Diane von Furstenberg Jeanne Long Sleeve Silk Wrap Dress',
  description: '100% silk', colourway: 'Palace Tiger Pink', sizes: ['2','4','6']};
const AF_JEAN = {title: "Women's Abercrombie & Fitch Ultra High Rise 90s Straight Jean",
  description: 'Ultra high rise, straight leg', colourway: 'Medium Wash', sizes: ['24','25','26']};
const EVERLANE = {title: 'Everlane The Fitted Cotton Poplin Shirt',
  description: '100% cotton poplin', colourway: 'White', sizes: ['XS','S','M']};

console.log('\nPART 1 — the faults she found on 2026-09-08, which the word list could not answer');
{
  // The 8-word CUT table returned UNKNOWN for every one of these, so no request
  // naming them could ever produce an exact match.
  const req = {item: 'jeans', size: '26', cut: 'high rise'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {
    cut:  {verdict: 'confirmed', evidence: 'Ultra High Rise'},
    size: {verdict: 'confirmed', evidence: '26'}}}]}), req, [AF_JEAN])[0];
  ok('"high rise" is confirmed by "Ultra High Rise"', r.checks.cut.verdict === 'confirmed');
  ok('...and the jean is a real exact match at last', r.exact === true, JSON.stringify(r.unknown));
}
{
  const req = {item: 'top', colour: 'white', cut: 'fitted'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {
    cut:    {verdict: 'confirmed', evidence: 'The Fitted Cotton Poplin Shirt'},
    colour: {verdict: 'confirmed', evidence: 'White'}}}]}), req, [EVERLANE])[0];
  ok('"fitted" is confirmed by a shirt called Fitted', r.exact === true);
}

console.log('\nPART 2 — her four traps, which are stylist knowledge and not string rules');
{
  const req = {item: 'dress', fabric: 'silk', cut: 'wrap'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {
    fabric: {verdict: 'rejected', evidence: '95% polyester'},
    cut:    {verdict: 'rejected', evidence: 'Faux Wrap'}}}]}), req, [KENSIE])[0];
  ok('satin/polyester is REJECTED for silk, not merely unknown', r.checks.fabric.verdict === 'rejected');
  ok('faux-wrap is REJECTED for wrap — the retailer\'s own words, not the tidy title',
     r.checks.cut.verdict === 'rejected');
  ok('and a rejection is never an exact match', r.exact === false);
}
{
  // 🚨 The one that corrected Claude, not her: the DVF she approved is a TIGER
  //    PRINT. A print name must never confirm a colour.
  const req = {item: 'dress', colour: 'blush', fabric: 'silk', cut: 'wrap'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {
    colour: {verdict: 'rejected', evidence: 'Palace Tiger Pink'},
    fabric: {verdict: 'confirmed', evidence: '100% silk'},
    cut:    {verdict: 'confirmed', evidence: 'Silk Wrap Dress'}}}]}), req, [DVF])[0];
  ok('a print name does not confirm blush', r.checks.colour.verdict === 'rejected');
  ok('silk and wrap still stand on their own evidence',
     r.checks.fabric.verdict === 'confirmed' && r.checks.cut.verdict === 'confirmed');
  ok('so it is NOT an exact match, however good the title reads', r.exact === false);
}

console.log('\nPART 3 — she may judge, but she may NOT invent (the code enforces it)');
{
  const req = {item: 'top', colour: 'white', fabric: 'silk'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {
    colour: {verdict: 'confirmed', evidence: 'White'},
    fabric: {verdict: 'confirmed', evidence: 'washed silk charmeuse'}}}]}), req, [EVERLANE])[0];
  ok('a quote that IS in the product stands', r.checks.colour.verdict === 'confirmed');
  ok('a quote that is NOT in the product is thrown away', r.checks.fabric.verdict === 'unknown',
     JSON.stringify(r.checks.fabric));
  ok('...and the invention cannot produce an exact match', r.exact === false);
}
{
  const req = {item: 'dress', fabric: 'silk'};
  const cross = parseJudgement(reply({products: [{i: 0, checks: {
    fabric: {verdict: 'confirmed', evidence: '100% silk'}}}]}), req, [KENSIE])[0];
  ok('evidence quoted from a DIFFERENT product does not count',
     cross.checks.fabric.verdict === 'unknown');
}
{
  const req = {item: 'top', colour: 'white'};
  for (const [label, raw] of [
    ['malformed JSON',        'sorry, I could not do that'],
    ['an empty reply',        ''],
    ['a made-up verdict word', reply({products: [{i: 0, checks: {colour: {verdict: 'probably', evidence: 'White'}}}]})],
    ['a missing product',     reply({products: []})],
    ['confirmed with no quote', reply({products: [{i: 0, checks: {colour: {verdict: 'confirmed', evidence: ''}}}]})],
  ]) {
    const r = parseJudgement(raw, req, [EVERLANE])[0];
    ok(`${label} degrades to unknown, never to a pass`,
       r.checks.colour.verdict === 'unknown' && r.exact === false);
  }
}

console.log('\nPART 4 — UNKNOWN IS NEVER A PASS');
{
  const req = {item: 'dress', colour: 'blush', fabric: 'silk', width: 'wide'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {
    colour: {verdict: 'confirmed', evidence: 'Palace Tiger Pink'.slice(0, 0) || 'Palace'},
    fabric: {verdict: 'confirmed', evidence: '100% silk'}}}]}), req, [DVF])[0];
  ok('a requirement she stated but nobody judged stays unknown',
     r.checks.width.verdict === 'unknown');
  ok('and one unknown is enough to stop it being exact', r.exact === false, JSON.stringify(r.unknown));
  ok('the unknowns are named, so the card can say what is unconfirmed',
     r.unknown.includes('width'));
}
{
  const req = {item: 'dress'};
  const r = parseJudgement(reply({products: [{i: 0, checks: {}}]}), req, [DVF])[0];
  ok('a request with no stated requirements is exact on the item alone', r.exact === true);
}

console.log('\nPART 5 — the prompt carries her rules and only her words');
{
  const req = {item: 'dress', colour: 'blush', fabric: 'silk'};
  const p = buildJudgePrompt(req, [DVF]);
  ok('it asks about what she stated', /colour: blush/.test(p) && /fabric: silk/.test(p));
  ok('it never invents a requirement she did not give', !/\bcut:/.test(p.split('Below are real')[0]));
  ok('it carries the satin/silk distinction', /Satin is a weave/.test(p));
  ok('it carries the print-is-not-a-colour trap', /Palace Tiger Pink/.test(p));
  ok('it carries the faux-wrap trap', /faux-wrap is not a wrap/i.test(p));
  ok('it carries the wide-calf trap', /Wide calf is not wide width/.test(p));
  ok('it tells her to read like a person, not string-match', /not as a string match/.test(p));
  ok('it demands verbatim quotes', /VERBATIM/.test(p));
  ok('it says unknown is a correct answer, not a failure', /never a failure/.test(p));
  ok('the product text it judges is the same text the evidence is checked against',
     p.includes(productText(DVF)));
  ok('statedKeys only lists what she said', JSON.stringify(statedKeys(req)) === '["colour","fabric"]');
}

console.log('\n' + pass + ' passed, ' + fails.length + ' failed');
process.exit(fails.length ? 1 : 0);
