export interface UniversityFormula {
  id: string;
  name: string;
  shortName: string;
  matricWeight: number; // percentage
  fscWeight: number;    // percentage
  testWeight: number;   // percentage
  /**
   * Which F.Sc marks the merit formula expects:
   * 'full'  = full HSSC / Intermediate out of 1,100
   * 'part1' = HSSC Part-I out of ~520/550
   */
  fscBasis: 'full' | 'part1';
  description: string;
}

export const PAK_UNIVERSITY_FORMULAS: UniversityFormula[] = [
  {
    id: 'pmdc-mdcat',
    name: 'PMDC MBBS/BDS (MDCAT)',
    shortName: 'MDCAT',
    matricWeight: 10,
    fscWeight: 40,
    testWeight: 50,
    fscBasis: 'full', // verified: PM&DC uses full HSSC Pre-Medical out of 1,100
    description: 'PM&DC Formula: Matric 10% + F.Sc Pre-Medical 40% + MDCAT 50%',
  },
  {
    id: 'nust-net',
    name: 'NUST Islamabad (NET)',
    shortName: 'NUST NET',
    matricWeight: 10,
    fscWeight: 15,
    testWeight: 75,
    // verify: NUST Part-I total may be 520 (pre-2010 scheme) or 550 (current scheme)
    fscBasis: 'part1',
    description: 'NUST Entry Test: Matric 10% + F.Sc Part 1 15% + NET 75%',
  },
  {
    id: 'giki',
    name: 'GIKI Swabi Entry Test',
    shortName: 'GIKI',
    matricWeight: 0,
    fscWeight: 15,
    testWeight: 85,
    // verify: GIKI's 15% HSSC scope (full HSSC vs Part-I) unconfirmed against current policy
    fscBasis: 'part1',
    description: 'GIKI Admission Merit: F.Sc / HSSC 15% + GIKI Admission Test 85%',
  },
  {
    id: 'uet-ecat',
    name: 'UET Lahore (ECAT)',
    shortName: 'UET ECAT',
    matricWeight: 0,
    fscWeight: 67,
    testWeight: 33,
    // UET Fall 2026 ECAT merit, academic basis depends on qualification.
    fscBasis: 'full',
    description: 'UET ECAT merit: HSSC 67% + ECAT 33%; use the academic basis required by your qualification.',
  },
  {
    id: 'fast-nu',
    name: 'FAST NUCES',
    shortName: 'FAST',
    matricWeight: 10,
    fscWeight: 40,
    testWeight: 50,
    fscBasis: 'part1', // FAST uses HSSC Part-I per published policy
    description: 'FAST Engineering/CS: SSC 10% + HSSC Part 1 40% + NU Test 50%',
  },
  {
    id: 'comsats',
    name: 'COMSATS University (NTS NAT)',
    shortName: 'COMSATS',
    matricWeight: 10,
    fscWeight: 40,
    testWeight: 50,
    // verify: COMSATS 40% HSSC scope (full vs Part-I) unconfirmed against current policy
    fscBasis: 'part1',
    description: 'COMSATS Merit: SSC 10% + HSSC 40% + NTS NAT 50%',
  },
  {
    id: 'pu',
    name: 'University of the Punjab (PU)',
    shortName: 'Punjab University',
    // Official PU basic merit = 1/4 Matric + F.Sc out of 275 + 1100 = 1375 -> 20% / 80%
    matricWeight: 15,
    fscWeight: 60,
    testWeight: 25,
    fscBasis: 'full', // verified: PU uses total F.Sc marks out of 1,100
    description: 'PU illustrative merit: 75% of academic merit (20% SSC + 80% HSSC) plus 25% admission test. Department-specific academic formulas, subject marks and additional tests can differ.',
  },
  {
    id: 'ku',
    name: 'University of Karachi (KU)',
    shortName: 'Karachi University',
    matricWeight: 20,
    fscWeight: 30,
    testWeight: 50,
    // verify: KU 20/30/50 weightings and HSSC scope unconfirmed against current prospectus
    fscBasis: 'part1',
    description: 'KU Entry Test Based Programs: Matric 20% + Intermediate 30% + Test 50%',
  },
];
