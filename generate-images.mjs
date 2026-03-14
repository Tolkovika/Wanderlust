import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const FAL_KEY = process.env.FAL_KEY || '07f6c9a8-7cbf-426b-a5e7-047ba70218aa:3a786d64501f4eb43bc49e1110c86999';
const MODEL = 'fal-ai/flux/schnell';
const OUTPUT_DIR = './images';
const CONCURRENT = 5;

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);

// Parse countries from the JS module
const src = readFileSync('./countries.js', 'utf8');
const countries = [];

// Extract each country block
const blockRegex = /(?:^  (\w[\w ]*?)|^  '([^']+)'):\s*\{[^}]*?imagePrompt:\s*'([^']+)'/gms;
let match;
while ((match = blockRegex.exec(src)) !== null) {
  countries.push({ name: match[1] || match[2], prompt: match[3] });
}

// Fallback: more robust extraction
if (countries.length === 0) {
  const nameRegex = /^\s{2}(?:'([^']+)'|(\w[\w ]*?)):\s*\{/gm;
  const promptRegex = /imagePrompt:\s*'([^']+)'/g;
  const names = [];
  const prompts = [];
  let m;
  while ((m = nameRegex.exec(src)) !== null) names.push(m[1] || m[2]);
  while ((m = promptRegex.exec(src)) !== null) prompts.push(m[1]);
  for (let i = 0; i < Math.min(names.length, prompts.length); i++) {
    countries.push({ name: names[i], prompt: prompts[i] });
  }
}

console.log(`Found ${countries.length} countries to generate images for.\n`);

async function generateImage(country) {
  const slug = country.name.toLowerCase().replace(/\s+/g, '-');
  const outPath = `${OUTPUT_DIR}/${slug}.jpg`;

  if (existsSync(outPath)) {
    console.log(`  [skip] ${country.name} — already exists`);
    return { name: country.name, slug, url: outPath, skipped: true };
  }

  const response = await fetch(`https://fal.run/${MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: country.prompt,
      image_size: 'landscape_16_9',
      num_inference_steps: 4,
      num_images: 1,
      output_format: 'jpeg',
      sync_mode: true,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`  [error] ${country.name}: ${response.status} — ${err}`);
    return { name: country.name, slug, error: true };
  }

  const data = await response.json();
  const imageUrl = data.images[0].url;

  // Download the image
  const imgResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imgResponse.arrayBuffer());
  writeFileSync(outPath, buffer);

  console.log(`  [done] ${country.name} — ${(buffer.length / 1024).toFixed(0)}KB`);
  return { name: country.name, slug, url: outPath };
}

// Process in batches
async function run() {
  const results = [];
  for (let i = 0; i < countries.length; i += CONCURRENT) {
    const batch = countries.slice(i, i + CONCURRENT);
    console.log(`Batch ${Math.floor(i / CONCURRENT) + 1}/${Math.ceil(countries.length / CONCURRENT)}: ${batch.map(c => c.name).join(', ')}`);
    const batchResults = await Promise.all(batch.map(generateImage));
    results.push(...batchResults);
  }

  // Generate image map for the app
  const imageMap = {};
  for (const r of results) {
    if (!r.error) {
      imageMap[r.name] = `images/${r.slug}.jpg`;
    }
  }

  writeFileSync('./image-map.js', `export const IMAGE_MAP = ${JSON.stringify(imageMap, null, 2)};\n`);

  const successes = results.filter(r => !r.error && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const errors = results.filter(r => r.error).length;
  console.log(`\nDone! ${successes} generated, ${skipped} skipped, ${errors} errors.`);
}

run().catch(console.error);
