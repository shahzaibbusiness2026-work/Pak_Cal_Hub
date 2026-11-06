# Calculator and live-rate review — 6 November 2026

The GitHub `main` branch at `8b23732` was imported into this project before applying these fixes. The earlier local project was preserved in `../local-review-backup-2026-11-05.zip`.

## Changes

- Registered input validation for all 53 tools: reject non-finite numbers, out-of-range values, invalid dates and invalid select options, while preserving legitimate zero inputs and signed electricity adjustments.
- Replaced the pension commutation factors with the official 2001 table. Age at retirement is converted to age next birthday. Federal FY2026-27 GP Fund deductions now use the revised August 2026 subscription table.
- Corrected electricity slab benefit, lifeline/protected surcharges and negative fuel adjustments. Solar export credit uses the editable CY2026 NAEPP reference of Rs 8.13/kWh.
- Corrected the UET merit weights and included PU admission-test weight, with program-specific limitations disclosed. Updated the MDCAT total to 180 and preserved zero test marks.
- Corrected month-end/leap-day age arithmetic, zero-interest financing and partial-year amortization schedules, zero freelance income, and inheritance distribution for the supported immediate-family cases.
- Removed fabricated retail FX spreads and universal local property fees. Transaction rates and local fees are editable assumptions.
- Updated dated fuel, USD, gold and silver fallbacks. Live indicative gold is calculated from international spot and FX, with the disclosed 2% planning premium; it is not the official Sarafa announcement.
- Fixed HTTP retries and response-body deadlines; coalesced concurrent requests to the same upstream; rejected stale/future spot and FX timestamps and inconsistent fuel dates. The public endpoint reports source dates and live/fallback status separately for every rate.
- Prevented delayed API responses from overwriting user-edited inputs. Forms retain dated references if upstreams are unavailable.
- Hardened legacy admin mutations to require a configured secret, including the database connection endpoint.
- Updated Next.js to 15.5.29 and migrated asynchronous route parameters/cookies. Patched dependency overrides resolve the npm audit findings. Added GitHub CI.

## Validation

- `npm test`: eight deterministic suites, covering 53 calculators, 1,222 form scenarios and 330 salary combinations, plus formula, API, transport, CMS and source-registry regressions.
- `npm run lint`, `npm run typecheck`, `npm run build`.
- `npm run test:live`: real application handler, with actual petrol/diesel, gold/silver and FX upstream requests; all five live flags must be true.
- `npm run test:routes`: production server route and unauthorized-mutation checks. Start the server on port 3100 first, or set `TEST_APP_URL`.
- `npm audit`: zero known vulnerabilities at review time.

Real upstream check on 6 November PKT: petrol Rs 362/L, diesel Rs 387.81/L, source effective 5 November; gold spot and FX source timestamps were current. Market values vary continuously, so exact live gold values are intentionally not frozen in tests.

## Sources and limits

- [Finance Division pension compendium, p. 116](https://finance.gov.pk/publications/compenduim_of_pension_rules_2018.pdf): official commutation table.
- [Finance Division circulars](https://www.finance.gov.pk/circulars.html): July 2026 basic pay scales and August 2026 GP Fund revision.
- [IESCO official tariff guide](https://www.iesco.com.pk/tariff-guide): residential slabs, previous-slab benefit and sanctioned-load fixed charges.
- [PSO published fuel prices](https://www.psopk.com/en/fuels/fuel-prices), [SBP economic data](https://www.sbp.org.pk/psd/reports/report.htm), and the provenance links returned by `/api/rates/live`.
- [UET prospectus](https://admission.uet.edu.pk/downloads/), [PU 2026 admission-test announcement](https://pu.edu.pk/home/section/allpress/17205), [PM&DC FAQ](https://pmdc.pk/Home/FAQs).

Third-party API uptime cannot be guaranteed. Safe dated fallbacks remain available and are labelled. Provincial payroll/vehicle schedules, institution-specific admission rules, local charges, construction prices and bank offers still require the relevant current notification or transaction quote; these are disclosed rather than universally certified. Live Supabase/database writes and deployed-host cron configuration require the production environment and were not exercised against a production database.
