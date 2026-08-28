export interface UniversityFormula {
  id: string;
  name: string;
  shortName: string;
  matricWeight: number; // percentage
  fscWeight: number;    // percentage
  testWeight: number;   // percentage
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
    description: 'PM&DC Formula: Matric 10% + F.Sc Pre-Medical 40% + MDCAT 50%',
  },
  {
    id: 'nust-net',
    name: 'NUST Islamabad (NET)',
    shortName: 'NUST NET',
    matricWeight: 10,
    fscWeight: 15,
    testWeight: 75,
    description: 'NUST Entry Test: Matric 10% + F.Sc Part 1 15% + NET 75%',
  },
  {
    id: 'giki',
    name: 'GIKI Swabi Entry Test',
    shortName: 'GIKI',
    matricWeight: 0,
    fscWeight: 15,
    testWeight: 85,
    description: 'GIKI Admission Merit: F.Sc / HSSC 15% + GIKI Admission Test 85%',
  },
  {
    id: 'uet-ecat',
    name: 'UET Lahore (ECAT)',
    shortName: 'UET ECAT',
    matricWeight: 10,
    fscWeight: 40,
    testWeight: 50,
    description: 'UET Combined Entry Test: Matric 10% + F.Sc 40% + ECAT 50%',
  },
  {
    id: 'fast-nu',
    name: 'FAST NUCES',
    shortName: 'FAST',
    matricWeight: 10,
    fscWeight: 40,
    testWeight: 50,
    description: 'FAST Engineering/CS: SSC 10% + HSSC Part 1 40% + NU Test 50%',
  },
  {
    id: 'comsats',
    name: 'COMSATS University (NTS NAT)',
    shortName: 'COMSATS',
    matricWeight: 10,
    fscWeight: 40,
    testWeight: 50,
    description: 'COMSATS Merit: SSC 10% + HSSC 40% + NTS NAT 50%',
  },
  {
    id: 'pu',
    name: 'University of the Punjab (PU)',
    shortName: 'Punjab University',
    matricWeight: 25,
    fscWeight: 75,
    testWeight: 0,
    description: 'PU Standard Basic Merit: 1/4 Matric + Total F.Sc Marks (or 75% HSSC + 25% PU Entry Test if applicable)',
  },
  {
    id: 'ku',
    name: 'University of Karachi (KU)',
    shortName: 'Karachi University',
    matricWeight: 20,
    fscWeight: 30,
    testWeight: 50,
    description: 'KU Entry Test Based Programs: Matric 20% + Intermediate 30% + Test 50%',
  },
];
