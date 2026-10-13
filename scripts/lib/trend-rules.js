/* One matcher for data/trend-rules.json. The page carries a copy of this same
   logic (_trendKeep in index.html); scratchpad/trendrules.mjs asserts both
   give the same answer on every stored piece. */
export function wordRe(w) {
  const star = w.endsWith('*');
  const core = (star ? w.slice(0, -1) : w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[ -]/g, '[ -]?');
  return new RegExp('(^|[^a-z])' + core + (star ? '' : '(?![a-z])'), 'i');
}
export function trendKeep(rules, trend, p) {
  const name = String((p.name || '') + ' ' + (p.title || '')).toLowerCase();
  const brand = String(p.brand || '').toLowerCase() + ' ' + name;
  if ((rules.neverBrands || []).some(b => brand.includes(b))) return false;
  if ((rules.offSeason || []).some(w => wordRe(w).test(name))) return false;
  const not = (rules.mustNot || {})[trend];
  if (Array.isArray(not) && not.some(w => wordRe(w).test(name))) return false;
  const must = (rules.must || {})[trend];
  if (must && !must.every(g => g.some(w => wordRe(w).test(name)))) return false;
  return true;
}
