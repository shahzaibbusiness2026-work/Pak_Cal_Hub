import { spawnSync } from 'node:child_process';

const suites = [
  'all-calculators',
  'calculators',
  'electricity-accuracy',
  'live-rates',
  'live-transport',
  'cms',
  'tool-sources',
  'review-regressions',
  'government-accuracy',
  'remittance',
];
for (const suite of suites) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', `src/tests/${suite}.test.ts`], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`All ${suites.length} test suites passed.`);
