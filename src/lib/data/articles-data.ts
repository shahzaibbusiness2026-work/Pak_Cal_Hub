export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  image?: string;
  tags: string[];
}

export const ARTICLES_DATA: ArticleItem[] = [
  {
    id: 'fbr-tax-slabs-guide-2026',
    slug: 'fbr-tax-slabs-guide-2026',
    title: 'Complete Guide to FBR Income Tax Slabs 2025–2026 for Salaried & Non-Salaried Individuals',
    excerpt: 'Detailed breakdown of taxable thresholds, progressive tax percentages, 10% super surcharge above Rs. 10M, and exemptions under the latest Finance Act.',
    category: 'Tax & FBR',
    date: 'August 2026',
    readTime: '6 min read',
    author: 'Taxation Advisory Desk',
    tags: ['FBR Tax Slabs', 'Salary Tax', 'Finance Act 2026', 'Tax Exemption'],
  },
  {
    id: 'bps-salary-and-pension-guide',
    slug: 'bps-salary-and-pension-guide',
    title: 'How to Calculate BPS Salary, Adhoc Relief Allowances & Pension Commutation Gratuity',
    excerpt: 'Step-by-step explanation of Federal and Provincial Basic Pay Scales 2022, house rent allowances for big cities vs rural areas, and 35% commutation calculation.',
    category: 'Government & Salary',
    date: 'August 2026',
    readTime: '8 min read',
    author: 'Civil Service Forum',
    tags: ['BPS Scales', 'Adhoc Allowances', 'Pension Commutation', 'GP Fund'],
  },
  {
    id: 'solar-net-metering-guide-pakistan',
    slug: 'solar-net-metering-guide-pakistan',
    title: 'Solar System Sizing, Inverters & 2026 NEPRA Net Metering Tariffs in Pakistan',
    excerpt: 'Learn how to size your solar system accurately based on monthly units, evaluate On-Grid vs Hybrid setups with lithium batteries, and calculate 25-year ROI payback.',
    category: 'Energy & Solar',
    date: 'August 2026',
    readTime: '7 min read',
    author: 'Renewable Energy Insights',
    tags: ['Solar Sizing', 'NEPRA Net Metering', 'Green Meter', 'Solar ROI'],
  },
  {
    id: 'marla-and-kanal-land-measurement-guide',
    slug: 'marla-and-kanal-land-measurement-guide',
    title: 'Standard Marla (272.25 sq ft) vs LDA Marla (225 sq ft): Pakistan Land Records Explained',
    excerpt: 'Clear demarcation between Punjab Revenue Record Patwari measurements and Lahore Development Authority (LDA) residential plot sizing standards.',
    category: 'Property & Land',
    date: 'August 2026',
    readTime: '5 min read',
    author: 'Real Estate Analysis',
    tags: ['Marla to Sq Ft', 'Kanal to Acre', 'LDA Lahore', 'Revenue Record'],
  },
  {
    id: 'zakat-nisab-rules-2026',
    slug: 'zakat-nisab-rules-2026',
    title: 'Islamic Zakat & Nisab 2026: Gold, Silver, Cash & Business Inventory Rulings',
    excerpt: 'Authentic Shariah guide to determining whether you meet the Nisab threshold in Gold or Silver, deductions for immediate debts, and 2.5% calculation rules.',
    category: 'Islamic Finance',
    date: 'August 2026',
    readTime: '6 min read',
    author: 'Islamic Jurisprudence Desk',
    tags: ['Zakat Nisab', 'Gold Zakat', 'Silver Nisab', 'Islamic Faraid'],
  },
  {
    id: 'mdcat-ecat-university-aggregate-guide',
    slug: 'mdcat-ecat-university-aggregate-guide',
    title: 'PM&DC MDCAT & University Merit Aggregates: Complete Formula Breakdown',
    excerpt: 'Comprehensive formula guide for PMDC MDCAT (50:40:10), UET ECAT (70:30), NUST NET (75:15:10), and FAST NUCES admission merit calculations.',
    category: 'Education & Admissions',
    date: 'August 2026',
    readTime: '5 min read',
    author: 'Academic Advisory',
    tags: ['MDCAT Aggregate', 'ECAT Merit', 'NUST NET', 'University Admissions'],
  },
];
