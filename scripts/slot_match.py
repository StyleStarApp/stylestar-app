#!/usr/bin/env python3
"""
Match a feed garment to Catherine's own 100-row wardrobe checklist.

⭐ WHY THIS RUNS AT INGEST AND NOT AT READ TIME, which is the one real design
decision in this file. A shelf could be filled by asking the database "give me
things whose category or name looks like a white top" every time a woman taps a
row -- but that means the matching rules exist TWICE, once in Python here and
once in JavaScript in the function that serves the shelf. Two implementations of
one rule drift, always, and this project has already paid for that lesson
(the store table vs SEARCH_DOMAINS, the eight footers, the five copies of the
colour-preference bullet). ▶ So the answer is computed ONCE, nightly, and stored
in products.slots. The live read becomes `slots contains 'to1'`, which is a
single indexed lookup and cannot disagree with the report below it.

⚠️ THE COST, stated honestly: a rules change does not reach the shop until the
next nightly run (or a hand-dispatched one). That is at most a day, against a
whole class of bug that can never happen. Worth it.

THE RULES THEMSELVES LIVE IN data/slot-rules.json, not here. This file is only
the machinery that applies them.
"""
import json, os, re

_HERE = os.path.dirname(os.path.abspath(__file__))
RULES_PATH = os.path.join(_HERE, "..", "data", "slot-rules.json")

_WORD = re.compile(r"[^a-z0-9]+")


def _depluralize(tok):
    """'dresses' -> 'dress', 'tops' -> 'top', 'booties' -> 'booty'.

    Applied to BOTH the garment's words and the rule's words, so the two always
    meet in the middle. It does not have to be linguistically right, only
    CONSISTENT -- 'dungarees' becoming 'dungaree' on both sides matches fine.
    ⚠️ Deliberately leaves short tokens and double-s alone, so 'dress' does not
       become 'dres' and 'as' does not become 'a'.
    """
    if len(tok) <= 3 or tok.endswith("ss"):
        return tok
    if tok.endswith("ies"):
        return tok[:-3] + "y"
    if tok.endswith(("ses", "xes", "zes", "ches", "shes")):
        return tok[:-2]
    if tok.endswith("s"):
        return tok[:-1]
    return tok


def norm(text):
    """Lowercase, split on anything not a letter or digit, de-pluralize, and pad.

    Padding with spaces is what makes a plain `in` test a WORD-BOUNDARY test:
    ' top ' is not found inside ' laptop ', and 'tee' is not found inside
    'canteen'. Splitting on non-alphanumerics is what makes 't-shirt', 'T Shirt'
    and 'tshirt'... no, not the last one, but the two spellings the feeds
    actually use, land on the same string.
    """
    if not text:
        return " "
    toks = [t for t in _WORD.split(text.lower()) if t]
    return " " + " ".join(_depluralize(t) for t in toks) + " "


def _has(hay, terms):
    return any((" " + norm(t).strip() + " ") in hay for t in terms)


def load_rules(path=RULES_PATH):
    with open(path, "r", encoding="utf-8") as fh:
        raw = json.load(fh)
    return {k: v for k, v in raw.items() if not k.startswith("_")}


def cat_path(rec):
    """The garment's category words, most specific first.

    🚨 ALL THREE COLUMNS, JOINED, because MEASUREMENT SAID NO SINGLE ONE IS
    FILLED IN EVERYWHERE: Mytheresa's merchant_category is a near-perfect
    breadcrumb and it is 80% of the catalog; DVF and Fleur du Mal leave
    category_secondary 100% blank; Marissa Collections -- 8,755 garments, 11% of
    the shop -- has no category at all, which is why the name rung below exists
    and is not optional.
    """
    return " ".join(x for x in (
        rec.get("merchant_category") or "",
        rec.get("category_secondary") or "",
        rec.get("category_primary") or "",
    ) if x)


def match(rec, rules):
    """-> the list of checklist row ids this garment belongs on (often empty)."""
    hay_cat = norm(cat_path(rec))
    hay_name = norm(rec.get("name") or "")
    hay_all = hay_cat + hay_name
    color_hay = norm((rec.get("color") or "") + " " + (rec.get("name") or ""))
    pattern = norm(rec.get("pattern") or "")

    out = []
    for slot, r in rules.items():
        # ---- the ladder: a category hit, or failing that the garment's name ---
        if not (_has(hay_cat, r.get("cat", [])) or _has(hay_name, r.get("name", []))):
            continue
        # ---- her boundaries. Checked against BOTH, because a merchant can put
        # the disqualifying word in either place: Mytheresa says
        # 'women>clothing>swimwear', Marissa Collections only ever says 'Bikini
        # Top' in the name.
        if _has(hay_all, r.get("not", [])):
            continue
        # ---- colour: loose on purpose. 663 distinct values, 15% blank,
        # inconsistent capitals, and at FARM Rio the field is a PRINT NAME
        # ('TROPICAL GROOVE BLUE') rather than a colour -- so the name is
        # allowed to carry it too.
        if r.get("color") and not _has(color_hay, r["color"]):
            continue
        # ---- pattern: blank at five of the seven stores, so it may only ever
        # gate the rows that are ACTUALLY about pattern, which are the only
        # rows that carry this key.
        if r.get("pattern") and not _has(pattern, r["pattern"]):
            continue
        out.append(slot)
    return out
