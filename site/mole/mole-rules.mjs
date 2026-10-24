// Mole trait rules: the one roller every JS generator uses.
// Rules live in MOLE_RULES.json (copied into every manifest as `rules`).
//
//   exclude  [{a, b}]   a/b = trait id ("Jackets/Smock") or slot name ("Body/Shirt").
//                       Two picked traits that match a pair can never appear together.
//   slotNone {slot: p}  per-slot empty chance; overrides opts.none (keeps trait odds steady).
//   drawWith {id: slot} the trait is drawn from that slot's pool (it competes with
//                       those traits) but still renders in its own slot.
//                       Example: full-top jackets compete with shirts.
//
// Mirror in mole_rules.py — keep both in step (check_mole_rules.py tests both).

const hit = (x, slot, id) => x === id || x === slot;

// slots: {slot: [{id, ...}]}; picked: {slot: id}
export function conflicts(rules, picked, slot, id) {
  for (const { a, b } of (rules && rules.exclude) || []) {
    for (const [ps, pid] of Object.entries(picked)) {
      if (!pid || ps === slot) continue;
      if ((hit(a, ps, pid) && hit(b, slot, id)) || (hit(b, ps, pid) && hit(a, slot, id))) return true;
    }
  }
  return false;
}

// List of {slot, id} pairs that break a rule.
export function violations(rules, picked) {
  const out = [], e = Object.entries(picked).filter(([, id]) => id);
  for (let i = 0; i < e.length; i++) for (let j = i + 1; j < e.length; j++) {
    if (conflicts(rules, { [e[i][0]]: e[i][1] }, e[j][0], e[j][1])) out.push([e[i][1], e[j][1]]);
  }
  return out;
}

// Equip one trait by hand: drop whatever it conflicts with. Returns the new selection.
export function equip(rules, picked, slot, id) {
  const out = { ...picked };
  const draw = (rules && rules.drawWith) || {};
  // a trait drawn with another slot occupies that slot too (smock replaces the shirt)
  for (const [s, cur] of Object.entries(out)) {
    if (s === slot || !cur) continue;
    if (conflicts(rules, { [s]: cur }, slot, id) || draw[id] === s || draw[cur] === slot) delete out[s];
  }
  out[slot] = id;
  return out;
}

// Roll a full outfit.
//   slots       {slot: [{id}]}   (order of keys = render order)
//   opts.rng    () => [0,1)
//   opts.none   chance a non-required slot stays empty
//   opts.always Set of slots that are always filled when anything is allowed
export function roll(slots, rules, opts = {}) {
  const rng = opts.rng || Math.random, none = opts.none ?? 0.15, always = opts.always || new Set();
  const draw = (rules && rules.drawWith) || {};
  const slotOf = {};
  for (const [s, list] of Object.entries(slots)) for (const t of list || []) slotOf[t.id] = s;
  const order = [...new Set([...((rules && rules.rollOrder) || []), ...Object.keys(slots)])].filter((s) => slots[s]);
  const picked = {}, filled = new Set();
  for (const slot of order) {
    if (filled.has(slot)) continue;
    const pool = [];
    for (const t of slots[slot] || []) if (!draw[t.id]) pool.push(t.id);
    for (const [id, s] of Object.entries(draw)) if (s === slot && slotOf[id]) pool.push(id);
    const ok = pool.filter((id) => !filled.has(slotOf[id]) && !conflicts(rules, picked, slotOf[id], id));
    if (!ok.length) continue;
    const sn = rules && rules.slotNone && rules.slotNone[slot];
    if (!always.has(slot) && rng() < (sn ?? none)) continue;
    const id = ok[Math.floor(rng() * ok.length)], home = slotOf[id];
    picked[home] = id; filled.add(home); filled.add(slot);
  }
  return picked;
}
