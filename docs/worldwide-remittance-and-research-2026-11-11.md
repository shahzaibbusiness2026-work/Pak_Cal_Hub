# Worldwide remittance and overseas-tool follow-up

## Implemented

The new `/overseas/remittance-calculator` supports 257 country/territory choices and 153 active currency choices from a reviewed Unicode CLDR snapshot. Sending and receiving currencies can be changed independently of the country. Selecting a country suggests its first listed current currency; locations without a listed currency retain the user's currency choice. Pakistan/PKR is the initial destination.

Inputs include the sending amount, fees within the budget or on top, fixed and percentage sender fees, recipient/intermediary fees, and either a daily indicative cross-rate or an entered provider quote. A second entered quote can be compared. The result shows what the recipient receives, what the sender pays and the net effective rate. When sender fees are on top, the two quote totals can differ; the tool does not call a quote cheaper merely because it pays out more.

Changing a country or currency clears both provider quotes and all entered fee amounts, preventing an old quote from being reused for a different route. Changing just the sending amount retains the quote. Input amounts and outputs explicitly identify the sending/receiving currencies; JPY and KWD, for example, use different display precision.

`/api/remittance-rate?from=GBP&to=PKR` returns one conversion reference with its source date. The server shares an hourly upstream snapshot across pairs and coalesces concurrent requests. The wider upstream map remains internal; the existing public market-rates response retains its existing currency subset. Pair failures return a clear unavailable response, and the calculator accepts a manual provider quote. It never substitutes USD for an unsupported currency. Known bundled references are labelled as saved snapshots.

The site does not fetch transfer-company fees or guarantee that every selected country pair is available, permitted, or supported by a bank. Fees start at zero as inputs. Users must enter their actual quotes and charges. Exchange-rate references are indicative, not guaranteed payout rates.

The homepage daily-rate strip now appears immediately above the hero search bar. Homepage calculator/category counts reflect the registered tools. An Overseas navigation item opens the real new category.

## Data sources

- [World Bank remittance methodology](https://remittanceprices.worldbank.org/methodology): transfer charges and exchange-rate margin are separate cost components.
- [ExchangeRate-API open-access documentation](https://www.exchangerate-api.com/docs/free): daily references, attribution and caching. The calculator displays the required attribution.
- [Unicode CLDR](https://github.com/unicode-org/cldr-json): country names, current currency suggestions and currency fraction digits. The extracted snapshot records its version/review date; the Unicode licence accompanies it in `src/data/remittance`.

## Requested Ahrefs and Semrush checks

The user requested checks with both services. Actual connected-tool requests were attempted on 11 November 2026:

- Ahrefs Keywords Explorer rejected the Saudi keyword overview with **Insufficient plan**. No Ahrefs keyword figures were returned.
- Semrush's keyword-research discovery request returned **no_api_units**: the account has a subscription but insufficient API units. No Semrush keyword figures were returned. [Semrush MCP access](https://www.semrush.com/mcp-access) describes access/unit options.

These are access limitations, not zero search demand. No Ahrefs/Semrush figures have been fabricated or inferred from another provider. Their cross-check remains unfulfilled until account access is available.

## Supporting research obtained before those cross-check requests

The following estimates were retrieved from Ubersuggest, not Ahrefs or Semrush. Markets were resolved by the provider: Saudi Arabia 2682 and UAE 2784; English queries. They describe searches by all users in those countries, not Pakistani users alone. Raw metrics are in the adjacent Saudi/UAE keyword-data JSON files.

| Build priority | Candidate and exact measured query | Market | Est. monthly searches | Difficulty /100 | Why build it / important boundary |
| --- | --- | --- | ---: | ---: | --- |
| 1 | UAE gratuity: `gratuity calculator uae` | UAE | 49,500 | 18 | Strongest measured calculator intent. Support the applicable private-sector regime, basic wage, service dates, unpaid leave and caps; handle excluded schemes separately. |
| 2 | Saudi end-of-service: `end of service calculator` | Saudi Arabia | 8,100 | 9 | Clear calculator intent. Contract, termination reason and legally relevant wage basis matter. |
| 3 | Saudi visa deadline/official-portal helper: `exit re entry visa` | Saudi Arabia | 2,400 | 18 | Repeated travel/return need, but much of the intent is navigational. Build date guidance and direct links, not a pretend visa-record lookup. |
| 4 | Saudi renewal-cost planner: `iqama renewal fees` | Saudi Arabia | 880 | 14 | Explain residence, work-permit and dependent charges separately. Identify employer-borne costs; avoid presenting every charge as payable by the employee. |
| 5 | Dubai offer/budget planner: `dubai salary calculator` | UAE | 390 | 8 | Compare basic salary, allowances, rent, transport and savings, with an optional PKR remittance target. It is a budget tool, not a prediction of market salary. |
| Later | UAE visa-fine planner: `visa fine calculator` | UAE | Not returned | Not returned | No measured volume was returned for the seed. Do not call it a high-demand opportunity on the available evidence. Route official fine inquiries to ICP/GDRFA. |

Do not add overlapping phrases into an audience total. Volumes and difficulty are estimates with individual update dates. No monthly-history series was obtained, so “evergreen” here means an inference from recurring employment, renewal and travel tasks; it is not a demonstrated flat search trend or a promise of future traffic. Low difficulty does not guarantee ranking.

## Official rule/service checks for future tools

- [Saudi HRSD end-of-service calculator](https://www.wide.hrsd.gov.sa/en/ministry-services/services/end-service-benefit-calculator) and [expatriate services guide](https://www.hrsd.gov.sa/sites/default/files/2024-11/Guide%20to%20Services%20Provided%20for%20Expatriates.pdf).
- [UAE government end-of-service guidance](https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector) and [Dubai Development Authority calculator](https://dda.gov.ae/en/gratuity-calculator/gratuity-calculator): validate the exact scope and examples before implementation.
- [Absher official FAQs](https://www.absher.sa/wps/wcm/connect/individuals/contents/individuals/FAQs_EN?uri=nm%3Aoid%3Amoi.absher.footer.about): visa procedures and official inquiries. Date calculations must not claim to establish actual visa validity.
- [Saudi HRSD employer-borne fees](https://www.hrsd.gov.sa/en/knowledge-centre/articles/64434-0) and [work-licence services](https://www.hrsd.gov.sa/en/ministry-services/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D9%88-%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF-%D8%B1%D8%AE%D8%B5-%D8%A7%D9%84%D8%B9%D9%85%D9%84).
- [UAE visa fees/fines guidance](https://u.ae/en/information-and-services/visa-and-emirates-id/visa-fees) and [ICP fine-payment service](https://icp.gov.ae/en/services-details/?serviceid=68e73faf5ae59b00117389f1): keep estimates distinct from an official outstanding-fine inquiry.

The worldwide remittance calculator is implemented. These other candidates are research recommendations, not newly implemented calculators.

## Validation and observed limits

All ten deterministic suites passed: 54 registered calculators, 2,165 form scenarios, the existing 330 salary combinations, and the new remittance tests. Lint, TypeScript and the production build passed. The build generated 112 pages, including the new category and calculator.

Production browser checks confirmed that UAE selection suggests AED, a manual change to USD is retained, the worked budget/fee example pays out PKR 274,300.00, and switching to Canada selects CAD and clears the quote and fees. Desktop and 390px mobile checks confirmed the daily-rate strip precedes the hero search. The mobile homepage and calculator had no horizontal page overflow. The calculator exposed 257 country and 153 currency options.

The real remittance endpoint returned dated references for GBP/PKR, GBP/JPY and VND/PKR; same-currency requests returned 1 and invalid currency requests returned HTTP 400. Existing routing checks completed for 94 generated public routes, wrong-category 404 behaviour and four protected mutations before failing at the external fuel-feed live assertion. Diagnostics also observed gold-provider network failures; those market rates used labelled fallbacks. This is not a fully passing live-market integration check or a guarantee of upstream uptime. The remittance FX source succeeded independently.
