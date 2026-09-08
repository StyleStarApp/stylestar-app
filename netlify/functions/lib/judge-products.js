// judge-products.js — THE STYLIST READS THE PRODUCTS.
//
// 🚨🚨 WHY THIS EXISTS, AND IT IS THE ROOT CAUSE OF EVERYTHING CATH FOUND ON
// 2026-09-08. Judging used to be a lookup table: `CUT` held EIGHT words (wrap,
// a-line, shift, midi, maxi, mini, ankle, knee-high), all of them from the one
// "blush silk wrap dress" case the finder was built against. Measured:
//     she asks "fitted"   -> "The Fitted Cotton Poplin Shirt"        -> unknown
//     she asks "high rise"-> "Ultra High Rise 90s Straight Jean"     -> unknown
// And because UNKNOWN IS NEVER A PASS (her rule, and the right one), a request
// naming a cut the list did not know could never produce an exact match. Ever.
//
// ▶▶ HER DIAGNOSIS WAS RIGHT AND IS THE DESIGN: "I feel like our app already
//    knows what we are trying to deliver." It does — "relaxed" appears 39 times
//    in the app's own taxonomy, "fitted" 31. The app knew. The finder never did.
//
// 🚨 THE FRAME THAT DECIDES WHAT LIVES WHERE, and it must not be forgotten:
//    PROMISES stay in code — never a never-wear item, never claim a size we did
//    not check, only her shops, womenswear only, don't stack one store. A promise
//    that depends on an AI having a good day is not a promise.
//    JUDGEMENTS go to the stylist — is this fitted? is this her blush? Those need
//    reading, and a list can only ever know the words someone typed into it.
//    ▶ THE BUG WAS BUILDING A JUDGEMENT AS IF IT WERE A PROMISE.
//
// ⚠️⚠️ AND THE HONESTY IS STILL ENFORCED IN CODE, NOT ASKED FOR IN A PROMPT.
//    The stylist may only say CONFIRMED by quoting the product's own words, and
//    `parseJudgement` CHECKS THAT THE QUOTE REALLY APPEARS in that product's
//    text. An invented quote is silently demoted to UNKNOWN. So "no tick without
//    evidence" is a thing the code verifies, not a thing the model is trusted on.
//    ▶ That is the Stitch Fix lesson applied correctly this time: the RULE is in
//      code, the JUDGEMENT is hers.

export const VERDICTS = ['confirmed', 'rejected', 'unknown'];

// Everything about a product that a person could actually read. Kept in one
// place so the prompt and the evidence check can never look at different text.
export function productText(p) {
  return [p.title, p.offerTitle, p.brand, p.colourway, p.description,
          (p.sizes || []).join(' '), (p.details || []).join(' ')]
    .filter(Boolean).join('\n');
}

// The requirements SHE stated. Size and width are hers from her saved prefs;
// colour, fabric and cut only ever reach here if they were in her own sentence
// (_findKeepHerWords), which is the rule that stops the model recommending a
// jewel tone and then searching for one as though she had asked.
export const REQ_KEYS = ['colour', 'fabric', 'cut', 'size', 'width'];
export const statedKeys = (req) => REQ_KEYS.filter(k => req && req[k]);

export function buildJudgePrompt(req, products) {
  const asks = statedKeys(req).map(k => `${k}: ${req[k]}`).join('\n');
  const items = products.map((p, i) =>
    `--- PRODUCT ${i} ---\n${productText(p)}`).join('\n\n');
  return `A woman asked for: ${req.item}
She specified:
${asks || '(nothing beyond the item)'}

Below are real products. For EACH product, judge EACH thing she specified.

Answer only with what the product's own text proves:
- "confirmed" — the text shows it. You MUST quote the exact words that show it.
- "rejected" — the text shows it is NOT so (95% polyester when she asked for silk;
  a print name when she asked for a plain colour; an explicitly different fit).
- "unknown" — the text does not say. This is the correct answer far more often
  than people expect, and it is never a failure.

Rules that matter:
- Quote VERBATIM from that product's text. Do not paraphrase. Do not quote from
  a different product. A quote that is not in the text will be thrown away.
- Satin is a weave, silk is a fibre. A satin dress is not a silk dress.
- A print name is not a colour. "Palace Tiger Pink" does not confirm blush.
- A faux-wrap is not a wrap. Read the retailer's own words, not the tidy title.
- Wide calf is not wide width. "W 7" means a women's 7, not a wide 7.
- If she asked for a cut like "high rise" or "fitted", the product saying
  "Ultra High Rise" or "The Fitted Shirt" DOES confirm it. Read it as a person
  would, not as a string match.

Reply with JSON only, no other text:
{"products":[{"i":0,"checks":{"colour":{"verdict":"confirmed","evidence":"exact words from the text"}}}]}

${items}`;
}

/* ⚠️ THE VALIDATOR IS THE GUARANTEE. Everything the model returns is treated as a
   suggestion until this function agrees with it. A malformed reply, a missing
   product, a bad verdict word or an invented quote all degrade to UNKNOWN —
   never to a pass. */
export function parseJudgement(raw, req, products) {
  const keys = statedKeys(req);
  const blank = () => Object.fromEntries(keys.map(k => [k, {verdict: 'unknown', evidence: ''}]));
  let data = null;
  try {
    const m = String(raw || '').match(/\{[\s\S]*\}/);   // tolerate chatter around the JSON
    data = m ? JSON.parse(m[0]) : null;
  } catch { data = null; }

  const byIndex = new Map();
  if (data && Array.isArray(data.products)) {
    for (const row of data.products) {
      if (row && Number.isInteger(row.i)) byIndex.set(row.i, row.checks || {});
    }
  }

  return products.map((p, i) => {
    const hay = productText(p).toLowerCase().replace(/\s+/g, ' ');
    const got = byIndex.get(i) || {};
    const checks = blank();
    for (const k of keys) {
      const c = got[k];
      if (!c || !VERDICTS.includes(c.verdict)) continue;         // -> stays unknown
      if (c.verdict === 'confirmed') {
        // 🚨 THE EVIDENCE MUST REALLY BE THERE. This is the line that makes the
        //    whole design safe: the stylist can say yes, but only about words the
        //    product actually contains. An invented quote confirms nothing.
        const ev = String(c.evidence || '').toLowerCase().replace(/\s+/g, ' ').trim();
        if (!ev) continue;                                       // -> stays unknown
        // ⚠️ SHORT EVIDENCE IS CHECKED ON WORD BOUNDARIES, AND A TEST CAUGHT WHY.
        //    A first version required 3+ characters to stop a stray " " or "a"
        //    matching everything — which silently made EVERY SIZE unverifiable,
        //    because sizes are "26", "M", "6". ▶ The real risk was never length,
        //    it was a fragment matching inside a longer word, so boundaries fix it
        //    properly: "26" confirms against "24 25 26" but not against "126".
        const found = ev.length >= 4
          ? hay.includes(ev)
          : new RegExp('(^|[^a-z0-9])' + ev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)').test(hay);
        if (!found) continue;                                    // -> stays unknown
        checks[k] = {verdict: 'confirmed', evidence: String(c.evidence).trim()};
      } else {
        checks[k] = {verdict: c.verdict, evidence: String(c.evidence || '').trim()};
      }
    }
    const unknown = keys.filter(k => checks[k].verdict === 'unknown');
    const rejected = keys.filter(k => checks[k].verdict === 'rejected');
    return {
      checks, unknown, rejected,
      // ⚠️ UNKNOWN IS NEVER A PASS. An exact match means every single thing she
      //    said is CONFIRMED — not "nothing contradicted it".
      exact: rejected.length === 0 && unknown.length === 0,
    };
  });
}
