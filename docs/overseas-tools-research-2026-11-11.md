# Overseas Pakistani tools: research and build priorities

Research date: 11 November 2026, Pakistan time.

## Recommendation

The best new product is a remittance calculator that shows how many PKR the recipient actually receives after fees and exchange-rate spread. The fastest additions are overseas NICOP and PTA visitor helpers, expanding existing tools. Launch a dedicated Overseas Pakistanis category when useful tools are ready; do not add an empty navigation destination.

An evergreen need does not mean permanently fixed fees, tax law or exchange rates. Keep source dates, applicability and editable assumptions visible. Never describe an indicative currency quote as a guaranteed transfer quote.

## Measured search demand

Source: connected Ubersuggest `keyword_suggestions`, English, United Kingdom, resolved location ID 2826. These are estimated average monthly UK searches, not global totals, current live search counts, unique users or guaranteed traffic. Keyword metrics have their own update dates; the research date is the date retrieved. Raw returned metrics are saved in [overseas-keyword-data-2026-11-11.json](overseas-keyword-data-2026-11-11.json).

| Keyword | Estimated searches/month | Search difficulty /100 | Interpretation |
| --- | ---: | ---: | --- |
| send money to pakistan | 2,400 | 19 | Strongest measured seed; transactional intent. |
| send money to pakistan from uk | 720 | 17 | Specific corridor suitable for a fee comparison. |
| nicop renewal online | 390 | 11 | Document planner with clear next steps. |
| nicop renewal | 320 | 10 | Recurring official-service need. |
| nicop renewal uk | 260 | 17 | Country-specific guidance opportunity. |
| pta tax calculator | 260 | 11 | Extend the existing tool with a visitor path. |
| best app to send money to pakistan | 90 | 14 | Comparison intent; ranking providers requires current quotes. |
| best rate to send money to pakistan | 90 | 16 | Opportunity for an honest net-received comparison. |

Difficulty is a provider estimate, not proof that a new site will rank. Do not add these volumes together: overlapping queries are not independent audiences. No monthly history series was retrieved, so long-term stability is an inference from recurring services rather than a measured trend claim. UAE, Saudi Arabia and other markets have not had their keyword volumes validated in this pass. No CPC forecasts are used because the response contains differently scaled `cpc` and `cpcDollars` fields.

## Build order

Priorities balance measured demand, usefulness, existing code that can be reused and the burden of keeping results correct. The first three have measured UK keyword evidence. The others are useful candidates supported by official services, with search volume still unmeasured.

| Priority | Tool and output | Existing feature to reuse | Demand evidence and maintenance |
| --- | --- | --- | --- |
| 1 | Remittance net-received calculator: sender amount, fee currency, fee treatment, provider exchange rate, recipient fee and final PKR; compare two quotes. | Currency converter; add a separate remittance calculation. | Strongest measured cluster: 2,400/month for the broad UK seed. Use user-entered quotes first; provider rankings need licensed/live provider data. |
| 2 | NICOP/POC fee and renewal planner: destination country, service, priority, official fee, delivery charges if applicable, documents and renewal checklist. | Expand NADRA fee guide. | NICOP renewal online: 390/month, difficulty 11. NADRA publishes zones, fees and processing references; preserve the date and refer applications to PakID. |
| 3 | PTA visitor helper: temporary-registration checklist, arrival-based 120-day planning window, permanent-registration route and official portal. | Expand PTA mobile tax tool. | PTA tax calculator: 260/month, difficulty 11. The visitor subtopic itself has not been measured. FBR/PTA describe a temporary-registration facility; an on-site countdown does not activate it. |
| 4 | Overseas passport renewal planner: current passport, validity, pages, priority, delivery country, documents and official application route. | Expand passport fee calculator. | Useful recurring service; keyword volume not measured. Avoid treating Pakistan domestic fees as overseas mission fees. |
| 5 | Saudi and UAE end-of-service calculators with Urdu/English explanations and optional PKR conversion. | New country-specific engines. | Official authorities provide rules/calculators, establishing the task, not its search volume. Start with one jurisdiction. Contract type, termination reason, wage basis and employment regime matter. |
| 6 | Pakistan stay-day tracker and overseas property withholding checklist. Output days by tax year, the relevant questions and official-source links. | Age/date and property-tax components. | High-value recurring problem; keyword volume not measured. FBR describes NICOP/POC and non-resident requirements for the overseas property filer-rate route. A day count alone must not certify tax residence or all tax exemptions. |
| 7 | Roshan Digital Account / Naya Pakistan Certificate return estimator: currency, tenure, rate, profit payment schedule, tax and optional early-redemption scenario. | Investment calculator; a separate NPC schedule. | Official SBP product documentation supports the need; search volume not measured. Use dated bank/SBP terms and distinguish conventional fixed rates from Islamic expected/actual profit. |
| 8 | Digital power-of-attorney document planner: mission, applicants, witnesses, documents, appointment/online route and checklist. | New guided checklist, not a numeric calculator. | MOFA directs overseas applicants to NADRA's digital POA service. Search volume not measured. The tool must not claim to issue or attest a POA. |

## Official sources

- [NADRA fee structure](https://www.nadra.gov.pk/feeStructure) and [NICOP renewal requirements](https://www.nadra.gov.pk/identityDocument/nicop?action=renew): fee zones, priorities and official application requirements. The fee page has inconsistent duplicated entries, so reconcile the applicable service and PakID checkout before publishing a hard-coded schedule.
- [FBR temporary mobile registration announcement](https://www.fbr.gov.pk/fbr-to-facilitate-temporary-registration-of-overseas-pakistanis--foreigners--by-collaborating-with-/173441) and [FBR DIRBS guidance](https://www.fbr.gov.pk/mobile-devices/51149/131261): visitor facility and official registration route.
- [DGI&P online passport services](https://dgip.gov.pk/eServices/online-passport.php) and [passport FAQs](https://dgip.gov.pk/faq/faq.php): overseas renewal eligibility and application routes.
- [Saudi HRSD end-of-service regulations](https://www.hrsd.gov.sa/en/knowledge-centre/articles/317-0) and [official calculator](https://prod.hrsd.gov.sa/ministry-services/services/end-service-benefit-calculator): validate every supported employment/termination case before launch.
- [UAE government end-of-service guidance](https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector): applicable private-sector framework and alternative savings scheme. Do not reuse the Saudi formula.
- [FBR overseas property FAQ](https://fbr.gov.pk/overseas-faqs/174240/174248): NICOP/POC and non-resident conditions, property-transfer procedure. The displayed rate table refers to Finance Act 2025; it must not silently become a verified 2026 rate table.
- [SBP Roshan Digital Account FAQ](https://www.sbp.org.pk/faqs/faqs-roshan-digital-account): product, currencies and tax references. Verify dated rates/terms with the executed investment.
- [MOFA digital POA guidance](https://mofa.gov.pk/frankfurt-online-power-of-attorney): the official digital service and application route.

## Release sequence

1. Finish the government-calculator accuracy corrections and keep unverified cases explicitly marked.
2. Expand NICOP and PTA guides, and add the remittance arithmetic calculator using entered quotes. These can be useful without claiming a provider feed exists.
3. Add passport planning and country-specific employment tools after official examples and boundaries are tested.
4. Develop tax/NPC tools with date-based rules and a source review process. Validate more keywords in Saudi Arabia, UAE, USA and Canada before claiming worldwide demand.

The overseas tools above are recommendations; this research does not represent new calculators already implemented or deployed. The More Tools dropdown has been removed from the local navbar; existing category pages and the mobile category menu remain available.
