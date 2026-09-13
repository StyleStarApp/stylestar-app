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
    return any(t in hay for t in terms)


def load_rules(path=RULES_PATH):
    """Read the rules and normalize every term ONCE.

    ⚠️ Not a micro-optimization. This runs against ~266,000 feed rows a night,
    against 100 rules, each with several terms -- normalizing a term inside the
    match loop meant tens of millions of redundant regex splits and turned a
    77-second job into a many-minute one. Measured, not guessed: the first
    version of this file did it the slow way and the coverage report showed it.
    """
    with open(path, "r", encoding="utf-8") as fh:
        raw = json.load(fh)
    # ---- WHOLE-FAMILY EXCLUSIONS. See the _readme inside _family_not: a rule's
    # own 'not' only ever separated clothing from clothing, so nothing said "a
    # top is not a handbag" until a thong reached Cath's Tops shelf. Merged in
    # here, once, rather than repeated across 100 rules.
    famcfg = raw.get("_family_not") or {}
    apply_map = famcfg.get("_apply") or {}

    def _family_terms(slot):
        fam = "".join(c for c in slot if c.isalpha())
        terms = []
        for group in apply_map.get(fam, ()):
            terms.extend(famcfg.get(group, ()))
        return terms

    out = {}
    for slot, r in raw.items():
        if slot.startswith("_"):
            continue
        rule = {"n": r.get("n", slot)}
        for key in ("cat", "name", "not", "color", "pattern"):
            terms = list(r.get(key) or ())
            if key == "not":
                terms += _family_terms(slot)
            if terms:
                # Padded, so a plain `in` test is a word-boundary test.
                # dict.fromkeys de-duplicates while keeping order.
                rule[key] = tuple(dict.fromkeys(norm(t) for t in terms))
        # 🚨🚨 requireName (2026-09-13) -- THE REAL SCHEMA GAP THIS FILE
        # RECORDED AND DID NOT SILENTLY PATCH. match() picks candidates by
        # CATEGORY alone, so two rows sharing a `cat` term (fo1/fo4 both
        # "bras", fo2/fo3 both "briefs", sh3/sh14 both "pumps", to6/fo5 both
        # "corsets") become candidates TOGETHER for any garment carrying it --
        # a plain bra, a plain brief, a plain pump, a plain dressy top -- with
        # nothing re-checking that the NARROWER row's own identity is actually
        # present. `not` cannot fix this: it can only say "not X", never
        # "must ALSO be Y", and the narrower row's real identity (strapless,
        # lace, kitten heel, garter/corset) already lives correctly in its own
        # `name` list -- it was simply never consulted once category had
        # already picked the candidate.
        # ▶ SO: a rule marked requireName additionally demands that at least
        # one of ITS OWN name terms appears -- checked against hay_all (cat +
        # name together, the same place `not` already looks), never name
        # alone, because a merchant's own subcategory can carry the
        # distinguishing word ("lingerie>bras>strapless") when the product
        # TITLE never repeats it. Requiring it in the name only would risk
        # emptying this exact shelf for a real strapless bra whose title is
        # just "Wolford Fatal Bra" -- the "shelves must not go empty" rule
        # this file has paid for before.
        # ⚠️ OPT-IN, PER ROW, DEFAULT ABSENT. It only gates whether A GARMENT
        # QUALIFIES FOR THIS ROW; it never touches any sibling's own matching,
        # so the genuine DESIGN overlaps (fo5's own garter/corset ALSO landing
        # on to6, a sundress also landing on daytime casual) are untouched.
        if r.get("requireName"):
            rule["requireName"] = True
        # 🚨🚨 requireAny (2026-09-13, SAME SESSION AS requireName, A DIFFERENT SCHEMA GAP).
        # requireName asks "is this row's OWN identity actually present" -- it has no answer
        # for a row like bo4 Linen pants, whose only identifying word ("linen") is a bare
        # FABRIC that genuinely belongs on nearly every garment type Mytheresa/COUTR sell:
        # after four rounds of `not`-list patches (17 words: tablecloth, napkin, playsuit,
        # cardigan, bathrobe, gilet...) the row was STILL matching a vest and a pair of shoes,
        # because `not` can only ever say "not X" for a X someone has already caught -- it
        # cannot say "must ALSO look like a bottom", which is the actual promise this row
        # makes. ▶ requireAny demands the garment's NAME contain at least one word from a
        # SEPARATE list (never the row's own `name` field, which stays the fabric/candidacy
        # trigger) -- checked against hay_name only, the same narrow scope as requireName's
        # own check, for the same reason: a merchant's category can carry the word a
        # bare-fabric title never repeats, so this only ever narrows what a NAME-FALLBACK
        # candidate can additionally require, never demands it be in the category too.
        # ⚠️ OPT-IN, PER ROW, DEFAULT ABSENT, and orthogonal to requireName -- a row could
        # need either, both, or neither.
        if r.get("requireAny"):
            rule["requireAny"] = tuple(dict.fromkeys(norm(t) for t in r["requireAny"]))
        out[slot] = rule
    return out


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
    """-> the list of checklist row ids this garment belongs on (often empty).

    🚨🚨 THE CATEGORY WINS WHENEVER THE GARMENT CARRIES ONE (2026-09-06, after
    Cath found a THONG and a GARTER BELT on "Tops in your favorite colors").

    This used to be an OR: a category hit **or** a name hit, either would do.
    That let the name rung fire for garments whose category had ALREADY said
    exactly what they were, and the name rung matches a MODIFIER as happily as
    a head noun:

        "Balenciaga Le City Small leather top-handle bag"  -> the word 'top'
        "Fleur du Mal Top Stitch Thong"                    -> the word 'top'
        "Super Star Sneaker - Denim Blue"                  -> the word 'denim'

    So a bag that arrived carrying `women>bags>top-handle bags` still landed on
    Black Tops. ▶ **A garment that has told us what it is must not then be
    asked whether its name contains a word.** The name rung is a FALLBACK for
    the stores that send no category at all (Marissa Collections has none;
    Fleur du Mal leaves category_secondary blank), and it now behaves like one.

    ⚠️ "Carries a category" deliberately means "carries a category THESE RULES
    RECOGNISE", not "the column is non-empty". A store whose breadcrumb is just
    'Women' or 'Sale' tells us nothing, and treating that as authoritative
    would silently empty a shelf -- the exact SILENT NOTHING failure this
    pipeline keeps warning about. If the category matches no rule anywhere, the
    garment falls through to its name as before.
    """
    hay_cat = norm(cat_path(rec))
    hay_name = norm(rec.get("name") or "")
    hay_all = hay_cat + hay_name
    color_hay = norm((rec.get("color") or "") + " " + (rec.get("name") or ""))
    pattern = norm(rec.get("pattern") or "")

    # ---- ONE pass to pick the rung, so this stays the same order of work as
    # the old loop (this runs against ~266,000 rows a night; see load_rules).
    candidates = [s for s, r in rules.items() if _has(hay_cat, r.get("cat", ()))]
    if not candidates:
        candidates = [s for s, r in rules.items() if _has(hay_name, r.get("name", ()))]

    out = []
    for slot in candidates:
        r = rules[slot]
        # ---- her boundaries. Checked against BOTH, because a merchant can put
        # the disqualifying word in either place: Mytheresa says
        # 'women>clothing>swimwear', Marissa Collections only ever says 'Bikini
        # Top' in the name. This now also carries the _family_not terms merged
        # in by load_rules -- see slot-rules.json.
        if _has(hay_all, r.get("not", ())):
            continue
        # ---- requireName: category alone is not enough for a row marked
        # this way -- see the readme in load_rules.
        # 🚨 CHECKED AGAINST hay_NAME ONLY, NOT hay_all, and this was found by
        # testing, not reasoned out in advance: fo5 and to6 share the cat term
        # "corset" (a corset is genuinely both a category AND its own name),
        # so a plain to6 satin top merely filed under that category already
        # contains the word "corset" in hay_cat -- checking hay_all made fo5's
        # own requireName trivially true off the CATEGORY LABEL that admitted
        # it as a candidate in the first place, which is exactly the
        # short-circuit this rule exists to close.
        # ⚠️ THE EMPTY-SHELF WORRY THIS RAISES (a real strapless bra whose
        # title never repeats "strapless", only its own subcategory does) is
        # untested against the real feed. If it ever shows up as a shelf that
        # goes emptier than it should, that is the reason to revisit this,
        # not a reason to guess a fix now for a case with no measurement.
        if r.get("requireName") and not _has(hay_name, r.get("name", ())):
            continue
        # ---- requireAny: this row's own candidacy word (bo4's "linen") is a bare
        # fabric that says nothing about GARMENT TYPE -- see the readme in
        # load_rules. Checked against hay_name only, same scope and same reason
        # as requireName above.
        if r.get("requireAny") and not _has(hay_name, r["requireAny"]):
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
