/**
 * Fetch the latest TLE data from the KeepTrack API and save to public/tle/tle.json.
 *
 * Usage:
 *   npx tsx scripts/fetch-tle.ts
 */

import { writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const TLE_URL = 'https://api.keeptrack.space/v4/sats';
const OUT_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'tle', 'tle.json');

async function main() {
  console.log(`Fetching TLE data from ${TLE_URL}...`);

  const res = await fetch(TLE_URL);

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.text();

  writeFileSync(OUT_PATH, data, 'utf-8');
  console.log(`Saved to ${OUT_PATH} (${(Buffer.byteLength(data) / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
