import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve('messages');
const locales = ['fr', 'en', 'he', 'es'];
const data = {};
for (const l of locales) {
  data[l] = JSON.parse(fs.readFileSync(path.join(dir, `${l}.json`), 'utf8'));
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

const flat = {};
for (const l of locales) flat[l] = flatten(data[l]);

const ref = 'fr';
const refKeys = new Set(Object.keys(flat[ref]));
let problems = 0;

for (const l of locales) {
  if (l === ref) continue;
  const keys = new Set(Object.keys(flat[l]));
  const missing = [...refKeys].filter(k => !keys.has(k));
  const extra = [...keys].filter(k => !refKeys.has(k));
  if (missing.length) { problems++; console.log(`\n[${l}] MISSING ${missing.length} keys vs ${ref}:`); missing.forEach(k => console.log('  - ' + k)); }
  if (extra.length) { problems++; console.log(`\n[${l}] EXTRA ${extra.length} keys vs ${ref}:`); extra.forEach(k => console.log('  + ' + k)); }
}

// Detect empty values and untranslated (identical to fr for non-fr, excluding proper nouns)
for (const l of locales) {
  for (const [k, v] of Object.entries(flat[l])) {
    if (typeof v === 'string' && v.trim() === '') { problems++; console.log(`[${l}] EMPTY value: ${k}`); }
  }
}

console.log(`\nTotal fr keys: ${refKeys.size}`);
console.log(problems === 0 ? '\nOK: parite parfaite, aucune valeur vide.' : `\n${problems} probleme(s) detecte(s).`);
