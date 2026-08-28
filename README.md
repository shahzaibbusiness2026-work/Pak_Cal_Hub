# 🇵🇰 Pakistan Calculation Hub (Pak Calc Hub)

An enterprise-grade, high-performance financial and utility calculation platform tailored specifically for Pakistan. Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **Supabase PostgreSQL**.

---

## 🌟 Core Features & Modules

### 🏛️ 1. Pakistan Civil Service & Government Calculators
- **Revised Basic Pay Scale (RBPS-2026)**: Multi-Government support (**Federal, Punjab, Sindh, KPK, and Balochistan**) across **2024-25, 2025-26, and 2026-27** financial years.
- **Pay Scale Fixation**: BPS 1 to 22 running basic pay with up to 30 increment stages.
- **Station-Specific HRA**: Specified Big Cities (45% ceiling) vs Other Stations (30% ceiling), or Official Govt Accommodation (0 HRA + 5% Maintenance Deduction).
- **Provincial Allowances**: Punjab Special Allowance 2021/2022 (DRA 25%/15%), Sindh Differential Allowance, KPK Executive Allowance, Balochistan Hardship Allowance.
- **Pension & Commutation**: Pre-2024 Defined Benefit (35% commutation + official **Appendix I Age 45–65 Purchase Factor Table** + Rs. 25,000 statutory minimum floor) and Post-2024 FGDC Defined Contribution VPS fund.
- **Specialized Pay Tools**: Leave Encashment (LPR up to 365 days), Family Pension (75% entitlement + Punjab lifetime restoration), FR-22(a)(i) Promotion Pay Fixation, and GP Fund compound markup engine.

### 💼 2. FBR Income Tax Module
- **Finance Act 2026 (Tax Year 2027)**, **Tax Year 2026**, and **Tax Year 2025** progressive tax brackets for Salaried and Business individuals.
- **Section 154A IT Export Regime**: 0.25% PSEB-registered freelancer tax vs 1.25% general foreign remittance withholding.
- **Tax Deductions**: Senior citizen rebates, monthly TDS estimation, marginal rate analysis.

### ⚡ 3. Utilities & Energy
- **Multi-DISCO Electricity Billing**: Domestic tariff calculations for **LESCO, IESCO, K-Electric, MEPCO, FESCO, GEPCO, PESCO, HESCO, SEPCO, QESCO, and TESCO**.
- **NEPRA Tariff Schedules**: Protected vs Unprotected slabs, Fuel Price Adjustment (FPA), Financing Cost Surcharge, Electricity Duty (1.5%), 18% GST, and PTV License Fee (Rs. 35).
- **Solar PV Sizing & Net Metering**: System capacity in KW, daily/monthly unit generation, turnkey investment costs, and ROI payback period.

### 🚗 4. Vehicles & Transport
- **Trip & Commute Fuel Expense**: Motorway & intercity trip costs based on distance, vehicle fuel average (km/L), and official **OGRA Petrol & Diesel** prices.
- **Motor Vehicle Token Tax**: Provincial token taxes, withholding tax, and transfer fees for Punjab, Sindh, and Islamabad.

### 💰 5. Gold, Currency & Islamic Finance
- **Gold Jewelry Rate Calculator**: 24K, 22K, 21K, and 18K purity conversions across Tola (11.6638g), Gram, Masha, and Ratti, plus making charges and 7.5 Tola Zakat Nisab threshold.
- **Currency Converter**: SBP Interbank and Open Market exchange rates for USD, AED, SAR, GBP, EUR, CAD, AUD to PKR.
- **Loan & KIBOR Amortization**: Monthly EMI, KIBOR benchmark + bank spread, and total interest schedules.

---

## 🏗️ Architecture & Folder Structure

```
├── prisma/
│   ├── schema.prisma            # PostgreSQL Database Schema (9 Relational Models)
│   └── seed.ts                  # Automated 1-Click Database Populator
├── src/
│   ├── app/
│   │   ├── [category]/[slug]/   # Dynamic High-Performance Calculator Routes
│   │   ├── admin/               # Visual Admin Control Center (/admin)
│   │   ├── api/                 # REST API Endpoints (Health, Rates, Seed, Cron)
│   │   ├── government-salary-calculator-2026/ # Programmatic SEO Landing Pages
│   │   ├── punjab-government-salary-calculator/
│   │   ├── sindh-government-salary-calculator/
│   │   ├── pension-calculator-pakistan/
│   │   ├── electricity-bill-calculator-lesco/
│   │   ├── fuel-cost-calculator-pakistan/
│   │   ├── gold-rate-calculator-pakistan/
│   │   ├── layout.tsx           # Root Layout with Theme & GA4 Analytics
│   │   └── page.tsx             # Homepage with Category Cards & Live Rates
│   ├── components/
│   │   ├── calculators/         # Interactive Calculator Components
│   │   └── ui/                  # Reusable UI (DataSource, ShareButtons, FAQSection)
│   ├── data/                    # Authoritative Local JSON Datasets (Fail-Safe Fallback)
│   │   ├── salary/              # 15 BPS Datasets (Federal + 4 Provinces, 2024-2027)
│   │   ├── pension/             # Commutation Table & Retirement Rules
│   │   ├── tax/                 # Tax Slabs (TY2027, TY2026, TY2025)
│   │   └── allowances/          # Conveyance, Medical, and GP Fund Rates
│   ├── lib/
│   │   ├── calculations/        # 13 Pure, Unit-Tested Calculation Engines
│   │   └── db/                  # Safe Hybrid Prisma Data Provider
│   └── tests/                   # Automated Accuracy Test Suites
└── vercel.json                  # Vercel Cron Job Schedule (Daily 01:00 UTC)
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 2. Installation
```bash
git clone https://github.com/shahzaibbusiness2026-work/Pak_Cal_Hub.git
cd "Pak Calc Hub"
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
# Supabase Project ID: pwurutzomtjwaansduup
DATABASE_URL="postgresql://postgres.pwurutzomtjwaansduup:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.pwurutzomtjwaansduup:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

ADMIN_SECRET_KEY="pakcalc2026"
CRON_SECRET="pakcalc_cron_secret_2026"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### 4. Database Setup & Seeding
```bash
# Push Prisma schema to Supabase PostgreSQL
npx prisma db push

# Seed all 330 BPS scales, tax slabs, commutation factors, and market rates
npm run db:seed
```

### 5. Running the Project
```bash
# Run Development Server
npm run dev

# Run Production Build
npm run build
npm start

# Run Automated Test Suite
npm test
```

---

## 🛠️ Admin Dashboard Guide (`/admin`)

Access the Admin Dashboard at `http://localhost:3000/admin` (or `https://yourdomain.com/admin`):
- **Unlock Password**: Enter `ADMIN_SECRET_KEY` (default: `pakcalc2026`).
- **Update Fuel & Gold Prices**: Click **"Edit Rate"**, enter new value, and click **"Save"**. Changes update live in PostgreSQL and reflect across all calculators immediately.
- **One-Click Database Seed**: Populate or reset all 9 master tables with one click.
- **Database Connection Monitor**: Real-time status indicator showing live PostgreSQL connection or hybrid fallback status.

---

## 🧪 Running Automated Accuracy Tests

Execute the full suite of unit tests verifying all 15 calculation services:
```bash
npm test
```

Test coverage includes:
- ✅ Federal & Provincial BPS 1–22 Salary Computations (2024–2027)
- ✅ Pre-2024 Defined Benefit Pension & Age 45–65 Commutation Table
- ✅ Statutory Minimum Pension Floor (Rs. 25,000)
- ✅ FBR Income Tax Slabs (TY 2027, 2026, 2025) & Freelancer Section 154A
- ✅ LESCO, IESCO, and K-Electric Domestic Electricity Billing & Taxes
- ✅ Fuel Mileage, Trip Costs, and Commute Expenses
- ✅ Gold 24K/22K/21K/18K Tola & Gram Calculations
- ✅ Currency Exchange Rates (Interbank vs Open Market)
- ✅ Solar System Sizing & ROI Payback Period
- ✅ KIBOR Loan EMI & Bank Markup Schedules

---

## 🔒 Security & Performance Features

- **Strict HTTP Security Headers**: Configured with `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy`.
- **Zero-Downtime Fail-Safe Architecture**: If PostgreSQL is offline or unconfigured, the application seamlessly falls back to pre-compiled local JSON datasets without throwing 500 errors.
- **100% Client-Side Privacy**: Financial computations execute entirely on client-side state without transmitting sensitive salary, pension, or wealth data to any server.

---

## 📄 License
This project is licensed under the MIT License.
