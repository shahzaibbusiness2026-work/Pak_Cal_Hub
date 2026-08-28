import { NextResponse, NextRequest } from 'next/server';
import { prisma, isDatabaseConnected } from '../../../../lib/db/prisma';
import { DEFAULT_MARKET_RATES } from '../../../../lib/db/dataProvider';
import { COMMUTATION_TABLE, getPensionRules } from '../../../../data/pension';
import { getTaxDataset } from '../../../../data/tax';
import { getSalaryDataset, SUPPORTED_GOVERNMENTS, SUPPORTED_BUDGET_YEARS } from '../../../../data/salary';
import { PROTECTED_SLABS, UNPROTECTED_SLABS } from '../../../../lib/data/electricity-data';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { secretKey } = body;

    const expectedSecret = process.env.ADMIN_SECRET_KEY || 'pakcalc2026';
    if (secretKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid Admin Secret Key' }, { status: 401 });
    }

    const connected = await isDatabaseConnected();
    if (!connected) {
      return NextResponse.json({
        success: false,
        error: 'Cannot seed database: Supabase PostgreSQL is not connected. Please verify DATABASE_URL and password in .env.',
      }, { status: 503 });
    }

    // 1. Seed Market Rates
    for (const rate of DEFAULT_MARKET_RATES) {
      await prisma.marketRate.upsert({
        where: { key: rate.key },
        update: { value: rate.value, label: rate.label, unit: rate.unit, category: rate.category, notes: rate.notes },
        create: { key: rate.key, value: rate.value, label: rate.label, unit: rate.unit, category: rate.category, notes: rate.notes },
      });
    }

    // 2. Seed Commutation Factors
    for (const item of COMMUTATION_TABLE) {
      await prisma.commutationFactor.upsert({
        where: { age: item.age },
        update: { factor: item.factor },
        create: { age: item.age, factor: item.factor },
      });
    }

    // 3. Seed Pension Rules
    const govTypes = ['federal', 'punjab', 'sindh', 'kpk', 'balochistan'] as const;
    for (const gov of govTypes) {
      const rules = getPensionRules(gov);
      await prisma.pensionRule.upsert({
        where: { government: gov },
        update: {
          governmentName: rules.governmentName,
          minimumPension: rules.minimumPension,
          familyPensionRate: rules.familyPensionRate,
          familyPensionLifetimeWidow: rules.familyPensionLifetimeWidow,
          familyPensionLifetimeDaughter: rules.familyPensionLifetimeUnmarriedDaughter,
          commutationMaxPercent: rules.commutationMaxPercent,
          voluntaryRetirementMinYears: rules.voluntaryRetirementMinYears,
          superannuationAge: rules.superannuationAge,
          post2024Enabled: rules.post2024Scheme.enabled,
          post2024EmpRate: rules.post2024Scheme.employeeContributionRate,
          post2024GovRate: rules.post2024Scheme.governmentContributionRate,
          notes: rules.notes,
        },
        create: {
          government: gov,
          governmentName: rules.governmentName,
          minimumPension: rules.minimumPension,
          familyPensionRate: rules.familyPensionRate,
          familyPensionLifetimeWidow: rules.familyPensionLifetimeWidow,
          familyPensionLifetimeDaughter: rules.familyPensionLifetimeUnmarriedDaughter,
          commutationMaxPercent: rules.commutationMaxPercent,
          voluntaryRetirementMinYears: rules.voluntaryRetirementMinYears,
          superannuationAge: rules.superannuationAge,
          post2024Enabled: rules.post2024Scheme.enabled,
          post2024EmpRate: rules.post2024Scheme.employeeContributionRate,
          post2024GovRate: rules.post2024Scheme.governmentContributionRate,
          notes: rules.notes,
        },
      });
    }

    // 4. Seed Tax Slabs
    const taxYears = ['2026-27', '2025-26', '2024-25'] as const;
    for (const ty of taxYears) {
      const dataset = getTaxDataset(ty);
      for (let idx = 0; idx < dataset.salariedSlabs.length; idx++) {
        const slab = dataset.salariedSlabs[idx];
        await prisma.taxSlab.upsert({
          where: { taxYear_taxpayerType_slabNumber: { taxYear: ty, taxpayerType: 'salaried', slabNumber: idx + 1 } },
          update: { minIncome: slab.min, maxIncome: slab.max > 999999999 ? 999999999 : slab.max, fixedTax: slab.fixedTax, rate: slab.rate, rateLabel: slab.rateLabel },
          create: { taxYear: ty, taxpayerType: 'salaried', slabNumber: idx + 1, minIncome: slab.min, maxIncome: slab.max > 999999999 ? 999999999 : slab.max, fixedTax: slab.fixedTax, rate: slab.rate, rateLabel: slab.rateLabel },
        });
      }
      for (let idx = 0; idx < dataset.nonSalariedSlabs.length; idx++) {
        const slab = dataset.nonSalariedSlabs[idx];
        await prisma.taxSlab.upsert({
          where: { taxYear_taxpayerType_slabNumber: { taxYear: ty, taxpayerType: 'non-salaried', slabNumber: idx + 1 } },
          update: { minIncome: slab.min, maxIncome: slab.max > 999999999 ? 999999999 : slab.max, fixedTax: slab.fixedTax, rate: slab.rate, rateLabel: slab.rateLabel },
          create: { taxYear: ty, taxpayerType: 'non-salaried', slabNumber: idx + 1, minIncome: slab.min, maxIncome: slab.max > 999999999 ? 999999999 : slab.max, fixedTax: slab.fixedTax, rate: slab.rate, rateLabel: slab.rateLabel },
        });
      }
    }

    // 5. Seed Government Salary Scales
    for (const gov of SUPPORTED_GOVERNMENTS) {
      for (const year of SUPPORTED_BUDGET_YEARS) {
        const salDataset = getSalaryDataset(gov.value, year.value);
        const parentScale = await prisma.governmentSalaryScale.upsert({
          where: { government_year: { government: salDataset.government, year: salDataset.year } },
          update: { governmentName: salDataset.governmentName, scaleTitle: salDataset.scaleTitle, effectiveDate: salDataset.effectiveDate, notificationNumber: salDataset.notificationNumber, minimumWage: salDataset.minimumWage },
          create: { government: salDataset.government, governmentName: salDataset.governmentName, year: salDataset.year, scaleTitle: salDataset.scaleTitle, effectiveDate: salDataset.effectiveDate, notificationNumber: salDataset.notificationNumber, minimumWage: salDataset.minimumWage },
        });

        for (let bps = 1; bps <= 22; bps++) {
          const grade = salDataset.scales[bps];
          if (grade) {
            await prisma.bpsScale.upsert({
              where: { salaryScaleId_bps: { salaryScaleId: parentScale.id, bps } },
              update: { minPay: grade.minPay, increment: grade.increment, maxPay: grade.maxPay, stages: grade.stages, frozenHraBigCity: grade.frozenHraBigCity, frozenHraOtherCity: grade.frozenHraOtherCity, conveyanceAllowance: grade.conveyanceAllowance, medicalAllowance: grade.medicalAllowance },
              create: { salaryScaleId: parentScale.id, bps, minPay: grade.minPay, increment: grade.increment, maxPay: grade.maxPay, stages: grade.stages, frozenHraBigCity: grade.frozenHraBigCity, frozenHraOtherCity: grade.frozenHraOtherCity, conveyanceAllowance: grade.conveyanceAllowance, medicalAllowance: grade.medicalAllowance },
            });
          }
        }
      }
    }

    // 6. Seed Electricity Tariffs
    for (const slab of PROTECTED_SLABS) {
      await prisma.electricityTariff.upsert({
        where: { consumerType_slabMin_slabMax_effectiveYear: { consumerType: 'protected', slabMin: slab.min, slabMax: slab.max > 9999 ? 9999 : slab.max, effectiveYear: '2026-27' } },
        update: { baseRate: slab.rate },
        create: { consumerType: 'protected', slabMin: slab.min, slabMax: slab.max > 9999 ? 9999 : slab.max, baseRate: slab.rate, effectiveYear: '2026-27' },
      });
    }

    for (const slab of UNPROTECTED_SLABS) {
      await prisma.electricityTariff.upsert({
        where: { consumerType_slabMin_slabMax_effectiveYear: { consumerType: 'unprotected', slabMin: slab.min, slabMax: slab.max > 99999 ? 99999 : slab.max, effectiveYear: '2026-27' } },
        update: { baseRate: slab.rate },
        create: { consumerType: 'unprotected', slabMin: slab.min, slabMax: slab.max > 99999 ? 99999 : slab.max, baseRate: slab.rate, effectiveYear: '2026-27' },
      });
    }

    // 7. Audit Log
    await prisma.adminAuditLog.create({
      data: {
        action: 'SEED_DATABASE_API',
        targetTable: 'ALL',
        details: 'One-click seed executed via Admin Dashboard API',
        adminUser: 'Admin Portal',
      },
    });

    return NextResponse.json({ success: true, message: 'Supabase PostgreSQL database seeded successfully with all tables and master records!' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
