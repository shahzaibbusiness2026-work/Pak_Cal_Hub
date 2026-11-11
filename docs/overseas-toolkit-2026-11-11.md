# Overseas Pakistanis Toolkit — build review, 11 Nov 2026

Source PDF: `Overseas Pakistani Toolkit: Tools to Build` (Nov 11, 2026).
Repo state: local clone at commit 5ab70a3 + the work below (not pushed, not deployed).

## What already existed (before this build)

| PDF tool | Already in the repo? |
| --- | --- |
| #4 Remittance comparison | **Yes** — `/overseas/remittance-calculator`, built today (257 countries, 153 currencies, two-quote comparison with user-entered rates/fees). It deliberately has NO provider fee feed: no live provider rates are fetched. The PDF's ranked provider table needs licensed/live provider data, so it is not built. |
| #1 PTA mobile tax | **Partly** — `/tax/pta-mobile-tax-calculator` existed but gave NO figure: it routed users to DIRBS because FBR SROs were unverified in the Oct 9 check. |
| #2 NICOP fee | **Partly** — `/data-tools/nadra-fee-calculator` existed but gave NO figure: it routed users to Pak-ID because NADRA's fee page could not be loaded and third-party tables conflicted. |
| #3 Roshan Digital Account | **No.** |
| #5 Umrah cost estimator | **No.** |
| #6 Property cost estimator | **Partly** — `/tax/property-tax-calculator` (236C/236K advance tax only). No stamp duty, CGT, or rental yield. |

The Overseas navbar button already existed and already opened the Overseas
category — it just had only 1 tool in it. No Navbar.tsx change was needed:
the dropdown, mobile menu, category page and sitemap all render from
`CATEGORIES_DATA`, so adding tools to the Overseas category fills the navbar
automatically.

## What was built (5 new tools, all under /overseas/)

| Tool | Route | What it does |
| --- | --- | --- |
| PTA Mobile Tax for Overseas Visitors | `/overseas/pta-tax-for-overseas-visitors` | Real estimate from the FY2026-27 bracket table (SRO 1064(I)/2026): sales tax 18%/25%, regulatory duty, handset levy, income tax (CNIC only). Passport vs CNIC filer vs non-filer, plus the free 120-day temporary registration for short visits. |
| NICOP Fee & Renewal Calculator | `/overseas/nicop-fee-renewal-calculator` | Zone A $39/$57/$75, Zone B $20/$30/$40 (Normal/Urgent/Executive), 31/23/9 days, PKR equivalent, documents per application type, PakID steps. |
| Roshan Digital Account Guide & NPC Returns | `/overseas/roshan-digital-account-guide` | Eligibility check, 15 SBP agent banks, NPC return by currency + tenor after 10% final tax. |
| Umrah Cost Estimator | `/overseas/umrah-cost-estimator` | Flights + Makkah/Madinah hotels + visa/insurance/transport + meals + 10% buffer, as a low–high range per person and total. Ramadan +40%, Hajj months blocked. |
| Overseas Property Cost Estimator | `/overseas/overseas-property-cost-estimator` | Buyer: stamp duty + registration + CVT + s.236K (1.25% filer). Seller: s.236C (2.75% filer) + CGT at your entered rate + net rental yield. |

## Verification done before writing any figure (11 Nov 2026)

- **PTA:** FY2026-27 table cross-checked against ProInfoDesk (worked examples
  reproduce exactly: $900 passport Rs. 95,925; $250 Rs. 23,065; $480 Rs. 39,933)
  and FilerWise (top tiers + SRO 1064(I)/2026). This is what unblocked the
  old DIRBS-only tool.
- **NICOP:** Zone A $39/$57/$75 and Zone B $20/$30/$40 agree across 4+
  independent 2026 sources (ARY News 7 Apr 2026, NADRA fee-structure pages,
  independent guides). Days 31/23/9 are widely reported, but NADRA's own fee
  page has printed different day counts — the tool says to confirm in PakID.
- **RDA/NPC:** Rates from SRO 870(I)/2026, certificates from 1 June 2026,
  corroborated by three independent guides: USD 6.75–7.75%, PKR 11.75–12.75%,
  GBP 6.75–8.00%, EUR 4.75–6.25%, SAR/AED 6.50–7.50%; 10% final tax;
  975,000+ accounts, US$14.16bn by Sep 2026 (SBP provisional).
- **Umrah:** SAR 300 visa + insurance SAR 100–180; economy 7–10 night
  packages PKR 220,000–300,000; visa+insurance+transport PKR 48,000–65,000;
  flights PKR 90,000–145,000 off-peak. Ramadan +30–50%.
- **Property:** filer rates reuse the existing property-tax tool (236K 1.25%,
  236C 2.75%, TY2027). Stamp duty is an editable input (Punjab reported 1%
  under a 2026 ordinance; other provinces differ).

## Deliberate honesty limits (do not remove without re-verification)

1. Every tool labels its figures as estimates and names the source + date.
2. **CGT 0% is never shown as a fact.** It appears only as "claimed — verify"
   when the user ticks NICOP/POC + RDA-funded, and the at-rate figure is still
   shown beside it. Without both conditions ticked, full CGT is charged.
3. **Non-filer buyer advance tax (s.236K) is not guessed** — it is value-banded
   in TY2027, so the tool excludes it and says to confirm with FBR.
4. **Remittance still has no provider fee feed.** The comparison works on
   user-entered quotes only. A ranked provider table needs live/licensed data.
5. PTA income-tax non-filer column is the doubled figure from the published
   table; one source claims filers/non-filers pay the same — the tool follows
   the table whose worked examples reproduce exactly, and DIRBS is final.

## Verification of this build (local, 11 Nov 2026)

- `tsc --noEmit`: clean. ESLint on all touched files: clean.
- `npm test`: **all 11 suites pass** (255 checks), including the new
  `src/tests/overseas.test.ts` (25 hand-worked assertions).
- `next build`: compiles clean; **117 static pages** (was 112, +5 new tools).
  All 5 new pages render with correct titles, H1s and form inputs.
- Environment note: this machine had no `node_modules`; `npm ci` and the
  Prisma engine download kept failing with ECONNRESET from Node. Fixed by
  installing with `bun install`, downloading the Prisma 5.22 engine binaries
  with `curl` into `node_modules/@prisma/engines/`, and running
  `prisma generate` with the `PRISMA_*_BINARY` env vars. That is a local
  environment repair only — no repo files were changed for it.

## Other overseas tools in demand (web research, 11 Nov 2026)

Beyond the six in the PDF. No search volumes are invented here — where a
volume was not found from a verifiable source, the seed keyword is given to
check in Keyword Planner / Ahrefs instead. Full research note: the 12-tool
list was compiled from broad web search on 11 Nov 2026.

### Already covered by this repo (do not build twice)

- **NPC returns calculator** — built inside the RDA tool above (#3).
- **Pakistani passport renewal fee** — `/data-tools/passport-fee-calculator`
  already exists (DGIP table), BUT it still offers MRP options and DGIP
  stopped issuing MRPs on 15 Oct 2026. Needs an e-passport-only check.
- **Islamic inheritance / Faraid calculator** — already exists.
- **Overseas property SALE tax (236C + CGT)** — covered by the sell side of
  the new property estimator above.
- **UAE gratuity / Saudi end-of-service** — prior research (11 Nov, Ubersuggest):
  `gratuity calculator uae` ~49,500/mo (difficulty 18), Saudi end-of-service
  ~8,100/mo (difficulty 9). Still unbuilt; see below.

### Build next (High priority)

1. **Saudi Iqama + exit/re-entry + dependent levy calculator** — Jawazat fees
   are published and stable; calculators exist on expat sites, none
   Pakistan-specific. Split employer-paid levy/insurance out or totals mislead.
2. **UAE visa + Emirates ID renewal cost calculator** — dedicated 2026 tools
   exist, none Pakistan-branded. Separate ICP (federal) vs GDRFA Dubai models.
3. **Gulf end-of-service / gratuity calculator (UAE + Saudi, one tool)** —
   strongest measured demand of the extras (see Ubersuggest figures above).
   UAE: 21 days' basic salary/yr first 5 years, 30 days/yr after, capped at
   2 years' pay. Saudi: ½ month/yr first 5 years, 1 month/yr after, with
   Art. 85 resignation fractions. Exclude DIFC/ADGM and part-time contracts.
4. **Non-resident / overseas Pakistani income tax calculator** — tax on
   Pakistan-source income only, 183-day test, ATL filer vs non-filer impact.
   One dedicated tool exists; most competitors are generic. Label "estimate,
   not tax advice".
5. **Hajj cost & savings calculator (by departure country)** — distinct from
   Umrah: annual, quota/ballot-driven, far more expensive. Pakistan govt
   scheme ~PKR 1.15–1.3m (2026); UK £4,500–£12,000+. Update every Nov–Dec
   when MORA announces the package.
6. **BEOE Protector fee calculator** — direct employment Rs. 9,200 vs via
   licensed OEP Rs. 22,200. No dedicated calculator found, guides only.
   Add the BEOE scam warning (fees through official channels only).
7. **Document attestation cost calculator (HEC/IBCC + MOFA + embassy)** —
   HEC PKR 3,000/doc, IBCC PKR 1,200, MOFA apostille PKR 3,000–12,000.
   No calculator found. Separate attestation (free) from apostille (paid);
   sources conflict on MOFA's own fee.

### Build with care (flagged)

8. **Car import duty calculator (Gift / Transfer of Residence)** — highest
   misleading-risk: Personal Baggage scheme ended 15 Jan 2026
   (SRO 61(I)/2026); only Gift and Transfer of Residence remain, with 850
   days abroad in 3 years. Build only with a prominent Jan-2026 rule banner,
   or as a ranges estimator.
9. **Overseas property sale tax** — covered above; keep buy and sell pages
   separate, buyers and sellers search differently.

### Not now

- Zakat for overseas assets in multi-currency — repo already has gold/Zakat
  logic; only a small overseas extension, not a new tool.
- International Driving Permit fee — small, fragmented, fees conflict.
- Pakistan visa fee for foreign spouses — NADRA's own portal already
  calculates it during application.
