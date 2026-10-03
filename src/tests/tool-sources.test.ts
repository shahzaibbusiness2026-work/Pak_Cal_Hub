/**
 * Official Source Registry Test Suite
 * Verifies: every calculator tool has a registry entry; every registry URL is
 * a valid https URL; every ratesVerifiedOn is a valid date not in the future.
 */

import { ALL_CALCULATORS } from '../lib/data/categories';
import {
  getToolSource,
  getAllRegisteredToolIds,
  formatVerifiedDate,
} from '../lib/data/tool-sources';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${message}`);
  }
}

function runTests() {
  console.log('\n=== Tool-Sources Registry Tests ===\n');

  const toolIds = ALL_CALCULATORS.map((c) => c.id);
  const registered = getAllRegisteredToolIds();

  // 1. Every tool id in categories.ts has a registry entry
  const missing = toolIds.filter((id) => !getToolSource(id));
  assert(
    missing.length === 0,
    `Every calculator has a registry entry${missing.length ? ` — missing: ${missing.join(', ')}` : ''} (${toolIds.length} tools checked)`
  );

  // No orphan registry entries either (keeps the registry honest)
  const orphans = registered.filter((id) => !toolIds.includes(id));
  assert(
    orphans.length === 0,
    `No orphan registry entries${orphans.length ? ` — orphans: ${orphans.join(', ')}` : ''}`
  );

  // 2. Every registry URL is https and non-empty
  const badUrls: string[] = [];
  for (const id of registered) {
    const entry = getToolSource(id)!;
    for (const s of entry.sources) {
      if (s.url !== undefined && !(s.url.startsWith('https://') && s.url.length > 10)) {
        badUrls.push(`${id}: ${s.url}`);
      }
    }
  }
  assert(badUrls.length === 0, `Every registry URL is a valid https URL${badUrls.length ? ` — bad: ${badUrls.join('; ')}` : ''}`);

  // 3. Every ratesVerifiedOn is a valid date not in the future (user's frame: Asia/Karachi)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  const badDates: string[] = [];
  for (const id of registered) {
    const entry = getToolSource(id)!;
    const d = new Date(entry.ratesVerifiedOn + 'T00:00:00');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.ratesVerifiedOn) || Number.isNaN(d.getTime()) || entry.ratesVerifiedOn > today) {
      badDates.push(`${id}: ${entry.ratesVerifiedOn}`);
    }
  }
  assert(badDates.length === 0, `Every ratesVerifiedOn is a valid date not in the future${badDates.length ? ` — bad: ${badDates.join('; ')}` : ''}`);

  // 4. ratesStatus is always a known value; verified entries should carry sources or an explanatory note
  const badStatus = registered.filter((id) => {
    const e = getToolSource(id)!;
    return e.ratesStatus !== 'verified' && e.ratesStatus !== 'verify';
  });
  assert(badStatus.length === 0, `Every entry has a valid ratesStatus${badStatus.length ? ` — bad: ${badStatus.join(', ')}` : ''}`);

  const noSourceNoNote = registered.filter((id) => {
    const e = getToolSource(id)!;
    return e.sources.length === 0 && !e.note;
  });
  assert(noSourceNoNote.length === 0, `Sourceless entries all carry an explanatory note${noSourceNoNote.length ? ` — bad: ${noSourceNoNote.join(', ')}` : ''}`);

  // 5. formatVerifiedDate sanity
  assert(formatVerifiedDate('2026-10-04') === '4th October 2026', 'formatVerifiedDate renders "4th October 2026"');

  console.log('\n========================================');
  console.log(process.exitCode ? '⚠️  REGISTRY TESTS HAD FAILURES' : '🎉 TOOL-SOURCES REGISTRY TESTS PASSED');
  console.log('========================================\n');
}

runTests();
