-- ============================================================================
-- Pak_Cal_Hub CMS seed — 3 sample published posts + site settings
-- Idempotent-ish: posts are inserted only when their slug does not exist;
-- site_settings rows use ON CONFLICT DO NOTHING.
-- Run AFTER supabase/migrations/0001_cms.sql in the Supabase SQL editor.
-- ============================================================================

-- ---------------- Post 1: electricity bill guide ----------------
insert into public.posts (
  slug, title, excerpt, content, category, tags, status, published_at,
  author_name, meta_title, meta_description, featured, reading_minutes
)
select
  'how-electricity-bill-calculated-pakistan',
  'How Your Electricity Bill Is Calculated in Pakistan (2026 Guide)',
  'A line-by-line explanation of NEPRA domestic tariffs, slabs, FPA, QTA, fixed charges and taxes — so you can verify your own bill.',
  $md$## Why your bill jumps when you cross 200 units

Pakistan's domestic electricity tariff has a sharp cliff at **200 units**. If you stay at or below 200 units (as an unprotected consumer), each block of units is billed at its own slab rate. Cross 200 units and **all units are billed at the single highest slab rate** — this is why a 201-unit bill can be thousands of rupees more than a 199-unit bill.

## The 2026 slab rates (NEPRA uniform tariff)

| Units | Rate (Rs/unit) |
|---|---|
| 1–100 | 22.44 |
| 101–200 | 28.91 |
| 201–300 | 33.10 |
| 301–400 | 36.46 |
| 401–500 | 38.95 |
| 501–600 | 40.22 |
| 601–700 | 41.85 |
| Above 700 | 47.20 |

Protected consumers (under 200 units for 6 consecutive months) pay lower rates: Rs. 10.54 for the first 100 units and Rs. 13.01 for the next 100.

## Beyond the energy charge

Your bill also includes:

- **Fixed charges** — billed per kW of your sanctioned load (check the load printed on your bill).
- **FC surcharge** — Rs. 3.23 per unit for debt servicing.
- **FPA (Fuel Price Adjustment)** — set monthly by NEPRA and billed 2–3 months late, so the FPA on your bill belongs to an older month's units.
- **QTA (Quarterly Tariff Adjustment)** — set quarterly; it can be negative.
- **Electricity duty** — 1.5% of (energy charges + QTA).
- **GST** — 18% on the bill excluding FPA; FPA carries its own GST line.

## How to verify your bill

1. Multiply your units by the slab rate from the table above (flat rate if above 200 units).
2. Add fixed charges: per-kW rate for your consumption tier × your sanctioned load.
3. Add FC surcharge (units × 3.23), QTA and FPA from the printed lines.
4. Apply 1.5% duty and 18% GST as described above.

Use our [electricity bill calculator](/electricity/electricity-bill-calculator) to check any bill in seconds.
$md$,
  'guide',
  array['electricity bill','NEPRA','LESCO','MEPCO','FPA','slabs'],
  'published',
  now() - interval '2 days',
  'Pak Calc Hub',
  'How Electricity Bills Are Calculated in Pakistan (2026) | Pak Calc Hub',
  'Understand NEPRA 2026 domestic slabs, FPA, QTA, fixed charges, electricity duty and GST — verify your LESCO, MEPCO or K-Electric bill line by line.',
  true,
  6
where not exists (select 1 from public.posts where slug = 'how-electricity-bill-calculated-pakistan');

-- ---------------- Post 2: income tax guide ----------------
insert into public.posts (
  slug, title, excerpt, content, category, tags, status, published_at,
  author_name, meta_title, meta_description, featured, reading_minutes
)
select
  'income-tax-salaried-pakistan-2026-27',
  'Income Tax on Salary in Pakistan: Tax Year 2027 (Finance Act 2026)',
  'The exact salaried tax slabs for Tax Year 2027, how the progressive rates work, and what changed from last year.',
  $md$## Salaried tax slabs — Tax Year 2027

Under the Finance Act 2026, salaried individuals are taxed at these progressive rates:

| Annual income | Tax |
|---|---|
| Up to Rs. 600,000 | 0% (exempt) |
| Rs. 600,001 – 1,200,000 | 1% of amount above 600,000 |
| Rs. 1,200,001 – 2,200,000 | Rs. 6,000 + 11% above 1,200,000 |
| Rs. 2,200,001 – 3,200,000 | Rs. 116,000 + 20% above 2,200,000 |
| Rs. 3,200,001 – 4,100,000 | Rs. 316,000 + 25% above 3,200,000 |
| Rs. 4,100,001 – 5,600,000 | Rs. 541,000 + 29% above 4,100,000 |
| Rs. 5,600,001 – 7,000,000 | Rs. 976,000 + 32% above 5,600,000 |
| Above Rs. 7,000,000 | Rs. 1,424,000 + 35% above 7,000,000 |

There is **no surcharge** on salaried income for Tax Year 2027.

## How progressive tax works

Only the income *within* each slab is taxed at that slab's rate — a common misunderstanding is that crossing a threshold taxes your whole income at the higher rate. For example, on Rs. 5,000,000 the tax is Rs. 541,000 + 29% of Rs. 900,000 = **Rs. 802,000** for the year.

## What changed from Tax Year 2026

The previous year's schedule had fewer slabs with higher marginal rates kicking in earlier (1%, 11%, 23%, 30%, 35%) plus a 9% surcharge above Rs. 10 million. The 2027 schedule smooths the curve with 20%, 25%, 29% and 32% intermediate slabs.

Use our [income tax calculator](/tax/income-tax-calculator) to compute your exact monthly and annual tax.
$md$,
  'article',
  array['income tax','FBR','salaried tax','Finance Act 2026','tax slabs'],
  'published',
  now() - interval '5 days',
  'Pak Calc Hub',
  'Income Tax on Salary Pakistan — Tax Year 2027 Slabs | Pak Calc Hub',
  'Exact salaried income tax slabs for Tax Year 2027 under the Finance Act 2026, with worked examples and what changed from last year.',
  true,
  5
where not exists (select 1 from public.posts where slug = 'income-tax-salaried-pakistan-2026-27');

-- ---------------- Post 3: gold rate explainer ----------------
insert into public.posts (
  slug, title, excerpt, content, category, tags, status, published_at,
  author_name, meta_title, meta_description, featured, reading_minutes
)
select
  'gold-rate-pakistan-tola-explained',
  'Gold Rate in Pakistan: How Per-Tola Prices Are Set (and How to Read Them)',
  'Why the sarafa rate moves daily, what 24K/22K/21K/18K mean for buyers, and how tola, masha and ratti convert.',
  $md$## Who sets the gold rate?

The daily benchmark is announced by the **All Pakistan Sarafa Gems and Jewellers Association (APSGJA)**. It tracks the international spot price (per troy ounce in USD), the rupee-dollar rate, and local demand — which is why the tola rate can move several thousand rupees in a single day.

## Purity: 24K vs 22K vs 21K vs 18K

- **24K** — 99.9% pure; the quoted benchmark rate.
- **22K** — 22/24 pure (≈91.6%); standard for Pakistani jewellery.
- **21K** — 21/24 pure (≈87.5%); common in Gulf-style jewellery.
- **18K** — 18/24 pure (75%); used for diamond settings.

Multiply the 24K tola rate by the purity fraction to get the metal value — then jewellers add making charges.

## Weight units

- **1 tola** = 11.6638 grams
- **1 tola** = 12 masha; **1 masha** = 8 ratti
- **10 grams** = 10 / 11.6638 tola

## Zakat on gold

Gold held for a lunar year is zakatable at **2.5%** once it reaches the nisab of **7.5 tola** (≈87.48 grams). Making charges are excluded from the zakat valuation — only the metal value counts.

Use our [gold price calculator](/data-tools/gold-price-calculator) for exact conversions across tola, grams, masha and ratti, and the [zakat calculator](/islamic/zakat-calculator) for your annual obligation.
$md$,
  'article',
  array['gold rate','sarafa','tola','zakat','APSGJA'],
  'published',
  now() - interval '9 days',
  'Pak Calc Hub',
  'Gold Rate Pakistan: Per-Tola Price Explained (2026) | Pak Calc Hub',
  'How Pakistan''s per-tola gold rate is set, 24K/22K/21K/18K purity conversions, tola–masha–ratti weights, and the 7.5-tola zakat nisab.',
  false,
  4
where not exists (select 1 from public.posts where slug = 'gold-rate-pakistan-tola-explained');

-- ---------------- site settings (insert-only) ----------------
insert into public.site_settings (key, value) values
  ('blog_title',       to_jsonb('Blog & Guides'::text)),
  ('blog_description', to_jsonb('Guides and explainers on Pakistani salaries, taxes, electricity bills, gold rates and more.'::text))
on conflict (key) do nothing;
