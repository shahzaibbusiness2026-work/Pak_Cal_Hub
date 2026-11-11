# Government calculator accuracy follow-up

Reviewed 11 November 2026. The site must not be represented as universally payroll-accurate. Automated execution tests establish software behaviour for the cases tested; they do not certify every notification, individual entitlement or provincial rule.

## Corrections

- Salary now deducts estimated salary income tax, with overrides for payroll withholding, confirmed exempt amounts and other payroll deductions. Annualising a single month does not replace payroll's year-to-date tax adjustment.
- Federal medical is no longer calculated as 15% of current basic pay. The automatic reference uses the frozen new-entrant BPS-2008 basis with the 2015 enhancement and minimum; existing employees can enter their sanctioned amount.
- Federal FY2026-27 includes continuing ARA-2023 and ARA-2024. New-entrant references are defaults; existing employees can supply the actual frozen amounts.
- DRA is opt-in. Federal DRA-2026 requires an employee-specific historical base or the sanctioned total. BPS scope is not eligibility.
- The public pension form forwards retirement date and 24-month average pensionable emoluments. A required average cannot silently fall back to last basic pay. Admissible retiring-year increment is entered separately.
- Pension medical, prior increases and the 2026 increase are explicit inputs. The federal 7% calculation requires an entered sanctioned baseline; the calculator does not invent the baseline or all historical increases.
- Provincial defined-contribution selections return an unsupported-case explanation instead of applying the federal scheme to them.
- Family pension has a retired-pensioner path using pension actually drawn and no blanket lifetime claim for widows and daughters. Beneficiary eligibility/duration are not determined by this tool.
- Promotion rejects a non-higher grade, above-scale pay and cases with no higher stage; a benchmark equal to the higher-scale minimum advances to the next stage.
- Leave encashment is explicitly an arithmetic estimate using an approved entered pay basis and days. The jurisdiction selector does not imply verified provincial leave rules.
- Current-year GP Fund projection text identifies the prior-year rate as a benchmark, not a notified current-year rate.
- Government calculators display a prominent applicability note. Source statuses do not certify the salary or promotion tools as fully verified.
- Removed the unconditional “Verified Calculation” result badge across the site. Results now say “Based on your inputs.” Restoration-age output is explicitly approximate.

## Evidence

- [Federal allowance clarification, 4 August 2026](https://www.finance.gov.pk/circulars/circular_04082026.pdf): treatment of frozen ARA-2023/2024 and new entrants.
- [Federal DRA-2026 order](https://www.finance.gov.pk/circulars/GRANT_OF_DISPARITY_REDUCTION_ALLOWANCE_2026.pdf): existing DRA recipients, historical pay base and BPS scope.
- [Medical allowance clarification, 4 March 2015](https://www.finance.gov.pk/circulars/circular_04032015.pdf), [Finance Division pay-scale compilation, BPS-2008 chart p. 307](https://www.finance.gov.pk/publications/Various_Schemes_of_Pay_Scales.pdf), and [National Assembly official answers, medical allowance reference](https://na.gov.pk/uploads/documents/questions/1631866875_995.pdf).
- [Pension emoluments order, 1 January 2025](https://www.finance.gov.pk/circulars/circular_01012025_2.pdf) and [clarifications, 4 March 2025](https://www.finance.gov.pk/circulars/circular_04032025.pdf): average, notional increment, transitional exceptions and pensioner family-pension basis.
- [Pension increase, 29 July 2026](https://www.finance.gov.pk/circulars/circular_29072026.pdf), [2025 baseline clarification](https://www.finance.gov.pk/circulars/pension_clarification_05082025.pdf) and [2025 increase order](https://www.finance.gov.pk/circulars/pension_increase_2025.pdf).

## Remaining limits

Provincial pay and pension reforms, historic frozen allowance bases, benevolent fund/group insurance schedules, individual transport and DRA eligibility, voluntary-retirement penalties, fractional service treatment, transitional exceptions and case-specific restoration dates still need full rule verification. Defined-contribution investment returns and withdrawals are illustrative. Family pension eligibility, duration, minimum floors and increases need the actual sanction and applicable jurisdiction. None of these are certified merely because the calculator returns a finite number.

The new regression suite uses independently worked examples for salary tax/net pay, frozen allowances, conditional DRA, pension form forwarding and additions, pensioner family pension and promotion boundaries. Existing tests that asserted the incorrect running-pay medical and automatic DRA assumptions were corrected to match the verified references.

Validation: all nine deterministic suites passed (53 calculators, 1,318 form scenarios, 330 salary combinations and the targeted government examples), as did lint, TypeScript checks and the production build. A production browser interaction reproduced the independently worked Rs 47,510 pension example; the primary navbar has no More Tools button. Production route checks passed for 92 routes, wrong-category 404 handling and four protected mutations.

Live-network checks on 11 November: the first attempt reported a gold-provider network failure and correctly returned a fallback. A subsequent real-network check and the public endpoint check returned live flags for petrol, diesel, gold, silver and USD/PKR. Fuel source date was 11 November. This observed recovery does not guarantee future upstream availability.
