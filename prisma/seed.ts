import { PrismaClient } from '@prisma/client';
import { DEFAULT_MARKET_RATES } from '../src/lib/db/dataProvider';
import { COMMUTATION_TABLE, getPensionRules } from '../src/data/pension';
import { getTaxDataset } from '../src/data/tax';
import { getSalaryDataset, SUPPORTED_GOVERNMENTS, SUPPORTED_BUDGET_YEARS } from '../src/data/salary';
import { PROTECTED_SLABS, UNPROTECTED_SLABS } from '../src/lib/data/electricity-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Database Seeding for Pakistan Calculation Hub...');

  // 1. Seed Market & Commodity Rates
  console.log('📦 Seeding Market Rates (Petrol, Diesel, Gold, USD, Steel, Cement)...');
  for (const rate of DEFAULT_MARKET_RATES) {
    await prisma.marketRate.upsert({
      where: { key: rate.key },
      update: {
        value: rate.value,
        label: rate.label,
        unit: rate.unit,
        category: rate.category,
        notes: rate.notes,
      },
      create: {
        key: rate.key,
        value: rate.value,
        label: rate.label,
        unit: rate.unit,
        category: rate.category,
        notes: rate.notes,
      },
    });
  }

  // 2. Seed Commutation Factor Table (Age 45 to 65)
  console.log('📦 Seeding Commutation Factor Table (Appendix I)...');
  for (const item of COMMUTATION_TABLE) {
    await prisma.commutationFactor.upsert({
      where: { age: item.age },
      update: { factor: item.factor },
      create: { age: item.age, factor: item.factor },
    });
  }

  // 3. Seed Pension Rules (Federal, Punjab, Sindh, KPK, Balochistan)
  console.log('📦 Seeding Pension Rules...');
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

  // 4. Seed Tax Slabs (TY 2027, 2026, 2025)
  console.log('📦 Seeding FBR Income Tax Slabs...');
  const taxYears = ['2026-27', '2025-26', '2024-25'] as const;
  for (const ty of taxYears) {
    const dataset = getTaxDataset(ty);

    // Salaried Slabs
    for (let idx = 0; idx < dataset.salariedSlabs.length; idx++) {
      const slab = dataset.salariedSlabs[idx];
      await prisma.taxSlab.upsert({
        where: {
          taxYear_taxpayerType_slabNumber: {
            taxYear: ty,
            taxpayerType: 'salaried',
            slabNumber: idx + 1,
          },
        },
        update: {
          minIncome: slab.min,
          maxIncome: slab.max > 999999999 ? 999999999 : slab.max,
          fixedTax: slab.fixedTax,
          rate: slab.rate,
          rateLabel: slab.rateLabel,
        },
        create: {
          taxYear: ty,
          taxpayerType: 'salaried',
          slabNumber: idx + 1,
          minIncome: slab.min,
          maxIncome: slab.max > 999999999 ? 999999999 : slab.max,
          fixedTax: slab.fixedTax,
          rate: slab.rate,
          rateLabel: slab.rateLabel,
        },
      });
    }

    // Non-Salaried Slabs
    for (let idx = 0; idx < dataset.nonSalariedSlabs.length; idx++) {
      const slab = dataset.nonSalariedSlabs[idx];
      await prisma.taxSlab.upsert({
        where: {
          taxYear_taxpayerType_slabNumber: {
            taxYear: ty,
            taxpayerType: 'non-salaried',
            slabNumber: idx + 1,
          },
        },
        update: {
          minIncome: slab.min,
          maxIncome: slab.max > 999999999 ? 999999999 : slab.max,
          fixedTax: slab.fixedTax,
          rate: slab.rate,
          rateLabel: slab.rateLabel,
        },
        create: {
          taxYear: ty,
          taxpayerType: 'non-salaried',
          slabNumber: idx + 1,
          minIncome: slab.min,
          maxIncome: slab.max > 999999999 ? 999999999 : slab.max,
          fixedTax: slab.fixedTax,
          rate: slab.rate,
          rateLabel: slab.rateLabel,
        },
      });
    }
  }

  // 5. Seed Government BPS Salary Scales & Allowances
  console.log('📦 Seeding Government BPS Scales (Federal & 4 Provinces across 3 Budget Years)...');
  for (const gov of SUPPORTED_GOVERNMENTS) {
    for (const year of SUPPORTED_BUDGET_YEARS) {
      const salDataset = getSalaryDataset(gov.value, year.value);

      const parentScale = await prisma.governmentSalaryScale.upsert({
        where: {
          government_year: {
            government: salDataset.government,
            year: salDataset.year,
          },
        },
        update: {
          governmentName: salDataset.governmentName,
          scaleTitle: salDataset.scaleTitle,
          effectiveDate: salDataset.effectiveDate,
          notificationNumber: salDataset.notificationNumber,
          minimumWage: salDataset.minimumWage,
        },
        create: {
          government: salDataset.government,
          governmentName: salDataset.governmentName,
          year: salDataset.year,
          scaleTitle: salDataset.scaleTitle,
          effectiveDate: salDataset.effectiveDate,
          notificationNumber: salDataset.notificationNumber,
          minimumWage: salDataset.minimumWage,
        },
      });

      // Insert BPS 1 to 22
      for (let bps = 1; bps <= 22; bps++) {
        const grade = salDataset.scales[bps];
        if (grade) {
          await prisma.bpsScale.upsert({
            where: {
              salaryScaleId_bps: {
                salaryScaleId: parentScale.id,
                bps,
              },
            },
            update: {
              minPay: grade.minPay,
              increment: grade.increment,
              maxPay: grade.maxPay,
              stages: grade.stages,
              frozenHraBigCity: grade.frozenHraBigCity,
              frozenHraOtherCity: grade.frozenHraOtherCity,
              conveyanceAllowance: grade.conveyanceAllowance,
              medicalAllowance: grade.medicalAllowance,
            },
            create: {
              salaryScaleId: parentScale.id,
              bps,
              minPay: grade.minPay,
              increment: grade.increment,
              maxPay: grade.maxPay,
              stages: grade.stages,
              frozenHraBigCity: grade.frozenHraBigCity,
              frozenHraOtherCity: grade.frozenHraOtherCity,
              conveyanceAllowance: grade.conveyanceAllowance,
              medicalAllowance: grade.medicalAllowance,
            },
          });
        }
      }

      // Insert Ad-hoc reliefs
      if (salDataset.adhocReliefs) {
        for (const adhoc of salDataset.adhocReliefs) {
          await prisma.adhocRelief.create({
            data: {
              salaryScaleId: parentScale.id,
              code: adhoc.id,
              name: adhoc.name,
              rate: adhoc.rate,
              appliesTo: adhoc.appliesTo,
            },
          });
        }
      }
    }
  }

  // 6. Seed Electricity Tariffs
  console.log('📦 Seeding Electricity Tariffs...');
  for (const slab of PROTECTED_SLABS) {
    await prisma.electricityTariff.upsert({
      where: {
        consumerType_slabMin_slabMax_effectiveYear: {
          consumerType: 'protected',
          slabMin: slab.min,
          slabMax: slab.max > 9999 ? 9999 : slab.max,
          effectiveYear: '2026-27',
        },
      },
      update: { baseRate: slab.rate },
      create: {
        consumerType: 'protected',
        slabMin: slab.min,
        slabMax: slab.max > 9999 ? 9999 : slab.max,
        baseRate: slab.rate,
        effectiveYear: '2026-27',
      },
    });
  }

  for (const slab of UNPROTECTED_SLABS) {
    await prisma.electricityTariff.upsert({
      where: {
        consumerType_slabMin_slabMax_effectiveYear: {
          consumerType: 'unprotected',
          slabMin: slab.min,
          slabMax: slab.max > 99999 ? 99999 : slab.max,
          effectiveYear: '2026-27',
        },
      },
      update: { baseRate: slab.rate },
      create: {
        consumerType: 'unprotected',
        slabMin: slab.min,
        slabMax: slab.max > 99999 ? 99999 : slab.max,
        baseRate: slab.rate,
        effectiveYear: '2026-27',
      },
    });
  }

  // 7. Initial Audit Log Entry
  await prisma.adminAuditLog.create({
    data: {
      action: 'SEED_DATABASE',
      targetTable: 'ALL',
      details: 'Automated seed executed: Populated Market Rates, BPS Scales, Pension Rules, Tax Slabs & Electricity Tariffs',
      adminUser: 'System Initializer',
    },
  });

  console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
