import { readFileSync, writeFileSync, existsSync } from 'fs';

const src = readFileSync('countries.js', 'utf8');
const names = [...src.matchAll(/^\s{2}(?:'([^']+)'|(\w[\w ]*?)):\s*\{/gm)].map(x => (x[1] || x[2]).trim());

const map = {};
for (const name of names) {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  const path = `images/${slug}.jpg`;
  if (existsSync(path)) {
    map[name] = path;
  }
}

writeFileSync('image-map.js', `export const IMAGE_MAP = ${JSON.stringify(map, null, 2)};\n`);
console.log(`Mapped ${Object.keys(map).length} of ${names.length} countries`);

const missing = names.filter(n => !(n in map));
if (missing.length) console.log('Missing:', missing.join(', '));
